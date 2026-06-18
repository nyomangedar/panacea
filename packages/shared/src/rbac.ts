import fp from 'fastify-plugin';
import type {
  FastifyPluginAsync,
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from 'fastify';
import type { Sql } from 'postgres';
import { resolvePermissions } from './permission-resolver.js';

declare module 'fastify' {
  interface FastifyInstance {
    requirePermission(key: string): preHandlerHookHandler;
    // Publishes a domain event. Wired to the core event bus by the shell at
    // runtime, and to an in-memory capture by the testkit.
    publishEvent(event: string, payload?: unknown): void | Promise<void>;
  }
}

// Reads the current user id from the request (attached by the shell's auth
// middleware at runtime, or the testkit's stub at test time).
function currentUserId(req: FastifyRequest): string | undefined {
  return (req as { user?: { sub?: string } | null }).user?.sub ?? undefined;
}

// Gathers a user's RBAC slices and reduces them through the pure resolver.
export async function getUserPermissions(db: Sql, userId: string): Promise<Set<string>> {
  const [user] = await db<{ id: string; status: string }[]>`
    SELECT id, status FROM users WHERE id = ${userId}
  `;
  if (!user) return new Set();

  const groupMembers = await db<{ userId: string; groupId: string }[]>`
    SELECT user_id AS "userId", group_id AS "groupId"
    FROM group_members WHERE user_id = ${userId}
  `;
  const groupIds = groupMembers.map((m) => m.groupId);

  const groupRoles = groupIds.length
    ? await db<{ groupId: string; roleId: string }[]>`
        SELECT group_id AS "groupId", role_id AS "roleId"
        FROM group_roles WHERE group_id IN ${db(groupIds)}
      `
    : [];
  const roleIds = [...new Set(groupRoles.map((gr) => gr.roleId))];

  const rolePermissions = roleIds.length
    ? await db<{ roleId: string; permissionKey: string }[]>`
        SELECT rp.role_id AS "roleId", p.key AS "permissionKey"
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id IN ${db(roleIds)}
      `
    : [];

  return resolvePermissions(userId, { user, groupMembers, groupRoles, rolePermissions });
}

interface RbacOptions {
  db: Sql;
}

// Decorates the app with requirePermission(key) — a preHandler that 401s when no
// user is attached and 403s when the user lacks the key. Registered by the shell
// (real auth) and by the testkit (stub auth).
const rbacPlugin: FastifyPluginAsync<RbacOptions> = async (app, { db }) => {
  app.decorate('requirePermission', (key: string): preHandlerHookHandler => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = currentUserId(req);
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const perms = await getUserPermissions(db, userId);
      if (!perms.has(key)) {
        return reply.status(403).send({ error: 'Forbidden' });
      }
    };
  });
};

export default fp(rbacPlugin, { name: 'rbac' });
