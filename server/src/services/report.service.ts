import { db } from '../db';
import { transactions, categories } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function generateEndOfMonthReport() {
  console.log('[REPORT AGENT] Generating End-of-Month statistical report...');
  
  try {
    const defaultUserId = "1"; // Assuming single-user for now
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Set boundaries for the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Fetch all transactions for this month
    const monthlyTxns = await db.select().from(transactions).where(
      and(
        eq(transactions.userId, defaultUserId),
        sql`${transactions.transactionDate} >= ${startOfMonth.toISOString()}`,
        sql`${transactions.transactionDate} <= ${endOfMonth.toISOString()}`
      )
    );

    // Filter out "Investments"
    const investmentsCat = await db.query.categories.findFirst({ where: eq(categories.name, 'השקעות') });
    const investId = investmentsCat ? investmentsCat.id : null;
    
    const validTxns = monthlyTxns.filter(t => t.categoryId !== investId);
    
    const totalIncome = validTxns.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = validTxns.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
    const reportText = `📊 END OF MONTH REPORT (${startOfMonth.toLocaleString('default', { month: 'long' })})
Income: ₪${totalIncome.toLocaleString()}
Total Spending: ₪${totalExpenses.toLocaleString()}
Net Cash Flow: ₪${(totalIncome - totalExpenses).toLocaleString()}

(This report has been generated successfully and is ready to be pushed to your configured notification channel.)`;

    console.log(reportText);
    return { success: true, reportText };

  } catch (error) {
    console.error('[REPORT AGENT] Failed to generate report:', error);
    return { success: false, error };
  }
}
