import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { Quiz } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(quizzes.map(q => ({ ...q, id: q._id })));
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить тесты' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, questions } = body;
    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Укажите название и хотя бы один вопрос' }, { status: 400 });
    }
    const quiz = await Quiz.create({ title, description: description || '', questions });
    return NextResponse.json({ ...quiz.toObject(), id: quiz._id });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка создания теста' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    await Quiz.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления теста' }, { status: 500 });
  }
}
