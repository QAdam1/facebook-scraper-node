import {chromium} from "playwright";

export class BrowserService {
    async setupResources() {
        const browser = await chromium.launch({headless: !process.env.IS_LOCAL});
        const context = await browser.newContext({
            permissions: ["notifications"], // disable notifications not possible in chromium directly
        });
        const page = await context.newPage();

        return {browser, context, page}
    }
}
