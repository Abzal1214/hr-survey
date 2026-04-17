import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { Training } from '../../../lib/models';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const dept = searchParams.get('department');
    const query = dept ? { $or: [{ department: dept }, { department: '' }, { department: null }] } : {};
    const trainings = await Training.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(trainings.map(t => ({
      ...t,
      id: t._id,
      attachments: t.fileUrl ? t.fileUrl.split(',').filter(Boolean) : []
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить тренинги' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, attachments = [], department = '', deadline } = body;
    if (!title || !description) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }
    const training = await Training.create({ title, description, fileUrl: Array.isArray(attachments) ? attachments.join(',') : (attachments || ''), department, deadline: deadline ? new Date(deadline) : null });
    return NextResponse.json({ ...training.toObject(), id: training._id });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка добавления тренинга' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, title, description, deadline } = body;
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    const updateData = { title, description };
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    const training = await Training.findByIdAndUpdate(id, updateData, { new: true });
    if (!training) return NextResponse.json({ error: 'Тренинг не найден' }, { status: 404 });
    return NextResponse.json({ ...training.toObject(), id: training._id });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления тренинга' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    await Training.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления тренинга' }, { status: 500 });
  }
}
