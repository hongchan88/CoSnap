import type { Config } from 'drizzle-kit';

export default {
  schema: './app/db/schema.ts',
  out: './app/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;