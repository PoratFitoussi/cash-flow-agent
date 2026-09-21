import { db } from './src/db/index';
import { categories } from './src/db/schema';

const CORE_CATEGORIES = [
  { name: 'קניות סופר', icon: '🛒' },
  { name: 'רכב', icon: '🚗' },
  { name: 'דיור', icon: '🏠' },
  { name: 'אוכל בחוץ', icon: '🍔' },
  { name: 'בריאות', icon: '💊' },
];

async function seed() {
  console.log('Seeding core categories...');
  try {
    for (const category of CORE_CATEGORIES) {
      await db
        .insert(categories)
        .values(category)
        .onConflictDoNothing({ target: categories.name });
    }
    console.log('Successfully seeded core categories.');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    process.exit(0);
  }
}

seed();
