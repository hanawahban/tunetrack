import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { sql } from 'drizzle-orm';
import { join } from 'path';
import * as schema from '../db/schema';

const client = new PGlite();
export const testDb = drizzle(client, { schema });

export const ready = migrate(testDb, {
  migrationsFolder: join(import.meta.dir, '../../drizzle'),
});

/** Truncates every table between tests so each test starts from an empty DB.
 *  Reads the table list from information_schema instead of hardcoding it, so a new table
 *  added to the schema doesn't silently get skipped. */
export async function resetDb() {
  await ready;
  const { rows } = await testDb.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
  );
  const tables = (rows as { table_name: string }[]).map((r) => `"${r.table_name}"`).join(', ');
  if (tables) {
    await testDb.execute(sql.raw(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`));
  }
}
