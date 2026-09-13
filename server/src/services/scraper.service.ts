import { createScraper, ScraperOptions, ScraperCredentials } from "israeli-bank-scrapers";
import { EventEmitter } from "events";

export const scraperEvents = new EventEmitter();

// We will store pending OTP resolvers here
const pendingOTPs = new Map<string, (code: string) => void>();

export async function runScraper(options: ScraperOptions, credentials: ScraperCredentials) {
  const scraper = createScraper(options);
  
  // Custom hook into the scraper for OTP (assuming library supports an onOTP callback or similar, 
  // or we mock the behavior for the human-in-the-loop requirement)
  // Since israeli-bank-scrapers doesn't have a native pause-for-OTP, 
  // we would typically use a customized page interaction or an upcoming PR for that library.
  // For the sake of this architecture, we emit the event and await the promise.
  
  const sessionId = Math.random().toString(36).substring(7);

  scraper.onProgress((companyId, msg) => {
    if (msg.type === 'OTP_REQUIRED') {
      scraperEvents.emit('AWAITING_OTP', { sessionId, companyId });
      
      // Pause execution for up to 180s
      return new Promise<string>((resolve, reject) => {
        pendingOTPs.set(sessionId, resolve);
        
        setTimeout(() => {
          pendingOTPs.delete(sessionId);
          reject(new Error("OTP Timeout"));
        }, 180000);
      });
    }
  });

  try {
    const scrapeResult = await scraper.scrape(credentials);
    return scrapeResult;
  } catch (error) {
    console.error("Scraping failed:", error);
    throw error;
  }
}

export function submitOTP(sessionId: string, code: string) {
  const resolver = pendingOTPs.get(sessionId);
  if (resolver) {
    resolver(code);
    pendingOTPs.delete(sessionId);
    return true;
  }
  return false;
}
