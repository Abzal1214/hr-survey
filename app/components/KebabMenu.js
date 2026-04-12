'use client';
import { useState, useEffect, useRef } from 'react';

export default function KebabMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative shrink-0 -ml-8" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="relative z-20 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition text-xl leading-none"
        title="Действия"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 top-0 w-40 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-30">
          {onEdit && (
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Изменить
            </button>
          )}
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}
