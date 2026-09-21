import { db } from './src/db';
import { transactions } from './src/db/schema';
import { isNotNull } from 'drizzle-orm';

async function run() {
  try {
    const result = await db.update(transactions)
      .set({ categoryId: null })
      .where(isNotNull(transactions.categoryId));
    console.log('Successfully reset all categories for all transactions.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
