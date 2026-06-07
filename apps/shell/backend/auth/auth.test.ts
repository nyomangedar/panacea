import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from './auth.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-auth-tests';
});

describe('hashPassword / verifyPassword', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hash = await hashPassword('my-password');
    expect(await verifyPassword('my-password', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});

describe('signToken / verifyToken', () => {
  it('issues a valid JWT and verifies the payload', () => {
    const token = signToken({ sub: 'user-1', role: 'admin' });
    const payload = verifyToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('admin');
  });

  it('rejects an expired JWT', () => {
    const token = signToken({ sub: 'user-1', role: 'admin' }, { expiresIn: -1 });
    expect(() => verifyToken(token)).toThrow(/expired/i);
  });

  it('rejects a tampered JWT', () => {
    const token = signToken({ sub: 'user-1', role: 'admin' });
    const tampered = token.slice(0, -4) + 'XXXX';
    expect(() => verifyToken(tampered)).toThrow();
  });
});
