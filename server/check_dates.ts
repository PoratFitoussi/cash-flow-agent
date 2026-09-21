import { db } from './src/db';
import { transactions } from './src/db/schema';

async function run() {
  try {
    const all = await db.select().from(transactions);
    console.log('Total:', all.length);
    console.log('Oldest:', new Date(Math.min(...all.map(t => new Date(t.transactionDate).getTime()))));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
