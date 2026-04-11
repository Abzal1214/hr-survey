'use client';

import { useEffect, useState } from 'react';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  const loadNews = () => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => setNews(Array.isArray(data) ? data : []))
      .catch(() => setNews([]));
  };

  useEffect(() => {
    loadNews();
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.role === 'admin') setIsAdmin(true);
    } catch {}
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Удалить эту новость?')) return;
    await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
    loadNews();
  };

  const handleAddNews = async () => {
    if (!newsForm.title || !newsForm.description) { setCreateMsg('Заполните заголовок и описание'); return; }
    setSaving(true);
    let imageUrl = '';
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('files', imageFile);
        const uploadRes = await fetch('/api/files', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          imageUrl = uploadData.fileUrls?.[0] || '';
        } else {
          setCreateMsg(uploadData.error || 'Ошибка загрузки изображения');
          setSaving(false);
          return;
        }
      }
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newsForm, imageUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateMsg('Новость добавлена!');
        setNewsForm({ title: '', description: '' });
        setImageFile(null);
        setShowCreate(false);
        loadNews();
      } else {
        setCreateMsg(data.error || 'Ошибка');
      }
    } catch { setCreateMsg('Ошибка сети'); }
    setSaving(false);
  };

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
        {/* Static promo blocks */}
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

        {/* Admin add button */}
        {isAdmin && (
          <div>
            <button
              onClick={() => { setShowCreate(!showCreate); setCreateMsg(''); }}
              className="rounded-full bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 font-semibold transition shadow-lg"
            >
              {showCreate ? '✕ Отмена' : '+ Добавить новость'}
            </button>

            {showCreate && (
              <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Новая новость</h2>
                <div className="space-y-4">
                  <input
                    value={newsForm.title}
                    onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                    placeholder="Заголовок *"
                  />
                  <textarea
                    value={newsForm.description}
                    onChange={e => setNewsForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 min-h-[100px]"
                    placeholder="Описание *"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Картинка</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setImageFile(e.target.files?.[0] || null)}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                    />
                    {imageFile && <p className="text-sm text-slate-600 mt-2">Выбрана: {imageFile.name}</p>}
                  </div>
                  {createMsg && <p className="text-sm text-red-600">{createMsg}</p>}
                  <button
                    onClick={handleAddNews}
                    disabled={saving}
                    className="w-full rounded-2xl bg-sky-600 text-white py-3 font-semibold hover:bg-sky-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Сохранение...' : 'Опубликовать'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live news feed */}
        <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Лента новостей</p>
            <h2 className="text-2xl font-bold text-slate-900">Последние публикации</h2>
          </div>
          {news.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-slate-500 text-center">
              {isAdmin ? 'Новостей пока нет. Добавьте первую кнопкой выше.' : 'Новостей пока нет.'}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {news.map((item) => {
                const itemId = String(item._id || item.id);
                return (
                  <article key={itemId} className="rounded-[20px] border-l-4 border-sky-400 bg-sky-50 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs uppercase tracking-widest text-sky-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}
                      </p>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(itemId)}
                          className="rounded-lg bg-red-100 text-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-200 transition shrink-0"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-2xl mb-3" />
                    )}
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
