import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create a PostgreSQL client
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Configure postgres client for production
const client = postgres(connectionString, {
  prepare: false,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for easy access
export * from './schema';