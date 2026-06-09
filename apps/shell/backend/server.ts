import Fastify, { type FastifyInstance } from 'fastify';
import type { Sql } from 'postgres';
import authMiddleware from './auth/auth-middleware.js';
import authRoute from './routes/auth.js';
import healthRoute from './routes/health.js';

export interface BuildServerOptions {
  db: Sql;
  logger?: boolean | object;
}

export function buildServer(opts: BuildServerOptions): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? true });
  app.register(authMiddleware);
  app.register(authRoute, { db: opts.db });
  app.register(healthRoute, { db: opts.db });
  return app;
}
