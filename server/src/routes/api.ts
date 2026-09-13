import express from 'express';
import { db } from '../db';
import { transactions, categories, budgets } from '../db/schema';
import { eq, isNull, desc, and } from 'drizzle-orm';
import { requireAuth } from './auth';
import { scraperEvents, submitOTP, runScraper } from '../services/scraper.service';
import { CompanyTypes } from 'israeli-bank-scrapers';

export const apiRouter = express.Router();

// Middleware: all API routes require authentication
apiRouter.use(requireAuth);

apiRouter.post('/sync', async (req: any, res) => {
  const userId = req.user.id;
  try {
    const options = {
      companyId: (process.env.SCRAPER_COMPANY_ID as CompanyTypes) || 'hapoalim',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // last 60 days
      combineInstallments: false,
      showBrowser: false, // Set to true if debugging locally
      additionalTransactionInformation: true, // MUST be true to get real names instead of placeholders
    };
    
    const credentials = {
      id: process.env.SCRAPER_USERNAME || '',
      userCode: process.env.SCRAPER_USERNAME || '', // Some banks use userCode
      password: process.env.SCRAPER_PASSWORD || '',
    };

    const scrapeResult = await runScraper(options, credentials as any);
    if (!scrapeResult.success) {
       return res.status(500).json({ error: 'Scrape failed or incomplete', details: scrapeResult });
    }

    let insertedCount = 0;
    
    for (const account of scrapeResult.accounts || []) {
       const accountId = account.accountNumber;
        for (const txn of account.txns) {
          // If the bank gives us a generic description (like 'דירקט'), the actual store is often in the memo.
          const fullMerchant = txn.memo ? `${txn.description} - ${txn.memo}` : txn.description;
          
          // Deduplication check: same date, amount. 
          // We fetch all transactions for this date and amount and fuzzy match the merchant in JS
          // to handle cases where the user renamed the merchant, or the bank appended a memo.
          const amountStr = txn.chargedAmount.toString();
          const existingForDateAndAmount = await db.select().from(transactions).where(
             and(
               eq(transactions.userId, userId),
               eq(transactions.transactionDate, new Date(txn.date)),
               eq(transactions.amount, amountStr)
             )
          );
          
          // Helper to normalize merchant names for comparison (remove punctuation, spaces, exact match)
          const normalize = (s: string) => s.replace(/[^\w\sא-ת]/gi, '').replace(/\s+/g, '').toLowerCase();
          const normFull = normalize(fullMerchant);
          const normDesc = normalize(txn.description);
          
          const isDuplicate = existingForDateAndAmount.some(existingTxn => {
            const normExisting = normalize(existingTxn.merchant);
            // If the existing name is contained in the new name, or vice versa, it's a duplicate
            return normFull.includes(normExisting) || normExisting.includes(normFull) ||
                   normDesc.includes(normExisting) || normExisting.includes(normDesc);
          });
          
          if (!isDuplicate) {
             const type = txn.chargedAmount > 0 ? 'INCOME' : 'EXPENSE';
             await db.insert(transactions).values({
               userId,
               transactionDate: new Date(txn.date),
               amount: amountStr,
               merchant: fullMerchant,
               type,
               source: 'BANK_SYNC',
               paymentMethod: 'CREDIT', 
               accountId,
               isTemplate: false,
             });
             insertedCount++;
          }
       }
    }
    
    res.json({ success: true, insertedCount });
  } catch (error: any) {
    console.error("Sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

// SSE Endpoint for OTP challenges
apiRouter.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onOTP = (data: any) => {
    res.write(`event: AWAITING_OTP\ndata: ${JSON.stringify(data)}\n\n`);
  };

  scraperEvents.on('AWAITING_OTP', onOTP);

  req.on('close', () => {
    scraperEvents.off('AWAITING_OTP', onOTP);
  });
});

apiRouter.post('/otp/submit', (req, res) => {
  const { sessionId, code } = req.body;
  const success = submitOTP(sessionId, code);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid or expired OTP session' });
  }
});

apiRouter.get('/transactions', async (req, res) => {
  try {
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.transactionDate));
    res.json({ success: true, data: allTransactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

apiRouter.get('/swipe-queue', async (req, res) => {
  try {
    const pending = await db.select().from(transactions).where(isNull(transactions.categoryId)).orderBy(desc(transactions.transactionDate));
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch swipe queue' });
  }
});

apiRouter.patch('/transactions/:id/category', async (req, res) => {
  const { categoryId } = req.body;
  const id = req.params.id;
  try {
    const updated = await db.update(transactions).set({ categoryId }).where(eq(transactions.id, id)).returning();
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

apiRouter.patch('/transactions/:id/merchant', async (req, res) => {
  const { merchant } = req.body;
  const id = req.params.id;
  try {
    const updated = await db.update(transactions).set({ merchant }).where(eq(transactions.id, id)).returning();
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update merchant name' });
  }
});

// -- BUDGETS --

apiRouter.get('/budget/:period', async (req, res) => {
  const period = req.params.period;
  try {
    const userId = req.user.id;
    // Get global budget (categoryId is null)
    const result = await db.select().from(budgets).where(and(eq(budgets.period, period), isNull(budgets.categoryId), eq(budgets.userId, userId)));
    if (result.length > 0) {
      res.json({ success: true, data: result[0] });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

apiRouter.post('/budget', async (req, res) => {
  const { period, amount } = req.body;
  try {
    const userId = req.user.id;
    // Upsert the global budget
    const existing = await db.select().from(budgets).where(and(eq(budgets.period, period), isNull(budgets.categoryId), eq(budgets.userId, userId)));
    if (existing.length > 0) {
      const updated = await db.update(budgets).set({ userDefinedLimit: amount.toString() }).where(eq(budgets.id, existing[0].id)).returning();
      res.json({ success: true, data: updated[0] });
    } else {
      const inserted = await db.insert(budgets).values({
        userId,
        period,
        aiSuggestedLimit: '10000', // Default fallback
        userDefinedLimit: amount.toString()
      }).returning();
      res.json({ success: true, data: inserted[0] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

apiRouter.post('/transactions/manual', async (req, res) => {
  const { date, amount, merchant, isTemplate, categoryId } = req.body;
  try {
    const inserted = await db.insert(transactions).values({
      transactionDate: new Date(date),
      amount,
      merchant,
      categoryId,
      paymentMethod: 'CASH',
      isTemplate: isTemplate || false,
      userId: (req as any).user.id,
      type: 'EXPENSE',
      source: 'MANUAL'
    }).returning();
    res.json({ success: true, data: inserted[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

apiRouter.get('/templates', async (req, res) => {
  try {
    const templates = await db.select().from(transactions).where(eq(transactions.isTemplate, true)).orderBy(desc(transactions.createdAt));
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

apiRouter.get('/categories', async (req, res) => {
  try {
    const cats = await db.select().from(categories);
    res.json({ success: true, data: cats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
