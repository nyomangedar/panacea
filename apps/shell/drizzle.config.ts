import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './backend/db/schema.ts',
  out: '../../packages/shared/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/panacea',
  },
});
