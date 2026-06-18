import type { Sql } from 'postgres';

export type AuditOp = 'update' | 'link.add' | 'link.remove' | 'create' | 'delete';
export type AuditSource = 'ui' | 'import' | 'api' | 'system' | 'revert';

export interface AuditEntry {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  op: AuditOp;
  before?: unknown;
  after?: unknown;
  source?: AuditSource;
  revertsId?: string | null;
}

// Single writer for audit_logs. Standardizes payload as { op, before, after } and
// stamps source — the prerequisite that makes every action revert-ready (M3.5).
export async function writeAudit(db: Sql, entry: AuditEntry): Promise<void> {
  const payload = { op: entry.op, before: entry.before ?? null, after: entry.after ?? null };
  await db`
    INSERT INTO audit_logs (actor_id, action, target_type, target_id, payload, source, reverts_id)
    VALUES (
      ${entry.actorId},
      ${entry.action},
      ${entry.targetType},
      ${entry.targetId},
      ${db.json(payload as never)},
      ${entry.source ?? 'ui'},
      ${entry.revertsId ?? null}
    )
  `;
}
