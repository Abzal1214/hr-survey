'use client';
import { useEffect } from 'react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-[28px] bg-white shadow-2xl overflow-hidden animate-scale-in">
        <div className="px-8 pt-8 pb-2 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-900 mb-1">Подтвердите действие</p>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 transition"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold py-3 transition shadow-lg shadow-red-500/20"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
