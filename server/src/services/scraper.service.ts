import { createScraper, ScraperOptions, ScraperCredentials } from "israeli-bank-scrapers";
import { EventEmitter } from "events";

export const scraperEvents = new EventEmitter();

// We will store pending scraper instances here
const pendingScrapers = new Map<string, any>();

export async function runScraper(options: ScraperOptions, credentials: ScraperCredentials) {
  const scraper = createScraper(options);
  const sessionId = Math.random().toString(36).substring(7);

  // Listen for the custom OTP event injected via our patch-package modifications
  (scraper as any).eventEmitter.on('onOtpRequired', (companyId: string, payload: any) => {
    console.log(`[scraper.service] Received onOtpRequired from scraper for session ${sessionId}`);
    
    // Store the actual scraper instance so we can call submitOtp on it later
    pendingScrapers.set(sessionId, scraper);
    
    // Alert the frontend
    scraperEvents.emit('AWAITING_OTP', { sessionId, companyId, screenshot: payload?.screenshot });
  });

  scraper.onProgress((companyId, msg) => {
    // If we receive a generic error that looks like OTP failure, we can handle it,
    // but the patched logic should handle everything internally.
    if ((msg.type as any) === 'OTP_REQUIRED') {
      // Fallback if other scrapers use this natively
      scraperEvents.emit('AWAITING_OTP', { sessionId, companyId });
    }
  });

  try {
    const scrapeResult = await scraper.scrape(credentials);
    return scrapeResult;
  } catch (error) {
    console.error("Scraping failed:", error);
    throw error;
  } finally {
    // Cleanup
    pendingScrapers.delete(sessionId);
  }
}

export function submitOTP(sessionId: string, code: string) {
  const scraper = pendingScrapers.get(sessionId);
  if (scraper && typeof scraper.submitOtp === 'function') {
    scraper.submitOtp(code);
    pendingScrapers.delete(sessionId);
    return true;
  }
  return false;
}
