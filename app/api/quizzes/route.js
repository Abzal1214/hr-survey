
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { Quiz } from '../../../lib/models';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const dept = searchParams.get('department');
    const admin = searchParams.get('admin');
    const query = dept ? { $or: [{ department: dept }, { department: '' }, { department: null }] } : {};
    // Только активные для сотрудников (если не ?admin=1)
    if (!admin) query.isActive = true;
    const quizzes = await Quiz.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(quizzes.map(q => ({ ...q, id: q._id })), { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить тесты' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, questions, coins, department = '', attemptsPerDay = 1, isActive = true } = body;
    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Укажите название и хотя бы один вопрос' }, { status: 400 });
    }
    const quiz = await Quiz.create({ title, description: description || '', coins: coins ?? 3, questions, department, attemptsPerDay, isActive });
    return NextResponse.json({ ...quiz.toObject(), id: quiz._id });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка создания теста' }, { status: 500 });
  }
}

// PATCH: обновление attemptsPerDay и isActive
export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, attemptsPerDay, isActive } = body;
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    const update = {};
    if (typeof attemptsPerDay === 'number') update.attemptsPerDay = attemptsPerDay;
    if (typeof isActive === 'boolean') update.isActive = isActive;
    const quiz = await Quiz.findByIdAndUpdate(id, update, { new: true });
    if (!quiz) return NextResponse.json({ error: 'Тест не найден' }, { status: 404 });
    return NextResponse.json({ ...quiz.toObject(), id: quiz._id });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления теста' }, { status: 500 });
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
