import { db } from '../db';
import { transactions, categories, merchantCategoryMappings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

export async function categorizeTransactionsBatch(merchants: string[]): Promise<Record<string, { categoryId: string, confidenceScore: number, expenseType: string }> | null> {
  const allCategories = await db.select().from(categories);
  if (allCategories.length === 0) return null;

  const categoryListStr = allCategories.map(c => `ID: ${c.id}, Name: ${c.name}`).join('\n');
  const merchantsList = merchants.map(m => `"${m}"`).join(', ');

  const prompt = `
You are an expert financial categorizer.
Categorize each of the following bank transaction merchant names into one of the provided categories.

Available Categories:
${categoryListStr}

Merchants to categorize:
[${merchantsList}]

Return a strict JSON payload. The root object must be a map where the key is the exact merchant name, and the value is an object containing exactly three fields:
- "categoryId": The ID of the best matching category from the list above.
- "confidenceScore": An integer between 0 and 100 representing your confidence.
- "expenseType": A string, either "NEED" or "WANT". Return "NEED" for required survival expenses (e.g., rent, utilities, supermarket/groceries, health, insurance, basic fuel). Return "WANT" for discretionary spending (e.g., eating out, restaurants, shopping, subscriptions, entertainment).
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: 'You are a helpful assistant designed to output strict JSON.'
    });

    const content = result.response.text();
    if (!content) return null;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error calling Gemini batch categorization:", error);
    return null;
  }
}

export async function processPendingTransactions() {
  console.log("Starting batch categorization of pending transactions...");
  
  const pendingTxns = await db.select()
    .from(transactions)
    .where(eq(transactions.status, 'PENDING'));
    
  console.log(`Found ${pendingTxns.length} pending transactions.`);
  if (pendingTxns.length === 0) return { totalPending: 0, processed: 0 };

  const uniqueMerchants = [...new Set(pendingTxns.map(t => t.merchant).filter(Boolean))] as string[];
  console.log(`Found ${uniqueMerchants.length} unique merchants to categorize.`);

  const categoryMap = new Map<string, { categoryId: string, expenseType: string }>();
  
  // First, check DB cache for all unique merchants
  const cachedMappings = await db.select().from(merchantCategoryMappings);
  const uncachedMerchants = [];
  
  for (const merchant of uniqueMerchants) {
    const cache = cachedMappings.find(m => m.merchantName === merchant);
    if (cache) {
      categoryMap.set(merchant, { categoryId: cache.categoryId, expenseType: cache.expenseType });
    } else {
      uncachedMerchants.push(merchant);
    }
  }

  // Process uncached merchants in batches of 30 to avoid rate limits and massive prompts
  const chunkSize = 30;
  for (let i = 0; i < uncachedMerchants.length; i += chunkSize) {
    const chunk = uncachedMerchants.slice(i, i + chunkSize);
    const llmResults = await categorizeTransactionsBatch(chunk);
    
    if (llmResults) {
      for (const [merchant, data] of Object.entries(llmResults)) {
        if (data.categoryId && data.confidenceScore >= 85) {
          categoryMap.set(merchant, { categoryId: data.categoryId, expenseType: data.expenseType || 'WANT' });
          // Save to cache
          await db.insert(merchantCategoryMappings).values({
            merchantName: merchant,
            categoryId: data.categoryId,
            confidenceScore: data.confidenceScore,
            expenseType: data.expenseType || 'WANT'
          }).catch(e => console.error("Cache insert error", e));
        }
      }
    }
  }

  let processedCount = 0;
  for (const txn of pendingTxns) {
    if (!txn.merchant) continue;
    
    const mapped = categoryMap.get(txn.merchant);
    if (mapped) {
      await db.update(transactions)
        .set({ categoryId: mapped.categoryId, expenseType: mapped.expenseType, status: 'CATEGORIZED' })
        .where(eq(transactions.id, txn.id));
      processedCount++;
    }
  }

  console.log(`Successfully categorized ${processedCount} out of ${pendingTxns.length} transactions.`);
  return { totalPending: pendingTxns.length, processed: processedCount };
}
