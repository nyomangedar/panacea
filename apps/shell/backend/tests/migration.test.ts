import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { runMigrations, checkMigrationsApplied } from '../db/migrate.js';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
});

afterAll(async () => {
  await container.stop();
});

describe('migrations', () => {
  it('runs idempotently — running twice does not error', async () => {
    const url = container.getConnectionUri();
    await expect(runMigrations(url)).resolves.not.toThrow();
    await expect(runMigrations(url)).resolves.not.toThrow();
  });

  it('checkMigrationsApplied returns false on a blank database', async () => {
    const fresh = await new PostgreSqlContainer().start();
    try {
      const result = await checkMigrationsApplied(fresh.getConnectionUri());
      expect(result).toBe(false);
    } finally {
      await fresh.stop();
    }
  });
});
