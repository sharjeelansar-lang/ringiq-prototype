import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    let oid: ObjectId;
    try { oid = new ObjectId(id); }
    catch { return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 }); }

    const db   = await getDb();
    const item = await db.collection('queue').findOne({ _id: oid });
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      prospect: {
        id:                item._id.toString(),
        practiceName:      item.practiceName      ?? '',
        contactName:       item.contactName       ?? '',
        contactRole:       item.contactRole       ?? '',
        email:             item.email             ?? '',
        phone:             item.phone             ?? '',
        website:           item.website           ?? '',
        officeLine2:       item.officeLine2       ?? '',
        officeLine3:       item.officeLine3       ?? '',
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
        currentAfterHoursPolicy: item.currentAfterHoursPolicy ?? '',
        ringiqAfterHoursPolicy:  item.ringiqAfterHoursPolicy  ?? '',
        afterHoursPolicy:  item.afterHoursPolicy  ?? '',
        voice:             item.voice             ?? '',
        interests:         Array.isArray(item.interests) ? item.interests : [],
        notes:             item.notes             ?? '',
        plan:              item.plan              ?? '',
        status:            item.status            ?? 'pending',
        createdAt:         item.createdAt ? new Date(item.createdAt).toISOString() : '',
      },
    });
  } catch (err) {
    console.error('[GET /api/queue/[id]] Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['pending', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 },
      );
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('queue').updateOne(
      { _id: objectId },
      { $set: { status, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/queue/[id]] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    let oid: ObjectId;
    try { oid = new ObjectId(id); }
    catch { return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 }); }

    const db = await getDb();
    const result = await db.collection('queue').deleteOne({ _id: oid });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/queue/[id]] Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
