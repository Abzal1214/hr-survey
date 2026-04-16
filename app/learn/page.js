'use client';

import { useEffect, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import KebabMenu from '../components/KebabMenu';
import GoldCoin from '../components/GoldCoin';

const emptyQuestion = () => ({ text: '', options: ['', '', '', ''], correct: '' });

export default function LearnPage() {
  const [tab, setTab] = useState('materials');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Материалы
  const [trainings, setTrainings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [newTraining, setNewTraining] = useState({ title: '', description: '' });
  const [trainingFiles, setTrainingFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [message, setMessage] = useState('');

  // Тесты
  const [quizzes, setQuizzes] = useState([]);
  const [userResults, setUserResults] = useState({});
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [quizMessage, setQuizMessage] = useState('');
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', coins: 3, questions: [emptyQuestion()] });
  const [createQuizMsg, setCreateQuizMsg] = useState('');
  const [savingQuiz, setSavingQuiz] = useState(false);

  const loadTrainings = () =>
    fetch('/api/trainings').then(r => r.json()).then(d => setTrainings(Array.isArray(d) ? d : [])).catch(() => {});

  const loadQuizzes = () =>
    fetch('/api/quizzes').then(r => r.json()).then(d => setQuizzes(Array.isArray(d) ? d : [])).catch(() => {});

  const loadUserResults = (phone) => {
    fetch('/api/tests').then(r => r.json()).then(tests => {
      const byQuiz = {};
      tests.filter(t => t.phone === phone).forEach(t => {
        const key = t.quizId || 'legacy';
        if (!byQuiz[key] || t.score > byQuiz[key].score) byQuiz[key] = { passed: t.score >= 70, score: t.score };
      });
      setUserResults(byQuiz);
    }).catch(() => {});
  };

  useEffect(() => {
    loadTrainings();
    loadQuizzes();
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(u);
      if (u.role === 'admin') setIsAdmin(true);
      if (u.phone) loadUserResults(u.phone);
    } catch {}
  }, []);

  const handleDelete = (id) => {
    setConfirmModal({ message: 'Удалить этот материал?', onConfirm: async () => {
      setConfirmModal(null);
      await fetch(`/api/trainings?id=${id}`, { method: 'DELETE' });
      setMessage('Удалено'); loadTrainings(); setTimeout(() => setMessage(''), 3000);
    }});
  };

  const handleSaveEdit = async (id) => {
    await fetch('/api/trainings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...editForm }) });
    setEditingId(null); loadTrainings();
  };

  const handleAddTraining = async () => {
    if (!newTraining.title) { setCreateMsg('Введите название'); return; }
    setSaving(true);
    let attachmentUrls = [];
    if (trainingFiles.length > 0) {
      const fd = new FormData();
      trainingFiles.forEach(f => fd.append('files', f));
      try {
        const r = await fetch('/api/files', { method: 'POST', body: fd });
        const d = await r.json();
        if (r.ok) attachmentUrls = d.fileUrls || [];
      } catch {}
    }
    const res = await fetch('/api/trainings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newTraining, attachments: attachmentUrls }) });
    if (res.ok) { setCreateMsg('Добавлено!'); setNewTraining({ title: '', description: '' }); setTrainingFiles([]); setShowCreate(false); loadTrainings(); }
    else { const d = await res.json(); setCreateMsg(d.error || 'Ошибка'); }
    setSaving(false);
  };

  const handleQuestionChange = (idx, field, value) => setNewQuiz(p => { const qs = [...p.questions]; qs[idx] = { ...qs[idx], [field]: value }; return { ...p, questions: qs }; });
  const handleOptionChange = (qIdx, oIdx, value) => setNewQuiz(p => { const qs = [...p.questions]; const opts = [...qs[qIdx].options]; opts[oIdx] = value; qs[qIdx] = { ...qs[qIdx], options: opts }; return { ...p, questions: qs }; });
  const addQuestion = () => setNewQuiz(p => ({ ...p, questions: [...p.questions, emptyQuestion()] }));
  const removeQuestion = (idx) => setNewQuiz(p => ({ ...p, questions: p.questions.filter((_, i) => i !== idx) }));

  const handleCreateQuiz = async () => {
    if (!newQuiz.title) { setCreateQuizMsg('Введите название теста'); return; }
    const valid = newQuiz.questions.every(q => q.text && q.correct && q.options.every(o => o));
    if (!valid) { setCreateQuizMsg('Заполните все вопросы и отметьте правильные ответы'); return; }
    setSavingQuiz(true);
    const res = await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newQuiz) });
    if (res.ok) { setCreateQuizMsg('Тест создан!'); setNewQuiz({ title: '', description: '', coins: 3, questions: [emptyQuestion()] }); setShowCreateQuiz(false); loadQuizzes(); }
    else { const d = await res.json(); setCreateQuizMsg(d.error || 'Ошибка'); }
    setSavingQuiz(false);
  };

  const handleDeleteQuiz = (id) => {
    setConfirmModal({ message: 'Удалить этот тест?', onConfirm: async () => {
      setConfirmModal(null);
      await fetch(`/api/quizzes?id=${id}`, { method: 'DELETE' }); loadQuizzes();
    }});
  };

  const startQuiz = (quiz) => { setSelectedQuiz(quiz); setAnswers({}); setResult(null); setQuizMessage(''); };
  const handleAnswer = (qIdx, optIdx) => setAnswers(p => ({ ...p, [qIdx]: optIdx }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const questions = selectedQuiz.questions;
    const correct = questions.filter((q, i) => q.options[answers[i]] === q.correct).length;
    const percent = Math.round((correct / questions.length) * 100);
    setResult({ correct, total: questions.length, percent });
    try {
      const res = await fetch('/api/tests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentUser?.phone, quizId: String(selectedQuiz._id || selectedQuiz.id), score: percent, answers, timestamp: new Date().toISOString() }) });
      const data = await res.json();
      if (percent >= 70) {
        if (!data.alreadyPassed && data.bonus > 0 && currentUser) {
          const updated = { ...currentUser, points: (currentUser.points || 0) + data.bonus };
          setCurrentUser(updated);
          localStorage.setItem('currentUser', JSON.stringify(updated));
          window.dispatchEvent(new Event('userChanged'));
        }
        setQuizMessage(data.alreadyPassed ? 'Вы уже получали AQUA COIN за этот тест.' : `Тест пройден! +${data.bonus} AQUA COIN начислено.`);
        if (currentUser?.phone) loadUserResults(currentUser.phone);
      } else {
        setQuizMessage('Для получения баллов нужно 70%+. Попробуйте ещё раз.');
      }
    } catch { setQuizMessage('Ошибка сохранения результата'); }
  };

  const quizId = selectedQuiz ? String(selectedQuiz._id || selectedQuiz.id) : null;
  const isPassed = quizId ? userResults[quizId]?.passed : false;

  if (selectedQuiz) {
    const questions = selectedQuiz.questions || [];
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setSelectedQuiz(null)} className="mb-6 text-white/80 hover:text-white flex items-center gap-2 text-sm">← Назад к тестам</button>
          <div className="text-center mb-8">
            <div className="text-5xl">🧠</div>
            <h1 className="text-3xl font-bold text-white drop-shadow mt-4">{selectedQuiz.title}</h1>
            {selectedQuiz.description && <p className="text-white/80 mt-2">{selectedQuiz.description}</p>}
            <p className="text-white/60 mt-1 text-sm">{questions.length} вопросов · За прохождение: +{selectedQuiz.coins ?? 3} AQUA COIN</p>
          </div>
          {isPassed && !result ? (
            <div className="bg-white rounded-[32px] p-10 shadow-2xl text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Тест уже пройден!</h2>
              <p className="text-lg text-slate-600 mb-6">Монеты начисляются только один раз.</p>
              <button onClick={() => setSelectedQuiz(null)} className="rounded-full bg-emerald-600 text-white px-8 py-3 font-semibold hover:bg-emerald-700 transition">К списку тестов</button>
            </div>
          ) : result ? (
            <div className="bg-white rounded-[32px] p-10 shadow-2xl text-center">
              <div className="text-6xl mb-4">{result.percent >= 70 ? '🏆' : '📚'}</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{result.percent}%</h2>
              <p className="text-lg text-slate-600 mb-2">Правильных: {result.correct} из {result.total}</p>
              <p className={`text-lg font-semibold mb-4 ${result.percent >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>{result.percent >= 70 ? '✅ Тест пройден!' : '❌ Недостаточно правильных ответов'}</p>
              {quizMessage && <p className="text-sm text-slate-500 mb-6">{quizMessage}</p>}
              <div className="flex gap-3 justify-center flex-wrap">
                {result.percent < 70 && <button onClick={() => { setAnswers({}); setResult(null); setQuizMessage(''); }} className="rounded-full bg-emerald-600 text-white px-8 py-3 font-semibold hover:bg-emerald-700 transition">Попробовать ещё раз</button>}
                <button onClick={() => setSelectedQuiz(null)} className="rounded-full bg-slate-200 text-slate-700 px-8 py-3 font-semibold hover:bg-slate-300 transition">К списку тестов</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {questions.map((q, idx) => (
                <div key={idx} className="rounded-[24px] bg-white/95 p-6 shadow-lg">
                  <p className="font-semibold text-slate-900 mb-4"><span className="text-emerald-600">{idx + 1}.</span> {q.text}</p>
                  <div className="space-y-3">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-3 cursor-pointer rounded-2xl px-4 py-3 border transition ${answers[idx] === oi ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}`}>
                        <input type="radio" name={`q-${idx}`} checked={answers[idx] === oi} onChange={() => handleAnswer(idx, oi)} className="accent-emerald-600" />
                        <span className="text-slate-800">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={Object.keys(answers).length < questions.length}
                className="w-full rounded-full bg-emerald-600 text-white py-4 font-bold text-lg hover:bg-emerald-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg">
                {Object.keys(answers).length < questions.length ? `Ответьте на все вопросы (${Object.keys(answers).length}/${questions.length})` : 'Завершить тест'}
              </button>
            </form>
          )}
        </div>
        {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Обучение</span>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Обучение</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 text-lg">Учебные материалы и тесты для сотрудников аквапарков.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="flex gap-2 mb-8 bg-white/20 backdrop-blur-sm rounded-2xl p-1 w-fit">
          <button onClick={() => setTab('materials')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition ${tab === 'materials' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/20'}`}>
            📚 Материалы
          </button>
          <button onClick={() => setTab('tests')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition ${tab === 'tests' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/20'}`}>
            🧪 Тесты
          </button>
        </div>

        {tab === 'materials' && (
          <div>
            {isAdmin && (
              <div className="mb-6">
                <button onClick={() => { setShowCreate(!showCreate); setCreateMsg(''); }}
                  className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-semibold transition shadow-lg">
                  {showCreate ? '✕ Отмена' : '+ Добавить материал'}
                </button>
                {showCreate && (
                  <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Новый материал</h2>
                    <div className="space-y-4">
                      <input value={newTraining.title} onChange={e => setNewTraining(p => ({ ...p, title: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Название *" />
                      <textarea value={newTraining.description} onChange={e => setNewTraining(p => ({ ...p, description: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 min-h-[80px]" placeholder="Описание" />
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Файлы</label>
                        <input type="file" multiple accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={e => setTrainingFiles(Array.from(e.target.files || []))}
                          className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" />
                        {trainingFiles.length > 0 && <p className="text-sm text-slate-600 mt-2">Выбрано: {trainingFiles.length}</p>}
                      </div>
                      {createMsg && <p className="text-sm text-red-600">{createMsg}</p>}
                      <button onClick={handleAddTraining} disabled={saving}
                        className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
                        {saving ? 'Сохранение...' : 'Добавить'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {message && <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">{message}</div>}
            {trainings.length === 0 ? (
              <div className="rounded-[24px] bg-white/95 p-10 text-center text-slate-500 shadow">
                {isAdmin ? 'Нет материалов. Добавьте первый кнопкой выше.' : 'Пока нет материалов.'}
              </div>
            ) : (
              <div className="space-y-4">
                {trainings.map((item) => {
                  const itemId = String(item._id || item.id);
                  return (
                    <div key={itemId} className="rounded-[20px] border-l-4 border-emerald-400 bg-white/95 p-6 shadow-sm">
                      {editingId === itemId ? (
                        <div className="space-y-3">
                          <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm" />
                          <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm min-h-[80px]" />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(itemId)} className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold">Сохранить</button>
                            <button onClick={() => setEditingId(null)} className="rounded-xl bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                            {isAdmin && <KebabMenu onEdit={() => { setEditingId(itemId); setEditForm({ title: item.title, description: item.description || '' }); }} onDelete={() => handleDelete(itemId)} />}
                          </div>
                          {item.description && <p className="text-slate-600 mt-2 text-sm">{item.description}</p>}
                          {item.attachments?.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs uppercase tracking-widest text-slate-400">Файлы</p>
                              {item.attachments.map((url, i) => {
                                const name = url.split('/').pop();
                                const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
                                return (
                                  <div key={i} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                                    {isImg ? <img src={url} alt={name} className="w-full max-h-64 object-contain rounded-lg" />
                                      : <a href={url} target="_blank" rel="noreferrer" className="text-sky-600 hover:text-sky-700 text-sm font-medium">{name}</a>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-4">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'tests' && (
          <div>
            {isAdmin && (
              <div className="mb-6">
                <button onClick={() => { setShowCreateQuiz(!showCreateQuiz); setCreateQuizMsg(''); }}
                  className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-semibold transition shadow-lg">
                  {showCreateQuiz ? '✕ Отмена' : '+ Добавить тест'}
                </button>
                {showCreateQuiz && (
                  <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Новый тест</h2>
                    <div className="space-y-4">
                      <input value={newQuiz.title} onChange={e => setNewQuiz(p => ({ ...p, title: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Название теста *" />
                      <input value={newQuiz.description} onChange={e => setNewQuiz(p => ({ ...p, description: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Описание" />
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1"><GoldCoin size="xs" /> AQUA COIN:</label>
                        <input type="number" min="1" max="100" value={newQuiz.coins} onChange={e => setNewQuiz(p => ({ ...p, coins: Number(e.target.value) }))}
                          className="w-24 rounded-2xl border border-slate-300 p-3 text-slate-900" />
                      </div>
                      {newQuiz.questions.map((q, qi) => (
                        <div key={qi} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-slate-700 text-sm">Вопрос {qi + 1}</span>
                            {newQuiz.questions.length > 1 && <button onClick={() => removeQuestion(qi)} className="text-red-500 text-xs hover:text-red-700">✕ Удалить</button>}
                          </div>
                          <input value={q.text} onChange={e => handleQuestionChange(qi, 'text', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm mb-3" placeholder="Текст вопроса *" />
                          <div className="space-y-2 mb-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <input type="radio" name={`correct-${qi}`} checked={q.correct === opt && opt !== ''} onChange={() => opt && handleQuestionChange(qi, 'correct', opt)} className="accent-emerald-600 shrink-0" />
                                <input value={opt} onChange={e => handleOptionChange(qi, oi, e.target.value)}
                                  className="flex-1 rounded-xl border border-slate-300 p-2 text-slate-900 text-sm" placeholder={`Вариант ${oi + 1} *`} />
                              </div>
                            ))}
                          </div>
                          {q.correct && <p className="text-xs text-emerald-600">✓ Правильный: {q.correct}</p>}
                        </div>
                      ))}
                      <button onClick={addQuestion} className="rounded-xl bg-slate-100 text-slate-700 px-4 py-2 text-sm hover:bg-slate-200 transition">+ Добавить вопрос</button>
                      {createQuizMsg && <p className="text-sm text-red-600">{createQuizMsg}</p>}
                      <button onClick={handleCreateQuiz} disabled={savingQuiz}
                        className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
                        {savingQuiz ? 'Сохранение...' : 'Создать тест'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {quizzes.length === 0 ? (
              <div className="rounded-[24px] bg-white/95 p-10 text-center text-slate-500 shadow">
                {isAdmin ? 'Нет тестов. Создайте первый кнопкой выше.' : 'Тесты пока не добавлены.'}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {quizzes.map((quiz) => {
                  const qid = String(quiz._id || quiz.id);
                  const res = userResults[qid];
                  return (
                    <div key={qid} className="rounded-[24px] bg-white/95 p-6 shadow-xl flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{quiz.title}</h3>
                          {quiz.description && <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>}
                          <p className="text-xs text-slate-400 mt-1">{quiz.questions?.length || 0} вопросов</p>
                          <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1"><GoldCoin size="xs" /> +{quiz.coins ?? 3} AQUA COIN</p>
                        </div>
                        {res && <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${res.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{res.passed ? `✓ ${res.score}%` : `✗ ${res.score}%`}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <button onClick={() => startQuiz(quiz)}
                          className={`flex-1 rounded-2xl py-2 font-semibold text-sm transition ${res?.passed ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                          {res?.passed ? '🏆 Пройден' : res ? '🔁 Пересдать' : '🚀 Начать'}
                        </button>
                        {isAdmin && <button onClick={() => handleDeleteQuiz(qid)} className="rounded-2xl bg-red-100 text-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-200 transition">🗑</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}
