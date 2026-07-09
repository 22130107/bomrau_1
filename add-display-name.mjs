import mysql from 'mysql2/promise';
import fs from 'fs';

let envFile = '.env';
if (!fs.existsSync(envFile)) {
  envFile = '.env.local';
}

const envConfig = fs.readFileSync(envFile, 'utf8');
for (const line of envConfig.split('\n')) {
  const match = line.trim().match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "12345",
    database: process.env.DB_NAME || "bomrautft",
  });

  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM users LIKE 'display_name'");
    if (rows.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN display_name VARCHAR(255) DEFAULT NULL AFTER username");
      console.log("Added display_name column!");
    } else {
      console.log("Column display_name already exists.");
    }
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await pool.end();
  }
}

run();
