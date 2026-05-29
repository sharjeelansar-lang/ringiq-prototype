import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, twilioAccountSid, twilioAuthToken, assistantId } = await req.json();

    if (!phoneNumber || !twilioAccountSid || !twilioAuthToken || !assistantId) {
      return NextResponse.json(
        { success: false, error: 'phoneNumber, twilioAccountSid, twilioAuthToken, and assistantId are all required' },
        { status: 400 },
      );
    }

    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'VAPI_API_KEY not configured' },
        { status: 500 },
      );
    }

    // Normalise to E.164 — VAPI requires +1XXXXXXXXXX format
    const e164 = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;

    const res = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'twilio',
        number: e164,          
        twilioAccountSid,
        twilioAuthToken,
        assistantId,
        name: 'VAPI AI Line',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message ?? 'VAPI phone number import failed');
    }

    return NextResponse.json(
      {
        success: true,
        phoneNumber: { id: data.id, number: data.number, assistantId: data.assistantId },
      },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to import phone number to VAPI';
    console.error('[POST /api/vapi/phone-number/import]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
