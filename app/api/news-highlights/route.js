import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'news-highlights.json');

const defaultHighlights = [
  {
    id: 'hawaii-miami',
    badge: 'Hawaii&Miami',
    title: 'Портал команды аквапарка',
    description: 'Тренинги по гостевому сервису, новая документация и расписание смен.',
    theme: 'sky',
    items: [
      'Обновлен график анимации',
      'Добавлены новые правила безопасности',
      'Запуск нового курса для уборщиц и барменов',
    ],
  },
  {
    id: 'sanremo',
    badge: 'SanRemo',
    title: 'База знаний и события',
    description: 'Все новости по SanRemo: тренинги, мероприятия и внутренняя коммуникация.',
    theme: 'emerald',
    items: [
      'Составлен новый план обучения',
      'Анонс зимнего тимбилдинга',
      'Обновление инструкций по гостевому сервису',
    ],
  },
];

async function readHighlights() {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultHighlights;
  } catch {
    return defaultHighlights;
  }
}

export async function GET() {
  const highlights = await readHighlights();
  return NextResponse.json(highlights);
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, badge, title, description, items } = body;
    if (!id || !badge || !title || !description || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Заполните все поля карточки' }, { status: 400 });
    }

    const highlights = await readHighlights();
    const updated = highlights.map((entry) => (
      entry.id === id
        ? {
            ...entry,
            badge,
            title,
            description,
            items: items.map((item) => String(item).trim()).filter(Boolean),
          }
        : entry
    ));

    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true, highlights: updated });
  } catch {
    return NextResponse.json({ error: 'Ошибка сохранения карточки' }, { status: 500 });
  }
}