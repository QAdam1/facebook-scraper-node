import * as fs from "node:fs/promises";

const OUTPUT_FILENAME = "scraped_posts.json"; // Output filename (or use SEARCH if not empty)

export class Store {
    async write(data: any) {
        await fs.writeFile(OUTPUT_FILENAME, data, {encoding: "utf8"});
    }

    async read(predicateFn?: (item: any) => boolean) {
        const fileData = await fs.readFile(OUTPUT_FILENAME, 'utf8');
        const jsonData = JSON.parse(fileData);
        return predicateFn ? jsonData.filter(predicateFn) : jsonData;
    }
}
