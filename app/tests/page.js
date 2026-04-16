'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [message, setMessage] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newTraining, setNewTraining] = useState({ title: '', description: '', date: '', time: '', location: '', maxParticipants: 20, department: '', trainer: '', registrationDeadline: '' });
  const [createMsg, setCreateMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTrainings = () =>
    fetch('/api/offline-trainings').then(r => r.json()).then(d => setTrainings(Array.isArray(d) ? d : [])).catch(() => {});

  useEffect(() => {
    loadTrainings();
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(u);
      if (u.role === 'admin') setIsAdmin(true);
    } catch {}
  }, []);

  const isSignedUp = (training) => {
    if (!currentUser?.phone) return false;
    return training.signups?.some(s => s.phone === currentUser.phone);
  };

  const spotsLeft = (training) => (training.maxParticipants || 20) - (training.signups?.length || 0);

  const handleSignup = async (trainingId) => {
    if (!currentUser?.phone) { setMessage('Войдите в систему, чтобы записаться'); setTimeout(() => setMessage(''), 4000); return; }
    const res = await fetch('/api/offline-trainings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: trainingId, action: 'signup', phone: currentUser.phone, name: currentUser.name || currentUser.fullName || '', department: currentUser.department || '' }),
    });
    const data = await res.json();
    if (res.ok) { setMessage('Вы записаны на тренинг!'); loadTrainings(); setTimeout(() => setMessage(''), 4000); }
    else { setMessage(data.error || 'Ошибка записи'); setTimeout(() => setMessage(''), 4000); }
  };

  const handleUnsignup = async (trainingId) => {
    if (!currentUser?.phone) return;
    const res = await fetch('/api/offline-trainings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: trainingId, action: 'unsignup', phone: currentUser.phone }),
    });
    if (res.ok) { setMessage('Вы отменили запись.'); loadTrainings(); setTimeout(() => setMessage(''), 4000); }
  };

  const handleDelete = (id) => {
    setConfirmModal({ message: 'Удалить этот тренинг?', onConfirm: async () => {
      setConfirmModal(null);
      await fetch(`/api/offline-trainings?id=${id}`, { method: 'DELETE' });
      loadTrainings();
    }});
  };

  const handleCreate = async () => {
    if (!newTraining.title || !newTraining.date || !newTraining.time || !newTraining.location) {
      setCreateMsg('Заполните название, дату, время и место'); return;
    }
    setSaving(true);
    const res = await fetch('/api/offline-trainings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTraining) });
    if (res.ok) {
      setCreateMsg('Тренинг добавлен!');
      setNewTraining({ title: '', description: '', date: '', time: '', location: '', maxParticipants: 20, department: '' });
      setShowCreate(false);
      loadTrainings();
    } else { const d = await res.json(); setCreateMsg(d.error || 'Ошибка'); }
    setSaving(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return dateStr; }
  };

  const getTrainingDateTime = (t) => {
    if (!t.date) return null;
    if (t.time) return new Date(`${t.date}T${t.time}`);
    return new Date(`${t.date}T23:59:59`);
  };

  const isPast = (t) => {
    const dt = getTrainingDateTime(t);
    if (!dt) return false;
    return dt < new Date();
  };

  const isRegistrationClosed = (t) => {
    if (t.registrationDeadline) return new Date(t.registrationDeadline) < new Date();
    // default: closes at training start time
    const dt = getTrainingDateTime(t);
    return dt ? dt < new Date() : false;
  };

  const renderTraining = (t) => {
    const tid = String(t._id || t.id);
    const signed = isSignedUp(t);
    const left = spotsLeft(t);
    const past = isPast(t);
    const regClosed = isRegistrationClosed(t);
    const full = left <= 0 && !signed;
    return (
      <div key={tid} className={`rounded-[24px] bg-white/95 p-6 shadow-lg border-l-4 ${past ? 'border-slate-300' : signed ? 'border-emerald-400' : 'border-sky-400'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
              {past && <span className="rounded-full bg-slate-100 text-slate-500 text-xs px-2 py-0.5 font-semibold">Прошедший</span>}
              {signed && !past && <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 font-semibold">✓ Вы записаны</span>}
              {t.department && <span className="rounded-full bg-sky-100 text-sky-700 text-xs px-2 py-0.5">{t.department}</span>}
            </div>
            {t.description && <p className="text-slate-600 text-sm mb-3">{t.description}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">📅 {formatDate(t.date)}</span>
              <span className="flex items-center gap-1.5">🕐 {t.time}</span>
              <span className="flex items-center gap-1.5">📍 {t.location}</span>
              {t.trainer && <span className="flex items-center gap-1.5">👤 {t.trainer}</span>}
              <span className={`flex items-center gap-1.5 font-semibold ${left <= 0 ? 'text-red-500' : left <= 3 ? 'text-orange-500' : 'text-emerald-600'}`}>
                👥 Мест: {left <= 0 ? 'нет' : left} / {t.maxParticipants}
              </span>
              {t.registrationDeadline && !past && (
                <span className={`flex items-center gap-1.5 ${regClosed ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                  ⏳ Запись до: {new Date(t.registrationDeadline).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => handleDelete(tid)} className="shrink-0 rounded-2xl bg-red-100 text-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-200 transition">🗑</button>
          )}
        </div>

        {isAdmin && t.signups?.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-800">Список записавшихся ({t.signups.length})</summary>
            <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">#</th>
                    <th className="px-4 py-2 text-left font-semibold">Имя</th>
                    <th className="px-4 py-2 text-left font-semibold">Телефон</th>
                    <th className="px-4 py-2 text-left font-semibold">Отдел</th>
                    <th className="px-4 py-2 text-left font-semibold">Дата записи</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {t.signups.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">{s.name || '—'}</td>
                      <td className="px-4 py-2 text-slate-700">{s.phone}</td>
                      <td className="px-4 py-2 text-slate-500">{s.department || '—'}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{s.signedAt ? new Date(s.signedAt).toLocaleDateString('ru-RU') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        {!past && (
          <div className="mt-4">
            {regClosed && !signed ? (
              <span className="inline-block rounded-2xl bg-slate-100 text-slate-400 px-5 py-2.5 text-sm font-semibold">Запись закрыта</span>
            ) : signed ? (
              <button onClick={() => handleUnsignup(tid)}
                className="rounded-2xl bg-red-100 text-red-600 px-5 py-2.5 font-semibold text-sm hover:bg-red-200 transition">
                Отменить запись
              </button>
            ) : (
              <button onClick={() => handleSignup(tid)} disabled={full}
                className={`rounded-2xl px-5 py-2.5 font-semibold text-sm transition ${full ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700'}`}>
                {full ? 'Мест нет' : 'Записаться'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-sky-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Тренинги</span>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Тренинги</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 text-lg">Запишитесь на офлайн-тренинги и корпоративные мероприятия.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-16">
        {isAdmin && (
          <div className="mb-6">
            <button onClick={() => { setShowCreate(!showCreate); setCreateMsg(''); }}
              className="rounded-full bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 font-semibold transition shadow-lg">
              {showCreate ? '✕ Отмена' : '+ Добавить тренинг'}
            </button>
            {showCreate && (
              <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Новый тренинг</h2>
                <div className="space-y-4">
                  <input value={newTraining.title} onChange={e => setNewTraining(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Название *" />
                  <textarea value={newTraining.description} onChange={e => setNewTraining(p => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 min-h-[80px]" placeholder="Описание" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Дата *</label>
                      <input type="date" value={newTraining.date} onChange={e => setNewTraining(p => ({ ...p, date: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Время *</label>
                      <input type="time" value={newTraining.time} onChange={e => setNewTraining(p => ({ ...p, time: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" />
                    </div>
                  </div>
                  <input value={newTraining.location} onChange={e => setNewTraining(p => ({ ...p, location: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Место проведения *" />
                  <input value={newTraining.trainer} onChange={e => setNewTraining(p => ({ ...p, trainer: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Ведущий (имя, должность)" />
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Запись открыта до</label>
                    <input type="datetime-local" value={newTraining.registrationDeadline} onChange={e => setNewTraining(p => ({ ...p, registrationDeadline: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Макс. участников</label>
                      <input type="number" min="1" value={newTraining.maxParticipants} onChange={e => setNewTraining(p => ({ ...p, maxParticipants: Number(e.target.value) }))}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Отдел (необязательно)</label>
                      <select value={newTraining.department} onChange={e => setNewTraining(p => ({ ...p, department: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900">
                        <option value="">Все отделы</option>
                        <option value="Аквапарк">Аквапарк</option>
                        <option value="Ресторан">Ресторан</option>
                        <option value="SPA">SPA</option>
                        <option value="Магазин">Магазин</option>
                        <option value="Офис">Офис</option>
                      </select>
                    </div>
                  </div>
                  {createMsg && <p className="text-sm text-red-600">{createMsg}</p>}
                  <button onClick={handleCreate} disabled={saving}
                    className="w-full rounded-2xl bg-sky-600 text-white py-3 font-semibold hover:bg-sky-700 transition disabled:opacity-50">
                    {saving ? 'Сохранение...' : 'Создать тренинг'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {message && <div className="mb-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 px-4 py-3 text-sm">{message}</div>}

        {(() => {
          const upcoming = trainings.filter(t => !isPast(t));
          const past = trainings.filter(t => isPast(t));
          return (
            <>
              {upcoming.length === 0 && past.length === 0 ? (
                <div className="rounded-[24px] bg-white/95 p-10 text-center text-slate-500 shadow">
                  {isAdmin ? 'Нет тренингов. Добавьте первый кнопкой выше.' : 'Ближайших тренингов нет.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((t) => renderTraining(t))}
                </div>
              )}

              {past.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-slate-300" />
                    <span className="text-slate-500 font-semibold text-sm uppercase tracking-widest">Прошедшие тренинги</span>
                    <div className="flex-1 h-px bg-slate-300" />
                  </div>
                  <div className="space-y-4">
                    {past.map((t) => renderTraining(t))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}
