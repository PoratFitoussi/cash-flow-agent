import express from 'express';
import { db } from '../db';
import { transactions, categories, budgets, cardOwners, merchantCategoryMappings } from '../db/schema';
import { eq, isNull, desc, and, or, ilike, gte, lte } from 'drizzle-orm';
import { requireAuth } from './auth';
import { scraperEvents, submitOTP, runScraper } from '../services/scraper.service';
import { processPendingTransactions } from '../services/aiCategorization.service';
import { CompanyTypes } from 'israeli-bank-scrapers';

export const apiRouter = express.Router();

// Middleware: all API routes require authentication
apiRouter.use(requireAuth);

apiRouter.post('/sync', async (req: any, res) => {
  const userId = req.user.id;
  try {
    const options = {
      companyId: (process.env.SCRAPER_COMPANY_ID as CompanyTypes) || 'hapoalim',
      startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // last 120 days (approx 4 months)
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
    const existingMappings = await db.select().from(cardOwners);
    const memoryRules = await db.select().from(merchantCategoryMappings);
    const defaultSpendingsCategory = await db.query.categories.findFirst({ where: eq(categories.name, 'בזבוזים') });
    const basisCategory = await db.query.categories.findFirst({ where: eq(categories.name, 'בסיס') });
    
    for (const account of scrapeResult.accounts || []) {
       const accountId = account.accountNumber;
       const mapping = existingMappings.find(m => m.accountId === accountId);
       const defaultCardOwner = mapping ? mapping.ownerName : null;
       
       for (const txn of account.txns) {
          // If the bank gives us a generic description (like 'דירקט'), the actual store is often in the memo.
          let fullMerchant = txn.memo ? `${txn.description} - ${txn.memo}` : txn.description;
          const originalMerchantString = fullMerchant; // Save the raw bank string before memory rules mutate it
          
          // Completely ignore placeholder "Direct" (דירקט) transactions
          if (fullMerchant.includes('דירקט')) {
            continue;
          }

          // Check if the 4-digit card suffix exists in the transaction text
          let matchedCardOwner = defaultCardOwner;
          if (!matchedCardOwner) {
            const fallbackMapping = existingMappings.find(m => fullMerchant.includes(m.accountId));
            if (fallbackMapping) {
              matchedCardOwner = fallbackMapping.ownerName;
            }
          }
          
          let assignedCategoryId = null;

          // Apply AI Memory Rules
          for (const rule of memoryRules) {
             if (fullMerchant.toLowerCase().includes(rule.merchantName.toLowerCase())) {
                assignedCategoryId = rule.categoryId;
                if (rule.renameTo) fullMerchant = rule.renameTo;
                if (rule.ownerName) matchedCardOwner = rule.ownerName;
                break;
             }
          }
          
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
          const normFullOriginal = normalize(originalMerchantString);
          const normDesc = normalize(txn.description);
          
          const isDuplicate = existingForDateAndAmount.some(existingTxn => {
            const normExisting = normalize(existingTxn.originalMerchant || existingTxn.merchant);
            // If the existing original name is contained in the new original name, or vice versa, it's a duplicate
            return normFullOriginal.includes(normExisting) || normExisting.includes(normFullOriginal) ||
                   normDesc.includes(normExisting) || normExisting.includes(normDesc);
          });
          
          if (!isDuplicate) {
             const type = txn.chargedAmount > 0 ? 'INCOME' : 'EXPENSE';
             if (!assignedCategoryId && type === 'EXPENSE' && defaultSpendingsCategory) {
               assignedCategoryId = defaultSpendingsCategory.id;
             }
             
             const isFixedTransaction = assignedCategoryId === basisCategory?.id;
             
             await db.insert(transactions).values({
               userId,
               transactionDate: new Date(txn.date),
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
    
    // Auto-categorize any pending transactions immediately after sync
    await processPendingTransactions();

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
    const { owner, isFixed, status, search, categoryId, type } = req.query;
    const conditions = [];

    if (type && type !== 'All') {
      conditions.push(eq(transactions.type, type as string));
    }

    if (owner && owner !== 'All') {
      conditions.push(eq(transactions.cardOwner, owner as string));
    }
    
    if (isFixed && isFixed !== 'All') {
      conditions.push(eq(transactions.isFixed, isFixed === 'true'));
    }
    
    if (status && status !== 'All') {
      conditions.push(eq(transactions.status, status as string));
    }

    if (categoryId && categoryId !== 'All') {
      if (categoryId === 'Uncategorized') {
        conditions.push(isNull(transactions.categoryId));
      } else {
        conditions.push(eq(transactions.categoryId, categoryId as string));
      }
    }
    
    if (search) {
      const searchStr = `%${search}%`;
      conditions.push(
        or(
          ilike(transactions.merchant, searchStr),
          ilike(transactions.notes, searchStr)
        )
      );
    }

    const allTransactions = await db.query.transactions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(transactions.transactionDate)],
      with: { category: true }
    });
    res.json({ success: true, data: allTransactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

apiRouter.get('/swipe-queue', async (req, res) => {
  try {
    const pending = await db.query.transactions.findMany({
      where: isNull(transactions.categoryId),
      orderBy: [desc(transactions.transactionDate)],
      with: { category: true }
    });
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

apiRouter.post('/transactions/process-pending', async (req, res) => {
  try {
    const result = await processPendingTransactions();
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Process pending transactions error:", error);
    res.status(500).json({ error: error.message });
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

apiRouter.get('/budget/:period/all', async (req, res) => {
  const period = req.params.period;
  try {
    const userId = req.user.id;
    const userBudgets = await db.select().from(budgets).where(and(eq(budgets.period, period), eq(budgets.userId, userId)));
    
    const [yStr, mStr] = period.split('-');
    let pastMonth = parseInt(mStr, 10) - 1;
    let pastYear = parseInt(yStr, 10);
    if (pastMonth === 0) {
      pastMonth = 12;
      pastYear--;
    }
    const startDate = new Date(pastYear, pastMonth - 1, 1);
    const endDate = new Date(pastYear, pastMonth, 0, 23, 59, 59, 999);

    const pastExpenses = await db.select().from(transactions).where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'EXPENSE'),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate)
      )
    );

    const pastTotals: Record<string, number> = {};
    pastExpenses.forEach(t => {
      if (t.categoryId) {
        pastTotals[t.categoryId] = (pastTotals[t.categoryId] || 0) + Math.abs(Number(t.amount));
      }
    });

    const allCats = await db.select().from(categories);
    
    const mergedBudgets = allCats.map(cat => {
      const manualBudget = userBudgets.find(ub => ub.categoryId === cat.id);
      if (manualBudget) {
        return { ...manualBudget, isDynamic: false };
      } else {
        const dynamicLimit = pastTotals[cat.id] || 0;
        return { categoryId: cat.id, userDefinedLimit: dynamicLimit.toString(), period, isDynamic: true };
      }
    });

    res.json({ success: true, data: mergedBudgets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

apiRouter.post('/budget', async (req, res) => {
  const { period, amount, categoryId } = req.body;
  try {
    const userId = req.user.id;
    // Upsert the budget (either global or category specific)
    const condition = categoryId 
      ? and(eq(budgets.period, period), eq(budgets.categoryId, categoryId), eq(budgets.userId, userId))
      : and(eq(budgets.period, period), isNull(budgets.categoryId), eq(budgets.userId, userId));
      
    const existing = await db.select().from(budgets).where(condition);
    if (existing.length > 0) {
      const updated = await db.update(budgets).set({ userDefinedLimit: amount.toString() }).where(eq(budgets.id, existing[0].id)).returning();
      res.json({ success: true, data: updated[0] });
    } else {
      const inserted = await db.insert(budgets).values({
        userId,
        categoryId: categoryId || null,
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

// -- CARD OWNERS --
apiRouter.get('/card-owners', async (req, res) => {
  try {
    const data = await db.select().from(cardOwners);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch card owners' });
  }
});

apiRouter.post('/card-owners', async (req, res) => {
  const { accountId, ownerName } = req.body;
  try {
    const inserted = await db.insert(cardOwners).values({ accountId, ownerName }).returning();
    res.json({ success: true, data: inserted[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create card owner mapping' });
  }
});

apiRouter.delete('/card-owners/:id', async (req, res) => {
  try {
    await db.delete(cardOwners).where(eq(cardOwners.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete card owner mapping' });
  }
});

apiRouter.patch('/transactions/:id/owner', async (req, res) => {
  const { cardOwner } = req.body;
  try {
    const updated = await db.update(transactions).set({ cardOwner }).where(eq(transactions.id, req.params.id)).returning();
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update transaction owner' });
  }
});
