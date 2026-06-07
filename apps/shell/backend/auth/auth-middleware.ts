import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, type TokenPayload } from './auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: TokenPayload | null;
  }
}

const authMiddleware: FastifyPluginAsync = async (app) => {
  app.decorateRequest('user', null);

  app.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) return;
    const token = header.slice(7);
    try {
      request.user = verifyToken(token);
    } catch {
      // invalid token — leave request.user as null, route handler decides whether to reject
    }
  });
};

export default fp(authMiddleware);
