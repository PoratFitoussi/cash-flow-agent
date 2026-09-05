import 'dotenv/config';
import { createScraper, ScraperOptions, ScraperCredentials, CompanyTypes } from 'israeli-bank-scrapers';

async function runScraper(): Promise<void> {
    console.log("Starting the scraping process...");

    try {
        const username = process.env.SCRAPER_USERNAME || "";
        const password = process.env.SCRAPER_PASSWORD || "";

        if (!username || !password) {
            throw new Error("Missing SCRAPER_USERNAME or SCRAPER_PASSWORD in environment variables");
        }

        const credentials: ScraperCredentials = {
            userCode: username, // Hapoalim uses userCode, not id!
            password: password,
        };

        // Calculate startDate to be the 1st day of the current month
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        const options: ScraperOptions = {
            companyId: CompanyTypes.hapoalim,
            startDate: startDate,
            showBrowser: true,
            // @ts-ignore - Pass puppeteer args to bypass docker root sandbox restrictions
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            // @ts-ignore
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };

        const scraper = createScraper(options);
        
        console.log(`Scraping ${CompanyTypes.hapoalim} from ${startDate.toISOString()}...`);
        const scrapeResult = await scraper.scrape(credentials);

        if (scrapeResult.success) {
            console.log("Scraping successful. Found accounts.");
            
            // Import the service dynamically or at top, we'll use dynamic import for simplicity
            const { saveTransactionsToSheet } = await import('./src/sheetsService.ts');
            const addedCount = await saveTransactionsToSheet(scrapeResult.accounts || []);
            
            console.log(`Successfully added ${addedCount} new unique transactions to Google Sheets.`);
        } else {
            console.error("Scraping failed. Error type:", scrapeResult.errorType);
        }
    } catch (error: unknown) {
        console.error("An error occurred during scraping:", error);
    }
    
    console.log("Scraping finished.");
}

runScraper().catch((error: unknown) => {
    console.error("An unhandled error occurred:", error);
});