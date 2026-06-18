import type { ModuleManifest } from './module-registry';

// Ticketing has no real frontend yet (lands in M4). Placeholder lets it open as a tab.
function placeholder(name: string) {
  return async () => ({
    default: () => (
      <div style={{ padding: 24, color: 'var(--color-text-secondary)' }}>
        {name} module — UI ships in a later milestone.
      </div>
    ),
  });
}

export const MODULE_MANIFESTS: ModuleManifest[] = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Users, roles & audit log',
    accessPermission: 'admin:access',
    pages: [
      { id: 'users', label: 'Users', accessPermission: 'admin:users:access' },
      { id: 'groups', label: 'Groups', accessPermission: 'admin:groups:access' },
      { id: 'roles', label: 'Roles', accessPermission: 'admin:roles:access' },
      { id: 'audit', label: 'Audit log', accessPermission: 'admin:audit:access' },
    ],
    // dev: real admin UI from the sibling repo (Vite alias + ambient module decl)
    load: () => import('@panacea-admin/frontend'),
  },
  {
    id: 'ticketing',
    label: 'Ticketing',
    description: 'Issues & workflows',
    accessPermission: 'ticketing:access',
    load: placeholder('Ticketing'),
  },
];
