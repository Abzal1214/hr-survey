'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const quickLinks = [
  { icon: '📰', label: 'Новости', desc: 'Последние события компании', href: '/news', color: 'from-sky-400 to-blue-500' },
  { icon: '📚', label: 'Тренинги', desc: 'Обучающие материалы и курсы', href: '/learn', color: 'from-emerald-400 to-teal-500' },
  { icon: '📝', label: 'Опросы', desc: 'Поделитесь обратной связью', href: '/surveys', color: 'from-violet-400 to-purple-500' },
  { icon: '🧪', label: 'Тесты', desc: 'Проверка знаний онлайн', href: '/tests', color: 'from-orange-400 to-red-500' },
  { icon: '🎁', label: 'Награды', desc: 'Обмен аква койнов на товары', href: '/rewards', color: 'from-yellow-400 to-amber-500' },
  { icon: '👤', label: 'Войти', desc: 'Личный кабинет сотрудника', href: '/admin', color: 'from-pink-400 to-rose-500' },
];

export default function Home() {
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => setNews(data.slice(0, 4)))
      .catch(() => setNews([]));
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    const onUserChanged = () => {
      try {
        const stored = localStorage.getItem('currentUser');
        setUser(stored ? JSON.parse(stored) : null);
      } catch { setUser(null); }
    };
    window.addEventListener('userChanged', onUserChanged);
    return () => window.removeEventListener('userChanged', onUserChanged);
  }, []);

  return (
    <div className="min-h-screen text-slate-900">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <h1 className="animate-fade-in-up text-5xl sm:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
            Портал для сотрудников
          </h1>
          <p className="animate-fade-in-up delay-200 mt-6 max-w-xl mx-auto text-lg text-white/90 leading-relaxed">
            Всё необходимое в одном месте: обучение, новости, опросы, тесты и программа лояльности AQUA COIN.
          </p>
          <div className="animate-fade-in-up delay-400 mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <Link href="/admin" className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-8 py-3 text-base font-bold text-white shadow-xl transition">
                👋 Мой кабинет
              </Link>
            ) : (
              <>
                <Link href="/register" className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-8 py-3 text-base font-bold text-white shadow-xl transition">
                  🚀 Зарегистрироваться
                </Link>
                <Link href="/admin" className="rounded-full bg-white/20 hover:bg-white/30 border border-white/40 px-8 py-3 text-base font-bold text-white shadow-xl transition backdrop-blur-sm">
                  🔐 Войти
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        {/* Быстрые ссылки */}
        <section className="mt-4">
          <h2 className="text-2xl font-bold text-white drop-shadow mb-6 text-center">Быстрый доступ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quickLinks.map((item, i) => (
              <Link key={item.href} href={item.href}
                className={`animate-scale-in hover-lift group relative overflow-hidden rounded-3xl bg-gradient-to-br ${item.color} p-6 text-white shadow-xl`}
                style={{animationDelay: `${i * 0.08}s`}}>
                <div className="text-4xl mb-3">{item.icon}</div>
                <p className="text-lg font-bold">{item.label}</p>
                <p className="mt-1 text-sm text-white/80">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* AQUA COIN баннер */}
        <section className="mt-10 animate-fade-in-up delay-300 rounded-[32px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 p-8 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-emerald-100">Программа лояльности</p>
            <h3 className="mt-2 text-3xl font-extrabold">💰 AQUA COIN</h3>
            <p className="mt-2 text-white/90">Зарабатывайте баллы за активность и обменивайте на товары в магазине наград.</p>
          </div>
          <Link href="/rewards" className="shrink-0 rounded-full bg-white font-bold px-8 py-3 shadow-lg hover:bg-emerald-50 transition" style={{color:'#047857'}}>
            В магазин →
          </Link>
        </section>

        {/* Последние новости */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white drop-shadow">Последние новости</h2>
            <Link href="/news" className="rounded-full bg-white/20 border border-white/40 px-5 py-2 text-sm font-semibold text-white hover:bg-white/30 transition backdrop-blur-sm">
              Все новости →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {news.length === 0 ? (
              <div className="rounded-[24px] bg-white/80 p-6 text-slate-500 shadow">Новостей пока нет.</div>
            ) : (
              news.map((item) => (
                <article key={item.id} className="rounded-[24px] bg-white/90 p-6 shadow-lg hover:shadow-xl transition">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-2xl mb-4" />
                  )}
                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}
                  </p>
                  <h4 className="mt-2 text-xl font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-2 text-slate-600 line-clamp-3">{item.description}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/20 bg-black/20 backdrop-blur-md py-6 mt-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between text-sm text-white/70 gap-2">
          <span>© 2026 Hawaii&amp;Miami · SanRemo</span>
          <a href="mailto:ithawaii@waterpark.kz" className="font-semibold text-white hover:text-sky-300">ithawaii@waterpark.kz</a>
        </div>
      </footer>
    </div>
  );
}

