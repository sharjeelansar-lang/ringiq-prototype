import { NextRequest, NextResponse } from 'next/server';
import { getTwilioMainClient, getTwilioSubClient } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, friendlyName, subAccountSid, subAccountToken } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    if (process.env.TWILIO_TEST_MODE === 'true') {
      return NextResponse.json({
        success: true,
        _testMode: true,
        number: {
          sid: `PN_TEST_${Math.random().toString(36).slice(2, 30).toUpperCase()}`,
          phoneNumber,
          friendlyName: friendlyName ?? phoneNumber,
          status: 'in-use',
          capabilities: { voice: true, SMS: true, MMS: false },
          dateCreated: new Date(),
        },
      }, { status: 201 });
    }

    // If a sub-account was created earlier, buy within that context;
    // otherwise fall back to the main account
    const client = subAccountSid && subAccountToken
      ? getTwilioSubClient(subAccountSid, subAccountToken)
      : getTwilioMainClient();

    const purchased = await client.incomingPhoneNumbers.create({
      phoneNumber,
      friendlyName: friendlyName ?? phoneNumber,
    });

    return NextResponse.json({
      success: true,
      number: {
        sid: purchased.sid,
        phoneNumber: purchased.phoneNumber,
        friendlyName: purchased.friendlyName,
        status: purchased.status,
        capabilities: purchased.capabilities,
        dateCreated: purchased.dateCreated,
      },
    }, { status: 201 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to purchase number';
    console.error('[POST /api/twilio/numbers/purchase]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
