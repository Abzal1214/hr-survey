"use client";
import { useState, useEffect } from "react";
import ConfirmModal from "../components/ConfirmModal";
import KebabMenu from "../components/KebabMenu";


export default function LearnPage() {
  const [tab, setTab] = useState("materials");
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: "Тест по технике безопасности" },
    { id: 2, title: "Тест по продукту" },
  ]);
  // trainings: { id, title, attachments: [url], ... }
  const [trainings, setTrainings] = useState([]);
  const [loadingTrainings, setLoadingTrainings] = useState(false);
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

  // Загрузка материалов с сервера
  useEffect(() => {
    setLoadingTrainings(true);
    fetch('/api/trainings')
      .then(res => res.json())
      .then(data => setTrainings(Array.isArray(data) ? data : []))
      .finally(() => setLoadingTrainings(false));
  }, []);

  // Добавление материала через API
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterialTitle.trim()) return;
    const res = await fetch('/api/trainings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newMaterialTitle.trim(), description: '', attachments: [] })
    });
    if (res.ok) {
      const added = await res.json();
      setTrainings(prev => [added, ...prev]);
      setNewMaterialTitle("");
      setShowAddMaterialModal(false);
    } else {
      alert('Ошибка добавления материала');
    }
  };

  // Загрузка файла и добавление ссылки к материалу
  const handleFileChange = async (materialId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    // Загрузка файла
    const uploadRes = await fetch('/api/files', {
      method: 'POST',
      body: formData
    });
    if (!uploadRes.ok) {
      alert('Ошибка загрузки файла');
      return;
    }
    const { fileUrls } = await uploadRes.json();
    const fileUrl = fileUrls && fileUrls[0];
    if (!fileUrl) return;
    // Обновление материала (добавление ссылки)
    const mat = trainings.find(t => t.id === materialId || t._id === materialId);
    const attachments = Array.isArray(mat.attachments) ? [...mat.attachments, fileUrl] : [fileUrl];
    const updateRes = await fetch('/api/trainings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: materialId, attachments })
    });
    if (updateRes.ok) {
      setTrainings(prev => prev.map(t => (t.id === materialId || t._id === materialId) ? { ...t, attachments } : t));
    } else {
      alert('Ошибка обновления материала');
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
            {loadingTrainings ? (
              <div className="text-slate-500">Загрузка...</div>
            ) : trainings.length === 0 ? (
              <div className="text-slate-500">Нет материалов</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {trainings.map((t) => (
                  <div key={t.id || t._id} className="rounded-2xl bg-white/90 border border-slate-200 shadow p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-sky-800">{t.title}</div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 transition" onClick={() => alert('Редактировать материал пока не реализовано')}>Редактировать</button>
                          <button className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition" onClick={() => handleDeleteMaterial(t.id || t._id)}>Удалить</button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {t.attachments && t.attachments.length > 0 && (
                        <ul className="list-disc pl-5 text-slate-700 text-sm">
                          {t.attachments.map((url, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-sky-700">Файл {idx+1}</a>
                              {isAdmin && (
                                <button className="text-xs px-1 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200 transition" onClick={() => handleDeleteFile(t.id || t._id, url)}>Удалить</button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {isAdmin && (
                        <label className="inline-block cursor-pointer mt-2">
                          <span className="rounded bg-emerald-600 text-white px-4 py-1 text-sm font-semibold hover:bg-emerald-700 transition">Добавить файл</span>
                          <input type="file" className="hidden" onChange={e => handleFileChange(t.id || t._id, e)} />
                        </label>
                      )}
                    </div>
                    // Удаление материала (UI + сервер)
                    const handleDeleteMaterial = async (materialId) => {
                      if (!window.confirm('Удалить материал?')) return;
                      // Можно реализовать удаление через API, если есть DELETE /api/trainings
                      // Пока только UI:
                      setTrainings(prev => prev.filter(t => (t.id || t._id) !== materialId));
                      // TODO: добавить fetch на сервер, если потребуется
                    };

                    // Удаление файла из материала (UI + сервер)
                    const handleDeleteFile = async (materialId, fileUrl) => {
                      if (!window.confirm('Удалить файл из материала?')) return;
                      setTrainings(prev => prev.map(t =>
                        (t.id === materialId || t._id === materialId)
                          ? { ...t, attachments: t.attachments.filter(url => url !== fileUrl) }
                          : t
                      ));
                      // TODO: добавить fetch на сервер, если потребуется
                    };
                  </div>
                ))}
              </div>
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
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
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

                
