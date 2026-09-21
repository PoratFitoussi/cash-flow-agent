import { db } from './src/db';
import { transactions } from './src/db/schema';
import { like } from 'drizzle-orm';

async function run() {
  try {
    const all = await db.select().from(transactions);
    console.log('Total transactions:', all.length);
    
    const ali = await db.select().from(transactions).where(like(transactions.merchant, '%ALIEXPRESS%'));
    console.log('ALIEXPRESS transactions:', ali.length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
