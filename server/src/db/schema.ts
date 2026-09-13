import { pgTable, uuid, text, numeric, timestamp, boolean, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Enums ---
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE']);
export const transactionSourceEnum = pgEnum('transaction_source', ['MANUAL', 'RECEIPT_AI', 'BANK_SYNC']);

// --- Users Table ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets),
  coupons: many(coupons),
}));

// --- Categories Table ---
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"), // e.g. emoji like 🛒
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets),
}));

// --- Transactions Table ---
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(), 
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount').notNull(),
  categoryId: uuid('category_id').references(() => categories.id), 
  transactionDate: timestamp('transaction_date').notNull(),
  source: transactionSourceEnum('source').notNull(),
  paymentMethod: text('payment_method').notNull(), 
  merchant: text('merchant').notNull(), // Restored from original
  isTemplate: boolean('is_template').default(false).notNull(), // Restored from original
  accountId: text('account_id'), // Restored from original
  receiptImageUrl: text('receipt_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    dateIdx: index('transaction_date_idx').on(table.transactionDate),
    categoryIdx: index('transaction_category_idx').on(table.categoryId)
  };
});

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  items: many(transactionItems),
}));

// --- Products Table ---
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  canonicalName: text("canonical_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ many }) => ({
  transactionItems: many(transactionItems),
}));

// --- Transaction Items Table ---
export const transactionItems = pgTable("transaction_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id").references(() => transactions.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  rawName: text("raw_name").notNull(),
  quantity: numeric("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  totalPrice: numeric("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id],
  }),
}));

// --- Budgets Table ---
export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  categoryId: uuid('category_id').references(() => categories.id), // Nullable for global budget
  period: text('period').notNull(), // Format: 'YYYY-MM'
  aiSuggestedLimit: numeric('ai_suggested_limit').notNull(),
  userDefinedLimit: numeric('user_defined_limit')
});

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

// --- Coupons & Wallets Table ---
export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  providerName: text('provider_name').notNull(), // e.g., 'Cibus', 'BuyMe'
  initialAmount: numeric('initial_amount').notNull(),
  currentBalance: numeric('current_balance').notNull(),
  expiryDate: timestamp('expiry_date').notNull()
});

export const couponsRelations = relations(coupons, ({ one }) => ({
  user: one(users, {
    fields: [coupons.userId],
    references: [users.id],
  }),
}));
