"use client";

import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import KebabMenu from "../components/KebabMenu";

export default function LearnPage() {
  const [tab, setTab] = useState("materials");
  // Примерные данные, замените на реальные из props/fetch
  const [quizzes] = useState([]);
  const [trainings] = useState([]);
  const [isAdmin] = useState(true);
  const [userResults] = useState({});
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 mb-8">
        <button className={tab === "materials" ? "font-bold" : ""} onClick={() => setTab("materials")}>Материалы</button>
        <button className={tab === "tests" ? "font-bold" : ""} onClick={() => setTab("tests")}>Тесты</button>
        <button className={tab === "courses" ? "font-bold" : ""} onClick={() => setTab("courses")}>Курсы</button>
      </div>

      {tab === "materials" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Материалы</h2>
          {trainings.length === 0 ? (
            <div className="text-slate-500">Нет материалов</div>
          ) : (
            <ul>
              {trainings.map((t) => (
                <li key={t.id || t._id}>{t.title}</li>
              ))}
            </ul>
          )}
        </div>
      )}

              return (
                <div className="container mx-auto px-4 py-8">
                  <div className="flex gap-4 mb-8">
                    <button className={tab === "materials" ? "font-bold" : ""} onClick={() => setTab("materials")}>Материалы</button>
                    <button className={tab === "tests" ? "font-bold" : ""} onClick={() => setTab("tests")}>Тесты</button>
                    <button className={tab === "courses" ? "font-bold" : ""} onClick={() => setTab("courses")}>Курсы</button>
                  </div>

                  {tab === "materials" && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Материалы</h2>
                      {trainings.length === 0 ? (
                        <div className="text-slate-500">Нет материалов</div>
                      ) : (
                        <ul>
                          {trainings.map((t) => (
                            <li key={t.id || t._id}>{t.title}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {tab === "tests" && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Тесты</h2>
                      {quizzes.length === 0 ? (
                        <div className="text-slate-500">Нет тестов</div>
                      ) : (
                        <ul>
                          {quizzes.map((quiz) => (
                            <li key={quiz.id || quiz._id} className="mb-4 p-4 border rounded">
                              <div className="flex justify-between items-center">
                                <span>{quiz.title}</span>
                                <KebabMenu onEdit={() => {}} onDelete={() => {}} isActive={quiz.isActive} />
                              </div>
                              <button className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded" onClick={() => setShowModal(true)}>
                                Начать
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {tab === "courses" && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Курсы</h2>
                      <div className="text-slate-500">Раздел в разработке</div>
                    </div>
                  )}

                  {showModal && (
                    <ConfirmModal
                      message="Вы уверены, что хотите начать тест?"
                      onConfirm={() => setShowModal(false)}
                      onCancel={() => setShowModal(false)}
                    />
                  )}
                </div>
              );
            }
            // --- END OF FILE ---
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
                              <select value={newQuiz.department} onChange={e => setNewQuiz(p => ({ ...p, department: e.target.value }))}
                                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900">
                                <option value="">Все отделы</option>
                                <option value="Аквапарк">Аквапарк</option>
                                <option value="Ресторан">Ресторан</option>
                                <option value="SPA">SPA</option>
                                <option value="Магазин">Магазин</option>
                                <option value="Офис">Офис</option>
                              </select>
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
                        <div className="flex items-center gap-2">
                          <KebabMenu
                            onEdit={() => {
                              setShowCreateQuiz(false);
                              setCreateQuizMsg('');
                              setEditQuiz({ ...quiz, id: qid });
                            }}
                            onDelete={() => handleDeleteQuiz(qid)}
                            onToggleActive={async () => {
                              await fetch('/api/quizzes', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: qid, isActive: !quiz.isActive })
                              });
                              loadQuizzes(currentUser);
                            }}
                            isActive={quiz.isActive}
                          />
                          {res && <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${res.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{res.passed ? `✓ ${res.score}%` : `✗ ${res.score}%`}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => startQuiz(quiz)}
                          className={`flex-1 rounded-2xl py-2 font-semibold text-sm transition ${res?.passed ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                          disabled={res?.passed}
                        >
                          {res?.passed ? '🏆 Пройден' : res ? '🔁 Пересдать' : '🚀 Начать'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'courses' && (
          <CourseTab
            isAdmin={isAdmin}
            currentUser={currentUser}
            courses={courses}
            courseProgresses={courseProgresses}
            trainings={trainings}
            quizzes={quizzes}
            userResults={userResults}
            activeCourse={activeCourse}
            setActiveCourse={(c) => { setActiveCourse(c); setCourseQuizAnswers({}); setCourseQuizResult(null); setCourseQuizMsg(''); if (c && currentUser?.phone) { fetch(`/api/course-progress?courseId=${c._id || c.id}&phone=${encodeURIComponent(currentUser.phone)}`).then(r=>r.json()).then(p=>setActiveCourseProgress(p||{completedSteps:[]})).catch(()=>{}); } }}
            activeCourseProgress={activeCourseProgress}
            setActiveCourseProgress={setActiveCourseProgress}
            showCreateCourse={showCreateCourse}
            setShowCreateCourse={setShowCreateCourse}
            newCourse={newCourse}
            setNewCourse={setNewCourse}
            createCourseMsg={createCourseMsg}
            setCreateCourseMsg={setCreateCourseMsg}
            savingCourse={savingCourse}
            setSavingCourse={setSavingCourse}
            loadCourses={loadCourses}
            loadCourseProgresses={loadCourseProgresses}
            courseQuizAnswers={courseQuizAnswers}
            setCourseQuizAnswers={setCourseQuizAnswers}
            courseQuizResult={courseQuizResult}
            setCourseQuizResult={setCourseQuizResult}
            courseQuizMsg={courseQuizMsg}
            setCourseQuizMsg={setCourseQuizMsg}
            setConfirmModal={setConfirmModal}
          />
        )}
        {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
      );

// ── CourseTab component ──────────────────────────────────────────────────────

function CourseTab({ isAdmin, currentUser, courses, courseProgresses, trainings, quizzes, userResults,
  activeCourse, setActiveCourse, activeCourseProgress, setActiveCourseProgress,
  showCreateCourse, setShowCreateCourse, newCourse, setNewCourse, createCourseMsg, setCreateCourseMsg,
  savingCourse, setSavingCourse, loadCourses, loadCourseProgresses,
  courseQuizAnswers, setCourseQuizAnswers, courseQuizResult, setCourseQuizResult, courseQuizMsg, setCourseQuizMsg,
  setConfirmModal }) {

  // Mark material step complete
  const markStepComplete = async (stepIndex) => {
    if (!currentUser?.phone) return;
    const courseId = String(activeCourse._id || activeCourse.id);
    const res = await fetch('/api/course-progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, phone: currentUser.phone, stepIndex }) });
    if (res.ok) {
      const updated = await res.json();
      setActiveCourseProgress(updated);
      if (currentUser?.phone) loadCourseProgresses(currentUser.phone);
    }
  };

  // Submit quiz step
  const handleCourseQuizSubmit = async (e, quiz, stepIndex) => {
    e.preventDefault();
    const questions = quiz.questions || [];
    const correct = questions.filter((q, i) => q.options[courseQuizAnswers[i]] === q.correct).length;
    const percent = Math.round((correct / questions.length) * 100);
    setCourseQuizResult({ percent, correct, total: questions.length, stepIndex });
    if (percent >= 70) {
      // save test result
      try {
        await fetch('/api/tests', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: currentUser?.phone, quizId: String(quiz._id || quiz.id), score: percent, answers: courseQuizAnswers, timestamp: new Date().toISOString() }) });
      } catch {}
      setCourseQuizMsg('✅ Тест пройден! Шаг завершён.');
      await markStepComplete(stepIndex);
    } else {
      setCourseQuizMsg(`❌ ${percent}% — нужно 70%+. Попробуйте ещё раз.`);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title) { setCreateCourseMsg('Введите название'); return; }
    if (!newCourse.steps.length) { setCreateCourseMsg('Добавьте хотя бы один шаг'); return; }
    setSavingCourse(true);
    const res = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCourse) });
    if (res.ok) { setCreateCourseMsg('Курс создан!'); setNewCourse({ title: '', description: '', department: '', steps: [] }); setShowCreateCourse(false); loadCourses(); }
    else { const d = await res.json(); setCreateCourseMsg(d.error || 'Ошибка'); }
    setSavingCourse(false);
  };

  const addStep = (type, item) => {
    const id = String(item._id || item.id);
    if (newCourse.steps.some(s => s.refId === id)) return;
    setNewCourse(p => ({ ...p, steps: [...p.steps, { type, refId: id, title: item.title }] }));
  };
  const removeStep = (idx) => setNewCourse(p => ({ ...p, steps: p.steps.filter((_, i) => i !== idx) }));
  const moveStep = (idx, dir) => {
    const steps = [...newCourse.steps];
    const to = idx + dir;
    if (to < 0 || to >= steps.length) return;
    [steps[idx], steps[to]] = [steps[to], steps[idx]];
    setNewCourse(p => ({ ...p, steps }));
  };

  // Active course view
  if (activeCourse) {
    const steps = activeCourse.steps || [];
    const completed = activeCourseProgress?.completedSteps || [];
    const totalCompleted = completed.length;
    const progressPct = steps.length ? Math.round((totalCompleted / steps.length) * 100) : 0;

    return (
      <div>
        <button onClick={() => setActiveCourse(null)} className="mb-6 text-white/80 hover:text-white flex items-center gap-2 text-sm">← Назад к курсам</button>
        <div className="rounded-[28px] bg-white/95 p-6 shadow-2xl mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900">{activeCourse.title}</h2>
          {activeCourse.description && <p className="text-slate-600 mt-1">{activeCourse.description}</p>}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-500 mb-1">
              <span>Прогресс: {totalCompleted}/{steps.length} шагов</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200">
              <div className="h-2.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = completed.includes(idx);
            const prevDone = idx === 0 || completed.includes(idx - 1);
            const locked = !prevDone && !isCompleted;
            const material = step.type === 'material' ? trainings.find(t => String(t._id || t.id) === step.refId) : null;
            const quiz = step.type === 'quiz' ? quizzes.find(q => String(q._id || q.id) === step.refId) : null;
            const quizPassed = step.type === 'quiz' && quiz ? userResults[step.refId]?.passed : false;
            const isActiveQuizStep = courseQuizResult?.stepIndex === idx;

            return (
              <div key={idx} className={`rounded-[20px] bg-white/95 shadow-lg overflow-hidden transition-opacity ${locked ? 'opacity-50' : ''}`}>
                {/* Step header */}
                <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-100 ${isCompleted ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : locked ? 'bg-slate-200 text-slate-400' : 'bg-sky-100 text-sky-700'}`}>
                    {isCompleted ? '✓' : locked ? '🔒' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{step.type === 'material' ? 'Материал' : 'Тест'}</span>
                    <p className="font-bold text-slate-900 text-sm">{step.title}</p>
                  </div>
                  {isCompleted && <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 font-semibold">✓ Завершён</span>}
                  {locked && <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-3 py-1 font-semibold">🔒 Заблокирован</span>}
                </div>

                {/* Step content (only if unlocked) */}
                {!locked && (
                  <div className="px-6 py-5">
                    {step.type === 'material' && material && (
                      <div>
                        {material.description && <p className="text-slate-700 mb-4">{material.description}</p>}
                        {material.attachments?.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {material.attachments.map((url, i) => {
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
                        {!isCompleted && (
                          <button onClick={() => markStepComplete(idx)}
                            className="rounded-2xl bg-emerald-600 text-white px-6 py-2.5 font-semibold text-sm hover:bg-emerald-700 transition">
                            ✓ Прочитал, продолжить
                          </button>
                        )}
                      </div>
                    )}
                    {step.type === 'quiz' && quiz && (
                      <div>
                        <p className="text-slate-600 text-sm mb-1">{quiz.description}</p>
                        <p className="text-xs text-slate-400 mb-4">{quiz.questions?.length || 0} вопросов · +{quiz.coins ?? 3} AQUA COIN</p>
                        {(isCompleted || quizPassed) ? (
                          <p className="text-emerald-600 font-semibold text-sm">✓ Тест пройден</p>
                        ) : isActiveQuizStep && courseQuizResult ? (
                          <div className="text-center">
                            <p className={`text-lg font-bold mb-2 ${courseQuizResult.percent >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>{courseQuizResult.percent}%</p>
                            <p className="text-slate-600 text-sm mb-4">{courseQuizMsg}</p>
                            {courseQuizResult.percent < 70 && (
                              <button onClick={() => { setCourseQuizAnswers({}); setCourseQuizResult(null); setCourseQuizMsg(''); }}
                                className="rounded-2xl bg-emerald-600 text-white px-6 py-2.5 font-semibold text-sm hover:bg-emerald-700 transition">
                                Попробовать ещё раз
                              </button>
                            )}
                          </div>
                        ) : (
                          <form onSubmit={(e) => handleCourseQuizSubmit(e, quiz, idx)} className="space-y-4">
                            {quiz.questions.map((q, qi) => (
                              <div key={qi} className="rounded-xl bg-slate-50 p-4">
                                <p className="font-semibold text-slate-900 text-sm mb-3"><span className="text-emerald-600">{qi + 1}.</span> {q.text}</p>
                                <div className="space-y-2">
                                  {q.options.map((opt, oi) => (
                                    <label key={oi} className={`flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 border text-sm transition ${courseQuizAnswers[qi] === oi ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                      <input type="radio" name={`cq-${idx}-${qi}`} checked={courseQuizAnswers[qi] === oi} onChange={() => setCourseQuizAnswers(p => ({ ...p, [qi]: oi }))} className="accent-emerald-600" />
                                      {opt}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <button type="submit" disabled={Object.keys(courseQuizAnswers).length < (quiz.questions?.length || 0)}
                              className="rounded-2xl bg-emerald-600 text-white px-6 py-2.5 font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                              Завершить тест
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {progressPct === 100 && (
          <div className="mt-6 rounded-[24px] bg-gradient-to-r from-emerald-500 to-teal-400 p-8 text-center text-white shadow-2xl">
            <div className="text-5xl mb-3">🎓</div>
            <h3 className="text-2xl font-extrabold">Курс пройден!</h3>
            <p className="mt-2 text-white/90">Вы завершили все шаги курса «{activeCourse.title}».</p>
          </div>
        )}
      </div>
    );
  }

  // Course list
  return (
    <div>
      {isAdmin && (
        <div className="mb-6">
          <button onClick={() => { setShowCreateCourse(!showCreateCourse); setCreateCourseMsg(''); }}
            className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-semibold transition shadow-lg">
            {showCreateCourse ? '✕ Отмена' : '+ Создать курс'}
          </button>
          {showCreateCourse && (
            <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Новый курс</h2>
              <div className="space-y-4">
                <input value={newCourse.title} onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900" placeholder="Название курса *" />
                <textarea value={newCourse.description} onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 min-h-[70px]" placeholder="Описание" />
                <select value={newCourse.department} onChange={e => setNewCourse(p => ({ ...p, department: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900">
                  <option value="">Все отделы</option>
                  <option value="Аквапарк">Аквапарк</option>
                  <option value="Ресторан">Ресторан</option>
                  <option value="SPA">SPA</option>
                  <option value="Магазин">Магазин</option>
                  <option value="Офис">Офис</option>
                </select>

                {/* Steps constructor */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Шаги курса (порядок важен)</p>
                  {newCourse.steps.length === 0 ? (
                    <p className="text-sm text-slate-400 italic mb-3">Нет шагов. Добавьте материалы и тесты ниже.</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {newCourse.steps.map((step, i) => (
                        <div key={i} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${step.type === 'material' ? 'bg-sky-50 border border-sky-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                          <span className={`text-xs font-semibold shrink-0 ${step.type === 'material' ? 'text-sky-600' : 'text-emerald-600'}`}>{step.type === 'material' ? '📚' : '🧪'}</span>
                          <span className="flex-1 text-slate-800 truncate">{step.title}</span>
                          <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">↑</button>
                          <button onClick={() => moveStep(i, 1)} disabled={i === newCourse.steps.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">↓</button>
                          <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600">✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Материалы</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {trainings.length === 0 ? <p className="text-xs text-slate-400">Нет материалов</p> : trainings.map(t => {
                          const id = String(t._id || t.id);
                          const added = newCourse.steps.some(s => s.refId === id);
                          return (
                            <button key={id} onClick={() => addStep('material', t)} disabled={added}
                              className={`w-full text-left rounded-xl px-3 py-2 text-sm transition ${added ? 'bg-sky-100 text-sky-500 line-through' : 'bg-slate-50 hover:bg-sky-50 text-slate-700'}`}>
                              📚 {t.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Тесты</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {quizzes.length === 0 ? <p className="text-xs text-slate-400">Нет тестов</p> : quizzes.map(q => {
                          const id = String(q._id || q.id);
                          const added = newCourse.steps.some(s => s.refId === id);
                          return (
                            <button key={id} onClick={() => addStep('quiz', q)} disabled={added}
                              className={`w-full text-left rounded-xl px-3 py-2 text-sm transition ${added ? 'bg-emerald-100 text-emerald-500 line-through' : 'bg-slate-50 hover:bg-emerald-50 text-slate-700'}`}>
                              🧪 {q.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {createCourseMsg && <p className="text-sm text-red-600">{createCourseMsg}</p>}
                <button onClick={handleCreateCourse} disabled={savingCourse}
                  className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
                  {savingCourse ? 'Сохранение...' : 'Создать курс'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-[24px] bg-white/95 p-10 text-center text-slate-500 shadow">
          {isAdmin ? 'Нет курсов. Создайте первый кнопкой выше.' : 'Курсы пока не добавлены.'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const cid = String(course._id || course.id);
            const prog = courseProgresses[cid];
            const completed = prog?.completedSteps?.length || 0;
            const total = course.steps?.length || 0;
            const pct = total ? Math.round((completed / total) * 100) : 0;
            return (
              <div key={cid} className="rounded-[24px] bg-white/95 p-6 shadow-xl flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                    {course.description && <p className="text-sm text-slate-500 mt-1">{course.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">{total} шагов · {course.steps?.filter(s => s.type === 'material').length || 0} материалов, {course.steps?.filter(s => s.type === 'quiz').length || 0} тестов</p>
                  </div>
                  {pct === 100 && <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1">🎓 Завершён</span>}
                </div>
                {total > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{completed}/{total}</span><span>{pct}%</span></div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-auto">
                  <button onClick={() => setActiveCourse(course)}
                    className="flex-1 rounded-2xl bg-emerald-600 text-white py-2 font-semibold text-sm hover:bg-emerald-700 transition">
                    {pct === 100 ? '🎓 Повторить' : pct > 0 ? '▶ Продолжить' : '🚀 Начать'}
                  </button>
                  {isAdmin && (
                    <button onClick={() => setConfirmModal({ message: `Удалить курс «${course.title}»?`, onConfirm: async () => { setConfirmModal(null); await fetch(`/api/courses?id=${cid}`, { method: 'DELETE' }); loadCourses(); }})}
                      className="rounded-2xl bg-red-100 text-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-200 transition">🗑</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
