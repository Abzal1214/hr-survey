'use client';

import { useState, useEffect } from 'react';

const questions = [
  {
    id: 1,
    text: 'Что нужно делать при обнаружении нарушения техники безопасности в аквапарке?',
    options: ['Игнорировать', 'Немедленно сообщить руководителю', 'Исправить самостоятельно', 'Записать в журнал через час'],
    correct: 'Немедленно сообщить руководителю'
  },
  {
    id: 2,
    text: 'Как правильно приветствовать гостя аквапарка?',
    options: ['Кивнуть головой', 'Улыбнуться и поздороваться по имени если известно', 'Махнуть рукой', 'Подождать пока гость сам заговорит'],
    correct: 'Улыбнуться и поздороваться по имени если известно'
  },
  {
    id: 3,
    text: 'Что означает аббревиатура AQUA COIN?',
    options: ['Система штрафов', 'Программа лояльности для сотрудников', 'Платёжная система для гостей', 'Внутренний документ'],
    correct: 'Программа лояльности для сотрудников'
  },
  {
    id: 4,
    text: 'Как следует поступить если гость жалуется на качество обслуживания?',
    options: ['Спорить с гостем', 'Выслушать, извиниться и предложить решение', 'Позвать другого сотрудника и уйти', 'Сказать что это не ваша зона ответственности'],
    correct: 'Выслушать, извиниться и предложить решение'
  },
  {
    id: 5,
    text: 'Какова максимальная глубина детских бассейнов в аквапарке Hawaii&Miami?',
    options: ['50 см', '80 см', '120 см', '150 см'],
    correct: '50 см'
  },
  {
    id: 6,
    text: 'Что необходимо проверить перед открытием рабочего места?',
    options: ['Только чистоту', 'Чистоту, исправность оборудования и наличие расходников', 'Только наличие товара', 'Присутствие коллег'],
    correct: 'Чистоту, исправность оборудования и наличие расходников'
  },
  {
    id: 7,
    text: 'Как часто проводятся плановые тренинги для сотрудников?',
    options: ['Раз в год', 'Раз в квартал', 'По усмотрению сотрудника', 'Только при приёме на работу'],
    correct: 'Раз в квартал'
  },
  {
    id: 8,
    text: 'Что нужно делать при несчастном случае с гостем?',
    options: ['Убежать', 'Вызвать медика и сообщить руководителю немедленно', 'Попросить гостя подождать', 'Написать отчёт после смены'],
    correct: 'Вызвать медика и сообщить руководителю немедленно'
  },
  {
    id: 9,
    text: 'Какое поведение запрещено сотрудникам на рабочем месте?',
    options: ['Улыбаться гостям', 'Использовать телефон в личных целях во время работы', 'Помогать коллегам', 'Предлагать дополнительные услуги'],
    correct: 'Использовать телефон в личных целях во время работы'
  },
  {
    id: 10,
    text: 'Как начисляются AQUA COIN сотрудникам?',
    options: ['Автоматически каждый месяц', 'За активность, прохождение тестов и положительные отзывы гостей', 'Только за выход на работу', 'Выдаются наличными'],
    correct: 'За активность, прохождение тестов и положительные отзывы гостей'
  },
];

export default function TestsPage() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [alreadyPassed, setAlreadyPassed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return;
    const user = JSON.parse(stored);
    setCurrentUser(user);
    // Проверить, уже ли пройден тест
    fetch('/api/tests')
      .then(r => r.json())
      .then(tests => {
        const passed = tests.some(t => t.phone === user.phone && t.score >= 70);
        setAlreadyPassed(passed);
      })
      .catch(() => {});
  }, []);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const correct = questions.filter(q => answers[q.id] === q.correct).length;
    const percent = Math.round((correct / questions.length) * 100);
    setResult({ correct, percent });

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, score: percent, timestamp: new Date().toISOString(), phone: currentUser?.phone })
      });
      const data = await res.json();
      if (percent >= 70) {
        setAlreadyPassed(true);
        if (!data.alreadyPassed && data.bonus > 0 && currentUser) {
          const updated = { ...currentUser, points: (currentUser.points || 0) + data.bonus };
          setCurrentUser(updated);
          localStorage.setItem('currentUser', JSON.stringify(updated));
          window.dispatchEvent(new Event('userChanged'));
        }
      }
      if (data.alreadyPassed) {
        setMessage('Вы уже получили AQUA COIN за этот тест ранее. Повторное начисление не производится.');
      } else {
        setMessage(percent === 100 ? 'Идеальный результат! +5 AQUA COIN начислено.' : percent >= 70 ? 'Тест пройден! +3 AQUA COIN начислено.' : 'Результаты сохранены. Для получения баллов нужно 70%.');
      }
    } catch (error) {
      setMessage('Ошибка: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl">🧠</div>
          <h1 className="text-3xl font-bold text-white drop-shadow mt-4">Тест для сотрудников</h1>
          <p className="text-white/80 mt-2">10 вопросов · Нужно 70% для получения AQUA COIN</p>
        </div>

        {alreadyPassed && !result ? (
          <div className="bg-white rounded-[32px] p-10 shadow-2xl text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Тест уже пройден!</h2>
            <p className="text-lg text-slate-600 mb-2">Вы успешно прошли тест и получили AQUA COIN.</p>
            <p className="text-sm text-slate-500">Пересдача недоступна — монеты начисляются только один раз.</p>
          </div>
        ) : result ? (
          <div className="bg-white rounded-[32px] p-10 shadow-2xl text-center">
            <div className="text-6xl mb-4">{result.percent >= 70 ? '🏆' : '📚'}</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{result.percent}%</h2>
            <p className="text-lg text-slate-600 mb-2">Правильных ответов: {result.correct} из {questions.length}</p>
            <p className={`text-lg font-semibold mb-6 ${result.percent >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>
              {result.percent >= 70 ? '✅ Тест пройден успешно!' : '❌ Недостаточно правильных ответов'}
            </p>
            {message && <p className="text-sm text-slate-500 mb-6">{message}</p>}
            {result.percent < 70 && (
              <button
                onClick={() => { setAnswers({}); setResult(null); setMessage(''); }}
                className="rounded-full bg-emerald-600 text-white px-8 py-3 font-semibold hover:bg-emerald-700 transition"
              >
                Попробовать ещё раз
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {questions.map((question, idx) => (
              <div key={question.id} className="rounded-[24px] bg-white/95 p-6 shadow-lg border border-white/60">
                <p className="font-semibold text-slate-900 mb-4"><span className="text-emerald-600">{idx + 1}.</span> {question.text}</p>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <label key={option} className={`flex items-center gap-3 cursor-pointer rounded-2xl px-4 py-3 border transition ${
                      answers[question.id] === option
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                    }`}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswer(question.id, option)}
                        className="accent-emerald-600"
                      />
                      <span className="text-slate-800">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={Object.keys(answers).length < questions.length}
              className="w-full rounded-full bg-emerald-600 text-white py-4 font-bold text-lg hover:bg-emerald-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg"
            >
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
