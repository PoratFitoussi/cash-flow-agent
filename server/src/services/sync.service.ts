import path from 'path';
import { db } from '../db';
import { transactions, categories, cardOwners, merchantCategoryMappings } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { runScraper, scraperEvents } from './scraper.service';
import { processPendingTransactions } from './aiCategorization.service';
import { CompanyTypes } from 'israeli-bank-scrapers';

export interface SyncOptions {
  userId: string;
  isBackground?: boolean;
}

export async function performSync({ userId, isBackground = false }: SyncOptions) {
  const userDataDir = path.resolve(process.cwd(), '.browser_session');
  console.log(`[SYNC] Starting sync. Background: ${isBackground}. userDataDir: ${userDataDir}`);
  
  const options: any = {
    companyId: (process.env.SCRAPER_COMPANY_ID as CompanyTypes) || 'hapoalim',
    startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // last 120 days
    combineInstallments: false,
    showBrowser: false, 
    additionalTransactionInformation: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      `--user-data-dir=${userDataDir}` // <-- Persists cookies and session for 90 days
    ]
  };
  
  const credentials = {
    id: process.env.SCRAPER_USERNAME || '',
    userCode: process.env.SCRAPER_USERNAME || '', 
    password: process.env.SCRAPER_PASSWORD || '',
  };

  let otpListener: any = null;
  if (isBackground) {
    otpListener = () => {
      console.warn(`[BACKGROUND SYNC] WARNING: OTP Challenge requested! Since this is running in the background, we cannot answer it. Sync will likely timeout.`);
    };
    scraperEvents.on('AWAITING_OTP', otpListener);
  }

  try {
    const scrapeResult = await runScraper(options, credentials as any);
    if (!scrapeResult.success) {
       throw new Error(`Scrape failed or incomplete: ${scrapeResult.errorMessage}`);
    }

    let insertedCount = 0;
    const existingMappings = await db.select().from(cardOwners);
    const memoryRules = await db.select().from(merchantCategoryMappings);
    const defaultSpendingsCategory = await db.query.categories.findFirst({ where: eq(categories.name, 'בזבוזים') });
    const basisCategory = await db.query.categories.findFirst({ where: eq(categories.name, 'בסיס') });
    
    let investmentsCategory = await db.query.categories.findFirst({ where: eq(categories.name, 'השקעות') });
    if (!investmentsCategory) {
      const [newCat] = await db.insert(categories).values({ name: 'השקעות', icon: '📈' }).returning();
      investmentsCategory = newCat;
    }
    
    for (const account of scrapeResult.accounts || []) {
       const accountId = account.accountNumber;
       const mapping = existingMappings.find(m => m.accountId === accountId);
       const defaultCardOwner = mapping ? mapping.ownerName : null;
       
       for (const txn of account.txns) {
          let fullMerchant = txn.memo ? `${txn.description} - ${txn.memo}` : txn.description;
          const originalMerchantString = fullMerchant;
          
          if (fullMerchant.includes('דירקט')) continue;

          let matchedCardOwner = defaultCardOwner;
          if (!matchedCardOwner) {
            const fallbackMapping = existingMappings.find(m => fullMerchant.includes(m.accountId));
            if (fallbackMapping) matchedCardOwner = fallbackMapping.ownerName;
          }
          
          let assignedCategoryId = null;

          // 15K Investment Transfer Hardcoded Rule
          if (Math.abs(txn.chargedAmount) === 15000) {
            assignedCategoryId = investmentsCategory.id;
            fullMerchant = "Investment Portfolio Transfer";
          } else {
            for (const rule of memoryRules) {
               if (fullMerchant.toLowerCase().includes(rule.merchantName.toLowerCase())) {
                  assignedCategoryId = rule.categoryId;
                  if (rule.renameTo) fullMerchant = rule.renameTo;
                  if (rule.ownerName) matchedCardOwner = rule.ownerName;
                  break;
               }
            }
          }
          
          const amountStr = txn.chargedAmount.toString();
          // Check within a 3-day window to avoid timezone/bank-date shifts
          const d = new Date(txn.date);
          const startDate = new Date(d);
          startDate.setDate(startDate.getDate() - 3);
          const endDate = new Date(d);
          endDate.setDate(endDate.getDate() + 3);

          const existingForDateAndAmount = await db.select().from(transactions).where(
             and(
               eq(transactions.userId, userId),
               eq(transactions.amount, amountStr),
               sql`${transactions.transactionDate} >= ${startDate.toISOString()}`,
               sql`${transactions.transactionDate} <= ${endDate.toISOString()}`
             )
          );
          
          const normalize = (s: string) => s.replace(/[^\w\sא-ת]/gi, '').replace(/\s+/g, '').toLowerCase();
          const normFullOriginal = normalize(originalMerchantString);
          const normDesc = normalize(txn.description);
          
          const isDuplicate = existingForDateAndAmount.some(existingTxn => {
            const normExisting = normalize(existingTxn.originalMerchant || existingTxn.merchant);
            return normFullOriginal.includes(normExisting) || normExisting.includes(normFullOriginal) ||
                   normDesc.includes(normExisting) || normExisting.includes(normDesc);
          });
          
          if (!isDuplicate) {
             const type = txn.chargedAmount > 0 ? 'INCOME' : 'EXPENSE';
             if (!assignedCategoryId && type === 'EXPENSE' && defaultSpendingsCategory) {
               assignedCategoryId = defaultSpendingsCategory.id;
             }
             
             const isFixedTransaction = assignedCategoryId === basisCategory?.id;
             
             let finalTransactionDate = new Date(txn.date);
             // In Israel, salaries paid between 1st and 10th belong to the previous month
             if (type === 'INCOME' && finalTransactionDate.getDate() <= 10 && (fullMerchant.includes('משכורת') || originalMerchantString.includes('משכורת'))) {
               finalTransactionDate.setDate(0); // Shift to the last day of the previous month
             }
             
             await db.insert(transactions).values({
               userId,
               transactionDate: finalTransactionDate,
               amount: amountStr,
               merchant: fullMerchant,
               originalMerchant: originalMerchantString,
               type,
               source: 'BANK_SYNC',
               paymentMethod: 'CREDIT', 
               accountId,
               cardOwner: matchedCardOwner,
               categoryId: assignedCategoryId,
               isTemplate: isFixedTransaction,
             });
             insertedCount++;
          }
       }
    }
    
    await processPendingTransactions();
    return { success: true, insertedCount };
  } finally {
    if (isBackground && otpListener) {
      scraperEvents.off('AWAITING_OTP', otpListener);
    }
  }
}
