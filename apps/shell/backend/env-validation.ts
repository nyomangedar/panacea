export interface ValidatedEnv {
  DATABASE_URL: string;
  JWT_SECRET: string;
  REDIS_URL: string;
  PORT: number;
  NODE_ENV: string;
}

export function validateEnv(): ValidatedEnv {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL'] as const;
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    REDIS_URL: process.env.REDIS_URL!,
    PORT: Number(process.env.PORT ?? 3000),
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  };
}
