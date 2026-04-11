'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import KebabMenu from '../components/KebabMenu';

const departmentPositions = {
  Аквапарк: ['кассир', 'инструктор'],
  Ресторан: ['бармен', 'раннер', 'официант'],
  SPA: ['администратор SPA', 'спа-терапевт'],
  Магазин: ['кассир магазина', 'продавец'],
  Офис: ['менеджер', 'бухгалтер', 'HR']
};

const initialEmployeeForm = {
  name: '',
  surname: '',
  username: '',
  phone: '',
  password: '',
  department: '',
  position: '',
  points: 0
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '', department: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [testsData, setTestsData] = useState([]);

  // Auto-login from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        setIsLoggedIn(true);
        if (user.role === 'admin') fetchAdminData();
      }
      // Restore saved credentials
      const remembered = localStorage.getItem('rememberedLogin');
      if (remembered) setLoginData(JSON.parse(remembered));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const mapDepartment = (user) => {
    if (user.department) return user.department;
    if (user.workplaceType === 'restaurant') return 'Ресторан';
    if (user.workplaceType === 'waterpark') return 'Аквапарк';
    return user.workplaceType || '';
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Не удалось получить список пользователей');
      }
      const users = await response.json();
      const normalizePhone = (value) => String(value).replace(/\D/g, '');
      const enteredLogin = loginData.username.trim();
      const enteredPhone = normalizePhone(enteredLogin);
      const matchedUser = users.find((user) => {
        const phoneMatch = enteredPhone && normalizePhone(user.phone) === enteredPhone;
        const usernameMatch = user.username && user.username.toLowerCase() === enteredLogin.toLowerCase();
        return (phoneMatch || usernameMatch) && user.password === loginData.password && mapDepartment(user).toLowerCase() === loginData.department.toLowerCase();
      });

      if (matchedUser) {
        const user = { ...matchedUser, role: matchedUser.role || 'employee' };
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('rememberedLogin', JSON.stringify({ username: loginData.username, password: loginData.password, department: loginData.department }));
        window.dispatchEvent(new Event('userChanged'));
        if (matchedUser.role === 'admin') {
          await fetchAdminData();
        }
      } else if (loginData.username === 'admin' && loginData.password === 'admin') {
        const user = { name: 'Администратор', role: 'admin' };
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('rememberedLogin', JSON.stringify({ username: loginData.username, password: loginData.password, department: loginData.department }));
        window.dispatchEvent(new Event('userChanged'));
        await fetchAdminData();
      } else {
        alert('Неверный логин или пароль');
      }
    } catch (error) {
      alert('Ошибка входа: ' + error.message);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, testsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/tests'),
      ]);

      if (usersRes.ok && testsRes.ok) {
        const [users, tests] = await Promise.all([
          usersRes.json(),
          testsRes.json(),
        ]);
        setUsersData(users);
        setTestsData(tests);
      } else {
        throw new Error('Ошибка при загрузке данных');
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsersData([]);
    setTestsData([]);
    setEmployeeForm(initialEmployeeForm);
    setSelectedUser(null);
    setAdminMessage('');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('userChanged'));
    // Restore saved credentials so form is pre-filled
    try {
      const remembered = localStorage.getItem('rememberedLogin');
      if (remembered) setLoginData(JSON.parse(remembered));
      else setLoginData({ username: '', password: '', department: '' });
    } catch {
      setLoginData({ username: '', password: '', department: '' });
    }
  };

  const handleExport = () => {
    window.location.href = '/api/export';
  };

  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (employeeForm.password.length < 6) {
      setAdminMessage('Пароль должен быть не меньше 6 символов');
      return;
    }
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      });
      const data = await response.json();
      if (response.ok) {
        setAdminMessage('Сотрудник добавлен');
        setEmployeeForm(initialEmployeeForm);
        await fetchAdminData();
      } else {
        setAdminMessage(data.error || 'Ошибка добавления сотрудника');
      }
    } catch (error) {
      setAdminMessage('Ошибка: ' + error.message);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEmployeeForm({
      name: user.name || '',
      surname: user.surname || '',
      username: user.username || '',
      phone: user.phone,
      password: '',
      department: user.department || user.workplaceType || '',
      position: user.position || '',
      points: user.points ?? 0,
    });
    setAdminMessage('Редактируется сотрудник ' + user.name);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setAdminMessage('Выберите сотрудника для редактирования');
      return;
    }
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPhone: selectedUser.phone,
          name: employeeForm.name,
          surname: employeeForm.surname,
          username: employeeForm.username,
          phone: employeeForm.phone,
          password: employeeForm.password || selectedUser.password,
          department: employeeForm.department,
          position: employeeForm.position,
          points: employeeForm.points,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setAdminMessage('Данные сотрудника обновлены');
        setSelectedUser(null);
        setEmployeeForm(initialEmployeeForm);
        await fetchAdminData();
      } else {
        setAdminMessage(data.error || 'Ошибка обновления сотрудника');
      }
    } catch (error) {
      setAdminMessage('Ошибка: ' + error.message);
    }
  };

  const handleDeleteEmployee = (user) => {
    setConfirmModal({ message: `Удалить сотрудника ${user.name}?`, onConfirm: async () => {
      setConfirmModal(null);
      try {
        const response = await fetch('/api/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.phone }),
        });
        const data = await response.json();
        if (response.ok) {
          setAdminMessage('Сотрудник удален');
          if (selectedUser?.phone === user.phone) {
            setSelectedUser(null);
            setEmployeeForm(initialEmployeeForm);
          }
          await fetchAdminData();
        } else {
          setAdminMessage(data.error || 'Ошибка удаления сотрудника');
        }
      } catch (error) {
        setAdminMessage('Ошибка: ' + error.message);
      }
    }});
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.description) {
      setAdminMessage('Заполните заголовок и описание новости');
      return;
    }
    let imageUrl = '';
    try {
      if (newsImageFile) {
        const formData = new FormData();
        formData.append('files', newsImageFile);
        const uploadResponse = await fetch('/api/files', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          setAdminMessage(uploadData.error || 'Ошибка загрузки картинки');
          return;
        }
        imageUrl = uploadData.fileUrls?.[0] || '';
      }

      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newsForm, imageUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setAdminMessage('Новость добавлена');
        setNewsForm({ title: '', description: '' });
        setNewsImageFile(null);
        await fetchAdminData();
      } else {
        setAdminMessage(data.error || 'Ошибка добавления новости');
      }
    } catch (error) {
      setAdminMessage('Ошибка: ' + error.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-scale-in">
          {/* Card */}
          <div className="rounded-[28px] bg-white/95 shadow-2xl p-8 border border-white/60">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                🔐
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Вход в систему</h1>
              <p className="text-slate-500 mt-1 text-sm">Войдите для доступа к личному кабинету</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Телефон / логин</label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition"
                  placeholder="Логин или номер телефона"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Отдел</label>
                <select
                  name="department"
                  value={loginData.department}
                  onChange={handleLoginChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:border-sky-400 focus:bg-white transition"
                >
                  <option value="">Выберите отдел</option>
                  <option value="Аквапарк">Аквапарк</option>
                  <option value="Ресторан">Ресторан</option>
                  <option value="SPA">SPA</option>
                  <option value="Магазин">Магазин</option>
                  <option value="Офис">Офис</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Пароль</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white py-3.5 font-bold text-base hover:from-sky-600 hover:to-emerald-600 transition shadow-lg mt-2"
              >
                Войти
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Нет аккаунта?{' '}
              <a href="/register" className="text-sky-600 font-semibold hover:underline">Зарегистрироваться</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'employee') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,_#fdf4ff,_#e0f2fe)] p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-100 via-sky-100 to-yellow-100 backdrop-blur-xl p-8 rounded-[36px] shadow-2xl shadow-slate-200/40 border border-slate-200/80 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">Личный кабинет</p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900">👋 Добро пожаловать, {currentUser.name}</h1>
                <p className="mt-3 text-slate-600">Здесь вы можете продолжить обучение, посмотреть новости и пройти опросы.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/learn"
                  className="rounded-2xl bg-sky-700 text-white px-6 py-3 font-semibold shadow-lg shadow-sky-700/10 hover:bg-sky-800 transition"
                >
                  📘 Тренинги
                </a>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl bg-emerald-600 text-white px-6 py-3 font-semibold shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition"
                >
                  🚪 Выйти
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-[28px] bg-emerald-50 p-6 border border-emerald-100 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Имя</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{currentUser.name}</p>
              </div>
              <div className="rounded-[28px] bg-sky-50 p-6 border border-sky-100 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">Телефон</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{currentUser.phone}</p>
              </div>
              <div className="rounded-[28px] bg-yellow-50 p-6 border border-yellow-100 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-700">Должность</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{currentUser.position}</p>
              </div>
              <div className="rounded-[28px] bg-white p-6 border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Отдел</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{currentUser.department || currentUser.workplaceType || '—'}</p>
              </div>
              <div className="rounded-[28px] bg-emerald-50 p-6 border border-emerald-100 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Баллы</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{currentUser.points ?? 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a href="/news" className="block rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-200 transition">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.35em]">Новости</p>
                <p className="mt-4 text-lg font-semibold text-slate-900">Следите за событиями бренда</p>
              </a>
              <a href="/surveys" className="block rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-200 transition">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.35em]">Опросы</p>
                <p className="mt-4 text-lg font-semibold text-slate-900">Оставьте отзыв о работе и обучении</p>
              </a>
              <a href="/tests" className="block rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-200 transition">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.35em]">Тесты</p>
                <p className="mt-4 text-lg font-semibold text-slate-900">Пройдите проверку знаний</p>
              </a>
              <a href="/learn" className="block rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-200 transition">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.35em]">Материалы</p>
                <p className="mt-4 text-lg font-semibold text-slate-900">Смотрите презентации и информационные листы</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,_#fdf4ff,_#e0f2fe)] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-100 via-sky-100 to-yellow-100 backdrop-blur-xl p-8 rounded-[36px] shadow-2xl shadow-slate-200/40 border border-slate-200/80 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">Панель Hawaii&Miami · SanRemo</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">📊 Админ портала</h1>
              <p className="mt-3 text-slate-600">Управление отзывами, регистрациями и результатами обучения.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleExport}
                className="rounded-2xl bg-sky-700 text-white px-6 py-3 font-semibold shadow-lg shadow-sky-700/10 hover:bg-sky-800 transition"
              >
                📥 Скачать отчет
              </button>
              <button
                onClick={handleLogout}
                className="rounded-2xl bg-emerald-600 text-white px-6 py-3 font-semibold shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition"
              >
                🚪 Выйти
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-[28px] bg-sky-50 p-6 border border-sky-100 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">Зарегистрировано</p>
              <p className="mt-4 text-4xl font-bold text-slate-900">{usersData.length}</p>
            </div>
            <div className="rounded-[28px] bg-yellow-50 p-6 border border-yellow-100 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-700">Тесты</p>
              <p className="mt-4 text-4xl font-bold text-slate-900">{testsData.length}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr] mb-6">
            <div className="space-y-6">
              <section className="rounded-[36px] bg-white/90 p-6 shadow-2xl border border-slate-200/80 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Добавить / редактировать сотрудника</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Имя</label>
                      <input
                        name="name"
                        value={employeeForm.name}
                        onChange={handleEmployeeFormChange}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                        placeholder="Имя"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Фамилия</label>
                      <input
                        name="surname"
                        value={employeeForm.surname}
                        onChange={handleEmployeeFormChange}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                        placeholder="Фамилия"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Логин</label>
                    <input
                      name="username"
                      value={employeeForm.username}
                      onChange={handleEmployeeFormChange}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                      placeholder="login123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Телефон</label>
                    <input
                      name="phone"
                      value={employeeForm.phone}
                      onChange={handleEmployeeFormChange}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Пароль</label>
                    <input
                      name="password"
                      type="password"
                      value={employeeForm.password}
                      onChange={handleEmployeeFormChange}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                      placeholder="Минимум 6 символов"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Отдел</label>
                    <select
                      name="department"
                      value={employeeForm.department}
                      onChange={handleEmployeeFormChange}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                    >
                      <option value="">Выберите отдел</option>
                      {Object.keys(departmentPositions).map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Должность</label>
                    <select
                      name="position"
                      value={employeeForm.position}
                      onChange={handleEmployeeFormChange}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                    >
                      <option value="">Выберите должность</option>
                      {(departmentPositions[employeeForm.department] || []).map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Баллы</label>
                    <input
                      name="points"
                      type="number"
                      value={employeeForm.points}
                      onChange={handleEmployeeFormChange}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleAddEmployee}
                      className="rounded-2xl bg-emerald-600 text-white px-6 py-3 font-semibold hover:bg-emerald-700 transition"
                    >
                      Добавить сотрудника
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateEmployee}
                      disabled={!selectedUser}
                      className="rounded-2xl bg-sky-600 text-white px-6 py-3 font-semibold hover:bg-sky-700 transition disabled:opacity-50"
                    >
                      Обновить данные
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setEmployeeForm(initialEmployeeForm);
                        setAdminMessage('');
                      }}
                      className="rounded-2xl bg-slate-200 text-slate-900 px-6 py-3 font-semibold hover:bg-slate-300 transition"
                    >
                      Сбросить форму
                    </button>
                  </div>
                  {adminMessage && <p className="text-sm text-slate-700">{adminMessage}</p>}
                </form>
              </section>
            </div>
          </div>

          {!loading && usersData.length > 0 && (
            <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Зарегистрированные сотрудники</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm text-slate-900">
                  <thead className="bg-slate-100 text-slate-900">
                    <tr>
                      <th className="p-3 text-left">Имя</th>
                      <th className="p-3 text-left">Телефон</th>
                      <th className="p-3 text-left">Место работы</th>
                      <th className="p-3 text-left">Должность</th>
                      <th className="p-3 text-left">Дата регистрации</th>
                      <th className="p-3 text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.map((user, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-3 border-b text-slate-900">{user.name}</td>
                        <td className="p-3 border-b text-slate-900">{user.phone}</td>
                        <td className="p-3 border-b text-slate-900">{user.workplaceType === 'restaurant' ? 'Ресторан' : user.workplaceType === 'waterpark' ? 'Аквапарк' : user.department || '—'}</td>
                        <td className="p-3 border-b text-slate-900">{user.position}</td>
                        <td className="p-3 border-b text-slate-900">{new Date(user.registeredAt).toLocaleDateString('ru-RU')}</td>
                        <td className="p-3 border-b">
                          <KebabMenu
                            onEdit={() => handleSelectUser(user)}
                            onDelete={() => handleDeleteEmployee(user)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">💰 AQUA COIN — баллы сотрудников</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm text-slate-900">
                <thead className="bg-emerald-100 text-slate-900">
                  <tr>
                    <th className="p-3 text-left">Имя</th>
                    <th className="p-3 text-left">Телефон</th>
                    <th className="p-3 text-left">Отдел</th>
                    <th className="p-3 text-left">Баллы (AQUA COIN)</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((user, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-emerald-50' : 'bg-white'}>
                      <td className="p-3 border-b text-slate-900">{user.name}</td>
                      <td className="p-3 border-b text-slate-900">{user.phone}</td>
                      <td className="p-3 border-b text-slate-900">{mapDepartment(user)}</td>
                      <td className="p-3 border-b text-slate-900 font-bold text-emerald-700">{user.points ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}
