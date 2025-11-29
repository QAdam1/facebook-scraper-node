import {Browser, BrowserContext, Page} from "playwright";

// @ts-ignore


export class ExtractionService {
    async extractPostData(page: Page, postUrl: string) {
        await page.goto(postUrl);
        await page.waitForSelector('[data-ad-rendering-role="story_message"]');
        const elements = await page.$$('[data-ad-rendering-role="story_message"]');
        const lastElement = elements[elements.length - 1];
        const text = await lastElement?.innerText();
        const imgHandles = await lastElement?.$$('xpath=ancestor::*[@dir="auto"]/following-sibling::*//img');
        const imagesUrls = await Promise.all(imgHandles.map(async (i) => await i.getAttribute('src')));
        return {text, imagesUrls};
    }

    async extractPostDataInNewContext(context: BrowserContext, postUrl: string) {
        const page = await context.newPage();
        try {
            return await this.extractPostData(page, postUrl);
        } finally {
            await page.close();
        }
    }

}
