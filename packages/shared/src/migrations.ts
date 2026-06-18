import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const __dirname = dirname(fileURLToPath(import.meta.url));

// dist/migrations.js → <package root>/drizzle/migrations
export const coreMigrationsFolder = join(__dirname, '..', 'drizzle', 'migrations');

// Applies core's schema to a database. Used by the shell on boot and by each
// module's tests (via the testkit) to build the schema in a fresh testcontainer.
export async function applyCoreMigrations(connectionString: string): Promise<void> {
  const client = postgres(connectionString, { max: 1 });
  try {
    await migrate(drizzle(client), { migrationsFolder: coreMigrationsFolder });
  } finally {
    await client.end();
  }
}
