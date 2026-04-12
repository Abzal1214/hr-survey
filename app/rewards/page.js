"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmModal from '../components/ConfirmModal';
import KebabMenu from '../components/KebabMenu';

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [cart, setCart] = useState({});
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [exchangeError, setExchangeError] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', description: '', cost: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [editingRewardId, setEditingRewardId] = useState(null);
  const [editRewardForm, setEditRewardForm] = useState({ name: '', description: '', cost: '' });
  const couponTickets = coupon?.coupons?.length
    ? coupon.coupons
    : (coupon?.couponCode
      ? [{
          couponCode: coupon.couponCode,
          issuedAt: coupon.issuedAt,
          item: {
            name: coupon.items?.[0]?.name || 'Товар',
            cost: coupon.items?.[0]?.cost || 0,
            icon: coupon.items?.[0]?.icon || '🎁',
          },
          index: 1,
          count: 1,
        }]
      : []);

  const restoreUserFromRemembered = async () => {
    try {
      const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
      const currentRaw = localStorage.getItem('currentUser');
      const rememberedRaw = localStorage.getItem('rememberedLogin');
      const current = currentRaw ? JSON.parse(currentRaw) : null;
      const remembered = rememberedRaw ? JSON.parse(rememberedRaw) : null;

      if (current?.phone) {
        const known = { ...current, role: current.role || 'employee' };
        setUser(known);
        setIsAdmin(known.role === 'admin');
        return known;
      }

      const usersRes = await fetch('/api/users');
      if (!usersRes.ok) return null;
      const users = await usersRes.json();

      const loginCandidates = [current?.username, current?.phone, remembered?.username]
        .filter(Boolean)
        .map((v) => String(v).trim());

      let matched = null;

      if (remembered?.username && remembered?.password) {
        const enteredLogin = String(remembered.username).trim();
        const enteredPhone = normalizePhone(enteredLogin);
        matched = users.find((u) => {
          const phoneMatch = enteredPhone && normalizePhone(u.phone) === enteredPhone;
          const usernameMatch = u.username && u.username.toLowerCase() === enteredLogin.toLowerCase();
          const userDept = (u.department || u.workplaceType || '').toLowerCase();
          const rememberedDept = String(remembered.department || '').toLowerCase();
          return (phoneMatch || usernameMatch) && u.password === remembered.password && (!rememberedDept || userDept === rememberedDept);
        });
      }

      if (!matched && loginCandidates.length) {
        matched = users.find((u) => loginCandidates.some((login) => {
          const enteredPhone = normalizePhone(login);
          const phoneMatch = enteredPhone && normalizePhone(u.phone) === enteredPhone;
          const usernameMatch = u.username && u.username.toLowerCase() === login.toLowerCase();
          return phoneMatch || usernameMatch;
        }));
      }

      if (!matched) return null;
      const restoredUser = { ...matched, role: matched.role || 'employee' };
      setUser(restoredUser);
      setIsAdmin(restoredUser.role === 'admin');
      localStorage.setItem('currentUser', JSON.stringify(restoredUser));
      window.dispatchEvent(new Event('userChanged'));
      return restoredUser;
    } catch {
      return null;
    }
  };

  const loadRewards = () => {
    fetch('/api/rewards')
      .then((res) => res.json())
      .then(setRewards)
      .catch(() => setRewards([]));
  };

  useEffect(() => {
    loadRewards();
    const loadUser = async () => {
      try {
        const u = JSON.parse(localStorage.getItem('currentUser'));
        setUser(u);
        setIsAdmin(u?.role === 'admin');
        if (!u?.phone) await restoreUserFromRemembered();
      } catch {
        setUser(null);
        setIsAdmin(false);
      }
    };
    loadUser();

    const onUserChanged = async () => {
      try {
        const u = JSON.parse(localStorage.getItem('currentUser'));
        setUser(u);
        setIsAdmin(u?.role === 'admin');
      } catch {
        setUser(null);
        setIsAdmin(false);
      }
    };

    window.addEventListener('userChanged', onUserChanged);
    return () => window.removeEventListener('userChanged', onUserChanged);
  }, []);

  let balance = 0;
  if (user?.role === 'admin') balance = '∞';
  else if (user?.points != null) balance = user.points;

  const addToCart = (id) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart((prev) => {
    const next = { ...prev };
    if (next[id] > 1) next[id]--;
    else delete next[id];
    return next;
  });
  const clearCart = () => setCart({});

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = rewards.find((r) => String(r._id || r.id) === id);
    return sum + (item ? item.cost * qty : 0);
  }, 0);

  const handleExchange = async () => {
    setExchangeError('');
    let activeUser = user;
    if (!activeUser?.phone) {
      activeUser = await restoreUserFromRemembered();
    }
    if (!activeUser?.phone) {
      setExchangeError('Войдите в аккаунт для обмена.');
      return;
    }
    const items = Object.entries(cart).map(([id, qty]) => {
      const item = rewards.find(r => String(r._id || r.id) === id);
      return { id, name: item.name, qty, cost: item.cost, icon: getIcon(item.name) };
    });
    try {
      const res = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: activeUser.phone, items, total }),
      });
      const data = await res.json();
      if (!res.ok) { setExchangeError(data.error || 'Ошибка обмена'); return; }
      const updated = { ...activeUser, points: data.newBalance };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
      window.dispatchEvent(new Event('userChanged'));
      clearCart();
      setCoupon(data);
    } catch { setExchangeError('Ошибка сети. Попробуйте ещё раз.'); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddReward = async () => {
    if (!newReward.name || !newReward.description || !newReward.cost) {
      setCreateMsg('Заполните все поля'); return;
    }
    setSaving(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const uploadRes = await fetch('/api/files', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.fileUrls?.[0]) imageUrl = uploadData.fileUrls[0];
      }
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newReward, imageUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateMsg('Награда добавлена!');
        setNewReward({ name: '', description: '', cost: '' });
        setImageFile(null);
        setImagePreview('');
        setShowCreate(false);
        loadRewards();
      } else { setCreateMsg(data.error || 'Ошибка'); }
    } catch { setCreateMsg('Ошибка сети'); }
    setSaving(false);
  };

  const handleDeleteReward = (id) => {
    setConfirmModal({ message: 'Удалить эту награду?', onConfirm: async () => {
      setConfirmModal(null);
      await fetch(`/api/rewards?id=${id}`, { method: 'DELETE' });
      loadRewards();
    }});
  };

  const handleSaveRewardEdit = async (id) => {
    const res = await fetch('/api/rewards', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editRewardForm }),
    });
    if (res.ok) { setEditingRewardId(null); loadRewards(); }
  };

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
        {isAdmin && (
          <div>
            <button
              onClick={() => { setShowCreate(!showCreate); setCreateMsg(''); }}
              className="rounded-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 font-semibold transition shadow-lg"
            >
              {showCreate ? '✕ Отмена' : '+ Добавить награду'}
            </button>
            {showCreate && (
              <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Новая награда</h2>
                <div className="space-y-4">
                  <input value={newReward.name} onChange={e => setNewReward(p => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Название награды *" />
                  <input value={newReward.description} onChange={e => setNewReward(p => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Описание *" />
                  <input type="number" min="1" value={newReward.cost} onChange={e => setNewReward(p => ({ ...p, cost: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Стоимость в AQUA COIN *" />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Картинка товара</label>
                    <input type="file" accept="image/*" onChange={handleImageChange}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-yellow-100 file:text-yellow-700 file:font-semibold file:px-4 file:py-1" />
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" className="mt-3 h-32 w-full object-cover rounded-2xl border border-slate-200" />
                    )}
                  </div>
                  {createMsg && <p className="text-sm text-red-600">{createMsg}</p>}
                  <button onClick={handleAddReward} disabled={saving}
                    className="w-full rounded-2xl bg-yellow-500 text-white py-3 font-semibold hover:bg-yellow-600 transition disabled:opacity-50">
                    {saving ? 'Сохранение...' : 'Добавить награду'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.length === 0 && (
            <div className="col-span-3 rounded-[24px] bg-white/95 p-8 text-center text-slate-500 shadow">
              {isAdmin ? 'Нет наград. Добавьте первую кнопкой выше.' : 'Нет доступных товаров.'}
            </div>
          )}
          {rewards.map((item, i) => {
            const itemId = String(item._id || item.id);
            return (
              <div key={itemId}
                className="animate-scale-in hover-lift rounded-[24px] bg-white/95 p-6 shadow-xl flex flex-col gap-3"
                style={{animationDelay: `${i * 0.08}s`}}>
                {editingRewardId === itemId ? (
                  <div className="space-y-3">
                    <input
                      value={editRewardForm.name}
                      onChange={e => setEditRewardForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm"
                      placeholder="Название"
                    />
                    <textarea
                      value={editRewardForm.description}
                      onChange={e => setEditRewardForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm min-h-[60px]"
                      placeholder="Описание"
                    />
                    <input
                      type="number"
                      value={editRewardForm.cost}
                      onChange={e => setEditRewardForm(p => ({ ...p, cost: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm"
                      placeholder="Стоимость (🪙)"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveRewardEdit(itemId)} className="rounded-xl bg-yellow-500 text-white px-4 py-2 text-sm font-semibold hover:bg-yellow-600 transition">Сохранить</button>
                      <button onClick={() => setEditingRewardId(null)} className="rounded-xl bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-300 transition">Отмена</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="w-full h-36 object-cover rounded-2xl mb-1" />
                      : <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-2xl mb-1">{getIcon(item.name)}</div>
                    }
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="text-slate-500 text-sm flex-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-emerald-600">{item.cost} 🪙</span>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <KebabMenu
                            onEdit={() => { setEditingRewardId(itemId); setEditRewardForm({ name: item.name, description: item.description, cost: item.cost }); }}
                            onDelete={() => handleDeleteReward(itemId)}
                          />
                        )}
                        <button onClick={() => addToCart(itemId)}
                          className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold flex items-center justify-center transition shadow">
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

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
                  const item = rewards.find((r) => String(r._id || r.id) === id);
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
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-amber-600 text-sm">⚠️ Недостаточно монет. Нужно ещё {total - balance} 🪙</p>
                  <Link href="/tests"
                    className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 font-semibold text-sm transition shadow">
                    🚀 Заработать монеты
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>

    {coupon && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-3xl">
          <div className="max-h-[78vh] overflow-y-auto space-y-4 pr-1">
            {couponTickets.map((ticket, idx) => (
              <div key={`${ticket.couponCode}-${idx}`} className="print-coupon bg-white rounded-[28px] shadow-2xl overflow-hidden" style={{fontFamily: 'monospace'}}>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-center">
                  <div className="text-4xl mb-2">🎟️</div>
                  <h2 className="text-2xl font-extrabold text-white tracking-wide">AQUA COIN КУПОН</h2>
                  <p className="text-emerald-100 text-sm mt-1">Hawaii&Miami · SanRemo</p>
                </div>
                <div className="px-8 py-0 flex items-center gap-2 -my-1 relative z-10">
                  <div className="w-5 h-5 bg-slate-200 rounded-full -ml-11 flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-300" />
                  <div className="w-5 h-5 bg-slate-200 rounded-full -mr-11 flex-shrink-0" />
                </div>
                <div className="px-8 py-6">
                  <p className="text-xs text-slate-400 mb-1">Сотрудник</p>
                  <p className="font-bold text-slate-800 text-lg mb-4">{coupon.userName}</p>
                  <p className="text-xs text-slate-400 mb-2">Товар</p>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 mb-4 flex items-center gap-3">
                    <span className="text-xl">{ticket.item?.icon || '🎁'}</span>
                    <span className="flex-1 font-semibold text-slate-800">{ticket.item?.name}</span>
                    <span className="text-emerald-600 font-bold">{ticket.item?.cost} 🪙</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-300 px-4 py-3 text-center mb-2">
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest">Код купона</p>
                    <p className="text-xl font-extrabold text-emerald-700 tracking-widest">{ticket.couponCode}</p>
                  </div>
                  <p className="text-xs text-slate-400 text-center mb-1">
                    {new Date(ticket.issuedAt || coupon.issuedAt).toLocaleString('ru-RU')}
                  </p>
                  {ticket.count > 1 && (
                    <p className="text-xs text-slate-500 text-center">Купон {ticket.index} из {ticket.count}</p>
                  )}
                </div>
                <div className="px-8 py-0 flex items-center gap-2 -my-1 relative z-10">
                  <div className="w-5 h-5 bg-slate-200 rounded-full -ml-11 flex-shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-300" />
                  <div className="w-5 h-5 bg-slate-200 rounded-full -mr-11 flex-shrink-0" />
                </div>
                <div className="bg-emerald-50 px-8 py-4 text-center">
                  <p className="text-emerald-800 text-sm font-semibold">📍 Покажите этот купон администратору</p>
                  <p className="text-emerald-600 text-xs mt-1">чтобы получить ваш товар</p>
                </div>
              </div>
            ))}
          </div>
          <div className="no-print flex gap-3 mt-4">
            <button onClick={() => setCoupon(null)}
              className="flex-1 rounded-2xl bg-white/90 text-slate-700 py-3 font-semibold hover:bg-white transition shadow">
              Закрыть
            </button>
            <button onClick={() => window.print()}
              className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white py-3 font-semibold transition shadow flex items-center justify-center gap-2">
              🖨️ Распечатать
            </button>
          </div>
        </div>
      </div>
    )}
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
    </>
  );
}
