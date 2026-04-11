import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User, TestResult } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).lean();
    const tests = await TestResult.find({}).lean();

    const userRows = [['Тип', 'Имя', 'Телефон', 'Позиция', 'Место работы', 'Баланс', 'Дата регистрации']];
    users.forEach(u => userRows.push(['Пользователь', u.name, u.phone, u.position, u.department || u.workplaceType, u.points || 0, u.registeredAt]));

    const testRows = [['Тип', 'Телефон', 'Баллы', 'Дата']];
    tests.forEach(t => testRows.push(['Тест', t.phone, t.score, t.timestamp]));

    const csvContent = ['Отчеты пользователей', ...userRows.map(r => r.join(',')), '', 'Результаты тестов', ...testRows.map(r => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="training-report.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка экспорта' }, { status: 500 });
  }
}
