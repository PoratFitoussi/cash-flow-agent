import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import "dotenv/config";

// By not passing connectionString, the pg Pool will automatically read
// PGHOST, PGUSER, PGPASSWORD, PGDATABASE, and PGPORT from the environment.
const pool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : undefined);

export const db = drizzle(pool, { schema });
