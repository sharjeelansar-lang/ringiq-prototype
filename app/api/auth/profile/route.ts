import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyToken, signToken, COOKIE_NAME } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    const { name, title, phone } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { name: name.trim(), title: title?.trim() ?? '', phone: phone?.trim() ?? '', updatedAt: new Date() } },
    );

    // Reissue JWT so the updated name propagates immediately
    const newToken = await signToken({ userId: payload.userId, email: payload.email, name: name.trim() });

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, newToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    });
    return res;
  } catch (err) {
    console.error('[PATCH /api/auth/profile]', err);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
