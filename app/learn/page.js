"use client";
import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import KebabMenu from "../components/KebabMenu";

export default function LearnPage() {
  const [tab, setTab] = useState("materials");
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: "Тест по технике безопасности" },
    { id: 2, title: "Тест по продукту" },
  ]);
  const [trainings, setTrainings] = useState([
    { id: 1, title: "Введение в компанию" },
    { id: 2, title: "Обучение продажам" },
  ]);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newTestTitle, setNewTestTitle] = useState("");
  const [newMaterialTitle, setNewMaterialTitle] = useState("");

  // Определяем роль админа (замените на реальную логику)
  const isAdmin = typeof window !== 'undefined' && (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).role === 'admin' : false);

  const handleAddTest = (e) => {
    e.preventDefault();
    if (newTestTitle.trim()) {
      setQuizzes(prev => [
        ...prev,
        { id: Date.now(), title: newTestTitle.trim() }
      ]);
      setNewTestTitle("");
      setShowAddTestModal(false);
    }
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (newMaterialTitle.trim()) {
      setTrainings(prev => [
        ...prev,
        { id: Date.now(), title: newMaterialTitle.trim() }
      ]);
      setNewMaterialTitle("");
      setShowAddMaterialModal(false);
    }
  };

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-sky-700">Материалы</h2>
              {isAdmin && (
                <button
                  className="rounded-full bg-emerald-600 text-white px-5 py-2 font-semibold text-base shadow hover:bg-emerald-700 transition"
                  onClick={() => setShowAddMaterialModal(true)}
                >
                  + Добавить материал
                </button>
              )}
            </div>
            {/* Модалка добавления материала */}
            {showAddMaterialModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-scale-in">
                  <button onClick={() => setShowAddMaterialModal(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-2xl">×</button>
                  <h2 className="text-2xl font-bold mb-4 text-sky-700">Добавить материал</h2>
                  <form onSubmit={handleAddMaterial}>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">Название материала</label>
                    <input
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 mb-4"
                      value={newMaterialTitle}
                      onChange={e => setNewMaterialTitle(e.target.value)}
                      placeholder="Введите название материала"
                      required
                    />
                    <div className="flex gap-3 mt-4">
                      <button type="button" onClick={() => setShowAddMaterialModal(false)} className="flex-1 rounded-xl border border-slate-300 bg-slate-50 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition">Отмена</button>
                      <button type="submit" className="flex-1 rounded-xl bg-emerald-600 text-white py-2 font-semibold hover:bg-emerald-700 transition">Добавить</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
                  onClick={() => setShowAddTestModal(true)}
                >
                  + Добавить тест
                </button>
              )}
            </div>
            {/* Модалка добавления теста */}
            {showAddTestModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-scale-in">
                  <button onClick={() => setShowAddTestModal(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-2xl">×</button>
                  <h2 className="text-2xl font-bold mb-4 text-sky-700">Добавить тест</h2>
                  <form onSubmit={handleAddTest}>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">Название теста</label>
                    <input
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 mb-4"
                      value={newTestTitle}
                      onChange={e => setNewTestTitle(e.target.value)}
                      placeholder="Введите название теста"
                      required
                    />
                    <div className="flex gap-3 mt-4">
                      <button type="button" onClick={() => setShowAddTestModal(false)} className="flex-1 rounded-xl border border-slate-300 bg-slate-50 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition">Отмена</button>
                      <button type="submit" className="flex-1 rounded-xl bg-emerald-600 text-white py-2 font-semibold hover:bg-emerald-700 transition">Добавить</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

                
