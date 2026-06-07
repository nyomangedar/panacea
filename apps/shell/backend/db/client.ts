import postgres, { type Sql } from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

let _sql: Sql | null = null;

export function getSqlClient(connectionString: string): Sql {
  if (!_sql) _sql = postgres(connectionString);
  return _sql;
}

export function getDb(connectionString: string) {
  return drizzle(getSqlClient(connectionString), { schema });
}
