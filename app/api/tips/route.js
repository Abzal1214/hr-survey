import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { HRTip } from '../../../lib/models';

const defaultTips = [
  { icon: '🏥', title: 'Больничный лист', color: 'from-red-400 to-rose-500', steps: ['Обратитесь к врачу в день, когда почувствовали себя плохо — не позже.', 'Врач оформит электронный больничный лист (ЭЛН) и выдаст номер.', 'Сообщите руководителю/HR о болезни в первый день.', 'После выздоровления сообщите номер ЭЛН в бухгалтерию или HR.', 'Оплата: первые 3 дня — за счёт работодателя, остальные — за счёт фонда.'], docs: ['Паспорт', 'Полис ОМС'], note: 'Уведомите руководителя в первый день болезни любым доступным способом.', order: 1 },
  { icon: '🏖️', title: 'Ежегодный отпуск', color: 'from-sky-400 to-blue-500', steps: ['Отпуск предоставляется по графику, утверждённому в начале года.', 'Подайте заявление на отпуск минимум за 2 недели до его начала.', 'Руководитель согласовывает и передаёт в HR/бухгалтерию.', 'Отпускные выплачиваются не позднее чем за 3 дня до начала отпуска.', 'Минимальная продолжительность — 28 календарных дней в год.'], docs: ['Заявление на отпуск (форма у HR)'], note: 'Отпуск можно разделить на части, но хотя бы одна часть должна быть не менее 14 дней.', order: 2 },
  { icon: '📋', title: 'Приём на работу', color: 'from-emerald-400 to-teal-500', steps: ['Пройдите собеседование и получите оффер.', 'Подпишите трудовой договор в отделе кадров.', 'Пройдите инструктаж по охране труда.', 'Получите доступы, форму и необходимые материалы.', 'Первые 3 месяца — испытательный срок.'], docs: ['Паспорт', 'ИНН', 'СНИЛС', 'Трудовая книжка (или заявление об ЭТК)', 'Диплом / аттестат', 'Медкнижка (при необходимости)'], note: 'Все оригиналы документов необходимо принести в день подписания договора.', order: 3 },
  { icon: '🤱', title: 'Декретный отпуск', color: 'from-pink-400 to-rose-500', steps: ['Получите у врача листок нетрудоспособности по беременности (с 30-й недели).', 'Подайте заявление на отпуск по беременности и родам в HR.', 'После рождения ребёнка оформите отпуск по уходу за ребёнком до 1,5 или 3 лет.', 'Подайте документы для получения пособий через HR/бухгалтерию.'], docs: ['Больничный лист по беременности', 'Свидетельство о рождении ребёнка', 'Заявление на отпуск', 'Реквизиты банковского счёта'], note: 'Рабочее место сохраняется на весь период декрета.', order: 4 },
  { icon: '✍️', title: 'Увольнение', color: 'from-slate-400 to-slate-600', steps: ['Подайте заявление об увольнении за 2 недели до желаемой даты.', 'Передайте дела коллеге или руководителю.', 'Получите обходной лист и подпишите его у всех отделов.', 'В последний рабочий день получите трудовую книжку и расчёт.', 'Расчёт выплачивается в день увольнения.'], docs: ['Заявление об увольнении', 'Обходной лист'], note: 'По договорённости с работодателем срок отработки может быть сокращён.', order: 5 },
  { icon: '💰', title: 'Аванс и зарплата', color: 'from-yellow-400 to-amber-500', steps: ['Аванс выплачивается в середине месяца (обычно 15–16 числа).', 'Зарплата — в конце месяца (обычно последние числа).', 'При задержке обратитесь в бухгалтерию или к HR.', 'Расчётный листок можно запросить у бухгалтера.'], docs: ['Реквизиты банковской карты (для начисления)'], note: 'Если реквизиты изменились — сообщите в бухгалтерию заранее.', order: 6 },
  { icon: '🩺', title: 'Медосмотр', color: 'from-violet-400 to-purple-500', steps: ['Предварительный медосмотр проходят при приёме на работу.', 'Периодические медосмотры — ежегодно (по направлению компании).', 'Получите направление у HR.', 'Пройдите осмотр в указанной клинике и принесите заключение.', 'Расходы на медосмотр оплачивает работодатель.'], docs: ['Направление от работодателя', 'Паспорт', 'Полис ОМС'], note: 'Без актуального медосмотра допуск к работе может быть ограничен.', order: 7 },
  { icon: '📞', title: 'Контакты HR', color: 'from-orange-400 to-red-500', steps: ['По всем вопросам трудоустройства, документов и льгот обращайтесь в HR.', 'Рабочие часы HR: пн–пт, 9:00–18:00.', 'Срочные вопросы — по WhatsApp или телефону.'], docs: [], note: 'Все обращения конфиденциальны.', order: 8 },
];

async function ensureDefaults() {
  await connectDB();
  const count = await HRTip.countDocuments();
  if (count === 0) await HRTip.insertMany(defaultTips);
}

export async function GET() {
  try {
    await ensureDefaults();
    const tips = await HRTip.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(tips);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { icon, title, color, steps, docs, note } = body;
    if (!title || !steps?.length) return NextResponse.json({ error: 'Заполните название и шаги' }, { status: 400 });
    const count = await HRTip.countDocuments();
    const tip = await HRTip.create({ icon: icon || '📋', title, color: color || 'from-slate-400 to-slate-600', steps, docs: docs || [], note: note || '', order: count + 1 });
    return NextResponse.json(tip);
  } catch {
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, icon, title, color, steps, docs, note } = body;
    if (!id || !title || !steps?.length) return NextResponse.json({ error: 'Заполните название и шаги' }, { status: 400 });
    const tip = await HRTip.findByIdAndUpdate(id, { icon, title, color, steps, docs: docs || [], note: note || '' }, { new: true });
    return NextResponse.json(tip);
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    await HRTip.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}
