import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { Sql } from 'postgres';

const healthRoute: FastifyPluginAsync<{ db: Sql }> = async (app, { db }) => {
  app.get('/health', async (_req, reply) => {
    try {
      await db`SELECT 1`;
      return { status: 'ok', db: 'ok' };
    } catch {
      reply.status(503);
      return { status: 'error', db: 'unreachable' };
    }
  });
};

export default fp(healthRoute, { name: 'health' });
