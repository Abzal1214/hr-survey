'use client';

import { useEffect, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import KebabMenu from '../components/KebabMenu';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [editingHighlightId, setEditingHighlightId] = useState(null);
  const [highlightForm, setHighlightForm] = useState({ badge: '', title: '', description: '', itemsText: '' });
  const [highlightMsg, setHighlightMsg] = useState('');

  const themeClasses = {
    sky: {
      article: 'bg-sky-500',
      text: 'text-sky-100',
    },
    emerald: {
      article: 'bg-emerald-500',
      text: 'text-emerald-100',
    },
  };

  const loadNews = () => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => setNews(Array.isArray(data) ? data : []))
      .catch(() => setNews([]));
  };

  const loadHighlights = () => {
    fetch('/api/news-highlights')
      .then((res) => res.json())
      .then((data) => setHighlights(Array.isArray(data) ? data : []))
      .catch(() => setHighlights([]));
  };

  useEffect(() => {
    loadNews();
    loadHighlights();
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.role === 'admin') setIsAdmin(true);
    } catch {}
  }, []);

  const handleDelete = (id) => {
    setConfirmModal({ message: 'Удалить эту новость?', onConfirm: async () => {
      setConfirmModal(null);
      await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
      loadNews();
    }});
  };

  const handleSaveEdit = async (id) => {
    const res = await fetch('/api/news', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (res.ok) { setEditingId(null); loadNews(); }
  };

  const handleSaveHighlight = async (id) => {
    const items = highlightForm.itemsText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!highlightForm.badge || !highlightForm.title || !highlightForm.description || items.length === 0) {
      setHighlightMsg('Заполните все поля карточки');
      return;
    }

    const res = await fetch('/api/news-highlights', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        badge: highlightForm.badge,
        title: highlightForm.title,
        description: highlightForm.description,
        items,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setHighlights(Array.isArray(data.highlights) ? data.highlights : []);
      setEditingHighlightId(null);
      setHighlightMsg('');
    } else {
      setHighlightMsg(data.error || 'Ошибка сохранения');
    }
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
          {highlights.map((block, index) => {
            const theme = themeClasses[block.theme] || themeClasses.sky;
            return (
              <article key={block.id} className={`animate-fade-in-up hover-lift rounded-[24px] ${theme.article} p-8 shadow-xl`}>
                {editingHighlightId === block.id ? (
                  <div className="space-y-3">
                    <input
                      value={highlightForm.badge}
                      onChange={(e) => setHighlightForm((prev) => ({ ...prev, badge: e.target.value }))}
                      className="w-full rounded-xl border border-white/40 bg-white/90 p-3 text-slate-900 text-sm"
                      placeholder="Название бейджа"
                    />
                    <input
                      value={highlightForm.title}
                      onChange={(e) => setHighlightForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-xl border border-white/40 bg-white/90 p-3 text-slate-900 text-sm"
                      placeholder="Заголовок"
                    />
                    <textarea
                      value={highlightForm.description}
                      onChange={(e) => setHighlightForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full rounded-xl border border-white/40 bg-white/90 p-3 text-slate-900 text-sm min-h-[90px]"
                      placeholder="Описание"
                    />
                    <textarea
                      value={highlightForm.itemsText}
                      onChange={(e) => setHighlightForm((prev) => ({ ...prev, itemsText: e.target.value }))}
                      className="w-full rounded-xl border border-white/40 bg-white/90 p-3 text-slate-900 text-sm min-h-[120px]"
                      placeholder="Каждый пункт с новой строки"
                    />
                    {highlightMsg && <p className="text-sm text-red-100">{highlightMsg}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveHighlight(block.id)} className="rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition">Сохранить</button>
                      <button onClick={() => { setEditingHighlightId(null); setHighlightMsg(''); }} className="rounded-xl bg-white/20 text-white px-4 py-2 text-sm font-semibold hover:bg-white/30 transition">Отмена</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">{block.badge}</span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingHighlightId(block.id);
                            setHighlightMsg('');
                            setHighlightForm({
                              badge: block.badge || '',
                              title: block.title || '',
                              description: block.description || '',
                              itemsText: Array.isArray(block.items) ? block.items.join('\n') : '',
                            });
                          }}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                        >
                          ✎
                        </button>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">{block.title}</h2>
                    <p className={`${theme.text} mb-6 text-sm`}>{block.description}</p>
                    <ul className="space-y-3">
                      {(block.items || []).map((item) => (
                        <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 text-white text-sm font-medium">
                          <span className="text-yellow-300 font-bold">→</span>{item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            );
          })}
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
                    {editingId === itemId ? (
                      <div className="space-y-3">
                        <input
                          value={editForm.title}
                          onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm"
                          placeholder="Заголовок"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm min-h-[80px]"
                          placeholder="Описание"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(itemId)} className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-700 transition">Сохранить</button>
                          <button onClick={() => setEditingId(null)} className="rounded-xl bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-300 transition">Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-xs uppercase tracking-widest text-sky-400">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}
                          </p>
                          {isAdmin && (
                            <KebabMenu
                              onEdit={() => { setEditingId(itemId); setEditForm({ title: item.title, description: item.description }); }}
                              onDelete={() => handleDelete(itemId)}
                            />
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-2xl mb-3" />
                        )}
                        <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}
