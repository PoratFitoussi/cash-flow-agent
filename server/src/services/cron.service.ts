import cron from 'node-cron';
import { performSync } from './sync.service';
import { checkFuelPricesAndAlert } from './fuelAlert.service';
import { generateEndOfMonthReport } from './report.service';

export function initCronJobs() {
  console.log('[CRON] Initializing background jobs...');
  
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Starting daily background sync...');
    try {
      // In a multi-user app, you would iterate over users. 
      // For this single-user agent, we use a fixed default user ID (1)
      const defaultUserId = "1"; // Replace with proper fetching logic if multi-tenant
      
      const result = await performSync({ userId: defaultUserId, isBackground: true });
      console.log(`[CRON] Sync successful. Inserted ${result.insertedCount} transactions.`);
    } catch (error) {
      console.error(`[CRON] Background sync failed:`, error);
    }
  });

  // Fuel Price Alert: Runs on the 30th of every month at 17:00 (5:00 PM)
  cron.schedule('0 17 30 * *', async () => {
    console.log('[CRON] Starting monthly fuel price check...');
    await checkFuelPricesAndAlert();
  });

  // End of Month Report Agent: Runs at 23:59 on the 28-31st (handled cleanly via node-cron)
  // We use a trick: node-cron allows 'L' for last day of month, or we just run it on the 28th-31st and check if tomorrow is a new month.
  // Standard cron for last day of month is tricky, but '59 23 28-31 * *' + checking date works.
  cron.schedule('59 23 28-31 * *', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // If tomorrow's month is different, today is the last day of the month.
    if (tomorrow.getMonth() !== today.getMonth()) {
      console.log('[CRON] Starting End-of-Month statistical report...');
      await generateEndOfMonthReport();
    }
  });

  console.log('[CRON] Scheduled daily bank sync for 02:00 AM.');
  console.log('[CRON] Scheduled monthly fuel alert for 30th at 17:00.');
  console.log('[CRON] Scheduled end-of-month report agent for 23:59 on the last day of the month.');
}
