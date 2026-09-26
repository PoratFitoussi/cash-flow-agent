import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './src/routes/api';
import { initCronJobs } from './src/services/cron.service';
import { db } from './src/db';
import { sql } from 'drizzle-orm';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Start the server
async function startServer() {
  try {
    console.log("Applying database schema updates...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "merchant_category_mappings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "merchant_name" varchar(255) NOT NULL,
        "category_id" uuid NOT NULL,
        "rename_to" varchar(255),
        "owner_name" varchar(255),
        "confidence_score" integer NOT NULL,
        "expense_type" varchar(20) DEFAULT 'WANT' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "merchant_category_mappings_merchant_name_unique" UNIQUE("merchant_name")
      );
      
      ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "original_merchant" varchar(255);
      ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "expense_type" varchar(20) DEFAULT 'WANT' NOT NULL;
      ALTER TABLE "transactions" DROP COLUMN IF EXISTS "is_fixed";
    `);
    console.log("Schema updates applied successfully.");
  } catch (err) {
    console.error("Failed to apply schema updates:", err);
  }

  app.listen(port, () => {
      console.log(`API Server running at http://localhost:${port}`);
      // Initialize background automated tasks
      initCronJobs();
  });
}

startServer();
