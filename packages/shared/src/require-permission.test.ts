import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import postgres, { type Sql } from 'postgres';
import type { FastifyPluginAsync } from 'fastify';
import { applyCoreMigrations } from './migrations.js';
import { createTestApp, asUser } from './testkit.js';

let container: StartedPostgreSqlContainer;
let db: Sql;
let userWithPerm: string;
let userWithoutPerm: string;

// A throwaway module route guarded by a permission, exercised through the testkit.
const guardedModule: FastifyPluginAsync<{ db: Sql }> = async (app) => {
  app.get(
    '/guarded',
    { preHandler: app.requirePermission('test:thing:do') },
    async () => ({ ok: true }),
  );
};

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  const uri = container.getConnectionUri();
  await applyCoreMigrations(uri);
  db = postgres(uri, { max: 2 });

  const [u1] = await db<{ id: string }[]>`
    INSERT INTO users (email, password_hash, status)
    VALUES ('has@x.com', 'x', 'active') RETURNING id`;
  const [u2] = await db<{ id: string }[]>`
    INSERT INTO users (email, password_hash, status)
    VALUES ('none@x.com', 'x', 'active') RETURNING id`;
  userWithPerm = u1.id;
  userWithoutPerm = u2.id;

  const [g] = await db<{ id: string }[]>`INSERT INTO groups (name) VALUES ('G') RETURNING id`;
  const [r] = await db<{ id: string }[]>`INSERT INTO roles (name) VALUES ('R') RETURNING id`;
  const [p] = await db<{ id: string }[]>`
    INSERT INTO permissions (key, label, level, module)
    VALUES ('test:thing:do', 'Do the thing', 'function', 'test') RETURNING id`;
  await db`INSERT INTO group_members (user_id, group_id) VALUES (${userWithPerm}, ${g.id})`;
  await db`INSERT INTO group_roles (group_id, role_id) VALUES (${g.id}, ${r.id})`;
  await db`INSERT INTO role_permissions (role_id, permission_id) VALUES (${r.id}, ${p.id})`;
});

afterAll(async () => {
  await db?.end();
  await container?.stop();
});

describe('requirePermission', () => {
  it('allows request when user has required permission', async () => {
    // TDD: require-permission.test.ts — allows request when user has required permission | positive
    const app = await createTestApp({ db, module: { plugin: guardedModule } });
    const res = await app.inject({ method: 'GET', url: '/guarded', headers: asUser(userWithPerm) });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    await app.close();
  });

  it('returns 403 when user lacks the permission', async () => {
    // TDD: require-permission.test.ts — returns 403 when user lacks the permission | negative
    const app = await createTestApp({ db, module: { plugin: guardedModule } });
    const res = await app.inject({ method: 'GET', url: '/guarded', headers: asUser(userWithoutPerm) });
    expect(res.statusCode).toBe(403);
    await app.close();
  });

  it('returns 401 when user is not authenticated', async () => {
    // TDD: require-permission.test.ts — returns 401 when user is not authenticated | negative
    const app = await createTestApp({ db, module: { plugin: guardedModule } });
    const res = await app.inject({ method: 'GET', url: '/guarded' });
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
