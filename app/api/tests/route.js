import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { TestResult, User, Quiz } from '../../../lib/models';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const filter = phone ? { phone } : {};
    const tests = await TestResult.find(filter).sort({ timestamp: -1 }).lean();
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить результаты тестов' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone, quizId, score, answers } = body;
    await TestResult.create({ phone, quizId: quizId || null, score, answers });

    let alreadyPassed = false;
    let bonus = 0;

    if (score >= 70 && phone) {
      const query = { phone, score: { $gte: 70 } };
      if (quizId) query.quizId = quizId;
      const passingCount = await TestResult.countDocuments(query);
      if (passingCount > 1) {
        alreadyPassed = true;
      } else {
        const user = await User.findOne({ phone });
        if (user && user.role !== 'admin') {
          const quiz = quizId ? await Quiz.findById(quizId).lean() : null;
          bonus = quiz?.coins ?? (score === 100 ? 5 : 3);
          await User.updateOne({ phone }, { $inc: { points: bonus } });
        }
      }
    }

    return NextResponse.json({ message: 'Результаты теста сохранены', alreadyPassed, bonus });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения результатов' }, { status: 500 });
  }
}
