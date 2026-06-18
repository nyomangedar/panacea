// Resolves a user's effective permission keys via the RBAC chain:
//   user → group_members → group_roles → role_permissions → permission keys
// A non-active user resolves to no permissions. Pure over the supplied RBAC slices;
// the SQL that gathers these slices for a user lives alongside requirePermission in core.

export interface RbacUser {
  id: string;
  status: string;
}

export interface RbacData {
  user: RbacUser | undefined;
  groupMembers: { userId: string; groupId: string }[];
  groupRoles: { groupId: string; roleId: string }[];
  rolePermissions: { roleId: string; permissionKey: string }[];
}

export function resolvePermissions(userId: string, data: RbacData): Set<string> {
  const { user, groupMembers, groupRoles, rolePermissions } = data;

  if (!user || user.id !== userId || user.status !== 'active') {
    return new Set();
  }

  const groupIds = new Set(
    groupMembers.filter((m) => m.userId === userId).map((m) => m.groupId),
  );
  const roleIds = new Set(
    groupRoles.filter((gr) => groupIds.has(gr.groupId)).map((gr) => gr.roleId),
  );

  return new Set(
    rolePermissions
      .filter((rp) => roleIds.has(rp.roleId))
      .map((rp) => rp.permissionKey),
  );
}
