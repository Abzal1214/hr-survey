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
