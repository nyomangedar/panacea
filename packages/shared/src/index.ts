export type {
  PermissionLevel,
  PermissionDef,
  NavItem,
  RouteItem,
  ModuleEvents,
  ModuleManifest,
} from './manifest.js';

export { resolvePermissions } from './permission-resolver.js';
export type { RbacUser, RbacData } from './permission-resolver.js';

export { coreMigrationsFolder, applyCoreMigrations } from './migrations.js';

export { default as rbacPlugin, getUserPermissions } from './rbac.js';
export { writeAudit } from './write-audit.js';
export type { AuditOp, AuditSource, AuditEntry } from './write-audit.js';

export { syncPermissions } from './permission-registry.js';
