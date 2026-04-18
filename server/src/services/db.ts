import mysql from 'mysql2/promise';
import { env } from '../config/env';

export const db = mysql.createPool(env.DATABASE_URL);

// Test the database connection upon initialization
db.getConnection()
  .then((conn) => {
    console.log("✅ Database connected via raw SQL (mysql2)");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed", err);
  });
