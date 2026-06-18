import { validateEnv } from './env-validation.js';
import { runMigrations } from './db/migrate.js';
import { getSqlClient } from './db/client.js';
import { buildServer } from './server.js';
import { registerModules } from './core/load-runtime-modules.js';

const env = validateEnv();

// Always run migrations on boot — drizzle's migrator is idempotent and applies only
// pending ones, so a DB with older migrations still picks up new module tables.
await runMigrations(env.DATABASE_URL);

const db = getSqlClient(env.DATABASE_URL);
const app = buildServer({ db });

// Discover + load feature modules (admin, …) from MODULES_PATH into the shell.
await registerModules(app, db);

await app.listen({ port: env.PORT, host: '0.0.0.0' });
