"use client";
import { useEffect, useState } from "react";
import KebabMenu from "../components/KebabMenu";

const DEPARTMENTS = [
  "Все отделы",
  "Аквапарк",
  "Ресторан",
  "SPA",
  "Магазин",
  "Офис",
];

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("Все отделы");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [myMentors, setMyMentors] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  // Load mentors
  useEffect(() => {
    fetch("/api/mentors")
      .then((r) => r.json())
      .then(setMentors)
      .catch(() => setMentors([]));
  }, []);

  // Load user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === "admin");
      }
    } catch {}
  }, []);

  // Find my mentor and tasks for employee
  useEffect(() => {
    if (user && user.role === "employee" && user.department) {
      const foundMentors = mentors.filter((m) => m.department === user.department);
      setMyMentors(foundMentors);
      fetch(`/api/mentor-tasks?employeePhone=${user.phone}`)
        .then((r) => r.json())
        .then(setMyTasks)
        .catch(() => setMyTasks([]));
    } else {
      setMyMentors([]);
      setMyTasks([]);
    }
  }, [user, mentors]);

  return (
    <div className="min-h-screen relative">
      {/* Фоновое изображение */}
      <div className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/bg.jpg')"}} aria-hidden="true" />
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-sky-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">
            Команда
          </span>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            🧑‍🏫 Наставники
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 text-lg">
            Опытные сотрудники, готовые помочь
          </p>
          {(user?.role === "admin" || isAdmin) && (
            <button
              onClick={() => alert("Назначение наставника (реализуйте модалку)")}
              className="mt-6 rounded-full bg-white/20 border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition backdrop-blur-sm"
            >
              + Назначить наставника
            </button>
          )}
        </div>
      </div>

      {/* Только для сотрудника: показываем только его наставника и задачи */}
      {user?.role === "employee" ? (
        myMentors.length > 0 ? (
          <div className="max-w-2xl mx-auto -mt-12 mb-8 bg-white/70 rounded-xl shadow border border-sky-100 backdrop-blur-md p-4 flex flex-col gap-2">
            <div className="flex items-center gap-4">
              {myMentors[0]?.photoUrl ? (
                <img
                  src={myMentors[0].photoUrl}
                  alt={myMentors[0].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-sky-300"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-xl font-bold text-sky-600">
                  👤
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight">
                  {myMentors[0].name}
                </span>
                {myMentors[0].position && (
                  <span className="text-sky-600 text-xs font-medium leading-tight">
                    {myMentors[0].position}
                  </span>
                )}
                {myMentors[0].department && (
                  <span className="text-xs text-slate-400 mt-0.5">
                    {myMentors[0].department}
                  </span>
                )}
                {myMentors[0].phone && (
                  <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <span className="text-rose-500">📞</span>
                    {myMentors[0].phone}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2">
              <div className="font-semibold text-slate-700 mb-1">Задачи от наставника</div>
              {myTasks.length === 0 ? (
                <div className="text-slate-400 text-sm">Нет задач от наставника.</div>
              ) : (
                <ul className="space-y-1">
                  {myTasks.map((task) => (
                    <li
                      key={task._id}
                      className="rounded bg-sky-50 px-3 py-1 flex items-center gap-2 border border-sky-100 text-sm"
                    >
                      <span className={task.completed ? "line-through text-slate-400" : "text-slate-800"}>
                        📝 {task.title}
                      </span>
                      {task.completed && <span className="ml-2 text-xs text-emerald-600">✔</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto -mt-12 mb-8 bg-white/70 rounded-xl shadow border border-sky-100 backdrop-blur-md p-4 text-center text-slate-400">
            У вас пока нет назначенного наставника.
          </div>
        )
      ) : (
        <>
          <div className="max-w-5xl mx-auto px-2 py-6">
            <div className="flex gap-2 flex-wrap mb-6 justify-center">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                    filter === d
                      ? "bg-sky-500 text-white shadow"
                      : "bg-white/80 text-slate-600 border border-slate-200 hover:bg-sky-50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            {mentors.length === 0 ? (
              <div className="rounded-xl bg-white/70 p-8 text-center text-slate-500 shadow">
                Наставников пока нет.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mentors
                  .filter((m) => filter === "Все отделы" || m.department === filter)
                  .map((mentor) => (
                    <div
                      key={mentor._id}
                      className="relative group bg-white/80 rounded-xl p-4 shadow border border-sky-100 flex flex-col items-center"
                    >
                      {isAdmin && (
                        <div className="absolute top-3 right-3 z-10">
                          <KebabMenu
                            onEdit={() => alert("Редактировать наставника (реализуйте модалку)")}
                            onDelete={() => alert("Удалить наставника (реализуйте удаление)")}
                          />
                        </div>
                      )}
                      {mentor.photoUrl ? (
                        <img
                          src={mentor.photoUrl}
                          alt={mentor.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-sky-300 mb-3"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center text-3xl font-bold text-sky-600 mb-3">
                          👤
                        </div>
                      )}
                      <span className="font-bold text-slate-900 leading-tight text-lg mb-1">
                        {mentor.name}
                      </span>
                      {mentor.position && (
                        <span className="text-sky-600 text-xs font-medium leading-tight mb-1">
                          {mentor.position}
                        </span>
                      )}
                      {mentor.department && (
                        <span className="text-xs text-slate-400 mb-1">{mentor.department}</span>
                      )}
                      {mentor.phone && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                          <span className="text-rose-500">📞</span>
                          {mentor.phone}
                        </span>
                      )}
                      {mentor.email && (
                        <a
                          href={`mailto:${mentor.email}`}
                          className="text-sm text-slate-600 hover:text-sky-600 transition truncate mb-1"
                        >
                          ✉️ {mentor.email}
                        </a>
                      )}
                      <button
                        className="mt-2 text-sky-500 hover:underline text-xs"
                        onClick={() => setSelectedMentor(mentor)}
                      >
                        Подробнее
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {selectedMentor && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedMentor(null)}
            >
              <div
                className="relative w-full max-w-lg rounded-[32px] bg-white shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedMentor.photoUrl ? (
                  <img
                    src={selectedMentor.photoUrl}
                    alt={selectedMentor.name}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-8xl">
                    👤
                  </div>
                )}
                <div className="p-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                    {selectedMentor.name}
                  </h2>
                  {selectedMentor.position && (
                    <div className="text-sky-600 text-sm font-medium mb-1">
                      {selectedMentor.position}
                    </div>
                  )}
                  {selectedMentor.department && (
                    <div className="text-xs text-slate-400 mb-2">
                      {selectedMentor.department}
                    </div>
                  )}
                  {selectedMentor.bio && (
                    <div className="text-slate-700 text-sm mb-4">
                      {selectedMentor.bio}
                    </div>
                  )}
                  {selectedMentor.phone && (
                    <a
                      href={`tel:${selectedMentor.phone}`}
                      className="block text-slate-600 hover:text-emerald-600 text-sm mb-1"
                    >
                      📞 {selectedMentor.phone}
                    </a>
                  )}
                  {selectedMentor.email && (
                    <a
                      href={`mailto:${selectedMentor.email}`}
                      className="block text-slate-600 hover:text-sky-600 text-sm"
                    >
                      ✉️ {selectedMentor.email}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="absolute top-4 right-4 text-2xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
