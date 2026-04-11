import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { Reward } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const rewards = await Reward.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json(rewards.map(r => ({ ...r, id: r._id })));
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить награды' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description, cost, imageUrl } = body;
    if (!name || !description || cost == null) {
      return NextResponse.json({ error: 'Заполните название, описание и стоимость' }, { status: 400 });
    }
    const reward = await Reward.create({ name, description, cost: parseInt(cost), imageUrl: imageUrl || '' });
    return NextResponse.json({ message: 'Награда добавлена', reward: { ...reward.toObject(), id: reward._id } });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка добавления награды' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID награды не указан' }, { status: 400 });
    const result = await Reward.deleteOne({ _id: id });
    if (result.deletedCount === 0) return NextResponse.json({ error: 'Награда не найдена' }, { status: 404 });
    return NextResponse.json({ message: 'Награда удалена' });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления награды' }, { status: 500 });
  }
}