import { db } from './src/db';
import { transactions } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
  try {
    const deleted = await db.delete(transactions)
      .where(eq(transactions.merchant, 'דירקט- מצטבר'))
      .returning();
    
    console.log(`Successfully deleted ${deleted.length} generic 'דירקט- מצטבר' placeholders.`);
  } catch (error) {
    console.error('Error deleting transactions:', error);
  } finally {
    process.exit(0);
  }
}

run();
