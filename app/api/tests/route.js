import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { TestResult, User } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const tests = await TestResult.find({}).sort({ timestamp: -1 }).lean();
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить результаты тестов' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    await TestResult.create(body);

    let alreadyPassed = false;
    let bonus = 0;

    if (body.score >= 70 && body.phone) {
      const previousPass = await TestResult.findOne({
        phone: body.phone,
        score: { $gte: 70 },
        _id: { $ne: (await TestResult.findOne({ phone: body.phone, score: body.score }))._id }
      });
      // simpler: count how many passing results exist BEFORE this one
      const passingCount = await TestResult.countDocuments({ phone: body.phone, score: { $gte: 70 } });
      if (passingCount > 1) {
        alreadyPassed = true;
      } else {
        const user = await User.findOne({ phone: body.phone });
        if (user) {
          bonus = body.score === 100 ? 5 : 3;
          await User.updateOne({ phone: body.phone }, { $inc: { points: bonus } });
        }
      }
    }

    return NextResponse.json({ message: 'Результаты теста сохранены', alreadyPassed, bonus });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения результатов' }, { status: 500 });
  }
}
