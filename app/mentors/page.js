
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import KebabMenu from '../components/KebabMenu';

const DEPARTMENTS = ['Все отделы', 'Аквапарк', 'Ресторан', 'SPA', 'Магазин', 'Офис'];
const emptyForm = { name: '', position: '', department: '', phone: '', email: '', bio: '', photoUrl: '' };

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('Все отделы');
  const [showAssign, setShowAssign] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState('');
  const [phonePopup, setPhonePopup] = useState('');
  const [myMentors, setMyMentors] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  // Найти всех наставников по department и загрузить задачи для сотрудника
  useEffect(() => {
    if (user && user.role === 'employee' && user.department) {
      const foundMentors = mentors.filter(m => m.department === user.department);
      setMyMentors(foundMentors);
      fetch(`/api/mentor-tasks?employeePhone=${user.phone}`)
        .then(r => r.json())
        .then(setMyTasks)
        .catch(() => setMyTasks([]));
    } else {
      setMyMentors([]);
      setMyTasks([]);
    }
  }, [user, mentors]);

  const copyPhone = (phone) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(''), 2000);
    });
    setPhonePopup('');
  };

  useEffect(() => {
    fetch('/api/mentors').then(r => r.json()).then(setMentors).catch(() => setMentors([]));
    fetch('/api/users').then(r => r.json()).then(all => setEmployees(Array.isArray(all) ? all : [])).catch(() => {});
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setIsAdmin(u.role === 'admin');
    }
  }, []);

  useEffect(() => {
    const open = showForm || showAssign || !!selectedMentor;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm, showAssign, selectedMentor]);

  useEffect(() => {
    if (!phonePopup) return;
    const handler = () => setPhonePopup('');
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [phonePopup]);

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

  const handleAssign = async (emp) => {
    setSaving(true);
    // Create mentor record from employee data
    await fetch('/api/mentors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: [emp.name, emp.surname].filter(Boolean).join(' '),
        position: emp.position || '',
        department: emp.department || '',
        phone: emp.phone || '',
        email: '',
        bio: '',
        photoUrl: emp.photoUrl || '',
      }),
    });
    // Update user role to mentor
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: emp._id, oldPhone: emp.phone, role: 'mentor' }),
    });
    const updated = await fetch('/api/mentors').then(r => r.json());
    setMentors(updated);
    setShowAssign(false);
    setEmpSearch('');
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const photoUrl = await uploadImage();
    const payload = { ...form, photoUrl };
    await fetch('/api/mentors', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: editingId, ...payload }) });
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
    <div className="min-h-screen">


      {/* Мой наставник и задачи для сотрудника */}
      {user?.role === 'employee' && myMentors.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10 mb-10 p-0 rounded-2xl bg-white/95 shadow-xl border border-sky-100 flex flex-col gap-0">
          <div className="px-8 pt-7 pb-2 border-b border-sky-100">
            <div className="font-semibold text-slate-700 mb-2">Задачи от наставника</div>
            {myTasks.length === 0 ? (
              <div className="text-slate-400 text-sm">Нет задач от наставника.</div>
            ) : (
              <ul className="space-y-2">
                {myTasks.map(task => (
                  <li key={task._id} className="rounded-xl bg-sky-100 px-4 py-2 flex items-center gap-2 border border-sky-200">
                    <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-800'}>📝 {task.title}</span>
                    {task.completed && <span className="ml-2 text-xs text-emerald-600">✔ Выполнено</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="px-8 pt-7 pb-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {myMentors.map(m => (
                <div key={m._id} className="flex items-center gap-4 bg-sky-50 rounded-xl px-4 py-3 shadow-sm border border-sky-100">
                  {m.photoUrl
                    ? <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover border-2 border-sky-300" />
                    : <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-xl font-bold text-sky-600">👤</div>}
                  <div className="flex flex-col justify-center">
                    <span className="font-bold text-slate-900 leading-tight">{m.name}</span>
                    {m.position && <span className="text-sky-600 text-xs font-medium leading-tight">{m.position}</span>}
                    {m.phone && <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><span className='text-rose-500'>📞</span>{m.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-sky-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Команда</span>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">🧑‍🏫 Наставники</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 text-lg">Опытные сотрудники, готовые помочь</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {user?.role === 'mentor' && (
              <Link href="/mentor-dashboard"
                className="rounded-full bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition shadow-lg">
                👨‍🏫 Кабинет наставника
              </Link>
            )}
            {isAdmin && (
              <button onClick={() => { setShowAssign(true); setEmpSearch(''); }}
                className="rounded-full bg-white/20 border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition backdrop-blur-sm">
                + Назначить наставника
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header - empty now, button moved to hero */}
        <div className="mb-0" />

        {/* Dept filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {DEPARTMENTS.map(d => (
            <button key={d} onClick={() => setFilter(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${filter === d ? 'bg-sky-500 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-sky-50'}`}>
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
                      {mentor.phone && (
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setPhonePopup(phonePopup === mentor.phone ? '' : mentor.phone)}
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-800 hover:text-emerald-600 transition">
                            <span className="text-emerald-500">📞</span>
                            {mentor.phone}
                          </button>
                          {phonePopup === mentor.phone && (
                        <div className="absolute left-0 bottom-8 z-20 flex gap-2 rounded-2xl bg-white shadow-xl border border-slate-100 px-3 py-2">
                              <button onClick={() => copyPhone(mentor.phone)}
                                className="rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-3 py-1.5 text-xs font-semibold transition">
                                {copiedPhone === mentor.phone ? 'Скопировано' : 'Копировать'}
                              </button>
                              <a href={`tel:${mentor.phone}`}
                                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold transition">
                                Позвонить
                              </a>
                            </div>
                          )}
                        </div>
                      )}
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
              <div className="mt-5 flex flex-col gap-3">
                {selectedMentor.phone && (
                  <div className="relative">
                    <button onClick={() => setPhonePopup(phonePopup === selectedMentor.phone ? '' : selectedMentor.phone)}
                      className="flex items-center gap-2 text-slate-800 font-medium hover:text-emerald-600 transition">
                      <span className="text-emerald-500 text-lg">📞</span>
                      {selectedMentor.phone}
                    </button>
                    {phonePopup === selectedMentor.phone && (
                      <div className="absolute left-0 bottom-10 z-20 flex gap-2 rounded-2xl bg-white shadow-xl border border-slate-100 px-3 py-2">
                        <button onClick={() => copyPhone(selectedMentor.phone)}
                          className="rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-4 py-2 text-sm font-semibold transition">
                          {copiedPhone === selectedMentor.phone ? 'Скопировано' : 'Копировать'}
                        </button>
                        <a href={`tel:${selectedMentor.phone}`}
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold transition">
                          Позвонить
                        </a>
                      </div>
                    )}
                  </div>
                )}
                {selectedMentor.email && <a href={`mailto:${selectedMentor.email}`} className="text-slate-700 hover:text-sky-600 transition">✉️ {selectedMentor.email}</a>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign mentor modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAssign(false)}>
          <div className="relative w-full max-w-md rounded-[32px] bg-white shadow-2xl p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">Назначить наставника</h2>
            <input
              autoFocus
              placeholder="Поиск сотрудника..."
              value={empSearch}
              onChange={e => setEmpSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300 mb-4"
            />
            <div className="overflow-y-auto flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-2">
              {employees
                .filter(e => e.role !== 'mentor' && e.role !== 'admin')
                .filter(e => {
                  const q = empSearch.toLowerCase();
                  return !q || [e.name, e.surname, e.position, e.department, e.phone].join(' ').toLowerCase().includes(q);
                })
                .map(emp => {
                  const alreadyMentor = mentors.some(m => m.phone === emp.phone);
                  return (
                    <button key={emp._id} disabled={alreadyMentor || saving}
                      onClick={() => handleAssign(emp)}
                      className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                        alreadyMentor ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'hover:bg-sky-50 bg-white border border-slate-100'
                      }`}>
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center shrink-0">
                        {(emp.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{emp.name} {emp.surname}</p>
                        <p className="text-xs text-slate-400 truncate">{emp.position || '—'} · {emp.department || '—'}</p>
                      </div>
                      {alreadyMentor && <span className="ml-auto text-xs text-slate-400 shrink-0">уже наставник</span>}
                    </button>
                  );
                })}
            </div>
            <button onClick={() => setShowAssign(false)} className="mt-4 w-full rounded-full bg-slate-100 text-slate-700 font-bold py-3 hover:bg-slate-200 transition">Отмена</button>
          </div>
        </div>
      )}

      {/* Edit form (KebabMenu only) */}
      {showForm && editingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onClick={() => setShowForm(false)}>
          <div className="relative w-full max-w-lg mx-auto my-8 rounded-[32px] bg-white shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Редактировать наставника</h2>

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
              <button onClick={handleSave} disabled={saving}
                className="flex-1 rounded-full bg-sky-500 text-white font-bold py-3 hover:bg-sky-600 transition disabled:opacity-50">
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 rounded-full bg-slate-100 text-slate-700 font-bold py-3 hover:bg-slate-200 transition">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
