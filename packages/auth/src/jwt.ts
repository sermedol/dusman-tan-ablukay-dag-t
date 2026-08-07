import jwt, { JwtPayload, SignOptions, VerifyOptions } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

const JWT_SECRET: string = process.env.AUTH_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRY: number = parseInt(process.env.JWT_EXPIRATION || '604800', 10); // 7 days in seconds

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const options: VerifyOptions = {};
    const decoded = jwt.verify(token, JWT_SECRET, options);
    return decoded as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as TokenPayload;
  } catch (error) {
    return null;
  }
}
