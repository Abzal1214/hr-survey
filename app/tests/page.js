'use client';

import { useState, useEffect } from 'react';

const emptyQuestion = () => ({ text: '', options: ['', '', '', ''], correct: '' });

export default function TestsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [userResults, setUserResults] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', coins: 3, questions: [emptyQuestion()] });
  const [createMsg, setCreateMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const loadQuizzes = () =>
    fetch('/api/quizzes').then(r => r.json()).then(d => setQuizzes(Array.isArray(d) ? d : [])).catch(() => {});

  useEffect(() => {
    loadQuizzes();
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        if (user.role === 'admin') setIsAdmin(true);
        loadUserResults(user.phone);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserResults = (phone) => {
    fetch('/api/tests')
      .then(r => r.json())
      .then(tests => {
        const byQuiz = {};
        tests.filter(t => t.phone === phone).forEach(t => {
          const key = t.quizId || 'legacy';
          if (!byQuiz[key] || t.score > byQuiz[key].score) {
            byQuiz[key] = { passed: t.score >= 70, score: t.score };
          }
        });
        setUserResults(byQuiz);
      })
      .catch(() => {});
  };

  const handleNewQuizChange = (field, value) => setNewQuiz(p => ({ ...p, [field]: value }));

  const handleQuestionChange = (idx, field, value) => {
    setNewQuiz(p => {
      const qs = [...p.questions];
      qs[idx] = { ...qs[idx], [field]: value };
      return { ...p, questions: qs };
    });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setNewQuiz(p => {
      const qs = [...p.questions];
      const opts = [...qs[qIdx].options];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...p, questions: qs };
    });
  };

  const addQuestion = () => setNewQuiz(p => ({ ...p, questions: [...p.questions, emptyQuestion()] }));
  const removeQuestion = (idx) => setNewQuiz(p => ({ ...p, questions: p.questions.filter((_, i) => i !== idx) }));

  const handleCreateQuiz = async () => {
    if (!newQuiz.title) { setCreateMsg('Введите название теста'); return; }
    const valid = newQuiz.questions.every(q => q.text && q.correct && q.options.every(o => o));
    if (!valid) { setCreateMsg('Заполните все вопросы, варианты и отметьте правильный ответ'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuiz),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateMsg('Тест создан!');
        setNewQuiz({ title: '', description: '', coins: 3, questions: [emptyQuestion()] });
        setShowCreate(false);
        loadQuizzes();
      } else {
        setCreateMsg(data.error || 'Ошибка');
      }
    } catch { setCreateMsg('Ошибка сети'); }
    setSaving(false);
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Удалить этот тест?')) return;
    await fetch(`/api/quizzes?id=${id}`, { method: 'DELETE' });
    loadQuizzes();
  };

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setResult(null);
    setMessage('');
  };

  const handleAnswer = (qIdx, optIdx) => setAnswers(p => ({ ...p, [qIdx]: optIdx }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const questions = selectedQuiz.questions;
    const correct = questions.filter((q, i) => q.options[answers[i]] === q.correct).length;
    const percent = Math.round((correct / questions.length) * 100);
    setResult({ correct, total: questions.length, percent });

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentUser?.phone,
          quizId: String(selectedQuiz._id || selectedQuiz.id),
          score: percent,
          answers,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (percent >= 70) {
        if (!data.alreadyPassed && data.bonus > 0 && currentUser) {
          const updated = { ...currentUser, points: (currentUser.points || 0) + data.bonus };
          setCurrentUser(updated);
          localStorage.setItem('currentUser', JSON.stringify(updated));
          window.dispatchEvent(new Event('userChanged'));
        }
        setMessage(data.alreadyPassed
          ? 'Вы уже получали AQUA COIN за этот тест. Повторное начисление не производится.'
          : `Тест пройден! +${data.bonus} AQUA COIN начислено.`);
        if (currentUser?.phone) loadUserResults(currentUser.phone);
      } else {
        setMessage('Для получения баллов нужно 70%+. Попробуйте ещё раз.');
      }
    } catch { setMessage('Ошибка сохранения результата'); }
  };

  const quizId = selectedQuiz ? String(selectedQuiz._id || selectedQuiz.id) : null;
  const isPassed = quizId ? userResults[quizId]?.passed : false;

  if (selectedQuiz) {
    const questions = selectedQuiz.questions || [];
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setSelectedQuiz(null)} className="mb-6 text-white/80 hover:text-white flex items-center gap-2 text-sm">
            ← Назад к списку тестов
          </button>
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
              <p className="text-lg text-slate-600 mb-2">Вы успешно прошли этот тест и получили AQUA COIN.</p>
              <p className="text-sm text-slate-500 mb-6">Пересдача недоступна — монеты начисляются только один раз.</p>
              <button onClick={() => setSelectedQuiz(null)} className="rounded-full bg-emerald-600 text-white px-8 py-3 font-semibold hover:bg-emerald-700 transition">
                К списку тестов
              </button>
            </div>
          ) : result ? (
            <div className="bg-white rounded-[32px] p-10 shadow-2xl text-center">
              <div className="text-6xl mb-4">{result.percent >= 70 ? '🏆' : '📚'}</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{result.percent}%</h2>
              <p className="text-lg text-slate-600 mb-2">Правильных ответов: {result.correct} из {result.total}</p>
              <p className={`text-lg font-semibold mb-4 ${result.percent >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>
                {result.percent >= 70 ? '✅ Тест пройден успешно!' : '❌ Недостаточно правильных ответов'}
              </p>
              {message && <p className="text-sm text-slate-500 mb-6">{message}</p>}
              <div className="flex gap-3 justify-center flex-wrap">
                {result.percent < 70 && (
                  <button onClick={() => { setAnswers({}); setResult(null); setMessage(''); }}
                    className="rounded-full bg-emerald-600 text-white px-8 py-3 font-semibold hover:bg-emerald-700 transition">
                    Попробовать ещё раз
                  </button>
                )}
                <button onClick={() => setSelectedQuiz(null)} className="rounded-full bg-slate-200 text-slate-700 px-8 py-3 font-semibold hover:bg-slate-300 transition">
                  К списку тестов
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {questions.map((q, idx) => (
                <div key={idx} className="rounded-[24px] bg-white/95 p-6 shadow-lg border border-white/60">
                  <p className="font-semibold text-slate-900 mb-4"><span className="text-emerald-600">{idx + 1}.</span> {q.text}</p>
                  <div className="space-y-3">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-3 cursor-pointer rounded-2xl px-4 py-3 border transition ${
                        answers[idx] === oi ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                      }`}>
                        <input type="radio" name={`q-${idx}`} value={oi}
                          checked={answers[idx] === oi}
                          onChange={() => handleAnswer(idx, oi)}
                          className="accent-emerald-600" />
                        <span className="text-slate-800">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button type="submit"
                disabled={Object.keys(answers).length < questions.length}
                className="w-full rounded-full bg-emerald-600 text-white py-4 font-bold text-lg hover:bg-emerald-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg">
                {Object.keys(answers).length < questions.length
                  ? `Ответьте на все вопросы (${Object.keys(answers).length}/${questions.length})`
                  : 'Завершить тест'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl">🧪</div>
          <h1 className="text-4xl font-extrabold text-white drop-shadow mt-4">Тесты</h1>
          <p className="text-white/80 mt-2">Выберите тест для прохождения. За успех — AQUA COIN!</p>
        </div>

        {isAdmin && (
          <div className="mb-8">
            <button onClick={() => { setShowCreate(!showCreate); setCreateMsg(''); }}
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-semibold transition shadow-lg">
              {showCreate ? '✕ Отмена' : '+ Добавить тест'}
            </button>

            {showCreate && (
              <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Новый тест</h2>
                <div className="space-y-4">
                  <input value={newQuiz.title} onChange={e => handleNewQuizChange('title', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Название теста *" />
                  <input value={newQuiz.description} onChange={e => handleNewQuizChange('description', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Описание (необязательно)" />
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">💰 AQUA COIN за прохождение:</label>
                    <input type="number" min="1" max="100" value={newQuiz.coins}
                      onChange={e => handleNewQuizChange('coins', Number(e.target.value))}
                      className="w-24 rounded-2xl border border-slate-300 p-3 text-slate-900" />
                  </div>

                  <div className="space-y-4">
                    {newQuiz.questions.map((q, qi) => (
                      <div key={qi} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-slate-700 text-sm">Вопрос {qi + 1}</span>
                          {newQuiz.questions.length > 1 && (
                            <button onClick={() => removeQuestion(qi)} className="text-red-500 text-xs hover:text-red-700">✕ Удалить</button>
                          )}
                        </div>
                        <input value={q.text} onChange={e => handleQuestionChange(qi, 'text', e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm mb-3" placeholder="Текст вопроса *" />
                        <div className="space-y-2 mb-3">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input type="radio" name={`correct-${qi}`} checked={q.correct === opt && opt !== ''}
                                onChange={() => opt && handleQuestionChange(qi, 'correct', opt)}
                                className="accent-emerald-600 shrink-0" title="Отметить правильный" />
                              <input value={opt} onChange={e => handleOptionChange(qi, oi, e.target.value)}
                                className="flex-1 rounded-xl border border-slate-300 p-2 text-slate-900 text-sm"
                                placeholder={`Вариант ${oi + 1} *`} />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">Нажмите кружок слева от варианта, чтобы отметить правильный ответ</p>
                        {q.correct && <p className="text-xs text-emerald-600 mt-1">✓ Правильный: {q.correct}</p>}
                      </div>
                    ))}
                  </div>

                  <button onClick={addQuestion} className="rounded-xl bg-slate-100 text-slate-700 px-4 py-2 text-sm hover:bg-slate-200 transition">
                    + Добавить вопрос
                  </button>

                  {createMsg && <p className="text-sm text-red-600">{createMsg}</p>}

                  <button onClick={handleCreateQuiz} disabled={saving}
                    className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
                    {saving ? 'Сохранение...' : 'Создать тест'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="rounded-[24px] bg-white/80 p-10 text-center text-slate-500 shadow">
            {isAdmin ? 'Нет тестов. Создайте первый с кнопкой выше.' : 'Тесты пока не добавлены.'}
          </div>
        ) : (
          <>
          {!isAdmin && quizzes.length > 0 && quizzes.every(q => userResults[String(q._id || q.id)]?.passed) && (
            <div className="rounded-[24px] bg-white/95 p-8 shadow-xl text-center mb-6">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Все актуальные тесты пройдены!</h2>
              <p className="text-lg text-slate-600">Вы молодец! 🎉</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {quizzes.map((quiz) => {
              const qid = String(quiz._id || quiz.id);
              const res = userResults[qid];
              return (
                <div key={qid} className="rounded-[24px] bg-white/95 p-6 shadow-xl border border-white/60 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{quiz.title}</h3>
                      {quiz.description && <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>}
                      <p className="text-xs text-slate-400 mt-1">{quiz.questions?.length || 0} вопросов</p>
                      <p className="text-xs font-semibold text-emerald-600 mt-1">💰 +{quiz.coins ?? 3} AQUA COIN</p>
                    </div>
                    {res && (
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${res.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {res.passed ? `✓ ${res.score}%` : `✗ ${res.score}%`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <button onClick={() => startQuiz(quiz)}
                      className={`flex-1 rounded-2xl py-2 font-semibold text-sm transition ${
                        res?.passed ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}>
                      {res?.passed ? '🏆 Пройден' : res ? '🔁 Пересдать' : '🚀 Начать'}
                    </button>
                    {isAdmin && (
                      <button onClick={() => handleDeleteQuiz(qid)}
                        className="rounded-2xl bg-red-100 text-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-200 transition">
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
