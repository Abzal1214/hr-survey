import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { Notification } from '../../../lib/models';

// GET /api/notifications?phone=xxx  — get unread count + recent
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone') || '';
    // Return notifications for this user OR broadcast (phone='')
    const query = phone ? { $or: [{ phone }, { phone: '' }] } : { phone: '' };
    const items = await Notification.find(query).sort({ createdAt: -1 }).limit(30).lean();
    const unread = items.filter(n => !n.read).length;
    return NextResponse.json({ items, unread });
  } catch {
    return NextResponse.json({ items: [], unread: 0 });
  }
}

// POST /api/notifications — create (admin use)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const n = await Notification.create(body);
    return NextResponse.json(n);
  } catch {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}

// PATCH /api/notifications — mark read
export async function PATCH(request) {
  try {
    await connectDB();
    const { phone, ids } = await request.json();
    const query = ids?.length ? { _id: { $in: ids } } : (phone ? { $or: [{ phone }, { phone: '' }] } : {});
    await Notification.updateMany(query, { $set: { read: true } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}
