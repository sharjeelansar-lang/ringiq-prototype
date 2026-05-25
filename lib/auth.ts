import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'ringiq-session';

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET not set in .env');
  return new TextEncoder().encode(s);
}

export async function signToken(payload: { userId: string; email: string; name: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { userId: string; email: string; name: string };
}
