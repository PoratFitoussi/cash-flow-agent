const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://admin:password@localhost:5432/cashflow' });
async function run() {
  const res = await pool.query("SELECT id, transaction_date, amount, merchant FROM transactions ORDER BY transaction_date DESC LIMIT 10");
  console.log(res.rows);
  pool.end();
}
run();
