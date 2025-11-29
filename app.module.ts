import { Module } from '@nestjs/common';
import { ScrapeController } from '@/Controllers/scrapeController';
import { Store } from '@/Dal/Store';

@Module({
    controllers: [ScrapeController],
    providers: [Store],
})
export class AppModule {}
