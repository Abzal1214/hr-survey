"use client";
import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import KebabMenu from "../components/KebabMenu";

export default function LearnPage() {
  const [tab, setTab] = useState("materials");
  const [quizzes] = useState([]);
  const [trainings] = useState([]);
  // Пример: определяем роль админа (замените на реальную логику)
  const isAdmin = typeof window !== 'undefined' && (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).role === 'admin' : false);

  return (
    <div className="min-h-screen relative">
      {/* Фоновое изображение и затемнение */}
      <div className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/bg.jpg')"}} aria-hidden="true" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] -z-10" />

      {/* Заголовок */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">📚 Обучение</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 text-lg">Материалы, тесты и курсы для сотрудников</p>
        </div>
      </div>

      {/* Табы */}
      <div className="flex gap-2 flex-wrap mb-8 justify-center">
        {[
          { key: "materials", label: "Материалы" },
          { key: "tests", label: "Тесты" },
          { key: "courses", label: "Курсы" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-5 py-2 text-base font-semibold transition-all flex items-center gap-1
              ${tab === key ? "bg-sky-500 text-white shadow" : "bg-white/80 text-slate-600 border border-slate-200 hover:bg-sky-50"}
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Контент вкладок */}
      <div className="max-w-2xl mx-auto bg-white/80 rounded-xl shadow border border-sky-100 backdrop-blur-md p-8 mt-4">
        {tab === "materials" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-sky-700">Материалы</h2>
            {trainings.length === 0 ? (
              <div className="text-slate-500">Нет материалов</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {trainings.map((t) => (
                  <li key={t.id || t._id}>{t.title}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "tests" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-sky-700">Тесты</h2>
              {isAdmin && (
                <button
                  className="rounded-full bg-emerald-600 text-white px-5 py-2 font-semibold text-base shadow hover:bg-emerald-700 transition"
                  onClick={() => alert('Добавить тест (реализуйте модалку)')}
                >
                  + Добавить тест
                </button>
              )}
            </div>
            {quizzes.length === 0 ? (
              <div className="text-slate-500">Нет тестов</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {quizzes.map((quiz) => (
                  <li key={quiz.id || quiz._id}>{quiz.title}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "courses" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-sky-700">Курсы</h2>
            <div className="text-slate-500">Раздел в разработке</div>
          </div>
        )}
      </div>
    </div>
  );
}

                
