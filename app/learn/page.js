'use client';

import { useEffect, useState } from 'react';

export default function LearnPage() {
  const [trainings, setTrainings] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [message, setMessage] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newTraining, setNewTraining] = useState({ title: '', description: '' });
  const [trainingFiles, setTrainingFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  const loadTrainings = () => {
    fetch('/api/trainings')
      .then((res) => res.json())
      .then((data) => setTrainings(Array.isArray(data) ? data : []))
      .catch(() => setTrainings([]));
  };

  useEffect(() => {
    loadTrainings();
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.role === 'admin') setIsAdmin(true);
    } catch {}
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот тренинг?')) return;
    const res = await fetch(`/api/trainings?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Тренинг удалён');
      loadTrainings();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const startEdit = (item) => {
    setEditingId(String(item._id || item.id));
    setEditForm({ title: item.title, description: item.description || '' });
  };

  const handleSaveEdit = async (id) => {
    const res = await fetch('/api/trainings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (res.ok) {
      setMessage('Тренинг обновлён');
      setEditingId(null);
      loadTrainings();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddTraining = async () => {
    if (!newTraining.title) { setCreateMsg('Введите название тренинга'); return; }
    setSaving(true);
    let attachmentUrls = [];
    let fileWarning = '';
    try {
      if (trainingFiles.length > 0) {
        const formData = new FormData();
        trainingFiles.forEach((file) => formData.append('files', file));
        try {
          const uploadRes = await fetch('/api/files', { method: 'POST', body: formData });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok) {
            attachmentUrls = uploadData.fileUrls || [];
          } else {
            fileWarning = ' (файлы не загружены: ' + (uploadData.error || 'ошибка') + ')';
          }
        } catch {
          fileWarning = ' (файлы не загружены)';
        }
      }
      const res = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTraining, attachments: attachmentUrls }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateMsg('Тренинг добавлен' + fileWarning);
        setNewTraining({ title: '', description: '' });
        setTrainingFiles([]);
        setShowCreate(false);
        loadTrainings();
      } else {
        setCreateMsg(data.error || 'Ошибка');
      }
    } catch { setCreateMsg('Ошибка сети'); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen">
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="animate-fade-in inline-block rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Обучение</span>
          <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold text-white drop-shadow-lg">Тренинги и материалы</h1>
          <p className="animate-fade-in-up delay-300 mt-4 max-w-xl mx-auto text-white/80 text-lg">Курсы, документы и обучающий контент для сотрудников аквапарков.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16">
        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => { setShowCreate(!showCreate); setCreateMsg(''); }}
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-semibold transition shadow-lg"
            >
              {showCreate ? '✕ Отмена' : '+ Добавить тренинг'}
            </button>

            {showCreate && (
              <div className="mt-4 rounded-[28px] bg-white/95 p-6 shadow-2xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Новый тренинг</h2>
                <div className="space-y-4">
                  <input
                    value={newTraining.title}
                    onChange={e => setNewTraining(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                    placeholder="Название тренинга *"
                  />
                  <textarea
                    value={newTraining.description}
                    onChange={e => setNewTraining(p => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 min-h-[100px]"
                    placeholder="Описание (необязательно)"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Файлы и изображения</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={e => setTrainingFiles(Array.from(e.target.files || []))}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900"
                    />
                    {trainingFiles.length > 0 && (
                      <p className="text-sm text-slate-600 mt-2">Выбрано файлов: {trainingFiles.length}</p>
                    )}
                  </div>
                  {createMsg && <p className="text-sm text-red-600">{createMsg}</p>}
                  <button
                    onClick={handleAddTraining}
                    disabled={saving}
                    className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Сохранение...' : 'Добавить тренинг'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-xl">📚</div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Материалы</p>
              <h2 className="text-2xl font-bold text-slate-900">Онлайн тренинги</h2>
            </div>
          </div>
          {message && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">{message}</div>
          )}
          {trainings.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-slate-500 text-center">
              {isAdmin ? 'Нет тренингов. Добавьте первый кнопкой выше.' : 'Пока нет доступных тренингов.'}
            </div>
          ) : (
            <div className="space-y-4">
              {trainings.map((item) => {
                const itemId = String(item._id || item.id);
                const isEditing = editingId === itemId;
                return (
                  <div key={itemId} className="rounded-[20px] border-l-4 border-emerald-400 bg-emerald-50 p-6 shadow-sm">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm"
                          placeholder="Заголовок"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm min-h-[80px]"
                          placeholder="Описание"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(itemId)} className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition">Сохранить</button>
                          <button onClick={() => setEditingId(null)} className="rounded-xl bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-300 transition">Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                          {isAdmin && (
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => startEdit(item)} className="rounded-lg bg-sky-100 text-sky-700 px-3 py-1 text-xs font-semibold hover:bg-sky-200 transition">Изменить</button>
                              <button onClick={() => handleDelete(itemId)} className="rounded-lg bg-red-100 text-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-200 transition">Удалить</button>
                            </div>
                          )}
                        </div>
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
                                        {fileName}
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-4">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
