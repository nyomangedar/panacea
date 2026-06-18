import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { coreMigrationsFolder } from '@panacea/shared';

export async function runMigrations(connectionString: string): Promise<void> {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: coreMigrationsFolder });
  await client.end();
}

export async function checkMigrationsApplied(connectionString: string): Promise<boolean> {
  const client = postgres(connectionString, { max: 1 });
  try {
    const result = await client<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM drizzle.__drizzle_migrations
    `;
    return Number(result[0].count) > 0;
  } catch {
    return false;
  } finally {
    await client.end();
  }
}
