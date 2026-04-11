'use client';

import { useState, useEffect } from 'react';

const inputCls = "w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 transition";
const labelCls = "block space-y-2";
const spanCls = "text-sm font-semibold text-slate-700";

const ratingOptions = [
  { value: '5', label: '⭐⭐⭐⭐⭐ Отлично' },
  { value: '4', label: '⭐⭐⭐⭐ Хорошо' },
  { value: '3', label: '⭐⭐⭐ Средне' },
  { value: '2', label: '⭐⭐ Плохо' },
  { value: '1', label: '⭐ Очень плохо' },
];

const yesNo = [
  { value: 'да', label: '✅ Да' },
  { value: 'частично', label: '🟡 Частично' },
  { value: 'нет', label: '❌ Нет' },
];

let labelMap = {
  overall: 'Общая оценка',
  duties_clear: 'Понятны обязанности',
  support_received: 'Получили поддержку',
  team_comfortable: 'Комфорт в коллективе',
  training_helpful: 'Обучение полезно',
  continue: 'Планирует остаться',
  difficulties: 'Трудности',
  suggestions: 'Предложения',
};

export default function SurveysPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const [formData, setFormData] = useState({
    name: '', phone: '', position: '', department: '',
    overall: '', duties_clear: '', support_received: '', team_comfortable: '',
    training_helpful: '', difficulties: '', suggestions: '', continue: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser'));
      if (u?.role === 'admin') {
        setIsAdmin(true);
        setLoadingAdmin(true);
        fetch('/api/admin')
          .then(r => r.json())
          .then(data => setSurveys(Array.isArray(data) ? data : []))
          .catch(() => setSurveys([]))
          .finally(() => setLoadingAdmin(false));
      } else if (u) {
        setFormData(prev => ({
          ...prev,
          name: u.name || '',
          phone: u.phone || '',
          position: u.position || '',
          department: u.department || u.workplaceType || '',
        }));
      }
    } catch {}
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, surveyType: 'intern_3days', timestamp: new Date().toISOString() })
      });
      if (response.ok) setSubmitted(true);
      else alert('Ошибка при отправке');
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить эту анкету?')) return;
    await fetch(`/api/admin?id=${id}`, { method: 'DELETE' });
    setSurveys(prev => prev.filter(s => String(s._id || s.id) !== String(id)));
  };

  return (
    <div className="min-h-screen">
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="animate-fade-in inline-block rounded-full bg-violet-500/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Стажировка</span>
          <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold text-white drop-shadow-lg">
            {isAdmin ? 'Ответы на анкеты' : 'Анкета стажёра'}
          </h1>
          <p className="animate-fade-in-up delay-300 mt-4 max-w-xl mx-auto text-white/80 text-lg">
            {isAdmin ? 'Все полученные анкеты от сотрудников.' : 'Вы прошли первые 3 дня в команде Hawaii\u0026Miami · SanRemo.\nРасскажите, как всё прошло.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16">
        {isAdmin ? (
          <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-violet-500 flex items-center justify-center text-xl">📋</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Ответы</p>
                <h2 className="text-2xl font-bold text-slate-900">Анкеты сотрудников</h2>
              </div>
            </div>
            {loadingAdmin ? (
              <p className="text-slate-500 text-center py-8">Загрузка...</p>
            ) : surveys.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-slate-500 text-center">
                Анкет пока нет.
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.map((item) => {
                  const itemId = String(item._id || item.id);
                  return (
                    <div key={itemId} className="rounded-[20px] border-l-4 border-violet-400 bg-violet-50 p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                          <p className="text-sm text-slate-500">{item.phone} · {item.position} · {item.department}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {item.timestamp ? new Date(item.timestamp).toLocaleDateString('ru-RU') : ''}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(itemId)}
                          className="rounded-lg bg-red-100 text-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-200 transition shrink-0">
                          Удалить
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(labelMap).map(([key, label]) => item[key] ? (
                          <div key={key} className="rounded-xl bg-white border border-slate-100 px-3 py-2">
                            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                            <p className="text-sm font-medium text-slate-800">{item[key]}</p>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
            {submitted ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Спасибо за честный ответ!</h2>
                <p className="text-slate-600">Ваша анкета отправлена. Мы станем лучше вместе.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">👤 О вас</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelCls}>
                      <span className={spanCls}>Имя</span>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputCls} placeholder="Ваше имя" />
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Телефон</span>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={inputCls} placeholder="+7 (999) 123-45-67" />
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Должность</span>
                      <input type="text" name="position" value={formData.position} onChange={handleChange} required className={inputCls} placeholder="Официант, кассир..." />
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Отдел / место</span>
                      <input type="text" name="department" value={formData.department} onChange={handleChange} required className={inputCls} placeholder="Ресторан, Аквапарк..." />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">📊 Оценка первых дней</p>
                  <div className="space-y-5">
                    <label className={labelCls}>
                      <span className={spanCls}>Как в целом прошли первые 3 дня?</span>
                      <select name="overall" value={formData.overall} onChange={handleChange} required className={inputCls}>
                        <option value="">Выберите оценку</option>
                        {ratingOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Вам понятны ваши обязанности и задачи?</span>
                      <select name="duties_clear" value={formData.duties_clear} onChange={handleChange} required className={inputCls}>
                        <option value="">Выберите ответ</option>
                        {yesNo.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Коллеги и наставник помогали вам?</span>
                      <select name="support_received" value={formData.support_received} onChange={handleChange} required className={inputCls}>
                        <option value="">Выберите ответ</option>
                        {yesNo.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Вам комфортно в коллективе?</span>
                      <select name="team_comfortable" value={formData.team_comfortable} onChange={handleChange} required className={inputCls}>
                        <option value="">Выберите ответ</option>
                        {yesNo.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Обучение и инструктаж были полезны?</span>
                      <select name="training_helpful" value={formData.training_helpful} onChange={handleChange} required className={inputCls}>
                        <option value="">Выберите ответ</option>
                        {yesNo.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Планируете ли продолжить работу у нас?</span>
                      <select name="continue" value={formData.continue} onChange={handleChange} required className={inputCls}>
                        <option value="">Выберите ответ</option>
                        <option value="да">✅ Да, планирую остаться</option>
                        <option value="возможно">🤔 Пока не уверен(-а)</option>
                        <option value="нет">❌ Нет</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">💬 Свободные ответы</p>
                  <div className="space-y-4">
                    <label className={labelCls}>
                      <span className={spanCls}>С какими трудностями вы столкнулись?</span>
                      <textarea name="difficulties" value={formData.difficulties} onChange={handleChange} rows="3" className={inputCls} placeholder="Опишите любые сложности..." />
                    </label>
                    <label className={labelCls}>
                      <span className={spanCls}>Что бы вы предложили улучшить?</span>
                      <textarea name="suggestions" value={formData.suggestions} onChange={handleChange} rows="3" className={inputCls} placeholder="Ваши идеи и пожелания..." />
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white py-4 text-lg font-bold transition shadow-lg">
                  Отправить анкету
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
