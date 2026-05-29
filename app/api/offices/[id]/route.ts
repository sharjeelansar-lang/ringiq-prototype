import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getTwilioMainClient, getTwilioSubClient } from '@/lib/twilio';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid office ID' }, { status: 400 });
    }

    const db = await getDb();
    const office = await db.collection('offices').findOne({ _id: new ObjectId(id) });

    if (!office) {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      office: { ...office, _id: office._id.toString() },
    });
  } catch (err) {
    console.error('[GET /api/offices/[id]] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch office' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid office ID' }, { status: 400 });
    }

    const deleteNumber = req.nextUrl.searchParams.get('deleteNumber') === 'true';

    const db = await getDb();
    const office = await db.collection('offices').findOne({ _id: new ObjectId(id) });

    if (!office) {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
    }

    if (deleteNumber) {
      // Numbers purchased on a sub-account must be released via that sub-account client.
      // Fall back to main client only when no sub-account creds are stored.
      const phoneSid        = office.twilioNumbers?.[0]?.sid as string | undefined;
      const subAccountSid   = office.twilioSubAccountSid   as string | undefined;
      const subAccountToken = office.twilioSubAccountToken as string | undefined;

      if (phoneSid) {
        if (process.env.TWILIO_TEST_MODE === 'true') {
          console.log(`[DELETE] Test mode — skipping Twilio number release for SID: ${phoneSid}`);
        } else {
          const client = subAccountSid && subAccountToken
            ? getTwilioSubClient(subAccountSid, subAccountToken)
            : getTwilioMainClient();
          try {
            await client.incomingPhoneNumbers(phoneSid).remove();
          } catch (twilioErr) {
            // Log but don't abort — still delete the office record even if Twilio release fails
            console.error('[DELETE] Twilio number release failed:', twilioErr);
          }
        }
      }
    }

    await db.collection('offices').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/offices/[id]] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete office' }, { status: 500 });
  }
}
