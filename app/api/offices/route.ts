import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const offices = await db
      .collection('offices')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = offices.map((o) => ({
      id: o._id.toString(),
      mongoOfficeId: o._id.toString(),
      practiceDisplayName: o.name ?? '',
      corporateCleanName: o.corporateCleanName ?? o.ehr?.corporateCleanName ?? '',
      environmentStatus: o.officeStatus === 'active' ? 'live_production' : 'internal_testing',
      cpmid: o.ehr?.cpmid ?? '',
      timezone: o.tzName ?? '',
      createdAt: o.createdAt
        ? new Date(o.createdAt).toISOString().split('T')[0]
        : '',
      inboundPhone: o.twilioNumbers?.[0]?.number ?? '',
      twilioSid: o.twilioNumbers?.[0]?.sid ?? '',
    }));

    return NextResponse.json({ success: true, offices: mapped });
  } catch (err) {
    console.error('[GET /api/offices] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offices' },
      { status: 500 }
    );
  }
}

// Derive UTC offset from a tzName string using Node's Intl API
function computeTzOffset(tzName: string): number {
  const now = new Date();
  const utcMs = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' })).getTime();
  const tzMs = new Date(now.toLocaleString('en-US', { timeZone: tzName })).getTime();
  return Math.round((tzMs - utcMs) / 3600000);
}

// Build the workingHours object the DB expects from Mon-Fri/Sat/Sun blocks
function buildWorkingHours(operationalHours: {
  mondayFriday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}) {
  const { mondayFriday, saturday, sunday } = operationalHours;
  const weekday = { isOpen: !mondayFriday.closed, open: mondayFriday.open, close: mondayFriday.close };
  return {
    mon: weekday,
    tue: weekday,
    wed: weekday,
    thu: weekday,
    fri: weekday,
    sat: { isOpen: !saturday.closed, open: saturday.open, close: saturday.close },
    sun: { isOpen: !sunday.closed, open: sunday.open, close: sunday.close },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      practiceDisplayName,
      environmentStatus,
      cpmid,
      syeLocationId,
      inboundPhone,
      vapiAssistantPhoneNumber,
      twilioSid,
      twilioSubAccountSid,
      publicNumber,
      failoverTransferNumber,
      vapiAssistantId,
      twilioSubAccountToken,
      emailCompany,
      timezone,
      streetAddress,
      city,
      state,
      zipCode,
      operationalHours,
      internalWorkingHours,
      recordingDisclosure,
    } = body;

    const tzOffset = computeTzOffset(timezone);

    const officeDocument = {
      name: practiceDisplayName,
      address: {
        street: streetAddress,
        city,
        state,
        zip: zipCode,
      },
      email: {
        company: emailCompany ?? '',
      },
      officeStatus: environmentStatus === 'live_production' ? 'active' : 'testing',
      tzName: timezone,
      tzOffset,
      publicNumber: publicNumber ?? '',
      twilioNumbers: [
        ...(inboundPhone ? [{
          number: inboundPhone,
          title: 'Main',
          disabled: false,
          sid: twilioSid ?? '',
          subAccountSid: twilioSubAccountSid ?? '',
        }] : []),
        ...(vapiAssistantPhoneNumber ? [{
          number: vapiAssistantPhoneNumber,
          title: 'VAPI',
          disabled: false,
          sid: '',
          subAccountSid: twilioSubAccountSid ?? '',
        }] : []),
      ],
      failoverNumber: failoverTransferNumber ?? '',
      vapiAssistantId: vapiAssistantId ?? '',
      twilioSubAccountToken: twilioSubAccountToken ?? '',
      skipRecordingMessage: !recordingDisclosure,
      workingHours: operationalHours ? buildWorkingHours(operationalHours) : {},
      workingLunchHours: internalWorkingHours
        ? { doctorLunch: internalWorkingHours }
        : {},
      servicePlan: 'dashboard-399',
      officeOpenHours: {},
      // EHR metadata stored for downstream integrations
      corporateCleanName: body.corporateCleanName ?? '',
      ehr: {
        cpmid,
        syeLocationId,
      },
      createdAt: new Date(),
    };

    const db = await getDb();
    const result = await db.collection('offices').insertOne(officeDocument);

    return NextResponse.json({
      success: true,
      officeId: result.insertedId.toString(),
      office: { ...officeDocument, _id: result.insertedId },
    }, { status: 201 });

  } catch (err) {
    console.error('[POST /api/offices] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create office' },
      { status: 500 }
    );
  }
}
