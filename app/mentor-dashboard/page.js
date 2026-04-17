'use client';
import { useEffect, useState } from 'react';

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [tab, setTab] = useState('progress');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return;
    const u = JSON.parse(stored);
    setUser(u);
    if (u.role !== 'mentor' && u.role !== 'admin') return;
    // Load employees in same department
    fetch('/api/users')
      .then(r => r.json())
      .then(all => setEmployees(all.filter(e => e.department === u.department && e.role === 'employee')))
      .catch(() => {});
    fetch('/api/courses').then(r => r.json()).then(setCourses).catch(() => {});
    fetch('/api/quizzes').then(r => r.json()).then(setQuizzes).catch(() => {});
  }, []);

  const loadEmployee = async (emp) => {
    setSelected(emp);
    setLoading(true);
    setTab('progress');
    const [tr, cp, n, t] = await Promise.all([
      fetch(`/api/tests?phone=${emp.phone}`).then(r => r.json()).catch(() => []),
      fetch(`/api/course-progress?phone=${emp.phone}`).then(r => r.json()).catch(() => []),
      fetch(`/api/mentor-notes?employeePhone=${emp.phone}`).then(r => r.json()).catch(() => []),
      fetch(`/api/mentor-tasks?employeePhone=${emp.phone}`).then(r => r.json()).catch(() => []),
    ]);
    setTestResults(Array.isArray(tr) ? tr : []);
    setCourseProgress(Array.isArray(cp) ? cp : []);
    setNotes(Array.isArray(n) ? n : []);
    setTasks(Array.isArray(t) ? t : []);
    setLoading(false);
  };

  const addNote = async () => {
    if (!newNote.trim() || !selected) return;
    const note = await fetch('/api/mentor-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorPhone: user.phone, employeePhone: selected.phone, text: newNote.trim() }),
    }).then(r => r.json());
    setNotes(n => [note, ...n]);
    setNewNote('');
  };

  const deleteNote = async (id) => {
    await fetch(`/api/mentor-notes?id=${id}`, { method: 'DELETE' });
    setNotes(n => n.filter(x => x._id !== id));
  };

  const addTask = async () => {
    if (!newTask.trim() || !selected) return;
    const task = await fetch('/api/mentor-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorPhone: user.phone, employeePhone: selected.phone, title: newTask.trim() }),
    }).then(r => r.json());
    setTasks(t => [task, ...t]);
    setNewTask('');
  };

  const toggleTask = async (task) => {
    const updated = await fetch('/api/mentor-tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: task._id, completed: !task.completed }),
    }).then(r => r.json());
    setTasks(t => t.map(x => x._id === task._id ? updated : x));
  };

  const deleteTask = async (id) => {
    await fetch(`/api/mentor-tasks?id=${id}`, { method: 'DELETE' });
    setTasks(t => t.filter(x => x._id !== id));
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка...</div>;
  if (user.role !== 'mentor' && user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Доступ только для наставников.</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-14">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-3">Кабинет наставника</span>
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">👨‍🏫 {user.name} {user.surname}</h1>
          <p className="mt-2 text-white/70 text-base">Отдел: <span className="font-semibold text-white">{user.department || '—'}</span></p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 flex-col lg:flex-row">

        {/* Left — employee list */}
        <aside className="lg:w-72 shrink-0">
          <div className="relative mb-4 inline-block">
            <div className="absolute inset-0 rounded bg-white/60 backdrop-blur-sm" />
            <h2 className="relative text-lg font-extrabold text-black drop-shadow px-3 py-1">Сотрудники отдела</h2>
          </div>
          {employees.length === 0 ? (
            <div className="rounded-2xl bg-white/80 p-6 text-center text-slate-400 shadow text-sm">Нет сотрудников в вашем отделе.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {employees.map(emp => (
                <button key={emp._id} onClick={() => loadEmployee(emp)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all shadow-sm ${selected?._id === emp._id ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/90 hover:bg-white text-slate-700'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${selected?._id === emp._id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                    {(emp.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-sm truncate">{emp.name} {emp.surname}</div>
                    <div className={`text-xs truncate ${selected?._id === emp._id ? 'text-white/70' : 'text-slate-400'}`}>{emp.position || emp.phone}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Right — employee detail */}
        <main className="flex-1 min-w-0">
          {!selected ? (
            <div className="rounded-[24px] bg-white/80 p-12 text-center text-slate-400 shadow">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-lg font-semibold">Выберите сотрудника слева</p>
            </div>
          ) : loading ? (
            <div className="rounded-[24px] bg-white/80 p-12 text-center text-slate-400 shadow">Загрузка...</div>
          ) : (
            <div>
              {/* Employee header */}
              <div className="bg-white/95 rounded-[24px] shadow-lg p-6 mb-4 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl font-bold flex items-center justify-center shrink-0">
                  {(selected.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{selected.name} {selected.surname}</h2>
                  <p className="text-slate-500 text-sm">{selected.position || '—'} · {selected.department}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{selected.phone}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-extrabold text-amber-500">{selected.points || 0}</div>
                  <div className="text-xs text-slate-400">AQUA COIN</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[['progress', '📚 Прогресс'], ['notes', '📝 Заметки'], ['tasks', '✅ Задачи']].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === key ? 'bg-emerald-500 text-white shadow' : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Progress tab */}
              {tab === 'progress' && (
                <div className="space-y-4">
                  {/* Test results */}
                  <div className="bg-white/95 rounded-[20px] shadow p-5">
                    <h3 className="font-bold text-slate-700 mb-3">🧪 Результаты тестов</h3>
                    {testResults.length === 0 ? <p className="text-slate-400 text-sm">Тестов не проходил.</p> : (
                      <div className="space-y-2">
                        {testResults.map((r, i) => {
                          const quiz = quizzes.find(q => q._id === r.quizId);
                          const pct = Math.round((r.score / (quiz?.questions?.length || 1)) * 100);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 truncate">{quiz?.title || r.quizId}</p>
                                <p className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleDateString('ru-RU')}</p>
                              </div>
                              <div className={`text-sm font-bold px-3 py-1 rounded-full ${pct >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                {r.score}/{quiz?.questions?.length || '?'} ({pct}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Course progress */}
                  <div className="bg-white/95 rounded-[20px] shadow p-5">
                    <h3 className="font-bold text-slate-700 mb-3">🎓 Прогресс по курсам</h3>
                    {courseProgress.length === 0 ? <p className="text-slate-400 text-sm">Курсов не начинал.</p> : (
                      <div className="space-y-3">
                        {courseProgress.map((cp, i) => {
                          const course = courses.find(c => c._id === cp.courseId);
                          const total = course?.steps?.length || 1;
                          const done = cp.completedSteps?.length || 0;
                          const pct = Math.round((done / total) * 100);
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold text-slate-700 truncate">{course?.title || cp.courseId}</span>
                                <span className="text-slate-500 shrink-0 ml-2">{done}/{total}</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes tab */}
              {tab === 'notes' && (
                <div className="bg-white/95 rounded-[20px] shadow p-5">
                  <h3 className="font-bold text-slate-700 mb-4">📝 Заметки по сотруднику</h3>
                  <div className="flex gap-2 mb-5">
                    <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} placeholder="Написать заметку..."
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
                    <button onClick={addNote} disabled={!newNote.trim()}
                      className="rounded-xl bg-emerald-500 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-600 transition disabled:opacity-40">
                      Добавить
                    </button>
                  </div>
                  {notes.length === 0 ? <p className="text-slate-400 text-sm">Заметок пока нет.</p> : (
                    <div className="space-y-3">
                      {notes.map(note => (
                        <div key={note._id} className="flex gap-3 bg-slate-50 rounded-xl p-4">
                          <p className="text-sm text-slate-700 flex-1 whitespace-pre-wrap">{note.text}</p>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleDateString('ru-RU')}</p>
                            <button onClick={() => deleteNote(note._id)} className="text-xs text-red-400 hover:text-red-600 mt-1">удалить</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tasks tab */}
              {tab === 'tasks' && (
                <div className="bg-white/95 rounded-[20px] shadow p-5">
                  <h3 className="font-bold text-slate-700 mb-4">✅ Задачи для сотрудника</h3>
                  <div className="flex gap-2 mb-5">
                    <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Новая задача..."
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      onKeyDown={e => e.key === 'Enter' && addTask()} />
                    <button onClick={addTask} disabled={!newTask.trim()}
                      className="rounded-xl bg-emerald-500 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-600 transition disabled:opacity-40">
                      Добавить
                    </button>
                  </div>
                  {tasks.length === 0 ? <p className="text-slate-400 text-sm">Задач пока нет.</p> : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div key={task._id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                          <button onClick={() => toggleTask(task)}
                            className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'}`}>
                            {task.completed && <span className="text-xs">✓</span>}
                          </button>
                          <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.title}</span>
                          <button onClick={() => deleteTask(task._id)} className="text-xs text-red-400 hover:text-red-600 shrink-0">удалить</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
