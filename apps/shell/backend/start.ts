import { validateEnv } from './env-validation.js';
import { runMigrations, checkMigrationsApplied } from './db/migrate.js';
import { getSqlClient } from './db/client.js';
import { buildServer } from './server.js';

const env = validateEnv();

const migrated = await checkMigrationsApplied(env.DATABASE_URL);
if (!migrated) {
  await runMigrations(env.DATABASE_URL);
}

const db = getSqlClient(env.DATABASE_URL);
const app = buildServer({ db });

await app.listen({ port: env.PORT, host: '0.0.0.0' });
