import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

async function initDb() {
  console.log("Starting database initialization...");
  
  // Create a connection directly using the URL
  const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
    multipleStatements: true,
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Executing schema.sql...");
    
    // Process statements individually if multipleStatements causes issues, or execute fully.
    await connection.query(schemaSql);

    console.log("✅ Database initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDb();
