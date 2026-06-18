import Fastify, { type FastifyInstance, type FastifyPluginAsync } from 'fastify';
import type { Sql } from 'postgres';
import rbacPlugin from './rbac.js';

export interface TestModule {
  plugin: FastifyPluginAsync<{ db: Sql }>;
  prefix?: string;
}

export interface TestAppOptions {
  db: Sql;
  module?: TestModule;
}

// A minimal stand-in for the shell at test time: a stub auth that reads the user
// id from the `x-test-user` header, the rbac decorators, and (optionally) a module
// plugin — so a module can integration-test its own routes against a real DB.
export interface CapturedEvent {
  event: string;
  payload: unknown;
}

export async function createTestApp(opts: TestAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.decorateRequest('user', null);
  app.addHook('onRequest', async (req) => {
    const id = req.headers['x-test-user'];
    if (typeof id === 'string' && id.length > 0) {
      (req as { user?: unknown }).user = { sub: id };
    }
  });

  const capturedEvents: CapturedEvent[] = [];
  app.decorate('capturedEvents', capturedEvents);
  app.decorate('publishEvent', (event: string, payload?: unknown) => {
    capturedEvents.push({ event, payload });
  });

  await app.register(rbacPlugin, { db: opts.db });

  if (opts.module) {
    await app.register(
      async (scope) => {
        await opts.module!.plugin(scope, { db: opts.db });
      },
      { prefix: opts.module.prefix },
    );
  }

  await app.ready();
  return app;
}

// Convenience: headers that authenticate a test request as the given user.
export function asUser(userId: string): Record<string, string> {
  return { 'x-test-user': userId };
}

// Events captured by the app created via createTestApp.
export function getCapturedEvents(app: FastifyInstance): CapturedEvent[] {
  return (app as unknown as { capturedEvents: CapturedEvent[] }).capturedEvents ?? [];
}

// Creates a user wired (via a dedicated group + role) to hold the given permission
// keys, returning the user id. Permissions are upserted by key. Reusable across
// module route tests to authenticate as a user with a known capability set.
export async function seedUserWithPermissions(
  db: Sql,
  permissionKeys: string[],
  opts?: { email?: string; status?: string },
): Promise<string> {
  const email = opts?.email ?? `user_${Math.random().toString(36).slice(2)}@test.local`;
  const status = opts?.status ?? 'active';

  const [user] = await db<{ id: string }[]>`
    INSERT INTO users (email, password_hash, status)
    VALUES (${email}, 'x', ${status}) RETURNING id`;

  if (permissionKeys.length === 0) return user.id;

  const [group] = await db<{ id: string }[]>`
    INSERT INTO groups (name) VALUES (${`g_${user.id}`}) RETURNING id`;
  const [role] = await db<{ id: string }[]>`
    INSERT INTO roles (name) VALUES (${`r_${user.id}`}) RETURNING id`;
  await db`INSERT INTO group_members (user_id, group_id) VALUES (${user.id}, ${group.id})`;
  await db`INSERT INTO group_roles (group_id, role_id) VALUES (${group.id}, ${role.id})`;

  for (const key of permissionKeys) {
    const moduleName = key.split(':')[0];
    const [perm] = await db<{ id: string }[]>`
      INSERT INTO permissions (key, label, level, module)
      VALUES (${key}, ${key}, 'function', ${moduleName})
      ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label
      RETURNING id`;
    await db`
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (${role.id}, ${perm.id}) ON CONFLICT DO NOTHING`;
  }

  return user.id;
}
