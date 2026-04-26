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

      {tab === "tests" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Тесты</h2>
          {quizzes.length === 0 ? (
            <div className="text-slate-500">Нет тестов</div>
          ) : (
            <ul>
              {quizzes.map((quiz) => (
                <li key={quiz.id || quiz._id}>{quiz.title}</li>
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
    </div>
  );
}

                
