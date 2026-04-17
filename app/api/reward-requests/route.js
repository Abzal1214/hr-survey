import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { RewardRequest, Notification } from '../../../lib/models';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const all = searchParams.get('all');
    let query = {};
    if (all !== '1' && phone) query = { phone };
    const requests = await RewardRequest.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(requests);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { phone, userName, department, rewardId, rewardName, rewardCost } = await request.json();
    if (!phone || !rewardId) return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 });
    const req = await RewardRequest.create({ phone, userName, department, rewardId, rewardName, rewardCost });
    // Notify admins (broadcast phone='')
    await Notification.create({
      phone: '',
      type: 'info',
      title: '🎁 Новая заявка на приз',
      body: `${userName || phone} запросил «${rewardName}»`,
      link: '/admin',
    });
    return NextResponse.json(req);
  } catch {
    return NextResponse.json({ error: 'Ошибка создания заявки' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { id, status, note } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    const req = await RewardRequest.findByIdAndUpdate(id, { status, note }, { new: true });
    if (!req) return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    // Notify employee
    const msg = status === 'approved' ? `✅ Заявка на «${req.rewardName}» одобрена!` : `❌ Заявка на «${req.rewardName}» отклонена.`;
    await Notification.create({
      phone: req.phone,
      type: status === 'approved' ? 'info' : 'info',
      title: status === 'approved' ? '🎉 Заявка одобрена' : 'Заявка отклонена',
      body: msg + (note ? ` Причина: ${note}` : ''),
      link: '/rewards',
    });
    return NextResponse.json(req);
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}
