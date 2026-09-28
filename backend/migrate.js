const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Using the unpooled connection string for migrations is usually safer for DDL statements
const connectionString = "postgresql://neondb_owner:npg_igGLhnPCd25e@ep-shy-union-b89imx6f.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({
  connectionString,
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to Neon DB successfully!");
    
    const sqlPath = path.join(__dirname, 'db', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log("Executing Phase 1 schema.sql...");
    await client.query(sql);
    console.log("Database tables created successfully!");
    
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
