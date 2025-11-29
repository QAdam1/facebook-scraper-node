import 'dotenv/config';
import {BrowserService} from "./Services/BrowserService";
import {LoginService} from "./Services/LoginService";
import {ExtractionService} from "./Services/ExtractionService";
import pLimit from 'p-limit';
import {writeFile} from "node:fs/promises";

const {SEARCH, GROUP_DESC, GROUP_POST_PREFIX} = process.env;
const MAX_POSTS = Number(process.env.MAX_POSTS);
const N_SCROLLS = Number(process.env.N_SCROLLS);
const MAX_PARALLEL_EXTRACTIONS = Number(process.env.MAX_PARALLEL_EXTRACTIONS);
const logger = console;

const limit = pLimit(MAX_PARALLEL_EXTRACTIONS);
const browsrService = new BrowserService();
const loginService = new LoginService();


const extractionService = new ExtractionService();
(async () => {
    const OUTPUT_FILENAME = SEARCH || "scraped_posts.json"; // Output filename (or use SEARCH if not empty)
    // ----------------------------
    const {browser, context, page} = await browsrService.setupResources();
    await loginService.login(page);
    await loginService.navigateToGroupPage(page, GROUP_POST_PREFIX!);

    // Collect links
    logger.log('Collecting links by scrolling the page...')
    const links: string[] = [];
    const texts: any[] = [];
    let tasks: any[] = [];

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    while (links.length < MAX_POSTS) {
        const linksAttributes = await page.evaluate(() =>
            Array.from(document.querySelectorAll('a[role=link][href*="/groups/"][href*="/posts/"]'))
                // @ts-ignore
                .map(a => a.href.replace(/(https:\/\/www\.facebook\.com\/groups\/\d+\/posts\/\d+\/).*/, '$1'))
        );
        const uniqueLinks = [...new Set(linksAttributes)];
        const uniqueNewLinks = uniqueLinks.filter(l => !links.includes(l));
        links.push(...uniqueNewLinks);

        tasks.push(...uniqueNewLinks.map(l => limit(async () => {
            const postData = await extractionService.extractPostDataInNewContext(context, l);
            texts.push({url: l, ...postData});
        })));

        logger.log(`Collected ${links.length} unique post links so far...`);

        const nextLoaderElements = (await page.$$('[role=article] [aria-label="Loading..."]'));
        const nextLoader = nextLoaderElements[0];
        if (nextLoader) {
            // @ts-ignore
            await page.evaluate((el) => el.parentElement.scrollIntoView(), nextLoader);
            await page.waitForTimeout(2000);
        }
    }

    await Promise.all(tasks);

    logger.log(`Finished collecting data from ${links.length} posts.`);
    await browser.close();

    const data = JSON.stringify(texts, null, 4);
    await writeFile(OUTPUT_FILENAME, data, {encoding: "utf8"});
})();
