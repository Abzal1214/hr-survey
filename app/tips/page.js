'use client';
import { useState } from 'react';
import Link from 'next/link';

const tips = [
  {
    id: 1,
    icon: '🏥',
    title: 'Больничный лист',
    color: 'from-red-400 to-rose-500',
    steps: [
      'Обратитесь к врачу в день, когда почувствовали себя плохо — не позже.',
      'Врач оформит электронный больничный лист (ЭЛН) и выдаст номер.',
      'Сообщите руководителю/HR о болезни в первый день.',
      'После выздоровления сообщите номер ЭЛН в бухгалтерию или HR.',
      'Оплата: первые 3 дня — за счёт работодателя, остальные — за счёт фонда.',
    ],
    docs: ['Паспорт', 'Полис ОМС'],
    note: 'Уведомите руководителя в первый день болезни любым доступным способом.',
  },
  {
    id: 2,
    icon: '🏖️',
    title: 'Ежегодный отпуск',
    color: 'from-sky-400 to-blue-500',
    steps: [
      'Отпуск предоставляется по графику, утверждённому в начале года.',
      'Подайте заявление на отпуск минимум за 2 недели до его начала.',
      'Руководитель согласовывает и передаёт в HR/бухгалтерию.',
      'Отпускные выплачиваются не позднее чем за 3 дня до начала отпуска.',
      'Минимальная продолжительность — 28 календарных дней в год.',
    ],
    docs: ['Заявление на отпуск (форма у HR)'],
    note: 'Отпуск можно разделить на части, но хотя бы одна часть должна быть не менее 14 дней.',
  },
  {
    id: 3,
    icon: '📋',
    title: 'Приём на работу',
    color: 'from-emerald-400 to-teal-500',
    steps: [
      'Пройдите собеседование и получите оффер.',
      'Подпишите трудовой договор в отделе кадров.',
      'Пройдите инструктаж по охране труда.',
      'Получите доступы, форму и необходимые материалы.',
      'Первые 3 месяца — испытательный срок.',
    ],
    docs: ['Паспорт', 'ИНН', 'СНИЛС', 'Трудовая книжка (или заявление об ЭТК)', 'Диплом / аттестат', 'Медкнижка (при необходимости)'],
    note: 'Все оригиналы документов необходимо принести в день подписания договора.',
  },
  {
    id: 4,
    icon: '🤱',
    title: 'Декретный отпуск',
    color: 'from-pink-400 to-rose-500',
    steps: [
      'Получите у врача листок нетрудоспособности по беременности (с 30-й недели).',
      'Подайте заявление на отпуск по беременности и родам в HR.',
      'После рождения ребёнка оформите отпуск по уходу за ребёнком до 1,5 или 3 лет.',
      'Подайте документы для получения пособий через HR/бухгалтерию.',
    ],
    docs: ['Больничный лист по беременности', 'Свидетельство о рождении ребёнка', 'Заявление на отпуск', 'Реквизиты банковского счёта'],
    note: 'Рабочее место сохраняется на весь период декрета.',
  },
  {
    id: 5,
    icon: '✍️',
    title: 'Увольнение',
    color: 'from-slate-400 to-slate-600',
    steps: [
      'Подайте заявление об увольнении за 2 недели до желаемой даты.',
      'Передайте дела коллеге или руководителю.',
      'Получите обходной лист и подпишите его у всех отделов.',
      'В последний рабочий день получите трудовую книжку и расчёт.',
      'Расчёт выплачивается в день увольнения.',
    ],
    docs: ['Заявление об увольнении', 'Обходной лист'],
    note: 'По договорённости с работодателем срок отработки может быть сокращён.',
  },
  {
    id: 6,
    icon: '💰',
    title: 'Аванс и зарплата',
    color: 'from-yellow-400 to-amber-500',
    steps: [
      'Аванс выплачивается в середине месяца (обычно 15–16 числа).',
      'Зарплата — в конце месяца (обычно последние числа).',
      'При задержке обратитесь в бухгалтерию или к HR.',
      'Расчётный листок можно запросить у бухгалтера.',
    ],
    docs: ['Реквизиты банковской карты (для начисления)'],
    note: 'Если реквизиты изменились — сообщите в бухгалтерию заранее.',
  },
  {
    id: 7,
    icon: '🩺',
    title: 'Медосмотр',
    color: 'from-violet-400 to-purple-500',
    steps: [
      'Предварительный медосмотр проходят при приёме на работу.',
      'Периодические медосмотры — ежегодно (по направлению компании).',
      'Получите направление у HR.',
      'Пройдите осмотр в указанной клинике и принесите заключение.',
      'Расходы на медосмотр оплачивает работодатель.',
    ],
    docs: ['Направление от работодателя', 'Паспорт', 'Полис ОМС'],
    note: 'Без актуального медосмотра допуск к работе может быть ограничен.',
  },
  {
    id: 8,
    icon: '📞',
    title: 'Контакты HR',
    color: 'from-orange-400 to-red-500',
    steps: [
      'По всем вопросам трудоустройства, документов и льгот обращайтесь в HR.',
      'Рабочие часы HR: пн–пт, 9:00–18:00.',
      'Срочные вопросы — по WhatsApp или телефону.',
    ],
    docs: [],
    note: 'Все обращения конфиденциальны.',
  },
];

export default function TipsPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">HR-справочник</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg">💡 Полезные советы</h1>
          <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto">Как оформить больничный, уйти в отпуск и многое другое</p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-white/20 border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition">
            ← На главную
          </Link>
        </div>
      </div>

      {/* Cards */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tips.map(tip => (
            <button
              key={tip.id}
              onClick={() => setSelected(tip)}
              className={`bg-gradient-to-br ${tip.color} rounded-2xl p-5 text-left text-white shadow-lg hover:scale-[1.02] transition-transform`}
            >
              <div className="text-3xl mb-2">{tip.icon}</div>
              <p className="text-lg font-extrabold">{tip.title}</p>
              <p className="text-white/80 text-sm mt-1">{tip.steps[0]}</p>
            </button>
          ))}
        </div>
      </main>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-br ${selected.color} rounded-t-3xl p-6 text-white`}>
              <div className="text-4xl mb-2">{selected.icon}</div>
              <h2 className="text-2xl font-extrabold">{selected.title}</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h3 className="font-bold text-slate-800 mb-2">📝 Шаги</h3>
                <ol className="space-y-2">
                  {selected.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-slate-700 text-sm">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              {selected.docs.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">📎 Необходимые документы</h3>
                  <ul className="space-y-1">
                    {selected.docs.map((d, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selected.note && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  💡 {selected.note}
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 text-white font-bold flex items-center justify-center transition">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
