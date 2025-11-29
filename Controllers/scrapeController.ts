import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Store } from '@/Dal/Store';
import { scrape } from '@/facebookGroupParserNew';

@ApiTags('scraper')
@Controller('scraper')
export class ScrapeController {
    constructor(private readonly store: Store) {}

    @Get()
    @ApiOperation({ summary: 'Read stored scraped results' })
    async scrapeResults() {
        return this.store.read();
    }

    @Post()
    @ApiOperation({ summary: 'Trigger scraping for a group URL' })
    @ApiQuery({ name: 'groupUrl', required: true, description: 'URL of the Facebook group to scrape' })
    async scrape(@Query('groupUrl') groupUrl: string) {
        if (groupUrl) process.env.GROUP_POST_PREFIX = groupUrl;
        try {
            await scrape().catch(err => { throw err }); // ensure rejection is caught
            return { status: 'Scraping done...' };
        } catch (e) {
            return { status: 'Scraping failed...', error: e instanceof Error ? e.message : e };
        }
    }

}
