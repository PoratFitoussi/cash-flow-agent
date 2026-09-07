import 'dotenv/config';
import { createScraper, ScraperOptions, ScraperCredentials, CompanyTypes } from 'israeli-bank-scrapers';
import { saveTransactionsToDB } from './dbService';

export async function runBankScraper(startDate: Date): Promise<number> {
    console.log(`Starting the scraping process from ${startDate.toISOString()}...`);

    const username = process.env.SCRAPER_USERNAME || "";
    const password = process.env.SCRAPER_PASSWORD || "";

    if (!username || !password) {
        throw new Error("Missing SCRAPER_USERNAME or SCRAPER_PASSWORD in environment variables");
    }

    const credentials: ScraperCredentials = {
        userCode: username, // Hapoalim uses userCode, not id
        password: password,
    };

    const options: ScraperOptions = {
        companyId: CompanyTypes.hapoalim,
        startDate: startDate,
        showBrowser: false, // Turn off browser for background execution
        // @ts-ignore
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        // @ts-ignore
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--user-data-dir=/usr/src/app/browser_data']
    };

    const scraper = createScraper(options);
    
    console.log(`Scraping ${CompanyTypes.hapoalim}...`);
    const scrapeResult = await scraper.scrape(credentials);

    if (scrapeResult.success) {
        console.log("Scraping successful. Found accounts.");
        const addedCount = await saveTransactionsToDB(scrapeResult.accounts || []);
        console.log(`Successfully added ${addedCount} new unique transactions to PostgreSQL.`);
        return addedCount;
    } else {
        console.error("Scraping failed. Error type:", scrapeResult.errorType);
        throw new Error(`Scraping failed: ${scrapeResult.errorType}`);
    }
}
