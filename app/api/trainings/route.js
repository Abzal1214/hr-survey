import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { Training } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const trainings = await Training.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(trainings.map(t => ({ ...t, id: t._id })));
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить тренинги' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, attachments = [] } = body;
    if (!title || !description) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }
    const training = await Training.create({ title, description, fileUrl: Array.isArray(attachments) ? attachments.join(',') : '' });
    return NextResponse.json({ ...training.toObject(), id: training._id });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка добавления тренинга' }, { status: 500 });
  }
}
