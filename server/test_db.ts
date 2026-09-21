import { db } from './src/db';
import { transactions } from './src/db/schema';
import { eq } from 'drizzle-orm';
async function test() {
  const pendingTxns = await db.select().from(transactions).where(eq(transactions.status, 'PENDING'));
  console.log(`Pending count: ${pendingTxns.length}`);
}
test().catch(console.error);
