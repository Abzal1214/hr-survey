  // ВРЕМЕННО: выводим всех сотрудников в консоль для отладки
  useEffect(() => {
    if (usersData && usersData.length) {
      console.log('usersData:', usersData);
    } else {
      console.log('usersData пустой или не загружен');
    }
  }, [usersData]);
"use client";

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import ConfirmModal from '../components/ConfirmModal';
import KebabMenu from '../components/KebabMenu';
import GoldCoin from '../components/GoldCoin';

const DEFAULT_POSITIONS = {
  Аквапарк: ['кассир', 'инструктор'],
  Ресторан: ['бармен', 'раннер', 'официант'],
  SPA: ['администратор SPA', 'спа-терапевт'],
  Магазин: ['кассир магазина', 'продавец'],
  Офис: ['менеджер', 'бухгалтер', 'HR']
};

function loadPositions() {
  try {
    const saved = localStorage.getItem('departmentPositions');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_POSITIONS;
}

function savePositions(pos) {
  try { localStorage.setItem('departmentPositions', JSON.stringify(pos)); } catch {}
}

const initialEmployeeForm = {
  name: '',
  surname: '',
  username: '',
  phone: '',
  password: '',
  department: '',
  workplaceType: '', // Новый выбор аквапарка
  position: '',
  points: 0,
  role: 'employee',
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Фильтр по аквапарку
  const [waterparkFilter, setWaterparkFilter] = useState('all');
  const [loginData, setLoginData] = useState({ username: '', password: '', department: '' });
  const [loginError, setLoginError] = useState('');
  const [departmentPositions, setDepartmentPositions] = useState(DEFAULT_POSITIONS);
  const [newPositionInput, setNewPositionInput] = useState({ dept: '', value: '', show: false, context: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [testsData, setTestsData] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showEmployeeProfileForm, setShowEmployeeProfileForm] = useState(false);
  const [showAdminProfileForm, setShowAdminProfileForm] = useState(false);
  const [isVirtualAdmin, setIsVirtualAdmin] = useState(false);
  const [profileEditEnabled, setProfileEditEnabled] = useState(false);
  const [showPasswordResetFields, setShowPasswordResetFields] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    surname: '',
    username: '',
    phone: '',
    department: '',
    position: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileIdentity, setProfileIdentity] = useState({ id: '', phone: '', username: '' });

  // Auto-login from localStorage
  useEffect(() => {
    setDepartmentPositions(loadPositions());
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        setIsVirtualAdmin(Boolean(user?.role === 'admin' && !user?._id && !user?.id));
        if (user?.role === 'admin') setShowAdminProfileForm(true);
        setProfileIdentity({
          id: String(user._id || user.id || ''),
          phone: user.phone || '',
          username: user.username || '',
        });
        setIsLoggedIn(true);
        setProfileForm((prev) => ({
          ...prev,
          name: user.name || '',
          surname: user.surname || '',
          username: user.username || '',
          phone: user.phone || '',
          department: user.department || '',
          position: user.position || '',
        }));
        if (user.role === 'admin') fetchAdminData();
      }
      // Restore saved credentials
      const remembered = localStorage.getItem('rememberedLogin');
      if (remembered) setLoginData(JSON.parse(remembered));
    } catch {}
  }, []);
  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };
  const [confirmModal, setConfirmModal] = useState(null);
  const [staffPageSize, setStaffPageSize] = useState(10);
  const [staffPage, setStaffPage] = useState(1);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffSort, setStaffSort] = useState({ key: '', dir: 'asc' });
  const [coinSearch, setCoinSearch] = useState('');
  const [coinPage, setCoinPage] = useState(1);
  const [coinPageSize, setCoinPageSize] = useState(10);
  const [coinSort, setCoinSort] = useState({ key: 'points', dir: 'desc' });
  const employeeFormRef = useRef(null);
  const isProfileSuccessMessage = /успешно|обновлены/i.test(profileMessage);

  const sortData = (arr, { key, dir }) => {
    if (!key) return arr;
    return [...arr].sort((a, b) => {
      let av = key === 'fio' ? [a.name, a.surname].filter(Boolean).join(' ') : a[key];
      let bv = key === 'fio' ? [b.name, b.surname].filter(Boolean).join(' ') : b[key];
      if (key === 'registeredAt') { av = new Date(av); bv = new Date(bv); }
      if (key === 'points') { av = Number(av ?? 0); bv = Number(bv ?? 0); }
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const toggleSort = (setter, current, key) => {
    setter(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const SortTh = ({ label, sortKey, current, onToggle }) => {
    const active = current.key === sortKey;
    return (
      <th
        className="p-3 text-left cursor-pointer select-none hover:bg-slate-200 transition group"
        onClick={() => onToggle(sortKey)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <span className={`text-xs ${active ? 'text-emerald-600' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>
            {active ? (current.dir === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        </span>
      </th>
    );
  };

  const normalize = (str) => String(str || '').replace(/\s+/g, '').toLowerCase();
  const filteredStaff = usersData.filter((u) => {
    // Показываем только сотрудников с выбранным workplaceType (без учёта регистра и пробелов)
    return normalize(u.workplaceType) === normalize(waterparkFilter);
  }).filter((u) => {
    if (!staffSearch.trim()) return true;
    const q = staffSearch.trim().toLowerCase();
    return [
      u.name, u.surname, u.phone, u.username,
      u.department, u.position, u.points,
      new Date(u.registeredAt).toLocaleDateString('ru-RU'),
    ].some((v) => String(v ?? '').toLowerCase().includes(q));
  });

  const totalStaffPages = Math.max(1, Math.ceil(filteredStaff.length / staffPageSize));
  const currentStaffPage = Math.min(staffPage, totalStaffPages);
  const staffStart = (currentStaffPage - 1) * staffPageSize;
  const staffRows = sortData(filteredStaff, staffSort).slice(staffStart, staffStart + staffPageSize);

  useEffect(() => {
    setStaffPage(1);
  }, [staffPageSize, usersData.length, staffSearch]);

  useEffect(() => {
    setCoinPage(1);
  }, [coinPageSize, usersData.length, coinSearch]);

  const filteredCoins = coinSearch.trim()
    ? usersData.filter((u) => {
        const q = coinSearch.trim().toLowerCase();
        return [[u.name, u.surname].filter(Boolean).join(' '), u.phone, u.department].some((v) => String(v ?? '').toLowerCase().includes(q));
      })
    : usersData;
  const totalCoinPages = Math.max(1, Math.ceil(filteredCoins.length / coinPageSize));
  const currentCoinPage = Math.min(coinPage, totalCoinPages);
  const coinStart = (currentCoinPage - 1) * coinPageSize;
  const coinRows = sortData(filteredCoins, coinSort).slice(coinStart, coinStart + coinPageSize);

  const mapDepartment = (user) => {
    if (user.department) return user.department;
    if (user.workplaceType === 'restaurant') return 'Ресторан';
    if (user.workplaceType === 'waterpark') return 'Аквапарк';
    return user.workplaceType || '';
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    setLoginError('');
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Virtual admin bypass (hardcoded)
      if (loginData.username === 'admin' && loginData.password === 'admin123@') {
        const user = { name: 'Администратор', role: 'admin' };
        setCurrentUser(user);
        setIsVirtualAdmin(true);
        setShowAdminProfileForm(true);
        setProfileIdentity({ id: '', phone: '', username: 'admin' });
        setIsLoggedIn(true);
        setProfileForm((prev) => ({
          ...prev,
          name: user.name || '',
          surname: '',
          username: '',
          phone: '',
          department: '',
          position: '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }));
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('rememberedLogin', JSON.stringify({ username: loginData.username, password: loginData.password, department: loginData.department }));
        window.dispatchEvent(new Event('userChanged'));
        await fetchAdminData();
        return;
      }

      // Server-side authentication via /api/auth
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginData.username.trim(),
          password: loginData.password,
          department: loginData.department,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoginError(data.error || 'Неверный логин или пароль');
        return;
      }

      const user = { ...data.user, role: data.user.role || 'employee' };
      setCurrentUser(user);
      setIsVirtualAdmin(false);
      if (user.role === 'admin') setShowAdminProfileForm(true);
      setProfileIdentity({
        id: String(user._id || user.id || ''),
        phone: user.phone || '',
        username: user.username || '',
      });
      setIsLoggedIn(true);
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || '',
        surname: user.surname || '',
        username: user.username || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('rememberedLogin', JSON.stringify({ username: loginData.username, password: loginData.password, department: loginData.department }));
      window.dispatchEvent(new Event('userChanged'));
      if (user.role === 'admin') {
        await fetchAdminData();
      }
    } catch (error) {
      setLoginError('Ошибка входа: ' + error.message);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, testsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/quizzes'),
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
    setShowEmployeeProfileForm(false);
    setShowAdminProfileForm(false);
    setIsVirtualAdmin(false);
    setProfileEditEnabled(false);
    setShowPasswordResetFields(false);
    setProfileMessage('');
    setProfileForm({
      name: '',
      surname: '',
      username: '',
      phone: '',
      department: '',
      position: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setProfileIdentity({ id: '', phone: '', username: '' });
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

  const handleProfileSave = async (e) => {
    e.preventDefault();

    if (isVirtualAdmin) {
      setProfileMessage('Профиль встроенного admin/admin нельзя редактировать. Войдите под зарегистрированным админ-аккаунтом.');
      return;
    }

    if (showPasswordResetFields) {
      if (!profileForm.currentPassword) {
        setProfileMessage('Введите старый пароль');
        return;
      }
      if (!profileForm.newPassword || !profileForm.confirmNewPassword) {
        setProfileMessage('Заполните новый пароль и подтверждение');
        return;
      }
      if (profileForm.newPassword.length < 6) {
        setProfileMessage('Новый пароль должен быть не меньше 6 символов');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmNewPassword) {
        setProfileMessage('Новый пароль и подтверждение не совпадают');
        return;
      }
    }
    try {
      let targetUserId = profileIdentity.id || currentUser?._id || currentUser?.id;
      let targetOldPhone = profileIdentity.phone || currentUser?.phone || '';
      const targetLookupUsername = profileIdentity.username || currentUser?.username || '';

      // Some sessions (e.g., fallback admin login) may miss phone/id in currentUser.
      // Resolve target user from the latest users list by id, then username, then phone.
      if (!targetUserId || !targetOldPhone) {
        try {
          const usersRes = await fetch('/api/users');
          if (usersRes.ok) {
            const users = await usersRes.json();
            const normalize = (value) => String(value || '').replace(/\D/g, '');
            const byId = targetUserId
              ? users.find((u) => String(u._id || u.id) === String(targetUserId))
              : null;
            const byUsername = targetLookupUsername
              ? users.find((u) => (u.username || '').toLowerCase() === String(targetLookupUsername).toLowerCase())
              : null;
            const byPhone = targetOldPhone
              ? users.find((u) => normalize(u.phone) === normalize(targetOldPhone))
              : null;
            const resolved = byId || byUsername || byPhone;
            if (resolved) {
              targetUserId = resolved._id || resolved.id;
              targetOldPhone = resolved.phone || targetOldPhone;
            }
          }
        } catch {}
      }

      if (!targetUserId && !targetOldPhone) {
        setProfileMessage('Не удалось определить пользователя для сохранения');
        return;
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetUserId,
          oldPhone: targetOldPhone,
          lookupUsername: targetLookupUsername,
          name: profileForm.name,
          surname: profileForm.surname,
          username: profileForm.username,
          phone: profileForm.phone,
          department: profileForm.department,
          position: currentUser?.role === 'admin' ? undefined : profileForm.position,
          password: showPasswordResetFields ? profileForm.newPassword : undefined,
          currentPassword: showPasswordResetFields ? profileForm.currentPassword : undefined,
          avatar: profileForm.avatar,
          selfService: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setProfileMessage(data.error || 'Ошибка обновления профиля');
        return;
      }
      const updatedUserLocal = {
        ...currentUser,
        name: profileForm.name,
        surname: profileForm.surname,
        username: profileForm.username,
        phone: profileForm.phone,
        department: profileForm.department,
        position: currentUser?.role === 'admin' ? currentUser.position : profileForm.position,
      };

      // Refresh from API to guarantee UI reflects exactly what is stored in DB.
      let persistedUser = updatedUserLocal;
      try {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const users = await usersRes.json();
          const normalize = (value) => String(value || '').replace(/\D/g, '');
          const byPhone = users.find((u) => normalize(u.phone) === normalize(profileForm.phone));
          const byUsername = users.find((u) => (u.username || '').toLowerCase() === (profileForm.username || '').toLowerCase());
          const dbUser = byPhone || byUsername;
          if (dbUser) {
            persistedUser = {
              ...dbUser,
              role: dbUser.role || currentUser.role,
              password: showPasswordResetFields ? profileForm.newPassword : currentUser.password,
            };
          }
        }
      } catch {}

      setCurrentUser(persistedUser);
      setProfileIdentity({
        id: String(persistedUser._id || persistedUser.id || targetUserId || ''),
        phone: persistedUser.phone || profileForm.phone || targetOldPhone || '',
        username: persistedUser.username || profileForm.username || targetLookupUsername || '',
      });
      localStorage.setItem('currentUser', JSON.stringify(persistedUser));
      localStorage.setItem('rememberedLogin', JSON.stringify({
        username: profileForm.username || profileForm.phone,
        password: showPasswordResetFields ? profileForm.newPassword : (JSON.parse(localStorage.getItem('rememberedLogin') || '{}').password || ''),
        department: profileForm.department || currentUser.department || currentUser.workplaceType || '',
      }));
      setProfileForm((prev) => ({
        ...prev,
        newPassword: '',
        confirmNewPassword: '',
        currentPassword: '',
      }));
      setProfileEditEnabled(false);
      setShowPasswordResetFields(false);
      setProfileMessage('Успешно сохранено');
      window.dispatchEvent(new Event('userChanged'));
    } catch (error) {
      setProfileMessage('Ошибка: ' + error.message);
    }
  };

  const formatPhone = (digits) => {
    if (!digits.startsWith('7')) digits = '7' + digits.replace(/^7*/, '');
    digits = digits.slice(0, 11);
    let f = '+7';
    if (digits.length > 1) f += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) f += ')';
    if (digits.length > 4) f += ' ' + digits.slice(4, 7);
    if (digits.length > 7) f += '-' + digits.slice(7, 9);
    if (digits.length > 9) f += '-' + digits.slice(9, 11);
    return f;
  };

  const handleEmployeePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setEmployeeForm((prev) => ({ ...prev, phone: formatPhone(digits) }));
  };

  const handleEmployeePhoneKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const digits = employeeForm.phone.replace(/\D/g, '');
      if (digits.length > 1) {
        e.preventDefault();
        setEmployeeForm((prev) => ({ ...prev, phone: formatPhone(digits.slice(0, -1)) }));
      }
    }
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
        setShowEmployeeForm(false);
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
    setSelectedUserId(String(user._id || user.id || ''));
    setShowEmployeeForm(true);
    setEmployeeForm({
      name: user.name || '',
      surname: user.surname || '',
      username: user.username || '',
      phone: user.phone,
      password: '',
      department: user.department || user.workplaceType || '',
      position: user.position || '',
      points: user.points ?? 0,
      role: user.role || 'employee',
    });
    setAdminMessage('Редактируется сотрудник ' + user.name);
    setTimeout(() => { const el = employeeFormRef.current; if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }, 50);
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
          id: selectedUserId,
          oldPhone: selectedUser.phone,
          name: employeeForm.name,
          surname: employeeForm.surname,
          username: employeeForm.username,
          phone: employeeForm.phone,
          password: employeeForm.password || selectedUser.password,
          department: employeeForm.department,
          position: employeeForm.position,
          points: employeeForm.points,
          role: employeeForm.role,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setAdminMessage('');
        setSelectedUser(null);
        setSelectedUserId('');
        setEmployeeForm(initialEmployeeForm);
        setShowEmployeeForm(false);
        showToast('✅ Данные сотрудника успешно сохранены');
        await fetchAdminData();
      } else {
        setAdminMessage(data.error || 'Ошибка обновления сотрудника');
      }
    } catch (error) {
      setAdminMessage('Ошибка: ' + error.message);
    }
  };

  const handleCloseEmployeeForm = () => {
    setSelectedUser(null);
    setSelectedUserId('');
    setEmployeeForm(initialEmployeeForm);
    setAdminMessage('');
    setShowEmployeeForm(false);
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
            setSelectedUserId('');
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

  const handleStartAddEmployee = () => {
    setSelectedUser(null);
    setSelectedUserId('');
    setEmployeeForm(initialEmployeeForm);
    setAdminMessage('');
    setShowEmployeeForm(true);
    setTimeout(() => { const el = employeeFormRef.current; if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }, 50);
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

            <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
              {loginError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
                  {loginError}
                </div>
              )}              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Телефон / логин</label>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
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
                  autoComplete="current-password"
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeProfileForm((prev) => !prev);
                    setProfileEditEnabled(false);
                    setShowPasswordResetFields(false);
                    setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
                  }}
                  className="rounded-2xl bg-sky-700 text-white px-5 py-3 font-semibold hover:bg-sky-800 transition"
                >
                  {showEmployeeProfileForm ? 'Скрыть мои данные' : 'Мои данные'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-[28px] bg-emerald-50 p-6 border border-emerald-100 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">ФИО</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{[currentUser.name, currentUser.surname].filter(Boolean).join(' ')}</p>
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
              {showEmployeeProfileForm && (
              <section className="sm:col-span-2 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.35em]">Профиль</p>
                  <div className="flex items-center gap-3">
                    <h2 className="mt-2 text-xl font-bold text-slate-900">Изменить данные аккаунта</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileEditEnabled((prev) => !prev);
                        setShowPasswordResetFields(false);
                        setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
                      }}
                      className={`mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${profileEditEnabled ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
                      title={profileEditEnabled ? 'Выключить редактирование' : 'Включить редактирование'}
                    >
                      ✎
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-500">Нажмите значок редактирования, чтобы изменить поля. Сброс пароля покажет отдельные строки со старым и новым паролем.</p>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    {currentUser.avatar
                      ? <img src={currentUser.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-sky-300" />
                      : <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-2xl font-bold text-white">{(currentUser.name || '?')[0].toUpperCase()}</div>
                    }
                    {profileEditEnabled && (
                      <label className="cursor-pointer rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                        📷 Загрузить фото
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData(); fd.append('files', file);
                          const r = await fetch('/api/files', { method: 'POST', body: fd });
                          const d = await r.json();
                          if (r.ok && d.fileUrls?.[0]) {
                            const url = d.fileUrls[0];
                            setProfileForm(prev => ({ ...prev, avatar: url }));
                            const updated = { ...currentUser, avatar: url };
                            setCurrentUser(updated);
                            localStorage.setItem('currentUser', JSON.stringify(updated));
                            window.dispatchEvent(new Event('userChanged'));
                          }
                        }} />
                      </label>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileFormChange}
                      disabled={!profileEditEnabled}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                      placeholder="Имя"
                    />
                    <input
                      name="surname"
                      value={profileForm.surname}
                      onChange={handleProfileFormChange}
                      disabled={!profileEditEnabled}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                      placeholder="Фамилия"
                    />
                    <input
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileFormChange}
                      disabled={!profileEditEnabled}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                      placeholder="Логин"
                    />
                    <input
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileFormChange}
                      disabled={!profileEditEnabled}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                      placeholder="Телефон"
                    />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                      Отдел: <span className="font-semibold text-slate-700">{currentUser.department || currentUser.workplaceType || '—'}</span><br />
                      Должность: <span className="font-semibold text-slate-700">{currentUser.position || '—'}</span>
                    </div>
                  </div>
                  {showPasswordResetFields && (
                    <div className="space-y-3">
                      <input
                        type="password"
                        name="currentPassword"
                        value={profileForm.currentPassword}
                        onChange={handleProfileFormChange}
                        disabled={!profileEditEnabled}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                        placeholder="Старый пароль"
                      />
                      <input
                        type="password"
                        name="newPassword"
                        value={profileForm.newPassword}
                        onChange={handleProfileFormChange}
                        disabled={!profileEditEnabled}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                        placeholder="Новый пароль"
                      />
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={profileForm.confirmNewPassword}
                        onChange={handleProfileFormChange}
                        disabled={!profileEditEnabled}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                        placeholder="Подтвердите новый пароль"
                      />
                    </div>
                  )}
                  {profileMessage && (
                    <div className={`rounded-2xl px-4 py-3 text-sm ${isProfileSuccessMessage ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {profileMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={!profileEditEnabled}
                    className="rounded-2xl bg-sky-700 text-white px-6 py-3 font-semibold shadow-lg shadow-sky-700/10 hover:bg-sky-800 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Сохранить изменения
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordResetFields((prev) => !prev);
                      setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
                    }}
                    disabled={!profileEditEnabled}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {showPasswordResetFields ? 'Отменить смену пароля' : 'Сбросить пароль'}
                  </button>
                </form>
              </section>
              )}
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
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-fade-in-up">
          {toast}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-100 via-sky-100 to-yellow-100 backdrop-blur-xl p-8 rounded-[36px] shadow-2xl shadow-slate-200/40 border border-slate-200/80 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">Панель Hawaii&Miami · SanRemo</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">📊 Админ портала</h1>
              <p className="mt-3 text-slate-600">Управление отзывами, регистрациями и результатами обучения.</p>
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

          {/* HR Dashboard */}
          {!loading && usersData.length > 0 && (() => {
            const DEPARTMENTS = ['Аквапарк', 'Ресторан', 'SPA', 'Магазин', 'Офис'];
            const deptCounts = DEPARTMENTS.map(d => ({ dept: d, count: usersData.filter(u => (u.department || u.workplaceType || '').toLowerCase().includes(d.toLowerCase())).length }));
            const maxDept = Math.max(...deptCounts.map(d => d.count), 1);
            const top5 = [...usersData].sort((a, b) => Number(b.points || 0) - Number(a.points || 0)).slice(0, 5);
            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
            return (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">👥 Сотрудники по отделам</h3>
                  <div className="space-y-3">
                    {deptCounts.map(({ dept, count }) => (
                      <div key={dept}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 font-medium">{dept}</span>
                          <span className="text-slate-500">{count}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${count ? (count / maxDept) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">🏆 Топ-5 по AQUA COIN</h3>
                  <ol className="space-y-3">
                    {top5.map((u, i) => (
                      <li key={u._id || u.phone} className="flex items-center gap-3">
                        <span className="text-xl w-7 text-center">{medals[i]}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{[u.name, u.surname].filter(Boolean).join(' ') || u.phone}</p>
                          <p className="text-xs text-slate-400">{u.department || u.workplaceType || '—'}</p>
                        </div>
                        <span className="font-bold text-emerald-600 text-sm inline-flex items-center gap-1">{Number(u.points || 0)} <GoldCoin size="xs" /></span>
                      </li>
                    ))}
                    {top5.length === 0 && <li className="text-slate-400 text-sm">Нет данных</li>}
                  </ol>
                </div>
              </div>
            );
          })()}


          {!loading && usersData.length > 0 && (
            <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              {filteredStaff.length === 0 && (
                                <div className="text-center text-red-500 font-semibold my-4">
                                  Нет сотрудников для выбранного фильтра.<br/>
                                  Проверьте поле workplaceType у сотрудников в базе.<br/>
                                  Для отладки смотрите консоль браузера.
                                </div>
                              )}
                <h2 className="text-2xl font-bold text-slate-900 mb-2 sm:mb-0">Зарегистрированные сотрудники</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-semibold text-slate-700 mr-2">Аквапарк:</span>
                  {[
                    { label: 'Hawaii&Miami', value: 'Hawaii&Miami' },
                    { label: 'SanRemo', value: 'SanRemo' },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
                        ${waterparkFilter === value
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'}
                        focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                      onClick={() => setWaterparkFilter(value)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 104.65 4.65a7 7 0 0012 12z" />
                    </svg>
                    <input
                      type="text"
                      value={staffSearch}
                      onChange={e => { setStaffSearch(e.target.value); setStaffPage(1); }}
                      placeholder="Поиск"
                      className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    {staffSearch && (
                      <button onClick={() => setStaffSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleStartAddEmployee}
                    className="rounded-2xl bg-emerald-600 text-white px-5 py-3 font-semibold hover:bg-emerald-700 transition"
                  >
                    + Добавить сотрудника
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <table className="w-full border-collapse text-sm text-slate-900">
                  <thead className="bg-slate-100 text-slate-900">
                    <tr>
                      <SortTh label="ФИО" sortKey="fio" current={staffSort} onToggle={k => toggleSort(setStaffSort, staffSort, k)} />
                      <SortTh label="Телефон" sortKey="phone" current={staffSort} onToggle={k => toggleSort(setStaffSort, staffSort, k)} />
                      <SortTh label="Отдел" sortKey="department" current={staffSort} onToggle={k => toggleSort(setStaffSort, staffSort, k)} />
                      <SortTh label="Должность" sortKey="position" current={staffSort} onToggle={k => toggleSort(setStaffSort, staffSort, k)} />
                      <SortTh label="Роль" sortKey="role" current={staffSort} onToggle={k => toggleSort(setStaffSort, staffSort, k)} />
                      <SortTh label="Дата регистрации" sortKey="registeredAt" current={staffSort} onToggle={k => toggleSort(setStaffSort, staffSort, k)} />
                      <th className="p-3 text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffRows.map((user, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-3 border-b text-slate-900">{[user.name, user.surname].filter(Boolean).join(' ')}</td>
                        <td className="p-3 border-b text-slate-900">{user.phone}</td>
                        <td className="p-3 border-b text-slate-900">{user.department || '—'}</td>
                        <td className="p-3 border-b text-slate-900">{user.position}</td>
                        <td className="p-3 border-b">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-sky-100 text-sky-700' :
                            user.role === 'mentor' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>{user.role === 'admin' ? 'Админ' : user.role === 'mentor' ? 'Наставник' : 'Сотрудник'}</span>
                        </td>
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
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <p className="text-slate-500">Показано {staffRows.length} из {filteredStaff.length}</p>
                  <span>· по</span>
                  <select
                    value={staffPageSize}
                    onChange={(e) => setStaffPageSize(Number(e.target.value))}
                    className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-slate-900"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>сотрудников</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                    disabled={currentStaffPage === 1}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
                  >
                    Назад
                  </button>
                  <span className="text-sm text-slate-600">{currentStaffPage} / {totalStaffPages}</span>
                  <button
                    type="button"
                    onClick={() => setStaffPage((p) => Math.min(totalStaffPages, p + 1))}
                    disabled={currentStaffPage === totalStaffPages}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
                  >
                    Вперёд
                  </button>
                </div>
              </div>
            </div>
          )}
          {showEmployeeForm && (
            <div ref={employeeFormRef} className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedUser ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</h2>
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
                    onChange={handleEmployeePhoneChange}
                    onKeyDown={handleEmployeePhoneKeyDown}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                    placeholder="+7 (707) 559-90-25"
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
                    placeholder={selectedUser ? 'Оставьте пустым, чтобы не менять' : 'Минимум 6 символов'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Аквапарк</label>
                  <select
                    name="workplaceType"
                    value={employeeForm.workplaceType}
                    onChange={handleEmployeeFormChange}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  >
                    <option value="">Выберите аквапарк</option>
                    <option value="Hawaii&Miami">Hawaii&Miami</option>
                    <option value="SanRemo">SanRemo</option>
                  </select>
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
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setNewPositionInput({ dept: employeeForm.department, value: '', show: true, context: 'form' });
                      } else {
                        handleEmployeeFormChange(e);
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  >
                    <option value="">Выберите должность</option>
                    {(departmentPositions[employeeForm.department] || []).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                    {employeeForm.department && <option value="__new__">➕ Новая должность...</option>}
                  </select>
                  {newPositionInput.show && newPositionInput.context === 'form' && newPositionInput.dept === employeeForm.department && (
                    <div className="flex gap-2 mt-2">
                      <input
                        autoFocus
                        value={newPositionInput.value}
                        onChange={e => setNewPositionInput(p => ({ ...p, value: e.target.value }))}
                        placeholder="Название должности"
                        className="flex-1 rounded-2xl border border-slate-300 p-2.5 text-slate-900 text-sm"
                      />
                      <button type="button" onClick={() => {
                        const val = newPositionInput.value.trim();
                        if (!val) return;
                        const updated = { ...departmentPositions, [newPositionInput.dept]: [...(departmentPositions[newPositionInput.dept] || []), val] };
                        setDepartmentPositions(updated);
                        savePositions(updated);
                        handleEmployeeFormChange({ target: { name: 'position', value: val } });
                        setNewPositionInput({ dept: '', value: '', show: false, context: '' });
                      }} className="rounded-2xl bg-emerald-500 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-600 transition">Добавить</button>
                      <button type="button" onClick={() => setNewPositionInput({ dept: '', value: '', show: false, context: '' })} className="rounded-2xl bg-slate-100 text-slate-600 px-3 py-2 text-sm hover:bg-slate-200 transition">✕</button>
                    </div>
                  )}
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Роль</label>
                  <select
                    name="role"
                    value={employeeForm.role}
                    onChange={handleEmployeeFormChange}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                  >
                    <option value="employee">Сотрудник</option>
                    <option value="mentor">Наставник</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {selectedUser ? (
                    <button
                      type="button"
                      onClick={handleUpdateEmployee}
                      className="rounded-2xl bg-sky-600 text-white px-6 py-3 font-semibold hover:bg-sky-700 transition"
                    >
                      Сохранить изменения
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddEmployee}
                      className="rounded-2xl bg-emerald-600 text-white px-6 py-3 font-semibold hover:bg-emerald-700 transition"
                    >
                      Добавить сотрудника
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseEmployeeForm}
                    className="rounded-2xl bg-slate-200 text-slate-900 px-6 py-3 font-semibold hover:bg-slate-300 transition"
                  >
                    Отмена
                  </button>
                </div>
                {adminMessage && <p className="text-sm text-slate-700">{adminMessage}</p>}
              </form>
            </div>
          )}
          <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><GoldCoin size="md" /> AQUA COIN — баллы сотрудников</h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 104.65 4.65a7 7 0 0012 12z" />
                  </svg>
                  <input
                    type="text"
                    value={coinSearch}
                    onChange={e => { setCoinSearch(e.target.value); setCoinPage(1); }}
                    placeholder="Поиск"
                    className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  {coinSearch && (
                    <button onClick={() => setCoinSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const wsData = [
                      ['ФИО', 'Телефон', 'Отдел', 'Баллы (AQUA COIN)'],
                      ...coinRows.map(u => [
                        [u.name, u.surname].filter(Boolean).join(' '),
                        u.phone,
                        u.department || u.workplaceType || '',
                        Number(u.points || 0)
                      ])
                    ];
                    const ws = XLSX.utils.aoa_to_sheet(wsData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'AQUA COIN');
                    XLSX.writeFile(wb, 'aquacoin-report.xlsx');
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 text-white px-5 py-2 font-semibold hover:bg-sky-700 transition text-sm"
                >
                  📥 Экспорт Excel
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm text-slate-900">
                <thead className="bg-emerald-100 text-slate-900">
                  <tr>
                    <SortTh label="ФИО" sortKey="fio" current={coinSort} onToggle={k => toggleSort(setCoinSort, coinSort, k)} />
                    <SortTh label="Телефон" sortKey="phone" current={coinSort} onToggle={k => toggleSort(setCoinSort, coinSort, k)} />
                    <SortTh label="Отдел" sortKey="department" current={coinSort} onToggle={k => toggleSort(setCoinSort, coinSort, k)} />
                    <SortTh label="Баллы (AQUA COIN)" sortKey="points" current={coinSort} onToggle={k => toggleSort(setCoinSort, coinSort, k)} />
                  </tr>
                </thead>
                <tbody>
                  {coinRows.map((user, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-emerald-50' : 'bg-white'}>
                      <td className="p-3 border-b text-slate-900">{[user.name, user.surname].filter(Boolean).join(' ')}</td>
                      <td className="p-3 border-b text-slate-900">{user.phone}</td>
                      <td className="p-3 border-b text-slate-900">{mapDepartment(user)}</td>
                      <td className="p-3 border-b text-slate-900 font-bold text-emerald-700">{user.points ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <p className="text-slate-500">Показано {coinRows.length} из {filteredCoins.length}</p>
                <span>· по</span>
                <select
                  value={coinPageSize}
                  onChange={(e) => setCoinPageSize(Number(e.target.value))}
                  className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-slate-900"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>сотрудников</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCoinPage((p) => Math.max(1, p - 1))}
                  disabled={currentCoinPage === 1}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
                >
                  Назад
                </button>
                <span className="text-sm text-slate-600">{currentCoinPage} / {totalCoinPages}</span>
                <button
                  type="button"
                  onClick={() => setCoinPage((p) => Math.min(totalCoinPages, p + 1))}
                  disabled={currentCoinPage === totalCoinPages}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
                >
                  Вперёд
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}
