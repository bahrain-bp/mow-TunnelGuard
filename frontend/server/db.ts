import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is available or provide an informative message
// This allows the app to start even without DATABASE_URL when using MemStorage
let pool;
let db;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log('Connected to PostgreSQL database');
} else {
  console.warn('DATABASE_URL not set. Database connections will not be available.');
  console.warn('The application will use in-memory storage (MemStorage) instead.');
  console.warn('For local development with a database, create a .env file with DATABASE_URL.');
}

export { pool, db };
