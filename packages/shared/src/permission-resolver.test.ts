import { describe, it, expect } from 'vitest';
import { resolvePermissions, type RbacData } from './permission-resolver.js';

describe('resolvePermissions', () => {
  it('resolves correct permissions via group → role chain', () => {
    // TDD: permission-resolver.test.ts — resolves correct permissions via group → role chain | positive
    const data: RbacData = {
      user: { id: 'u1', status: 'active' },
      groupMembers: [
        { userId: 'u1', groupId: 'g1' },
        { userId: 'u1', groupId: 'g2' },
        { userId: 'u2', groupId: 'g3' }, // other user — must be ignored
      ],
      groupRoles: [
        { groupId: 'g1', roleId: 'r1' },
        { groupId: 'g2', roleId: 'r2' },
        { groupId: 'g3', roleId: 'r3' }, // unrelated group
      ],
      rolePermissions: [
        { roleId: 'r1', permissionKey: 'admin:users:read' },
        { roleId: 'r1', permissionKey: 'admin:users:create' },
        { roleId: 'r2', permissionKey: 'admin:users:read' }, // duplicate across roles
        { roleId: 'r3', permissionKey: 'ticketing:tickets:delete' }, // unrelated role
      ],
    };

    const result = resolvePermissions('u1', data);

    expect([...result].sort()).toEqual(['admin:users:create', 'admin:users:read']);
  });

  it('returns empty set for user with no groups', () => {
    // TDD: permission-resolver.test.ts — returns empty set for user with no groups | positive
    const data: RbacData = {
      user: { id: 'u1', status: 'active' },
      groupMembers: [{ userId: 'u2', groupId: 'g1' }],
      groupRoles: [{ groupId: 'g1', roleId: 'r1' }],
      rolePermissions: [{ roleId: 'r1', permissionKey: 'admin:users:read' }],
    };

    expect(resolvePermissions('u1', data).size).toBe(0);
  });

  it('deactivated user has no permissions', () => {
    // TDD: permission-resolver.test.ts — deactivated user has no permissions | negative
    const data: RbacData = {
      user: { id: 'u1', status: 'inactive' },
      groupMembers: [{ userId: 'u1', groupId: 'g1' }],
      groupRoles: [{ groupId: 'g1', roleId: 'r1' }],
      rolePermissions: [{ roleId: 'r1', permissionKey: 'admin:users:read' }],
    };

    expect(resolvePermissions('u1', data).size).toBe(0);
  });
});
