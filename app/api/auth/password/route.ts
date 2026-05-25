import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const db   = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash as string);
    if (!valid) return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });

    const hash = await bcrypt.hash(newPassword, 12);
    await db.collection('users').updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { passwordHash: hash, updatedAt: new Date() } },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/auth/password]', err);
    return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 });
  }
}
