import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { Sql } from 'postgres';
import { verifyPassword, signToken, verifyToken } from '../auth/auth.js';
import { serializeSession, clearSession, readSession } from '../auth/cookies.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', minLength: 1 },
      password: { type: 'string', minLength: 1 },
    },
  },
};

const authRoute: FastifyPluginAsync<{ db: Sql }> = async (app, { db }) => {
  app.post('/api/auth/login', { schema: loginSchema }, async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };
    const [user] = await db<UserRow[]>`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `;
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
    reply.header('Set-Cookie', serializeSession(signToken({ sub: user.id, role: 'user' })));
    return { user: { id: user.id, email: user.email } };
  });

  app.get('/api/auth/me', async (req, reply) => {
    const token = readSession(req.headers.cookie);
    if (!token) return reply.status(401).send({ error: 'Unauthorized' });
    try {
      const { sub } = verifyToken(token);
      const [user] = await db<UserRow[]>`SELECT id, email FROM users WHERE id = ${sub}`;
      if (!user) return reply.status(401).send({ error: 'Unauthorized' });
      return { user: { id: user.id, email: user.email } };
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  app.post('/api/auth/logout', async (_req, reply) => {
    reply.header('Set-Cookie', clearSession());
    return { ok: true };
  });
};

export default fp(authRoute, { name: 'auth-routes' });
