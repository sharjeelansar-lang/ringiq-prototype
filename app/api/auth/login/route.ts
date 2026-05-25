import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const db   = await getDb();
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await bcrypt.compare(password, user.passwordHash as string))) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({
      userId: user._id.toString(),
      email:  user.email as string,
      name:   (user.name as string) ?? 'Admin',
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    });

    return res;

  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
