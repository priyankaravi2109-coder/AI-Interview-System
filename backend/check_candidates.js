require("dotenv").config();

const { Client } = require("pg");

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function run() {
  await client.connect();

  const result = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'candidates'
    ORDER BY ordinal_position
  `);

  console.table(result.rows);

  await client.end();
}

run().catch(console.error);
