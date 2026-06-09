// Dev-only helper: inserts (or updates) a single user so you can log in while
// testing the shell locally. Not used by the app or tests — safe to delete.
// Run from apps/shell with DATABASE_URL set:  pnpm exec tsx backend/dev-seed.ts
import postgres from 'postgres';
import { hashPassword } from './auth/auth.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Set DATABASE_URL before running the seed.');

const email = process.env.SEED_EMAIL ?? 'admin@panacea.dev';
const password = process.env.SEED_PASSWORD ?? 'password123';

const sql = postgres(url, { max: 1 });
await sql`
  INSERT INTO users (email, password_hash)
  VALUES (${email}, ${await hashPassword(password)})
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
`;
console.log(`Seeded user → ${email} / ${password}`);
await sql.end();
