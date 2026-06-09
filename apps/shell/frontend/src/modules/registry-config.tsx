import type { ModuleManifest } from './module-registry';

// M2 has no real module frontends yet (admin/ticketing land in M3/M4). These
// placeholder loaders let the shell open modules as tabs end to end.
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
  { id: 'admin', label: 'Admin', description: 'Users, roles & audit log', load: placeholder('Admin') },
  { id: 'ticketing', label: 'Ticketing', description: 'Issues & workflows', load: placeholder('Ticketing') },
];
