// db.js
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  // max: 10, // limite de conexões (opcional)
  // idle_timeout: 60,
  // connect_timeout: 10
});

export { sql };
