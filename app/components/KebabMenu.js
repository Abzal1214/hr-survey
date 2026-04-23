'use client';
import { useState, useEffect, useRef } from 'react';

export default function KebabMenu({ onEdit, onDelete, onToggleActive, onView, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative shrink-0 -ml-10" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="relative z-20 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition text-xl leading-none"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 top-0 w-44 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-30">
          {onEdit && (
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              ✏️ Изменить
            </button>
          )}
          {onToggleActive && (
            <button
              onClick={() => { setOpen(false); onToggleActive(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition"
            >
              {isActive ? 'Деактивировать' : 'Активировать'}
            </button>
          )}
          {onView && (
            <button
              onClick={() => { setOpen(false); onView(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-50 transition"
            >
              👁️ Просмотр
            </button>
          )}
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            🗑️ Удалить
          </button>
        </div>
      )}
    </div>
  );
}
