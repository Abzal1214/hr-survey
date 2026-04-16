import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { OfflineTraining } from '../../../lib/models';

export async function GET() {
  await connectDB();
  const items = await OfflineTraining.find({}).sort({ date: 1 }).lean();
  return NextResponse.json(items);
}

export async function POST(request) {
  await connectDB();
  const body = await request.json();
  const { title, description, date, time, location, maxParticipants, department } = body;
  if (!title || !date || !time || !location) {
    return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
  }
  const item = await OfflineTraining.create({ title, description, date, time, location, maxParticipants: maxParticipants || 20, department: department || '', signups: [] });
  return NextResponse.json(item);
}

export async function PUT(request) {
  await connectDB();
  const body = await request.json();
  const { id, action, phone, name, department } = body;
  if (!id) return NextResponse.json({ error: 'Нет id' }, { status: 400 });

  const training = await OfflineTraining.findById(id);
  if (!training) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

  if (action === 'signup') {
    if (training.signups.some(s => s.phone === phone)) {
      return NextResponse.json({ error: 'Уже записаны' }, { status: 400 });
    }
    if (training.signups.length >= training.maxParticipants) {
      return NextResponse.json({ error: 'Нет мест' }, { status: 400 });
    }
    training.signups.push({ phone, name, department, signedAt: new Date() });
    await training.save();
    return NextResponse.json({ success: true });
  }

  if (action === 'unsignup') {
    training.signups = training.signups.filter(s => s.phone !== phone);
    await training.save();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
}

export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Нет id' }, { status: 400 });
  await OfflineTraining.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
