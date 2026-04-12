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

    const makeCouponCode = () => 'AQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const issuedAt = new Date().toISOString();
    const coupons = [];

    items.forEach((item) => {
      const qty = Math.max(1, Number(item.qty) || 1);
      for (let i = 0; i < qty; i += 1) {
        coupons.push({
          couponCode: makeCouponCode(),
          issuedAt,
          item: {
            id: item.id,
            name: item.name,
            cost: item.cost,
            icon: item.icon,
          },
          index: i + 1,
          count: qty,
        });
      }
    });

    return NextResponse.json({
      success: true,
      coupons,
      newBalance,
      userName: found.name,
      items,
      total,
      issuedAt,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обмена' }, { status: 500 });
  }
}
