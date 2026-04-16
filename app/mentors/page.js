'use client';
import { useEffect, useState } from 'react';
import KebabMenu from '../components/KebabMenu';

const DEPARTMENTS = ['Все отделы', 'Аквапарк', 'Ресторан', 'SPA', 'Магазин', 'Офис'];

const emptyForm = { name: '', position: '', department: '', phone: '', email: '', bio: '', photoUrl: '' };

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('Все отделы');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    fetch('/api/mentors').then(r => r.json()).then(setMentors).catch(() => setMentors([]));
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setIsAdmin(u.role === 'admin');
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return form.photoUrl;
    const fd = new FormData();
    fd.append('file', imageFile);
    const res = await fetch('/api/files', { method: 'POST', body: fd });
    const data = await res.json();
    return data.url || '';
  };

  const handleSave = async () => {
    setSaving(true);
    const photoUrl = await uploadImage();
    const payload = { ...form, photoUrl };
    if (editingId) {
      await fetch('/api/mentors', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: editingId, ...payload }) });
    } else {
      await fetch('/api/mentors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    const updated = await fetch('/api/mentors').then(r => r.json());
    setMentors(updated);
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview('');
    setSaving(false);
  };

  const handleEdit = (mentor) => {
    setForm({ name: mentor.name || '', position: mentor.position || '', department: mentor.department || '', phone: mentor.phone || '', email: mentor.email || '', bio: mentor.bio || '', photoUrl: mentor.photoUrl || '' });
    setEditingId(mentor._id);
    setImagePreview(mentor.photoUrl || '');
    setShowForm(true);
    setSelectedMentor(null);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/mentors?id=${id}`, { method: 'DELETE' });
    setMentors(m => m.filter(x => x._id !== id));
    if (selectedMentor?._id === id) setSelectedMentor(null);
  };

  const filtered = filter === 'Все отделы' ? mentors : mentors.filter(m => m.department === filter);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow">🧑‍🏫 Наставники</h1>
            <p className="text-sky-100 mt-1 text-sm">Опытные сотрудники, готовые помочь</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setShowForm(true); setForm(emptyForm); setEditingId(null); setImagePreview(''); }}
              className="rounded-full bg-white/20 border border-white/40 px-5 py-2 text-sm font-semibold text-white hover:bg-white/30 transition backdrop-blur-sm">
              + Добавить наставника
            </button>
          )}
        </div>

        {/* Dept filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {DEPARTMENTS.map(d => (
            <button key={d} onClick={() => setFilter(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${filter === d ? 'bg-white text-sky-600 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              {d}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-[24px] bg-white/80 p-10 text-center text-slate-500 shadow">Наставников пока нет.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(mentor => (
              <div key={mentor._id} className="relative group">
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-10">
                    <KebabMenu
                      onEdit={() => handleEdit(mentor)}
                      onDelete={() => handleDelete(mentor._id)}
                    />
                  </div>
                )}
                <article
                  onClick={() => setSelectedMentor(mentor)}
                  className="cursor-pointer rounded-[24px] bg-white/95 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
                  {mentor.photoUrl
                    ? <div className="h-52 overflow-hidden"><img src={mentor.photoUrl} alt={mentor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                    : <div className="h-52 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-6xl">👤</div>}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{mentor.name}</h3>
                    {mentor.position && <p className="text-sky-600 text-sm font-semibold mt-0.5">{mentor.position}</p>}
                    {mentor.department && (
                      <span className="mt-2 self-start rounded-full bg-sky-50 text-sky-500 text-xs font-semibold px-3 py-0.5">{mentor.department}</span>
                    )}
                    {mentor.bio && <p className="text-slate-500 text-sm mt-3 line-clamp-2 flex-1">{mentor.bio}</p>}
                    <div className="mt-4 flex flex-col gap-1">
                      {mentor.phone && <a href={`tel:${mentor.phone}`} onClick={e => e.stopPropagation()} className="text-sm text-slate-600 hover:text-sky-600 transition">📞 {mentor.phone}</a>}
                      {mentor.email && <a href={`mailto:${mentor.email}`} onClick={e => e.stopPropagation()} className="text-sm text-slate-600 hover:text-sky-600 transition truncate">✉️ {mentor.email}</a>}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal detail */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMentor(null)}>
          <div className="relative w-full max-w-lg rounded-[32px] bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {selectedMentor.photoUrl
              ? <img src={selectedMentor.photoUrl} alt={selectedMentor.name} className="w-full h-64 object-cover" />
              : <div className="w-full h-48 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-8xl">👤</div>}
            <button onClick={() => setSelectedMentor(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition text-lg">✕</button>
            <div className="p-8">
              <h2 className="text-2xl font-extrabold text-slate-900">{selectedMentor.name}</h2>
              {selectedMentor.position && <p className="text-sky-600 font-semibold mt-1">{selectedMentor.position}</p>}
              {selectedMentor.department && <span className="mt-2 inline-block rounded-full bg-sky-50 text-sky-500 text-xs font-semibold px-3 py-0.5">{selectedMentor.department}</span>}
              {selectedMentor.bio && <p className="mt-4 text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedMentor.bio}</p>}
              <div className="mt-5 flex flex-col gap-2">
                {selectedMentor.phone && <a href={`tel:${selectedMentor.phone}`} className="text-slate-700 hover:text-sky-600 transition">📞 {selectedMentor.phone}</a>}
                {selectedMentor.email && <a href={`mailto:${selectedMentor.email}`} className="text-slate-700 hover:text-sky-600 transition">✉️ {selectedMentor.email}</a>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/edit form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="relative w-full max-w-lg rounded-[32px] bg-white shadow-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">{editingId ? 'Редактировать' : 'Добавить наставника'}</h2>

            {/* Photo upload */}
            <div className="mb-5 flex flex-col items-center gap-3">
              {imagePreview
                ? <img src={imagePreview} className="w-28 h-28 rounded-full object-cover shadow" alt="preview" />
                : <div className="w-28 h-28 rounded-full bg-sky-50 flex items-center justify-center text-5xl">👤</div>}
              <label className="cursor-pointer rounded-full bg-sky-50 text-sky-600 text-sm font-semibold px-4 py-1.5 hover:bg-sky-100 transition">
                Загрузить фото
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            {[['Имя', 'name'], ['Должность', 'position'], ['Телефон', 'phone'], ['Email', 'email']].map(([label, key]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                <input type="text" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </div>
            ))}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Отдел</label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300">
                <option value="">— Выберите отдел —</option>
                {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1">О себе</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving || !form.name}
                className="flex-1 rounded-full bg-sky-500 text-white font-bold py-3 hover:bg-sky-600 transition disabled:opacity-50">
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 rounded-full bg-slate-100 text-slate-700 font-bold py-3 hover:bg-slate-200 transition">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
