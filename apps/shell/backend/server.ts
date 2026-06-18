import Fastify, { type FastifyInstance } from 'fastify';
import type { Sql } from 'postgres';
import { rbacPlugin } from '@panacea/shared';
import authMiddleware from './auth/auth-middleware.js';
import authRoute from './routes/auth.js';
import healthRoute from './routes/health.js';
import { eventBus } from './core/event-bus.js';

export interface BuildServerOptions {
  db: Sql;
  logger?: boolean | object;
}

export function buildServer(opts: BuildServerOptions): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? true });
  app.register(authMiddleware);
  // Core capabilities every module plugin relies on: requirePermission + publishEvent.
  app.register(rbacPlugin, { db: opts.db });
  app.decorate('publishEvent', (event: string, payload?: unknown) => eventBus.publish(event, payload));
  app.register(authRoute, { db: opts.db });
  app.register(healthRoute, { db: opts.db });
  return app;
}
