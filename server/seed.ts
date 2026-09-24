import { db } from './src/db';
import { categories } from './src/db/schema';
import { eq } from 'drizzle-orm';

const coreCategories = [
  { name: 'Supermarket', icon: '🛒' },
  { name: 'Car', icon: '🚗' },
  { name: 'Housing', icon: '🏠' },
  { name: 'Eating out', icon: '🍽️' },
  { name: 'Health', icon: '⚕️' },
];

async function seed() {
  console.log('Seeding core categories...');
  for (const cat of coreCategories) {
    const existing = await db.select().from(categories).where(eq(categories.name, cat.name));
    if (existing.length === 0) {
      await db.insert(categories).values(cat);
      console.log(`✅ Inserted category: ${cat.name}`);
    } else {
      console.log(`ℹ️ Category already exists: ${cat.name}`);
    }
  }
  console.log('Done seeding.');
  process.exit(0);
}

seed().catch(console.error);
