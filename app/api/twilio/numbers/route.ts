import { NextRequest, NextResponse } from 'next/server';
import { getTwilioMainClient } from '@/lib/twilio';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const areaCode = searchParams.get('areaCode')?.replace(/\D/g, '') ?? '';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '8'), 20);

    if (!areaCode || areaCode.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Provide a valid 3-digit area code' },
        { status: 400 }
      );
    }

    const client = getTwilioMainClient();

    const available = await client
      .availablePhoneNumbers('US')
      .local.list({ areaCode: parseInt(areaCode), limit });

    const numbers = available.map((n) => ({
      phoneNumber: n.phoneNumber,
      friendlyName: n.friendlyName,
      locality: n.locality,
      region: n.region,
      postalCode: n.postalCode,
      capabilities: {
        voice: n.capabilities.voice,
        sms: n.capabilities.sms,
        mms: n.capabilities.mms,
      },
    }));

    return NextResponse.json({ success: true, numbers });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to search numbers';
    console.error('[GET /api/twilio/numbers]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
