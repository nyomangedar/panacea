import { describe, it, expect, beforeAll } from 'vitest';
import Fastify from 'fastify';
import authMiddleware from './auth-middleware.js';
import { signToken } from './auth.js';
import { serializeSession } from './cookies.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-cookie';
});

function appWithWhoami() {
  const app = Fastify({ logger: false });
  app.register(authMiddleware);
  app.get('/whoami', async (req) => ({ sub: req.user?.sub ?? null }));
  return app;
}

describe('authMiddleware (cookie)', () => {
  it('populates request.user from the session cookie', async () => {
    // TDD: auth-middleware.test.ts — populates request.user from the session cookie | positive
    const app = appWithWhoami();
    const cookie = serializeSession(signToken({ sub: 'user-1', role: 'user' }));
    const res = await app.inject({ method: 'GET', url: '/whoami', headers: { cookie } });
    expect(res.json<{ sub: string | null }>().sub).toBe('user-1');
    await app.close();
  });

  it('leaves request.user null when no token is present', async () => {
    // TDD: auth-middleware.test.ts — populates request.user from the session cookie | negative
    const app = appWithWhoami();
    const res = await app.inject({ method: 'GET', url: '/whoami' });
    expect(res.json<{ sub: string | null }>().sub).toBeNull();
    await app.close();
  });
});
