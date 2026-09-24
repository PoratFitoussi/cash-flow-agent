const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://admin:password@localhost:5432/cashflow' });

async function run() {
  const res = await pool.query(`
    WITH duplicates AS (
      SELECT id,
             ROW_NUMBER() OVER(
               PARTITION BY amount, merchant 
               ORDER BY created_at DESC
             ) as rn
      FROM transactions
    )
    DELETE FROM transactions
    WHERE id IN (
      SELECT id FROM duplicates WHERE rn > 1
    );
  `);
  console.log(`Deleted ${res.rowCount} duplicate transactions based on exact merchant & amount.`);
  pool.end();
}
run();
