import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User } from '../../../lib/models';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone, items, total } = body;

    if (!phone || !items || !total) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }

    const normalizePhone = (v) => String(v || '').replace(/\D/g, '');
    const allUsers = await User.find({}).lean();
    const found = allUsers.find(u => normalizePhone(u.phone) === normalizePhone(phone));

    if (!found) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const currentPoints = found.points || 0;
    if (currentPoints < total) {
      return NextResponse.json({ error: 'Недостаточно AQUA COIN' }, { status: 400 });
    }

    await User.updateOne({ _id: found._id }, { $inc: { points: -total } });
    const newBalance = currentPoints - total;

    const couponCode = 'AQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    return NextResponse.json({
      success: true,
      couponCode,
      newBalance,
      userName: found.name,
      items,
      total,
      issuedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обмена' }, { status: 500 });
  }
}
