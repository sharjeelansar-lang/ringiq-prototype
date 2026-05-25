import { NextRequest, NextResponse } from 'next/server';
import { getTwilioClient } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const { friendlyName } = await req.json();

    if (!friendlyName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'friendlyName is required' },
        { status: 400 }
      );
    }

    if (process.env.TWILIO_TEST_MODE === 'true') {
      const fakeSid = `AC_TEST_${Math.random().toString(36).slice(2, 18).toUpperCase()}`;
      return NextResponse.json({
        success: true,
        _testMode: true,
        subAccount: {
          sid: fakeSid,
          friendlyName: friendlyName.trim(),
          authToken: `test_token_${Math.random().toString(36).slice(2, 34)}`,
          status: 'active',
          dateCreated: new Date(),
        },
      }, { status: 201 });
    }

    const client = getTwilioClient();

    const subAccount = await client.api.v2010.accounts.create({
      friendlyName: friendlyName.trim(),
    });

    return NextResponse.json({
      success: true,
      subAccount: {
        sid: subAccount.sid,
        friendlyName: subAccount.friendlyName,
        authToken: subAccount.authToken,
        status: subAccount.status,
        dateCreated: subAccount.dateCreated,
      },
    }, { status: 201 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create sub-account';
    console.error('[POST /api/twilio/subaccount]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
