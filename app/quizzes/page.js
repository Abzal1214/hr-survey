"use client";
import { useState, useEffect } from 'react';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editQuiz, setEditQuiz] = useState(null);
  const [editMsg, setEditMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(u);
      setIsAdmin(u.role === 'admin');
      loadQuizzes(u.role === 'admin');
    } catch { loadQuizzes(false); }
  }, []);

  const loadQuizzes = (admin = false) => {
    fetch(`/api/quizzes${admin ? '?admin=1' : ''}`)
      .then(r => r.json())
      .then(d => setQuizzes(Array.isArray(d) ? d : []))
      .catch(() => setQuizzes([]));
  };

  const handleEdit = (quiz) => {
    setEditQuiz({ ...quiz });
    setEditMsg('');
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/quizzes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editQuiz.id, attemptsPerDay: Number(editQuiz.attemptsPerDay), isActive: !!editQuiz.isActive })
    });
    const data = await res.json();
    if (res.ok) {
      setEditQuiz(null);
      loadQuizzes(true);
    } else {
      setEditMsg(data.error || 'Ошибка сохранения');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Тесты / Квизы</h1>
      {isAdmin && (
        <div className="mb-8 text-sm text-slate-600">Только активные тесты доступны сотрудникам. Можно задать лимит попыток в день.</div>
      )}
      <div className="space-y-6">
        {quizzes.map(q => (
          <div key={q.id} className="rounded-2xl bg-white shadow p-5 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="font-bold text-lg">{q.title}</div>
                <div className="text-slate-500 text-sm">{q.description}</div>
              </div>
              {isAdmin && (
                <button onClick={() => handleEdit(q)} className="rounded bg-sky-100 text-sky-700 px-3 py-1 text-sm font-semibold hover:bg-sky-200">Редактировать</button>
              )}
              {!isAdmin && !q.isActive && (
                <span className="text-xs text-red-500 font-semibold ml-2">Неактивен</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm mt-2">
              <span>Попыток в день: <b>{q.attemptsPerDay || 1}</b></span>
              <span className={q.isActive ? 'text-emerald-600' : 'text-red-500'}>
                {q.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </div>
          </div>
        ))}
      </div>
      {isAdmin && editQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button onClick={() => setEditQuiz(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold">✕</button>
            <h2 className="text-xl font-bold mb-4">Редактировать тест</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Попыток в день</label>
                <input type="number" min="1" value={editQuiz.attemptsPerDay || 1} onChange={e => setEditQuiz(p => ({ ...p, attemptsPerDay: e.target.value }))} className="w-full rounded border p-2" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={!!editQuiz.isActive} onChange={e => setEditQuiz(p => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="isActive" className="text-sm">Тест активен</label>
              </div>
              {editMsg && <div className="text-red-500 text-sm">{editMsg}</div>}
              <button onClick={handleSave} disabled={saving} className="w-full rounded bg-sky-600 text-white py-2 font-semibold hover:bg-sky-700 transition disabled:opacity-50">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
