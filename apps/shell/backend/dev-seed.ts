// Dev-only helper: creates a login user and grants it every synced permission, so
// you can sign in and exercise the admin module locally. Not used by the app or tests.
// Start the server once first (it syncs each module's permissions into the DB), then:
//   pnpm exec tsx backend/dev-seed.ts        (with DATABASE_URL set)
import postgres from 'postgres';
import { hashPassword } from './auth/auth.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Set DATABASE_URL before running the seed.');

const email = process.env.SEED_EMAIL ?? 'admin@panacea.dev';
const password = process.env.SEED_PASSWORD ?? 'password123';

const sql = postgres(url, { max: 1 });

const [user] = await sql<{ id: string }[]>`
  INSERT INTO users (name, email, password_hash, status)
  VALUES ('Dev Admin', ${email}, ${await hashPassword(password)}, 'active')
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, status = 'active'
  RETURNING id`;

const [group] = await sql<{ id: string }[]>`
  INSERT INTO groups (name) VALUES ('Dev Admins')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`;
const [role] = await sql<{ id: string }[]>`
  INSERT INTO roles (name) VALUES ('Dev Superadmin')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`;

await sql`INSERT INTO group_members (user_id, group_id) VALUES (${user.id}, ${group.id}) ON CONFLICT DO NOTHING`;
await sql`INSERT INTO group_roles (group_id, role_id) VALUES (${group.id}, ${role.id}) ON CONFLICT DO NOTHING`;
await sql`
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT ${role.id}, id FROM permissions
  ON CONFLICT DO NOTHING`;

const [{ count }] = await sql<{ count: string }[]>`
  SELECT COUNT(*)::text AS count FROM role_permissions WHERE role_id = ${role.id}`;
console.log(`Seeded ${email} / ${password} with ${count} permissions.`);
if (Number(count) === 0) {
  console.log('No permissions found — start the shell once so modules sync their permissions, then re-run.');
}
await sql.end();
