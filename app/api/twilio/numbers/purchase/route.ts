import { NextRequest, NextResponse } from 'next/server';
import { getTwilioMainClient, getTwilioSubClient } from '@/lib/twilio';

const VAPI_VOICE_URL  = 'https://api.vapi.ai/twilio/inbound_call';
const VAPI_STATUS_URL = 'https://api.vapi.ai/twilio/status';

export async function POST(req: NextRequest) {
  try {
    const {
      phoneNumber, friendlyName, subAccountSid, subAccountToken,
      failoverNumber, numberType,
    } = await req.json();

    const type: 'twilio' | 'vapi' = numberType === 'vapi' ? 'vapi' : 'twilio';

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

    // Both numbers are purchased under the sub-account when one exists
    const client = subAccountSid && subAccountToken
      ? getTwilioSubClient(subAccountSid, subAccountToken)
      : getTwilioMainClient();

    const purchased = await client.incomingPhoneNumbers.create({
      phoneNumber,
      friendlyName: friendlyName ?? phoneNumber,
    });

    // Normalise failover to E.164 for twimlets fallback
    const failoverE164 = failoverNumber
      ? (String(failoverNumber).startsWith('+') ? failoverNumber : `+1${String(failoverNumber).replace(/\D/g, '')}`)
      : null;

    const fallbackUrl = failoverE164 ? `http://twimlets.com/forward?PhoneNumber=${failoverE164}` : '';

    // Configure webhooks immediately after purchase based on number type
    const ringiqServerUrl = process.env.RINGIQ_SERVER_URL ?? '';
    const voiceUrl = type === 'vapi' ? VAPI_VOICE_URL : `${ringiqServerUrl}/twilio/voice`;

    await client.incomingPhoneNumbers(purchased.sid).update({
      voiceUrl,
      voiceMethod:         'POST',
      voiceFallbackUrl:    fallbackUrl,
      voiceFallbackMethod: 'POST',
      ...(type === 'vapi' ? {
        statusCallback:       VAPI_STATUS_URL,
        statusCallbackMethod: 'POST',
      } : {}),
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
      numberType: type,
      subAccountSid:   subAccountSid   ?? null,
      subAccountToken: subAccountToken ?? null,
    }, { status: 201 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to purchase number';
    console.error('[POST /api/twilio/numbers/purchase]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
