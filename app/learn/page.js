'use client';

import { useEffect, useState } from 'react';

export default function LearnPage() {
  const [trainings, setTrainings] = useState([]);

  useEffect(() => {
    fetch('/api/trainings')
      .then((res) => res.json())
      .then((data) => setTrainings(data.slice(0, 6)))
      .catch(() => setTrainings([]));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="animate-fade-in inline-block rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Обучение</span>
          <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold text-white drop-shadow-lg">Тренинги и материалы</h1>
          <p className="animate-fade-in-up delay-300 mt-4 max-w-xl mx-auto text-white/80 text-lg">Курсы, документы и обучающий контент для сотрудников аквапарков.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-xl">📚</div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Материалы</p>
              <h2 className="text-2xl font-bold text-slate-900">Онлайн тренинги</h2>
            </div>
          </div>
          {trainings.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-slate-500 text-center">Пока нет доступных тренингов.</div>
          ) : (
            <div className="space-y-4">
              {trainings.map((item) => (
                <div key={item.id} className="rounded-[20px] border-l-4 border-emerald-400 bg-emerald-50 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  {item.description && <p className="text-slate-600 mt-2 text-sm">{item.description}</p>}
                  {item.attachments?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-widest text-slate-400">Файлы</p>
                      <div className="grid gap-2">
                        {item.attachments.map((fileUrl, index) => {
                          const fileName = fileUrl.split('/').pop();
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                          return (
                            <div key={index} className="rounded-xl bg-white border border-slate-200 p-3">
                              {isImage ? (
                                <img src={fileUrl} alt={fileName} className="w-full h-auto max-h-64 object-contain rounded-lg" />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium transition">
                                  📎 {fileName}
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-4">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
