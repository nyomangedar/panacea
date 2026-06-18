import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import postgres, { type Sql } from 'postgres';
import { applyCoreMigrations } from './migrations.js';
import { syncPermissions } from './permission-registry.js';
import type { PermissionDef } from './manifest.js';

let container: StartedPostgreSqlContainer;
let db: Sql;

const defs: PermissionDef[] = [
  { key: 'admin:access', label: 'Access Admin', level: 'module' },
  { key: 'admin:users:access', label: 'Users', level: 'page', page: 'Users' },
  { key: 'admin:users:create', label: 'Create user', level: 'function', page: 'Users' },
];

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  const uri = container.getConnectionUri();
  await applyCoreMigrations(uri);
  db = postgres(uri, { max: 2 });
});

afterAll(async () => {
  await db?.end();
  await container?.stop();
});

describe('syncPermissions', () => {
  it('syncs PermissionDefs from all manifests into public.permissions on boot', async () => {
    // TDD: permission-registry.test.ts — syncs PermissionDefs from all manifests into public.permissions | positive
    await syncPermissions(db, defs);

    const rows = await db<{ key: string; level: string; module: string; page: string | null }[]>`
      SELECT key, level, module, page FROM permissions ORDER BY sort_order`;

    expect(rows.map((r) => r.key)).toEqual([
      'admin:access',
      'admin:users:access',
      'admin:users:create',
    ]);
    expect(rows.every((r) => r.module === 'admin')).toBe(true);
    const create = rows.find((r) => r.key === 'admin:users:create')!;
    expect(create.level).toBe('function');
    expect(create.page).toBe('Users');
  });

  it('upsert is idempotent; re-running boot does not duplicate keys', async () => {
    // TDD: permission-registry.test.ts — upsert is idempotent; re-running boot does not duplicate keys | positive
    await syncPermissions(db, defs);
    await syncPermissions(db, [{ key: 'admin:access', label: 'Renamed', level: 'module' }, ...defs.slice(1)]);

    const [{ count }] = await db<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM permissions`;
    expect(Number(count)).toBe(3);

    const [{ label }] = await db<{ label: string }[]>`
      SELECT label FROM permissions WHERE key = 'admin:access'`;
    expect(label).toBe('Renamed');
  });
});
