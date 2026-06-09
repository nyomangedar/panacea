import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import Fastify, { type FastifyInstance } from 'fastify';
import postgres, { type Sql } from 'postgres';
import { runMigrations } from '../db/migrate.js';
import { hashPassword } from '../auth/auth.js';
import authRoute from '../routes/auth.js';

let container: StartedPostgreSqlContainer;
let db: Sql;
let app: FastifyInstance;

const EMAIL = 'alice@panacea.dev';
const PASSWORD = 'correct-horse-battery';

function sessionCookie(setCookie: string | string[] | undefined): string {
  const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie ?? '';
  return raw.split(';')[0];
}

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-login-route';
  container = await new PostgreSqlContainer().start();
  const uri = container.getConnectionUri();
  await runMigrations(uri);
  db = postgres(uri, { max: 1 });
  await db`INSERT INTO users (email, password_hash) VALUES (${EMAIL}, ${await hashPassword(PASSWORD)})`;
  app = Fastify({ logger: false });
  app.register(authRoute, { db });
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await db.end();
  await container.stop();
});

describe('auth routes', () => {
  it('POST /api/auth/login returns 200 + Set-Cookie with valid credentials', async () => {
    // TDD: login-route.test.ts — POST /api/auth/login returns 200 + Set-Cookie with valid credentials | positive
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: EMAIL, password: PASSWORD },
    });
    expect(res.statusCode).toBe(200);
    const setCookie = res.headers['set-cookie'];
    const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie ?? '';
    expect(raw).toContain('panacea_session=');
    expect(raw).toContain('HttpOnly');
    expect(res.json<{ user: { email: string } }>().user.email).toBe(EMAIL);
  });

  it('POST /api/auth/login returns 401 with wrong credentials', async () => {
    // TDD: login-route.test.ts — POST /api/auth/login returns 401 with wrong credentials | negative
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: EMAIL, password: 'wrong-password' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/me returns the current user from the cookie', async () => {
    // TDD: login-route.test.ts — GET /api/auth/me returns the current user from the cookie | positive
    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: EMAIL, password: PASSWORD },
    });
    const cookie = sessionCookie(login.headers['set-cookie']);
    const res = await app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie } });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ user: { email: string } }>().user.email).toBe(EMAIL);
  });

  it('GET /api/auth/me returns 401 with no/invalid cookie', async () => {
    // TDD: login-route.test.ts — GET /api/auth/me returns 401 with no/invalid cookie | negative
    const noCookie = await app.inject({ method: 'GET', url: '/api/auth/me' });
    expect(noCookie.statusCode).toBe(401);
    const badCookie = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie: 'panacea_session=not-a-valid-jwt' },
    });
    expect(badCookie.statusCode).toBe(401);
  });

  it('POST /api/auth/logout clears the session cookie', async () => {
    // TDD: login-route.test.ts — POST /api/auth/logout clears the session cookie | positive
    const res = await app.inject({ method: 'POST', url: '/api/auth/logout' });
    expect(res.statusCode).toBe(200);
    const raw = Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie'][0]
      : res.headers['set-cookie'] ?? '';
    expect(raw).toContain('panacea_session=;');
    expect(raw).toContain('Max-Age=0');
  });
});
