import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found");
    process.exit(1);
  }

  const sql = postgres(connectionString);
  const db = drizzle(sql);


  await sql`NOTIFY pgrst, 'reload schema'`;


  await sql.end();
}

main();
