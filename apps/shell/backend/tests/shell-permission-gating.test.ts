import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import Fastify from 'fastify';
import postgres, { type Sql } from 'postgres';
import { applyCoreMigrations } from '@panacea/shared';
import { seedUserWithPermissions } from '@panacea/shared/testkit';
import { signToken } from '../auth/auth.js';
import { serializeSession } from '../auth/cookies.js';
import authRoute from '../routes/auth.js';

let container: StartedPostgreSqlContainer;
let db: Sql;
let userId: string;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-gating';
  container = await new PostgreSqlContainer().start();
  const uri = container.getConnectionUri();
  await applyCoreMigrations(uri);
  db = postgres(uri, { max: 2 });
  userId = await seedUserWithPermissions(db, ['admin:users:read', 'admin:groups:read']);
});

afterAll(async () => {
  await db?.end();
  await container?.stop();
});

describe('shell permission gating', () => {
  it("GET /api/auth/me returns the user's effective permission set", async () => {
    // TDD: shell-permission-gating.test.tsx — /api/auth/me returns the user's effective permission set | positive
    const app = Fastify({ logger: false });
    app.register(authRoute, { db });
    const cookie = serializeSession(signToken({ sub: userId, role: 'user' }));

    const res = await app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie } });
    expect(res.statusCode).toBe(200);
    const body = res.json<{ user: { id: string }; permissions: string[] }>();
    expect(body.user.id).toBe(userId);
    expect([...body.permissions].sort()).toEqual(['admin:groups:read', 'admin:users:read']);

    await app.close();
  });
});
