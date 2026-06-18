import type { Sql } from 'postgres';
import type { PermissionDef } from './manifest.js';

// Upserts each module's declared PermissionDefs into public.permissions, keyed by
// `key` (idempotent). Module is derived from the key prefix; sort_order from the
// declaration order. Run on boot for every registered module's manifest.
export async function syncPermissions(db: Sql, defs: PermissionDef[]): Promise<void> {
  for (let i = 0; i < defs.length; i++) {
    const d = defs[i];
    const module = d.key.split(':')[0];
    await db`
      INSERT INTO permissions (key, label, level, module, page, sort_order)
      VALUES (${d.key}, ${d.label}, ${d.level}, ${module}, ${d.page ?? null}, ${i})
      ON CONFLICT (key) DO UPDATE SET
        label = EXCLUDED.label,
        level = EXCLUDED.level,
        module = EXCLUDED.module,
        page = EXCLUDED.page,
        sort_order = EXCLUDED.sort_order
    `;
  }
}
