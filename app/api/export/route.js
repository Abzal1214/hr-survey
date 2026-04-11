import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFile = path.join(process.cwd(), 'users.json');
const testsFile = path.join(process.cwd(), 'test-results.json');

const toCsv = (rows) => rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');

export async function GET() {
  try {
    const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf8')) : [];
    const tests = fs.existsSync(testsFile) ? JSON.parse(fs.readFileSync(testsFile, 'utf8')) : [];

    const userRows = [['Тип', 'Имя', 'Телефон', 'Позиция', 'Место работы', 'Дата регистрации']];
    users.forEach((user) => {
      userRows.push(['Пользователь', user.name, user.phone, user.position, user.workplaceType, user.registeredAt]);
    });

    const testRows = [['Тип', 'Ответы', 'Баллы', 'Дата']];
    tests.forEach((test) => {
      testRows.push(['Тест', JSON.stringify(test.answers), test.score, test.timestamp]);
    });

    const csvContent = ['Отчеты пользователей', ...userRows.map((r) => r.join(',')), '', 'Результаты тестов', ...testRows.map((r) => r.join(','))].join('\n');

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
