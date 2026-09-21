import 'dotenv/config';
import { runScraper } from './src/services/scraper.service';
import { CompanyTypes } from 'israeli-bank-scrapers';
import fs from 'fs';

async function test() {
  try {
    const options = {
      companyId: (process.env.SCRAPER_COMPANY_ID as CompanyTypes) || 'hapoalim',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // last 60 days
      combineInstallments: false,
      showBrowser: false,
      additionalTransactionInformation: true,
      includeRawTransaction: true,
    };
    
    const credentials = {
      id: process.env.SCRAPER_USERNAME || '',
      userCode: process.env.SCRAPER_USERNAME || '', // Some banks use userCode
      password: process.env.SCRAPER_PASSWORD || '',
    };

    console.log("Running scraper with options:", options);
    const scrapeResult = await runScraper(options, credentials as any);
    
    if (scrapeResult.success) {
      fs.writeFileSync('./scraper_result.json', JSON.stringify(scrapeResult, null, 2));
      console.log("Dumped results to ./scraper_result.json");
    } else {
      console.log("Scrape failed", scrapeResult);
    }
  } catch (err: any) {
    console.error("Exception thrown:", err.message);
  }
}

test();
