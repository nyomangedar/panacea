import { describe, it, expect, beforeAll } from 'vitest';
import Fastify from 'fastify';
import authMiddleware from './auth-middleware.js';
import { signToken } from './auth.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-middleware';
});

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(authMiddleware);
  app.get('/protected', async (req, reply) => {
    if (!req.user) return reply.status(401).send({ error: 'Unauthorized' });
    return { user: req.user };
  });
  app.get('/public', async () => ({ ok: true }));
  return app;
}

describe('auth middleware', () => {
  it('allows requests with a valid JWT', async () => {
    // TDD: auth-middleware.test.ts — allows requests with a valid JWT | positive
    const app = buildTestApp();
    const token = signToken({ sub: 'user-1', role: 'admin' });

    const res = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json<{ user: { sub: string } }>();
    expect(body.user.sub).toBe('user-1');
  });

  it('returns 401 with no token', async () => {
    // TDD: auth-middleware.test.ts — returns 401 with no token | negative
    const app = buildTestApp();
    const res = await app.inject({ method: 'GET', url: '/protected' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    // TDD: auth-middleware.test.ts — returns 401 with an invalid token | negative
    const app = buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { authorization: 'Bearer not-a-real-token' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('allows unauthenticated access to public routes', async () => {
    // middleware does not block routes that do not check request.user | positive
    const app = buildTestApp();
    const res = await app.inject({ method: 'GET', url: '/public' });
    expect(res.statusCode).toBe(200);
  });
});
