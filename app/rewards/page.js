"use client";
import { useEffect, useState } from 'react';

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [cart, setCart] = useState({});
  const [user, setUser] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [exchangeError, setExchangeError] = useState('');

  useEffect(() => {
    fetch('/api/rewards')
      .then((res) => res.json())
      .then(setRewards)
      .catch(() => setRewards([]));
    try {
      const u = JSON.parse(localStorage.getItem('currentUser'));
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  let balance = 0;
  if (user?.role === 'admin') balance = '∞';
  else if (user?.points != null) balance = user.points;

  // Добавить товар в корзину
  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  // Удалить товар из корзины
  const removeFromCart = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  };

  // Очистить корзину
  const clearCart = () => setCart({});

  // Обработчик обмена
  const handleExchange = async () => {
    setExchangeError('');
    if (!user?.phone) { setExchangeError('Войдите в аккаунт для обмена.'); return; }
    const items = Object.entries(cart).map(([id, qty]) => {
      const item = rewards.find(r => r.id === Number(id));
      return { id: Number(id), name: item.name, qty, cost: item.cost, icon: getIcon(item.name) };
    });
    try {
      const res = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, items, total }),
      });
      const data = await res.json();
      if (!res.ok) { setExchangeError(data.error || 'Ошибка обмена'); return; }
      // Обновить баланс в localStorage
      const updated = { ...user, points: data.newBalance };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      window.dispatchEvent(new Event('userChanged'));
      clearCart();
      setCoupon(data);
    } catch {
      setExchangeError('Ошибка сети. Попробуйте ещё раз.');
    }
  };

  // Сумма заказа
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = rewards.find((r) => r.id === Number(id));
    return sum + (item ? item.cost * qty : 0);
  }, 0);

  const getIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('кофе') || n.includes('coffee')) return '☕';
    if (n.includes('чай') || n.includes('tea')) return '🍵';
    if (n.includes('футболк') || n.includes('shirt') || n.includes('одежд')) return '👕';
    if (n.includes('кружк') || n.includes('чашк') || n.includes('mug')) return '🍺';
    if (n.includes('сертификат') || n.includes('купон')) return '🎟️';
    if (n.includes('книг') || n.includes('book')) return '📚';
    if (n.includes('наушник') || n.includes('headphone')) return '🎧';
    if (n.includes('билет') || n.includes('ticket')) return '🎫';
    if (n.includes('ланч') || n.includes('обед') || n.includes('еда') || n.includes('food')) return '🍱';
    if (n.includes('день') || n.includes('выходной')) return '🏖️';
    if (n.includes('шапк') || n.includes('кепк')) return '🧢';
    if (n.includes('рюкзак') || n.includes('сумк')) return '🎒';
    return '🎁';
  };

  return (
    <>
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="animate-fade-in inline-block rounded-full bg-yellow-400 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Программа лояльности</span>
          <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold text-white drop-shadow-lg">💰 Магазин наград</h1>
          <p className="animate-fade-in-up delay-300 mt-4 max-w-xl mx-auto text-white/80 text-lg">Обменивайте AQUA COIN на приятные бонусы и подарки.</p>
          <div className="animate-fade-in-up delay-400 mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/40 px-6 py-2.5 backdrop-blur-sm">
            <span className="text-yellow-300 text-xl">🪙</span>
            <span className="text-white font-bold text-lg">{balance}</span>
            <span className="text-white/70 text-sm">AQUA COIN</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16 space-y-6">
        {/* Товары */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.length === 0 && (
            <div className="col-span-3 rounded-[24px] bg-white/95 p-8 text-center text-slate-500 shadow">Нет доступных товаров.</div>
          )}
          {rewards.map((item, i) => (
            <div key={item.id}
              className="animate-scale-in hover-lift rounded-[24px] bg-white/95 p-6 shadow-xl flex flex-col gap-3"
              style={{animationDelay: `${i * 0.08}s`}}>
              <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-2xl mb-1">{getIcon(item.name)}</div>
              <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
              <p className="text-slate-500 text-sm flex-1">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-emerald-600">{item.cost} 🪙</span>
                <button
                  onClick={() => addToCart(item.id)}
                  className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold flex items-center justify-center transition shadow"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Корзина */}
        <div className="animate-fade-in-up delay-200 rounded-[24px] bg-white/95 p-8 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            🛒 Корзина
            {Object.keys(cart).length > 0 && (
              <span className="ml-1 text-sm font-semibold text-white bg-emerald-500 rounded-full w-6 h-6 flex items-center justify-center">
                {Object.values(cart).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </h2>
          {Object.keys(cart).length === 0 ? (
            <p className="text-slate-400 text-sm">Добавьте товары из списка выше.</p>
          ) : (
            <>
              <ul className="space-y-3 mb-6">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = rewards.find((r) => r.id === Number(id));
                  if (!item) return null;
                  return (
                    <li key={id} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <span className="flex-1 font-medium text-slate-800">{item.name}</span>
                      <span className="text-slate-400 text-sm">×{qty}</span>
                      <span className="text-emerald-600 font-bold text-sm">{item.cost * qty} 🪙</span>
                      <button onClick={() => removeFromCart(id)}
                        className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold flex items-center justify-center transition text-sm">
                        –
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-sm text-slate-400">Итого</p>
                  <p className="text-2xl font-extrabold text-emerald-600">{total} 🪙</p>
                </div>
                <button
                  onClick={handleExchange}
                  disabled={balance !== '∞' && total > balance}
                  className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 font-bold text-base transition shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Обменять
                </button>
              </div>
              {exchangeError && <p className="text-red-500 text-sm mt-3">{exchangeError}</p>}
              {balance !== '∞' && total > balance && (
                <p className="text-amber-600 text-sm mt-2">⚠️ Недостаточно монет. Нужно ещё {total - balance} 🪙</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>

    {/* Купон */}
    {coupon && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md">
          {/* Купон */}
          <div className="bg-white rounded-[28px] shadow-2xl overflow-hidden" style={{fontFamily: 'monospace'}}>
            {/* Шапка купона */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-center">
              <div className="text-4xl mb-2">🎟️</div>
              <h2 className="text-2xl font-extrabold text-white tracking-wide">AQUA COIN КУПОН</h2>
              <p className="text-emerald-100 text-sm mt-1">Hawaii&Miami · SanRemo</p>
            </div>

            {/* Пунктир */}
            <div className="px-8 py-0 flex items-center gap-2 -my-1 relative z-10">
              <div className="w-5 h-5 bg-slate-200 rounded-full -ml-11 flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-slate-300" />
              <div className="w-5 h-5 bg-slate-200 rounded-full -mr-11 flex-shrink-0" />
            </div>

            {/* Тело купона */}
            <div className="px-8 py-6">
              <p className="text-xs text-slate-400 mb-1">Сотрудник</p>
              <p className="font-bold text-slate-800 text-lg mb-4">{coupon.userName}</p>

              <p className="text-xs text-slate-400 mb-2">Товары</p>
              <ul className="space-y-2 mb-4">
                {coupon.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 text-sm">
                    <span>{item.icon}</span>
                    <span className="flex-1 font-medium">{item.name}</span>
                    <span className="text-slate-400">×{item.qty}</span>
                    <span className="text-emerald-600 font-bold">{item.cost * item.qty} 🪙</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-3 mb-4">
                <span className="text-slate-500 text-sm">Итого списано</span>
                <span className="font-extrabold text-emerald-600 text-lg">{coupon.total} 🪙</span>
              </div>

              {/* Код купона */}
              <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-300 px-4 py-3 text-center mb-2">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest">Код купона</p>
                <p className="text-xl font-extrabold text-emerald-700 tracking-widest">{coupon.couponCode}</p>
              </div>
              <p className="text-xs text-slate-400 text-center mb-2">
                {new Date(coupon.issuedAt).toLocaleString('ru-RU')}
              </p>
            </div>

            {/* Пунктир */}
            <div className="px-8 py-0 flex items-center gap-2 -my-1 relative z-10">
              <div className="w-5 h-5 bg-slate-200 rounded-full -ml-11 flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-slate-300" />
              <div className="w-5 h-5 bg-slate-200 rounded-full -mr-11 flex-shrink-0" />
            </div>

            {/* Футер */}
            <div className="bg-emerald-50 px-8 py-4 text-center">
              <p className="text-emerald-800 text-sm font-semibold">📍 Покажите этот купон администратору</p>
              <p className="text-emerald-600 text-xs mt-1">чтобы получить ваш товар</p>
            </div>
          </div>

          {/* Кнопка закрыть */}
          <button
            onClick={() => setCoupon(null)}
            className="mt-4 w-full rounded-2xl bg-white/20 border border-white/40 text-white py-3 font-semibold hover:bg-white/30 transition backdrop-blur-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    )}
    </>
  );
}
