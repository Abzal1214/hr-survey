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
  const [selectedNews, setSelectedNews] = useState(null);

  const themeClasses = {
    sky: { article: 'bg-sky-500', text: 'text-sky-100' },
    emerald: { article: 'bg-emerald-500', text: 'text-emerald-100' },
  };

  const loadNews = () =>
    fetch('/api/news').then(r => r.json()).then(d => setNews(Array.isArray(d) ? d : [])).catch(() => setNews([]));

  const loadHighlights = () =>
    fetch('/api/news-highlights').then(r => r.json()).then(d => setHighlights(Array.isArray(d) ? d : [])).catch(() => setHighlights([]));

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
    const res = await fetch('/api/news', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...editForm }) });
    if (res.ok) { setEditingId(null); loadNews(); }
  };

  const handleSaveHighlight = async (id) => {
    const items = highlightForm.itemsText.split('\n').map(i => i.trim()).filter(Boolean);
    if (!highlightForm.badge || !highlightForm.title || !highlightForm.description || !items.length) { setHighlightMsg('Заполните все поля'); return; }
    const res = await fetch('/api/news-highlights', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, badge: highlightForm.badge, title: highlightForm.title, description: highlightForm.description, items }) });
    const data = await res.json();
    if (res.ok) { setHighlights(Array.isArray(data.highlights) ? data.highlights : []); setEditingHighlightId(null); setHighlightMsg(''); }
    else setHighlightMsg(data.error || 'Ошибка сохранения');
  };

  const handleAddNews = async () => {
    if (!newsForm.title || !newsForm.description) { setCreateMsg('Заполните заголовок и описание'); return; }
    setSaving(true);
    let imageUrl = '';
    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append('files', imageFile);
        const up = await fetch('/api/files', { method: 'POST', body: fd });
        const ud = await up.json();
        if (up.ok) imageUrl = ud.fileUrls?.[0] || '';
        else { setCreateMsg(ud.error || 'Ошибка загрузки'); setSaving(false); return; }
      }
      const res = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newsForm, imageUrl }) });
      const data = await res.json();
      if (res.ok) { setCreateMsg('Новость добавлена!'); setNewsForm({ title: '', description: '' }); setImageFile(null); setShowCreate(false); loadNews(); }
      else setCreateMsg(data.error || 'Ошибка');
    } catch { setCreateMsg('Ошибка сети'); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-sky-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Новости портала</span>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Hawaii&Miami и SanRemo</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 text-lg">Актуальные обновления для команды, события и всё важное для работы аквапарков.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 space-y-6">
        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {highlights.map((block) => {
              const theme = themeClasses[block.theme] || themeClasses.sky;
              return (
                <article key={block.id} className={`rounded-[24px] ${theme.article} p-8 shadow-xl`}>
                  {editingHighlightId === block.id ? (
                    <div className="space-y-3">
                      <input value={highlightForm.badge} onChange={e => setHighlightForm(p => ({ ...p, badge: e.target.value }))} className="w-full rounded-xl border border-white/40 bg-white/90 p-3 text-slate-900 text-sm" placeholder="Бейдж" />
                      <input value={highlightForm.title} onChange={e => setHighlightForm(p => ({ ...p, title: e.target.value }))} className="w-full rounded-xl border border-white/40 bg-white/90 p-3 text-slate-900 text-sm" placeholder="Заголовок" />
                      <textarea value={highlightForm.description} onChange={e => setHighlightForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-xl border border-white/40 bg-white/90 p-3 text-slate-900 text-sm min-h-[80px]" placeholder="Описание" />
                      <textarea value={highlightForm.itemsText} onChange={e => setHighlightForm(p => ({ ...p, itemsText: e.target.value }))} className="w-full rounded-xl border border-white/40 bg-white/90 p-3 text-slate-900 text-sm min-h-[100px]" placeholder="Каждый пункт с новой строки" />
                      {highlightMsg && <p className="text-sm text-red-100">{highlightMsg}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveHighlight(block.id)} className="rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-bold shadow hover:bg-slate-100 active:scale-95 transition-all cursor-pointer">Сохранить</button>
                        <button onClick={() => { setEditingHighlightId(null); setHighlightMsg(''); }} className="rounded-xl bg-white/20 text-white px-4 py-2 text-sm font-semibold hover:bg-white/30 active:scale-95 transition-all cursor-pointer">Отмена</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">{block.badge}</span>
                        {isAdmin && <button onClick={() => { setEditingHighlightId(block.id); setHighlightMsg(''); setHighlightForm({ badge: block.badge || '', title: block.title || '', description: block.description || '', itemsText: Array.isArray(block.items) ? block.items.join('\n') : '' }); }} className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition">✎</button>}
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3">{block.title}</h2>
                      <p className={`${theme.text} mb-6 text-sm`}>{block.description}</p>
                      <ul className="space-y-3">
                        {(block.items || []).map(item => (
                          <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 text-white text-sm font-medium"><span className="text-yellow-300 font-bold">→</span>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Admin add */}
        {isAdmin && (
          <div>
            <button onClick={() => { setShowCreate(!showCreate); setCreateMsg(''); }} className="rounded-full bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 font-semibold transition shadow-lg">
              {showCreate ? '✕ Отмена' : '+ Добавить новость'}
            </button>
            {showCreate && (
              <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Новая новость</h2>
                <div className="space-y-4">
                  <input value={newsForm.title} onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Заголовок *" />
                  <textarea value={newsForm.description} onChange={e => setNewsForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 min-h-[100px]" placeholder="Описание *" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Картинка</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" />
                    {imageFile && <p className="text-sm text-slate-600 mt-1">Выбрана: {imageFile.name}</p>}
                  </div>
                  {createMsg && <p className="text-sm text-red-600">{createMsg}</p>}
                  <button onClick={handleAddNews} disabled={saving} className="w-full rounded-2xl bg-sky-600 text-white py-3 font-semibold hover:bg-sky-700 transition disabled:opacity-50">
                    {saving ? 'Сохранение...' : 'Опубликовать'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* News grid */}
        <div>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-1">Лента новостей</p>
            <h2 className="text-2xl font-bold text-white drop-shadow">Последние публикации</h2>
          </div>
          {news.length === 0 ? (
            <div className="rounded-[24px] bg-white/90 p-10 text-center text-slate-500 shadow">
              {isAdmin ? 'Новостей пока нет. Добавьте первую кнопкой выше.' : 'Новостей пока нет.'}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => {
                const itemId = String(item._id || item.id);
                return (
                  <article key={itemId} className="group relative rounded-[20px] bg-white/95 shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer" onClick={() => !editingId && setSelectedNews(item)}>
                    {editingId === itemId ? (
                      <div className="p-5 space-y-3" onClick={e => e.stopPropagation()}>
                        <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm" placeholder="Заголовок" />
                        <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm min-h-[80px]" placeholder="Описание" />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(itemId)} className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-700 active:scale-95 transition-all cursor-pointer">Сохранить</button>
                          <button onClick={() => setEditingId(null)} className="rounded-xl bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-300 active:scale-95 transition-all cursor-pointer">Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item.imageUrl
                          ? <div className="relative h-48 overflow-hidden"><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                          : <div className="h-3 bg-gradient-to-r from-sky-400 to-blue-500" />
                        }
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : ''}
                            </p>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug mb-2 line-clamp-2">{item.title}</h3>
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{item.description}</p>
                          <span className="mt-4 inline-block text-xs font-semibold text-sky-600 group-hover:text-sky-700 transition">Читать далее →</span>
                        </div>
                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setEditingId(itemId); setEditForm({ title: item.title, description: item.description }); }} className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 text-xs font-bold flex items-center justify-center shadow transition">✎</button>
                            <button onClick={() => handleDelete(itemId)} className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow transition">✕</button>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* News modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            {selectedNews.imageUrl && (
              <div className="w-full flex justify-center items-center bg-white rounded-t-[32px] p-4" style={{minHeight: 200}}>
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="max-w-full max-h-[50vh] object-contain"
                  style={{ display: 'block', margin: '0 auto' }}
                />
              </div>
            )}
            <div className="p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-500 mb-3">
                {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 leading-tight">{selectedNews.title}</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedNews.description}</p>
            </div>
            <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white font-bold text-xl flex items-center justify-center transition">✕</button>
          </div>
        </div>
      )}

      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}
