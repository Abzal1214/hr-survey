'use client';

import { useEffect, useState } from 'react';

export default function NewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => setNews(data))
      .catch(() => setNews([]));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="animate-fade-in inline-block rounded-full bg-sky-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Новости портала</span>
          <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold text-white drop-shadow-lg">Hawaii&amp;Miami и SanRemo</h1>
          <p className="animate-fade-in-up delay-300 mt-4 max-w-xl mx-auto text-white/80 text-lg">Актуальные обновления для команды, события и всё важное для работы аквапарков.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 space-y-6">
        {/* Two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="animate-fade-in-up hover-lift rounded-[24px] bg-sky-500 p-8 shadow-xl">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white mb-4">Hawaii&amp;Miami</span>
            <h2 className="text-2xl font-bold text-white mb-3">Портал команды аквапарка</h2>
            <p className="text-sky-100 mb-6 text-sm">Тренинги по гостевому сервису, новая документация и расписание смен.</p>
            <ul className="space-y-3">
              {['Обновлен график анимации','Добавлены новые правила безопасности','Запуск нового курса для уборщиц и барменов'].map(item => (
                <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 text-white text-sm font-medium">
                  <span className="text-yellow-300 font-bold">→</span>{item}
                </li>
              ))}
            </ul>
          </article>
          <article className="animate-fade-in-up delay-200 hover-lift rounded-[24px] bg-emerald-500 p-8 shadow-xl">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white mb-4">SanRemo</span>
            <h2 className="text-2xl font-bold text-white mb-3">База знаний и события</h2>
            <p className="text-emerald-100 mb-6 text-sm">Все новости по SanRemo: тренинги, мероприятия и внутренняя коммуникация.</p>
            <ul className="space-y-3">
              {['Составлен новый план обучения','Анонс зимнего тимбилдинга','Обновление инструкций по гостевому сервису'].map(item => (
                <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 text-white text-sm font-medium">
                  <span className="text-yellow-300 font-bold">→</span>{item}
                </li>
              ))}
            </ul>
          </article>
        </div>

        {/* Live news feed */}
        <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Лента новостей</p>
            <h2 className="text-2xl font-bold text-slate-900">Последние публикации</h2>
          </div>
          {news.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-slate-500 text-center">Новостей пока нет. Добавьте первую запись через админку.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {news.map((item) => (
                <article key={item.id} className="rounded-[20px] border-l-4 border-sky-400 bg-sky-50 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-sky-400 mb-2">{new Date(item.createdAt || item.timestamp).toLocaleDateString('ru-RU')}</p>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-2xl mb-3" />
                  )}
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
