import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';

// --- Identity ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// --- RBAC ---

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const groupMembers = pgTable(
  'group_members',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.groupId] }) }),
);

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
});

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  level: text('level').notNull(), // 'module' | 'page' | 'function'
  module: text('module').notNull(),
  page: text('page'),
  sortOrder: integer('sort_order').notNull().default(0),
  description: text('description'),
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.roleId, t.permissionId] }) }),
);

export const groupRoles = pgTable(
  'group_roles',
  {
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.groupId, t.roleId] }) }),
);

// --- Audit / versioning (payload: { op, before, after }; source + reverts_id for M3.5) ---

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => users.id),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: uuid('target_id'),
  payload: jsonb('payload').notNull(),
  source: text('source').notNull().default('ui'),
  revertsId: uuid('reverts_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
