
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

  return (
    <div className="min-h-screen">
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-sky-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Команда</span>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">🧑‍🏫 Наставники</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 text-lg">Опытные сотрудники, готовые помочь</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-2 py-6">
        <div className="flex gap-2 flex-wrap mb-6 justify-center">
          {DEPARTMENTS.map(d => (
            <button key={d} onClick={() => setFilter(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${filter === d ? 'bg-sky-500 text-white shadow' : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-sky-50'}`}>
              {d}
            </button>
          ))}
        </div>
        {mentors.length === 0 ? (
          <div className="rounded-xl bg-white/70 p-8 text-center text-slate-500 shadow">Наставников пока нет.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.filter(m => filter === 'Все отделы' || m.department === filter).map(mentor => (
              <div key={mentor._id} className="relative group bg-white/80 rounded-xl p-4 shadow border border-sky-100 flex flex-col items-center">
                {mentor.photoUrl
                  ? <img src={mentor.photoUrl} alt={mentor.name} className="w-20 h-20 rounded-full object-cover border-2 border-sky-300 mb-3" />
                  : <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center text-3xl font-bold text-sky-600 mb-3">👤</div>}
                <span className="font-bold text-slate-900 leading-tight text-lg mb-1">{mentor.name}</span>
                {mentor.position && <span className="text-sky-600 text-xs font-medium leading-tight mb-1">{mentor.position}</span>}
                {mentor.department && <span className="text-xs text-slate-400 mb-1">{mentor.department}</span>}
                {mentor.phone && <span className="text-xs text-slate-500 flex items-center gap-1 mb-1"><span className='text-rose-500'>📞</span>{mentor.phone}</span>}
                {mentor.email && <a href={`mailto:${mentor.email}`} className="text-sm text-slate-600 hover:text-sky-600 transition truncate mb-1">✉️ {mentor.email}</a>}
                <button className="mt-2 text-sky-500 hover:underline text-xs" onClick={() => setSelectedMentor(mentor)}>Подробнее</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMentor(null)}>
          <div className="relative w-full max-w-lg rounded-[32px] bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {selectedMentor.photoUrl
              ? <img src={selectedMentor.photoUrl} alt={selectedMentor.name} className="w-full h-64 object-cover" />
              : <div className="w-full h-48 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-8xl">👤</div>}
            <div className="p-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{selectedMentor.name}</h2>
              {selectedMentor.position && <div className="text-sky-600 text-sm font-medium mb-1">{selectedMentor.position}</div>}
              {selectedMentor.department && <div className="text-xs text-slate-400 mb-2">{selectedMentor.department}</div>}
              {selectedMentor.bio && <div className="text-slate-700 text-sm mb-4">{selectedMentor.bio}</div>}
              {selectedMentor.phone && <a href={`tel:${selectedMentor.phone}`} className="block text-slate-600 hover:text-emerald-600 text-sm mb-1">📞 {selectedMentor.phone}</a>}
              {selectedMentor.email && <a href={`mailto:${selectedMentor.email}`} className="block text-slate-600 hover:text-sky-600 text-sm">✉️ {selectedMentor.email}</a>}
            </div>
            <button onClick={() => setSelectedMentor(null)} className="absolute top-4 right-4 text-2xl text-slate-400 hover:text-slate-700">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
