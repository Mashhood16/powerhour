import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// We use the Pool for standard queries to handle multiple concurrent connections.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Standard query helper.
 */
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

/**
 * Helper to execute a set of operations within a SQL Transaction.
 */
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};
