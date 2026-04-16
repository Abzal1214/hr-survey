'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import GoldCoin from './components/GoldCoin';

const staticLinks = [
  { icon: '📰', label: 'Новости', desc: 'Последние события компании', href: '/news', color: 'from-sky-400 to-blue-500' },
  { icon: '📚', label: 'Обучение', desc: 'Материалы и тесты', href: '/learn', color: 'from-emerald-400 to-teal-500' },
  { icon: '📝', label: 'Опросы', desc: 'Поделитесь обратной связью', href: '/surveys', color: 'from-violet-400 to-purple-500' },
  { icon: '🏋️', label: 'Тренинги', desc: 'Запись на офлайн тренинги', href: '/tests', color: 'from-orange-400 to-red-500' },
  { icon: '🎁', label: 'Награды', desc: 'Обмен аква койнов на товары', href: '/rewards', color: 'from-yellow-400 to-amber-500' },
];

export default function Home() {
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);
  const [newsIdx, setNewsIdx] = useState(0);
  const [newsAnimating, setNewsAnimating] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const carouselRef = useRef(null);
  const [carouselW, setCarouselW] = useState(800);

  const goNews = (dir) => {
    if (newsAnimating || news.length < 2) return;
    setNewsAnimating(true);
    setNewsIdx(i => (i + dir + news.length) % news.length);
    setTimeout(() => setNewsAnimating(false), 460);
  };

  useEffect(() => {
    if (!carouselRef.current) return;
    const ro = new ResizeObserver(entries => setCarouselW(entries[0].contentRect.width));
    ro.observe(carouselRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => setNews(data.slice(0, 8)))
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
            {staticLinks.map((item, i) => (
              <Link key={item.href} href={item.href}
                className={`animate-scale-in hover-lift group relative overflow-hidden rounded-3xl bg-gradient-to-br ${item.color} p-6 text-white shadow-xl`}
                style={{animationDelay: `${i * 0.08}s`}}>
                <div className="text-4xl mb-3">{item.icon}</div>
                <p className="text-lg font-bold">{item.label}</p>
                <p className="mt-1 text-sm text-white/80">{item.desc}</p>
              </Link>
            ))}
            {/* Динамическая карточка: кабинет или вход */}
            <Link href="/admin"
              className="animate-scale-in hover-lift group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 p-6 text-white shadow-xl"
              style={{animationDelay: `${staticLinks.length * 0.08}s`}}>
              {user ? (
                <>
                  <div className="text-4xl mb-3">👋</div>
                  <p className="text-lg font-bold truncate">{user.name || user.fullName || 'Мой кабинет'}</p>
                  <p className="mt-1 text-sm text-white/80 flex items-center gap-1">
                    <GoldCoin size="xs" /> {user.points ?? 0} AQUA COIN
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">👤</div>
                  <p className="text-lg font-bold">Войти</p>
                  <p className="mt-1 text-sm text-white/80">Личный кабинет сотрудника</p>
                </>
              )}
            </Link>
          </div>
        </section>

        {/* AQUA COIN баннер */}
        <section className="mt-10 animate-fade-in-up delay-300 rounded-[32px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 p-8 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-emerald-100">Программа лояльности</p>
            <h3 className="mt-2 text-3xl font-extrabold flex items-center gap-2"><GoldCoin size="lg" /> AQUA COIN</h3>
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
          {news.length === 0 ? (
            <div className="rounded-[24px] bg-white/80 p-6 text-slate-500 shadow text-center">Новостей пока нет.</div>
          ) : (
            <div className="relative px-10">
              {/* Left button */}
              {news.length > 1 && (
                <button onClick={() => goNews(-1)} disabled={newsAnimating}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/40 hover:bg-white/70 text-white font-bold text-3xl backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl disabled:opacity-50">
                  ‹
                </button>
              )}

              {/* Carousel body */}
              <div className="w-full" ref={carouselRef}>
                {(() => {
                  // All cards are the same base width, scale drives the size difference
                  const cardW = Math.min(carouselW * 0.72, 600);
                  const centerScale = 1;
                  const sideScale = 0.68;
                  // Distance from center to side card center = half of center + gap + half of side (in scaled terms)
                  const sideSpacing = cardW * (centerScale / 2 + sideScale / 2) + 14;
                  const offscreenSpacing = sideSpacing * 2;
                  const containerH = 400;
                  const cardH = containerH; // card height before scaling
                  return (
                    <div className="relative" style={{ height: containerH }}>
                      {[-2, -1, 0, 1, 2].map(offset => {
                        const idx = ((newsIdx + offset) % news.length + news.length) % news.length;
                        const isCenter = offset === 0;
                        const isSide = Math.abs(offset) === 1;
                        const isOffscreen = Math.abs(offset) === 2;
                        const scale = isCenter ? centerScale : isSide ? sideScale : sideScale * 0.85;
                        const x = isOffscreen ? offset * offscreenSpacing : offset * sideSpacing;
                        const opacity = isCenter ? 1 : isSide ? 0.92 : 0;
                        const item = news[idx];
                        return (
                          <div
                            key={offset}
                            onClick={() => isSide ? goNews(offset) : isCenter ? setSelectedNews(item) : null}
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              width: cardW,
                              height: cardH,
                              opacity,
                              zIndex: isCenter ? 10 : isSide ? 5 : 0,
                              pointerEvents: isOffscreen ? 'none' : 'auto',
                              cursor: isCenter ? 'pointer' : isSide ? 'pointer' : 'default',
                              transition: 'transform 0.52s cubic-bezier(.22,.68,0,1.2), opacity 0.52s ease',
                              transform: `translate(calc(-50% + ${x}px), -50%) scale(${scale})`,
                              transformOrigin: 'center center',
                              willChange: 'transform, opacity',
                            }}
                          >
                            {isCenter ? (
                              <article className="rounded-[24px] bg-white/95 shadow-2xl overflow-hidden h-full flex flex-col">
                                {item?.imageUrl
                                  ? <div className="overflow-hidden" style={{ height: 220 }}><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /></div>
                                  : <div className="h-3 bg-gradient-to-r from-sky-400 to-blue-500" />}
                                <div className="p-6 flex flex-col flex-1">
                                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-500 mb-1">
                                    {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : ''}
                                  </p>
                                  <h3 className="text-xl font-extrabold text-slate-900 leading-snug mb-2 line-clamp-2">{item?.title}</h3>
                                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">{item?.description}</p>
                                  <span className="mt-3 inline-block text-xs font-semibold text-sky-600">Читать далее →</span>
                                </div>
                              </article>
                            ) : (
                              <article className="rounded-[24px] bg-white/95 shadow-lg overflow-hidden flex flex-col h-full hover:bg-white/98 transition-colors">
                                {item?.imageUrl
                                  ? <div className="overflow-hidden shrink-0" style={{ height: 200 }}><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /></div>
                                  : <div className="bg-gradient-to-r from-sky-400 to-blue-500 shrink-0" style={{ height: 4 }} />}
                                <div className="flex flex-col justify-center p-4 overflow-hidden flex-1">
                                  <p className="text-xs font-semibold text-sky-400 mb-1 truncate">
                                    {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : ''}
                                  </p>
                                  <h4 className="font-bold text-slate-700 text-sm leading-snug line-clamp-3">{item?.title}</h4>
                                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{item?.description}</p>
                                </div>
                              </article>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Right button */}
              {news.length > 1 && (
                <button onClick={() => goNews(1)} disabled={newsAnimating}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/40 hover:bg-white/70 text-white font-bold text-3xl backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl disabled:opacity-50">
                  ›
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* News modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            {selectedNews.imageUrl && <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-64 object-cover rounded-t-[32px]" />}
            <div className="p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-500 mb-3">
                {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 leading-tight">{selectedNews.title}</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedNews.description}</p>
            </div>
            <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white font-bold flex items-center justify-center transition">✕</button>
          </div>
        </div>
      )}

      <footer className="border-t border-white/20 bg-black/20 backdrop-blur-md py-6 mt-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between text-sm text-white/70 gap-2">
          <span>© 2026 Hawaii&amp;Miami · SanRemo</span>
          <a href="mailto:ithawaii@waterpark.kz" className="font-semibold text-white hover:text-sky-300">ithawaii@waterpark.kz</a>
        </div>
      </footer>
    </div>
  );
}

