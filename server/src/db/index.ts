import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import "dotenv/config";

// Use DATABASE_URL if available (common in Coolify, Heroku, Render),
// otherwise fallback to PGHOST, PGUSER, PGPASSWORD, etc.
const pool = new Pool(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
} : undefined);

export const db = drizzle(pool, { schema });
