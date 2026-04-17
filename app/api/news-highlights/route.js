import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { NewsHighlight } from '../../../lib/models';

const defaults = [
  {
    slug: 'hawaii-miami',
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
    slug: 'sanremo',
    badge: 'SanRemo',
    title: 'База знаний и события',
    description: 'Все новости по SanRemo: тренинги, мероприятия и внутренняя коммуникация.',
    theme: 'emerald',
    items: [
      'Составлен новый план обучения',
      'Анонс летнего тимбилдинга',
      'Обновление инструкций по гостевому сервису',
    ],
  },
];

async function ensureDefaults() {
  await connectDB();
  const count = await NewsHighlight.countDocuments();
  if (count === 0) {
    await NewsHighlight.insertMany(defaults);
  }
}

function toPublic(doc) {
  return {
    id: doc.slug,
    badge: doc.badge,
    title: doc.title,
    description: doc.description,
    theme: doc.theme,
    items: doc.items,
  };
}

export async function GET() {
  try {
    await ensureDefaults();
    const highlights = await NewsHighlight.find({}).sort({ _id: 1 }).lean();
    return NextResponse.json(highlights.map(toPublic));
  } catch {
    return NextResponse.json(defaults.map(d => ({ id: d.slug, badge: d.badge, title: d.title, description: d.description, theme: d.theme, items: d.items })));
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, badge, title, description, items } = body;
    if (!id || !badge || !title || !description || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Заполните все поля карточки' }, { status: 400 });
    }

    const cleanItems = items.map((i) => String(i).trim()).filter(Boolean);
    await NewsHighlight.findOneAndUpdate(
      { slug: id },
      { badge, title, description, items: cleanItems, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const highlights = await NewsHighlight.find({}).sort({ _id: 1 }).lean();
    return NextResponse.json({ success: true, highlights: highlights.map(toPublic) });
  } catch {
    return NextResponse.json({ error: 'Ошибка сохранения карточки' }, { status: 500 });
  }
}