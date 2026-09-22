import { db } from './server/src/db';
import { users } from './server/src/db/schema';

async function test() {
  try {
    console.log("Selecting...");
    let userRecords = await db.select().from(users).limit(1);
    console.log("Selected:", userRecords);
    
    if (userRecords.length === 0) {
      console.log("Inserting...");
      userRecords = await db.insert(users).values({ email: 'test@agentfinance.local' }).returning();
      console.log("Inserted:", userRecords);
    }
  } catch (e) {
    console.error("FULL ERROR:", e);
  }
}
test();
