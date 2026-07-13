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

/** Truncates every table between tests so each test starts from an empty DB. */
export async function resetDb() {
  await ready;
  await testDb.execute(
    sql`TRUNCATE TABLE "Scrobble", "Track", "Album", "Artist", "User" RESTART IDENTITY CASCADE`,
  );
}
