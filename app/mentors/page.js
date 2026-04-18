
// This file has been cleared to resolve build errors.
// All previous content has been removed.
// Please add new code as necessary.
import KebabMenu from '../components/KebabMenu';

const DEPARTMENTS = ['Все отделы', 'Аквапарк', 'Ресторан', 'SPA', 'Магазин', 'Офис'];
const emptyForm = { name: '', position: '', department: '', phone: '', email: '', bio: '', photoUrl: '' };

export default function MentorsPage() {
      // Загрузка наставников из API
      useEffect(() => {
        fetch('/api/mentors')
          .then(r => r.json())
          .then(setMentors)
          .catch(() => setMentors([]));
      }, []);
    // Инициализация пользователя и роли из localStorage
    useEffect(() => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAdmin(parsedUser.role === 'admin');
            // ...ничего не добавлять здесь, основной return ниже...
  const [mentors, setMentors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('Все отделы');
  const [showAssign, setShowAssign] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState('');
  const [phonePopup, setPhonePopup] = useState('');
  const [myMentors, setMyMentors] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  // Найти всех наставников по department и загрузить задачи для сотрудника
  useEffect(() => {
    if (user && user.role === 'employee' && user.department) {
      const foundMentors = mentors.filter(m => m.department === user.department);
      setMyMentors(foundMentors);
      fetch(`/api/mentor-tasks?employeePhone=${user.phone}`)
        .then(r => r.json())
        .then(setMyTasks)
        .catch(() => setMyTasks([]));
    } else {
      setMyMentors([]);
      setMyTasks([]);
    }
  }, [user, mentors]);

  return (
    <div className="min-h-screen">
      {/* DEBUG: mentors API response */}
      <div style={{position:'fixed',bottom:0,left:0,zIndex:9999,background:'#fff',fontSize:12,padding:8,border:'1px solid #f00',maxWidth:600}}>
        <b>API mentors:</b> {JSON.stringify(mentors)}
      </div>
      {/* DEBUG: временный вывод для отладки */}
      <div className="fixed bottom-0 left-0 bg-white/90 text-xs p-2 z-[9999] max-w-lg border border-rose-200 rounded">
        <div><b>user:</b> {JSON.stringify(user)}</div>
        <div><b>isAdmin:</b> {String(isAdmin)}</div>
        <div><b>mentors:</b> {JSON.stringify(mentors)}</div>
      </div>
      {/* ...весь существующий JSX ниже... */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-sky-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Команда</span>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">🧑‍🏫 Наставники</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 text-lg">Опытные сотрудники, готовые помочь</p>
          {isAdmin && (
            <button onClick={() => setShowAssign(true)}
              className="mt-6 rounded-full bg-white/20 border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition backdrop-blur-sm">
              + Назначить наставника
            </button>
          )}
        </div>
      </div>

      {user?.role === 'employee' && myMentors.length > 0 && (
        <div className="max-w-2xl mx-auto -mt-12 mb-8 bg-white/70 rounded-xl shadow border border-sky-100 backdrop-blur-md p-4 flex flex-col gap-2">
          <div className="flex items-center gap-4">
            {myMentors[0]?.photoUrl
              ? <img src={myMentors[0].photoUrl} alt={myMentors[0].name} className="w-12 h-12 rounded-full object-cover border-2 border-sky-300" />
              : <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-xl font-bold text-sky-600">👤</div>}
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-tight">{myMentors[0].name}</span>
              {myMentors[0].position && <span className="text-sky-600 text-xs font-medium leading-tight">{myMentors[0].position}</span>}
              {myMentors[0].department && <span className="text-xs text-slate-400 mt-0.5">{myMentors[0].department}</span>}
              {myMentors[0].phone && <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><span className='text-rose-500'>📞</span>{myMentors[0].phone}</span>}
            </div>
          </div>
          <div className="mt-2">
            <div className="font-semibold text-slate-700 mb-1">Задачи от наставника</div>
            {myTasks.length === 0 ? (
              <div className="text-slate-400 text-sm">Нет задач от наставника.</div>
            ) : (
              <ul className="space-y-1">
                {myTasks.map(task => (
                  <li key={task._id} className="rounded bg-sky-50 px-3 py-1 flex items-center gap-2 border border-sky-100 text-sm">
              const DEPARTMENTS = ['Все отделы', 'Аквапарк', 'Ресторан', 'SPA', 'Магазин', 'Офис'];
              const emptyForm = { name: '', position: '', department: '', phone: '', email: '', bio: '', photoUrl: '' };
                  </li>
