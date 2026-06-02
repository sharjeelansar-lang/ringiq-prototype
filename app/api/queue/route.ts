import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const required = ['practiceName', 'contactName', 'contactRole', 'email', 'phone', 'streetAddress', 'city', 'state', 'zipCode', 'timezone'];
    const missing = required.filter((k) => !body[k]);
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 },
      );
    }

    const doc = {
      practiceName:      String(body.practiceName),
      contactName:       String(body.contactName),
      contactRole:       String(body.contactRole),
      email:             String(body.email).toLowerCase().trim(),
      phone:             String(body.phone).replace(/\D/g, ''),
      streetAddress:     body.streetAddress     ?? '',
      city:              String(body.city),
      state:             String(body.state),
      zipCode:           body.zipCode           ?? '',
      timezone:          body.timezone          ?? '',
      locationCount:     body.locationCount     ?? '',
      ehrSystem:         body.ehrSystem         ?? '',
      monthlyCallVolume: body.monthlyCallVolume ?? '',
      phoneProvider:     body.phoneProvider     ?? '',
      currentPhoneSetup: body.currentPhoneSetup ?? '',
      officeGreeting:    body.officeGreeting    ?? '',
      locationNote:      body.locationNote      ?? '',
      officeHours:       body.officeHours       ?? {},
      lunchBreak:        body.lunchBreak        ?? '',
      afterHoursPolicy:  body.afterHoursPolicy  ?? '',
      voice:             body.voice             ?? '',
      interests:         Array.isArray(body.interests) ? body.interests : [],
      notes:             body.notes             ?? '',
      plan:              body.plan              ?? '',
      status:            'pending' as const,
      createdAt:         new Date(),
    };

    const db = await getDb();
    const result = await db.collection('queue').insertOne(doc);

    return NextResponse.json(
      { success: true, queueId: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/queue] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection('queue')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = items.map((item) => ({
      id:                item._id.toString(),
      practiceName:      item.practiceName      ?? '',
      contactName:       item.contactName       ?? '',
      contactRole:       item.contactRole       ?? '',
      email:             item.email             ?? '',
      phone:             item.phone             ?? '',
      streetAddress:     item.streetAddress     ?? '',
      city:              item.city              ?? '',
      state:             item.state             ?? '',
      zipCode:           item.zipCode           ?? '',
      timezone:          item.timezone          ?? '',
      locationCount:     item.locationCount     ?? '',
      ehrSystem:         item.ehrSystem         ?? '',
      monthlyCallVolume: item.monthlyCallVolume ?? '',
      phoneProvider:     item.phoneProvider     ?? '',
      currentPhoneSetup: item.currentPhoneSetup ?? '',
      officeGreeting:    item.officeGreeting    ?? '',
      locationNote:      item.locationNote      ?? '',
      officeHours:       item.officeHours       ?? {},
      lunchBreak:        item.lunchBreak        ?? '',
      afterHoursPolicy:  item.afterHoursPolicy  ?? '',
      voice:             item.voice             ?? '',
      interests:         item.interests         ?? [],
      notes:             item.notes             ?? '',
      plan:              item.plan              ?? '',
      status:            (item.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'rejected',
      createdAt:         item.createdAt ? new Date(item.createdAt).toISOString() : '',
    }));

    return NextResponse.json({ success: true, queue: mapped });
  } catch (err) {
    console.error('[GET /api/queue] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch queue' },
      { status: 500 },
    );
  }
}
