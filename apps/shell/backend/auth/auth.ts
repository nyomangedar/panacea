import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  options: SignOptions = { expiresIn: '7d' },
): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as TokenPayload;
}
