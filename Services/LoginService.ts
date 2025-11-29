import {Page} from "playwright";
// @ts-ignore
// import cookies from "../Assets/cookies.json" with {type: 'json'};


export class LoginService {
    get _loginCredentials() {
        return {
            email: process.env.FB_EMAIL,
            password: process.env.FB_PASS
        }
    }

    get _cookies() {
        const ye = process.env.FB_COOKIES;
        const cookies = JSON.parse(Buffer.from(ye!, 'base64').toString('utf8'));
        return cookies!.map((c: any) => {
            if (!["no_restriction", "lax", "strict"].includes(c.sameSite)) delete c.sameSite;
            if (c.sameSite === "no_restriction") c.sameSite = "None";
            if (c.sameSite === "lax") c.sameSite = "Lax";
            if (c.sameSite === "strict") c.sameSite = "Strict";
            return c;
        });
    }

    async login(page: Page) {
        const {email, password} = this._loginCredentials;
        // Login page
        await page.goto("https://www.facebook.com/");
        await page.context().addCookies(this._cookies);
        await page.reload();
        await page.waitForTimeout(2000);

        // In case cookies are expired, do manual login
        if (await page.locator("input[name='email']").isVisible()) {
            await page.locator("input[name='email']").type(email!, {delay: 70});
            await page.waitForTimeout(300);
            await page.locator("input[name='pass']").type(password!, {delay: 85});
            await page.waitForTimeout(320);
            await page.locator("input[name='pass']").press("Enter");
            await page.waitForTimeout(650);
            await page.getByLabel('Create a post').waitFor({state: 'visible', timeout: 60000}).catch(async () => {
                await page.goBack();
                await page.waitForTimeout(500);
                await page.locator("input[name='pass']").type(password!, {delay: 80});
                await page.waitForTimeout(300);
                await page.locator("input[name='pass']").press("Enter");
                await page.getByLabel('Create a post').waitFor({state: 'visible', timeout: 60000});
            });
        }
    }

    async navigateToGroupPage(page: Page, GROUP_POST_PREFIX: string) {
        await page.goto(GROUP_POST_PREFIX);

        await page.getByLabel('Dismiss These community chats are read-only card').waitFor({
            state: 'visible',
            timeout: 60000
        });
        await page.getByLabel('Dismiss These community chats are read-only card').click();
        await page.getByLabel('Hide menu').waitFor({state: 'visible', timeout: 60000});
        await page.getByLabel('Hide menu').click();
    }

}
