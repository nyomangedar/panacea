import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnv } from './env-validation.js';

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL'] as const;

const defaults: Record<string, string> = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-secret',
  REDIS_URL: 'redis://localhost:6379',
};

describe('validateEnv', () => {
  beforeEach(() => {
    for (const [key, val] of Object.entries(defaults)) {
      process.env[key] = val;
    }
  });

  afterEach(() => {
    for (const key of Object.keys(defaults)) {
      delete process.env[key];
    }
  });

  for (const key of REQUIRED) {
    it(`server refuses to start if ${key} is missing`, () => {
      delete process.env[key];
      expect(() => validateEnv()).toThrow(key);
    });
  }
});
