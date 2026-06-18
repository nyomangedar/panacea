import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, type TokenPayload } from './auth.js';
import { readSession } from './cookies.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: TokenPayload | null;
  }
}

const authMiddleware: FastifyPluginAsync = async (app) => {
  app.decorateRequest('user', null);

  app.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
    // Accept either a Bearer token or the httpOnly session cookie (what the shell
    // frontend uses), so requirePermission works for browser requests too.
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ')
      ? header.slice(7)
      : readSession(request.headers.cookie);
    if (!token) return;
    try {
      request.user = verifyToken(token);
    } catch {
      // invalid token — leave request.user as null, route handler decides whether to reject
    }
  });
};

export default fp(authMiddleware);
