import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import Fastify from 'fastify';
import postgres from 'postgres';
import healthRoute from '../routes/health.js';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
});

afterAll(async () => {
  await container.stop();
});

describe('GET /health', () => {
  it('returns 200 with db: ok when Postgres is reachable', async () => {
    const db = postgres(container.getConnectionUri(), { max: 1 });
    const app = Fastify({ logger: false });
    app.register(healthRoute, { db });

    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    const body = res.json<{ status: string; db: string }>();
    expect(body.status).toBe('ok');
    expect(body.db).toBe('ok');

    await db.end();
  });

  it('returns 503 when Postgres is down', async () => {
    const db = postgres('postgresql://bad:bad@localhost:1/none', {
      max: 1,
      connect_timeout: 2,
    });
    const app = Fastify({ logger: false });
    app.register(healthRoute, { db });

    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(503);
    const body = res.json<{ status: string; db: string }>();
    expect(body.status).toBe('error');
    expect(body.db).toBe('unreachable');

    await db.end({ timeout: 1 });
  });
});
