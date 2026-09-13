import { db } from './src/db';
import { transactions } from './src/db/schema';
import { like, or } from 'drizzle-orm';

async function run() {
  try {
    const deleted = await db.delete(transactions)
      .where(or(
        like(transactions.merchant, '%,%'),
        like(transactions.merchant, '%מצטבר%')
      ))
      .returning();
    
    console.log(`Successfully deleted ${deleted.length} merged cumulative transactions.`);
  } catch (error) {
    console.error('Error deleting transactions:', error);
  } finally {
    process.exit(0);
  }
}

run();
