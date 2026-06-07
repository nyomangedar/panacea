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

  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const token = header.slice(7);
    try {
      request.user = verifyToken(token);
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });
};

export default fp(authMiddleware);
