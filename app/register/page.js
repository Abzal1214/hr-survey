'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    phone: '',
    password: '',
    department: '',
  });
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setMessage('Пароль должен быть не меньше 6 символов');
      return;
    }
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setMessage('Регистрация прошла успешно. Ожидайте, когда администратор назначит вам должность.');
      } else {
        setMessage(data.error || 'Ошибка регистрации');
      }
    } catch (error) {
      setMessage('Ошибка: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 border border-white/60">
        <div className="text-center mb-8">
          <div className="text-5xl">📝</div>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Саморегистрация сотрудника</h1>
          <p className="text-slate-600 mt-2">Заполните данные для доступа к обучению и тестам.</p>
        </div>
        {submitted ? (
          <div className="rounded-2xl bg-green-50 p-6 text-green-800">
            <h2 className="text-xl font-semibold mb-2">Спасибо!</h2>
            <p>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Имя <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  placeholder="Иван"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Фамилия <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  placeholder="Иванов"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Логин <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                placeholder="ivan_ivanov"
              />
              <p className="text-xs text-slate-500 mt-1">Используется для входа вместо номера телефона</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Номер телефона <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Пароль <span className="text-red-500">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                placeholder="Минимум 6 символов"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Отдел <span className="text-red-500">*</span></label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
              >
                <option value="">Выберите отдел</option>
                <option value="Аквапарк">Аквапарк</option>
                <option value="Ресторан">Ресторан</option>
                <option value="SPA">SPA</option>
                <option value="Магазин">Магазин</option>
                <option value="Офис">Офис</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Должность будет назначена администратором</p>
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 text-white py-3 text-lg font-semibold hover:bg-slate-800 transition"
            >
              Зарегистрироваться
            </button>
            {message && <p className="text-sm text-red-600">{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const positions = {
    Аквапарк: ['кассир', 'инструктор'],
    Ресторан: ['бармен', 'раннер', 'официант'],
    SPA: ['администратор SPA', 'спа-терапевт'],
    Магазин: ['кассир магазина', 'продавец'],
    Офис: ['менеджер', 'бухгалтер', 'HR']
  };

  const availablePositions = () => {
    return positions[formData.department] || [];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setMessage('Пароль должен быть не меньше 6 символов');
      return;
    }
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setMessage('Регистрация прошла успешно. Вы можете войти через админку или ждать одобрения.');
      } else {
        setMessage(data.error || 'Ошибка регистрации');
      }
    } catch (error) {
      setMessage('Ошибка: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 border border-white/60">
        <div className="text-center mb-8">
          <div className="text-5xl">📝</div>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Саморегистрация сотрудника</h1>
          <p className="text-slate-600 mt-2">Заполните данные для доступа к обучению и тестам.</p>
        </div>
        {submitted ? (
          <div className="rounded-2xl bg-green-50 p-6 text-green-800">
            <h2 className="text-xl font-semibold mb-2">Спасибо!</h2>
            <p>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Имя</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                placeholder="Ваше имя"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Телефон</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                placeholder="🇰🇿 +7 (999) 123-45-67"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                placeholder="Минимум 6 символов"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Отдел</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
              >
                <option value="">Выберите отдел</option>
                <option value="Аквапарк">Аквапарк</option>
                <option value="Ресторан">Ресторан</option>
                <option value="SPA">SPA</option>
                <option value="Магазин">Магазин</option>
                <option value="Офис">Офис</option>
              </select>
            </div>
            {formData.department && (
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Должность</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                >
                  <option value="">Выберите должность</option>
                  {availablePositions().map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 text-white py-3 text-lg font-semibold hover:bg-slate-800 transition"
            >
              Зарегистрироваться
            </button>
            {message && <p className="text-sm text-red-600">{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
