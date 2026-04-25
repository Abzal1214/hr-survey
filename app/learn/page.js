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
