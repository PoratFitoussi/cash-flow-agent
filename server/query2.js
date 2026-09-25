const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://admin:password@localhost:5432/cashflow' });
async function run() {
  const res = await pool.query("SELECT id, amount, merchant, original_merchant, created_at FROM transactions ORDER BY amount DESC LIMIT 20");
  console.log(res.rows);
  pool.end();
}
run();
