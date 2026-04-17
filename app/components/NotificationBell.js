'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

export default function NotificationBell() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const loadUser = () => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
      setUser(u);
      return u;
    } catch { return null; }
  };

  const fetchNotifications = useCallback(async (u) => {
    if (!u) return;
    try {
      const phone = u.phone || '';
      const res = await fetch(`/api/notifications?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setUnread(data.unread || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const u = loadUser();
    fetchNotifications(u);
    const onUserChanged = () => {
      const nu = loadUser();
      fetchNotifications(nu);
    };
    window.addEventListener('userChanged', onUserChanged);
    // Poll every 30s
    const interval = setInterval(() => {
      const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
      fetchNotifications(cu);
    }, 30000);
    return () => { window.removeEventListener('userChanged', onUserChanged); clearInterval(interval); };
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open && unread > 0 && user) {
      try {
        await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: user.phone || '' }) });
        setUnread(0);
        setItems(prev => prev.map(n => ({ ...n, read: true })));
      } catch {}
    }
  };

  if (!user) return null;

  const typeIcon = (type) => type === 'news' ? '📰' : type === 'deadline' ? '⏰' : '🔔';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/20 border border-white/40 text-white hover:bg-white/30 transition backdrop-blur-sm"
        aria-label="Уведомления"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-100 z-50 animate-scale-in">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="font-bold text-slate-900 text-sm">Уведомления</p>
            {unread === 0 && <p className="text-xs text-slate-400">Всё прочитано</p>}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">Нет уведомлений</div>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={String(n._id)} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${!n.read ? 'bg-sky-50' : ''}`}>
                  {n.link ? (
                    <a href={n.link} onClick={() => setOpen(false)} className="block">
                      <p className="text-sm font-semibold text-slate-900">{typeIcon(n.type)} {n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('ru-RU')}</p>
                    </a>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-900">{typeIcon(n.type)} {n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('ru-RU')}</p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
