'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => setNews(data.slice(0, 4)))
      .catch(() => setNews([]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-cyan-300 to-emerald-400 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-[36px] bg-white/90 border border-white/80 p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-700">HR обучение</p>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900">Портал для стажеров и администраторов</h1>
              <p className="mt-4 max-w-2xl text-slate-700 text-lg leading-8">
                Регистрация сотрудников, онлайн-тесты, загрузка материалов, события и новости — всё в одном месте.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <a href="/register" className="rounded-3xl bg-sky-600 text-white py-4 px-6 text-center font-semibold shadow-lg hover:bg-sky-700 transition">
                Регистрация
              </a>
              <a href="/tests" className="rounded-3xl bg-emerald-600 text-white py-4 px-6 text-center font-semibold shadow-lg hover:bg-emerald-700 transition">
                Пройти тест
              </a>
              <a href="/learn" className="rounded-3xl bg-violet-600 text-white py-4 px-6 text-center font-semibold shadow-lg hover:bg-violet-700 transition">
                Материалы и новости
              </a>
              <a href="/admin" className="rounded-3xl bg-orange-500 text-white py-4 px-6 text-center font-semibold shadow-lg hover:bg-orange-600 transition">
                Админка
              </a>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-sky-50 p-6 border border-sky-100 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Саморегистрация</h2>
              <p className="mt-3 text-slate-700">Сотрудники могут зарегистрироваться самостоятельно и получить доступ к обучению.</p>
            </div>
            <div className="rounded-3xl bg-cyan-50 p-6 border border-cyan-100 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Онлайн тесты</h2>
              <p className="mt-3 text-slate-700">Проверка знаний и запись результатов в систему.</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-6 border border-emerald-100 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Файлы и тренинги</h2>
              <p className="mt-3 text-slate-700">Загружайте PDF/Word материалы, публикуйте новости и события.</p>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Последние новости</h2>
              <a href="/learn" className="text-sky-700 font-semibold hover:underline">Все новости</a>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {news.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-6 text-slate-600">Новостей пока нет. Добавьте первую через админку.</div>
              ) : (
                news.map((item) => (
                  <div key={item.id} className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm">
                    <p className="text-slate-900 font-semibold">{item.title}</p>
                    <p className="mt-3 text-slate-600">{item.description}</p>
                    <p className="mt-4 text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString('ru-RU')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
