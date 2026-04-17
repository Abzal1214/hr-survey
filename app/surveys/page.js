'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import KebabMenu from '../components/KebabMenu';

const inputCls = "w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 transition";
const labelCls = "block space-y-2";
const spanCls = "text-sm font-semibold text-slate-700";

const ratingOptions = [
  { value: '5', label: '⭐⭐⭐⭐⭐ Отлично' },
  { value: '4', label: '⭐⭐⭐⭐ Хорошо' },
  { value: '3', label: '⭐⭐⭐ Средне' },
  { value: '2', label: '⭐⭐ Плохо' },
  { value: '1', label: '⭐ Очень плохо' },
];

const yesNo = [
  { value: 'да', label: '✅ Да' },
  { value: 'частично', label: '🟡 Частично' },
  { value: 'нет', label: '❌ Нет' },
];

export default function SurveysPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Survey templates
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Admin: create form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ title: '', description: '', department: 'Аквапарк' });
  const [questions, setQuestions] = useState([{ text: '', type: 'text' }]);
  const [saving, setSaving] = useState(false);

  // Admin: submissions
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Employee: fill out survey
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editTemplateForm, setEditTemplateForm] = useState({ title: '', description: '' });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser'));
      if (u?.role === 'admin') {
        setIsAdmin(true);
        setCurrentUser(u);
        loadTemplates(u);
        loadSubmissions();
      } else if (u) {
        setCurrentUser(u);
        loadTemplates(u);
      }
    } catch {}
  }, []);

  const loadTemplates = (u) => {
    const dept = u && u.role !== 'admin' && u.department ? `?department=${encodeURIComponent(u.department)}` : '';
    setLoadingTemplates(true);
    fetch('/api/surveys' + dept)
      .then(r => r.json())
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false));
  };

  const loadSubmissions = () => {
    setLoadingSubmissions(true);
    fetch('/api/admin')
      .then(r => r.json())
      .then(data => setSubmissions(Array.isArray(data) ? data : []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoadingSubmissions(false));
  };

  // Admin: questions
  const addQuestion = () => setQuestions(prev => [...prev, { text: '', type: 'text' }]);
  const removeQuestion = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, value) =>
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));

  // Admin: create survey template
  const handleAddSurvey = async (e) => {
    e.preventDefault();
    if (!newSurvey.title.trim() || questions.some(q => !q.text.trim())) {
      alert('Заполните название и все вопросы');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSurvey, questions }),
      });
      if (res.ok) {
        const created = await res.json();
        setTemplates(prev => [created, ...prev]);
        setNewSurvey({ title: '', description: '', department: 'Аквапарк' });
        setQuestions([{ text: '', type: 'text' }]);
        setShowAddForm(false);
      } else alert('Ошибка при создании');
    } catch { alert('Ошибка сети'); }
    finally { setSaving(false); }
  };

  // Admin: delete survey template
  const handleDeleteTemplate = (id) => {
    setConfirmModal({ message: 'Удалить этот опрос? Ответы сотрудников останутся.', onConfirm: async () => {
      setConfirmModal(null);
      await fetch(`/api/surveys?id=${id}`, { method: 'DELETE' });
      setTemplates(prev => prev.filter(t => String(t._id || t.id) !== String(id)));
    }});
  };

  const handleDeleteSubmission = (id) => {
    setConfirmModal({ message: 'Удалить эту анкету?', onConfirm: async () => {
      setConfirmModal(null);
      await fetch(`/api/admin?id=${id}`, { method: 'DELETE' });
      setSubmissions(prev => prev.filter(s => String(s._id || s.id) !== String(id)));
    }});
  };

  const handleSaveTemplateEdit = async (id) => {
    const res = await fetch('/api/surveys', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editTemplateForm }),
    });
    if (res.ok) { setEditingTemplateId(null); loadTemplates(); }
  };

  // Employee: select survey
  const handleSelectSurvey = (template) => {
    setSelectedTemplate(template);
    const init = {};
    template.questions.forEach((_, i) => { init[i] = ''; });
    setAnswers(init);
  };

  // Employee: submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const answerArr = selectedTemplate.questions.map((q, i) => ({
      question: q.text,
      type: q.type,
      answer: answers[i] || '',
    }));
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser?.name || '',
          phone: currentUser?.phone || '',
          position: currentUser?.position || '',
          department: currentUser?.department || currentUser?.workplaceType || '',
          templateId: String(selectedTemplate._id || selectedTemplate.id),
          templateTitle: selectedTemplate.title,
          answers: answerArr,
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) setSubmitted(true);
      else alert('Ошибка при отправке');
    } catch { alert('Ошибка сети'); }
  };

  // Render input based on question type
  const renderInput = (q, i) => {
    if (q.type === 'rating') {
      return (
        <select
          value={answers[i] || ''}
          onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
          required className={inputCls}>
          <option value="">Выберите оценку</option>
          {ratingOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (q.type === 'yesno') {
      return (
        <select
          value={answers[i] || ''}
          onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
          required className={inputCls}>
          <option value="">Выберите ответ</option>
          {yesNo.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    return (
      <textarea
        value={answers[i] || ''}
        onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
        rows={3} required className={inputCls} placeholder="Ваш ответ..." />
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10">
          <span className="animate-fade-in inline-block rounded-full bg-violet-500/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white mb-4">Опросы</span>
          <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold text-white drop-shadow-lg">
            {isAdmin ? 'Управление опросами' : 'Опросы'}
          </h1>
          <p className="animate-fade-in-up delay-300 mt-4 max-w-xl mx-auto text-white/80 text-lg">
            {isAdmin
              ? 'Создавайте опросы и просматривайте ответы сотрудников.'
              : 'Пройдите доступные опросы и расскажите о своём опыте.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16 space-y-8">
        {isAdmin ? (
          <>
            {/* Admin: manage templates */}
            <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500 flex items-center justify-center text-xl">📋</div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Шаблоны</p>
                    <h2 className="text-2xl font-bold text-slate-900">Опросы</h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddForm(v => !v)}
                  className="rounded-2xl bg-violet-500 hover:bg-violet-600 text-white px-5 py-2.5 font-semibold text-sm transition shadow">
                  {showAddForm ? '✕ Закрыть' : '+ Добавить опрос'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddSurvey} className="mb-8 rounded-2xl border border-violet-200 bg-violet-50 p-6 space-y-4">
                  <label className={labelCls}>
                    <span className={spanCls}>Название опроса *</span>
                    <input type="text" value={newSurvey.title}
                      onChange={e => setNewSurvey(p => ({ ...p, title: e.target.value }))}
                      required placeholder="Например: Анкета стажёра" className={inputCls} />
                  </label>
                  <label className={labelCls}>
                    <span className={spanCls}>Описание</span>
                    <input type="text" value={newSurvey.description}
                      onChange={e => setNewSurvey(p => ({ ...p, description: e.target.value }))}
                      placeholder="Краткое описание..." className={inputCls} />
                  </label>
                  <label className={labelCls}>
                    <span className={spanCls}>Отдел</span>
                    <select value={newSurvey.department} onChange={e => setNewSurvey(p => ({ ...p, department: e.target.value }))} className={inputCls}>
                      <option value="Аквапарк">Аквапарк (все отделы)</option>
                      <option value="Ресторан">Ресторан</option>
                      <option value="SPA">SPA</option>
                      <option value="Магазин">Магазин</option>
                      <option value="Офис">Офис</option>
                    </select>
                  </label>
                  <div>
                    <p className={spanCls + ' mb-3'}>Вопросы</p>
                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <input type="text" value={q.text}
                              onChange={e => updateQuestion(i, 'text', e.target.value)}
                              placeholder={`Вопрос ${i + 1}`} required className={inputCls} />
                            <select value={q.type}
                              onChange={e => updateQuestion(i, 'type', e.target.value)}
                              className={inputCls}>
                              <option value="text">📝 Текстовый ответ</option>
                              <option value="rating">⭐ Оценка 1–5</option>
                              <option value="yesno">✅ Да / Частично / Нет</option>
                            </select>
                          </div>
                          {questions.length > 1 && (
                            <button type="button" onClick={() => removeQuestion(i)}
                              className="mt-1 rounded-xl bg-red-100 text-red-500 px-3 py-2 text-sm hover:bg-red-200 transition">✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addQuestion}
                      className="mt-3 rounded-xl border border-violet-300 text-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-100 transition">
                      + Добавить вопрос
                    </button>
                  </div>
                  <button type="submit" disabled={saving}
                    className="w-full rounded-2xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white py-3 font-bold transition shadow">
                    {saving ? 'Сохранение...' : 'Создать опрос'}
                  </button>
                </form>
              )}

              {loadingTemplates ? (
                <p className="text-slate-500 text-center py-8">Загрузка...</p>
              ) : templates.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-slate-500 text-center">
                  Опросов пока нет. Создайте первый!
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map(t => {
                    const tid = String(t._id || t.id);
                    return (
                      <div key={tid} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        {editingTemplateId === tid ? (
                          <div className="space-y-3">
                            <input
                              value={editTemplateForm.title}
                              onChange={e => setEditTemplateForm(p => ({ ...p, title: e.target.value }))}
                              className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm"
                              placeholder="Название опроса"
                            />
                            <textarea
                              value={editTemplateForm.description}
                              onChange={e => setEditTemplateForm(p => ({ ...p, description: e.target.value }))}
                              className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-sm min-h-[60px]"
                              placeholder="Описание"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveTemplateEdit(tid)} className="rounded-xl bg-violet-600 text-white px-4 py-2 text-sm font-semibold hover:bg-violet-700 transition">Сохранить</button>
                              <button onClick={() => setEditingTemplateId(null)} className="rounded-xl bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-300 transition">Отмена</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-slate-900">{t.title}</h3>
                              {t.description && <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>}
                              <p className="text-xs text-slate-400 mt-1">{t.questions?.length || 0} вопрос(ов)</p>
                            </div>
                            <KebabMenu
                              onEdit={() => { setEditingTemplateId(tid); setEditTemplateForm({ title: t.title, description: t.description || '' }); }}
                              onDelete={() => handleDeleteTemplate(tid)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Admin: submissions */}
            <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-violet-500 flex items-center justify-center text-xl">📨</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Ответы</p>
                  <h2 className="text-2xl font-bold text-slate-900">Анкеты сотрудников</h2>
                </div>
              </div>
              {loadingSubmissions ? (
                <p className="text-slate-500 text-center py-8">Загрузка...</p>
              ) : submissions.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-slate-500 text-center">
                  Анкет пока нет.
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map(item => {
                    const itemId = String(item._id || item.id);
                    return (
                      <div key={itemId} className="rounded-[20px] border-l-4 border-violet-400 bg-violet-50 p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{item.templateTitle || 'Анкета'}</h3>
                            <p className="text-sm text-slate-500">{item.name} · {item.phone} · {item.position}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {item.timestamp ? new Date(item.timestamp).toLocaleDateString('ru-RU') : ''}
                            </p>
                          </div>
                          <KebabMenu onDelete={() => handleDeleteSubmission(itemId)} />
                        </div>
                        {Array.isArray(item.answers) ? (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {item.answers.map((a, i) => (
                              <div key={i} className="rounded-xl bg-white border border-slate-100 px-3 py-2">
                                <p className="text-xs text-slate-400 mb-0.5">{a.question}</p>
                                <p className="text-sm font-medium text-slate-800">{a.answer || '—'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {['overall','duties_clear','support_received','team_comfortable','training_helpful','continue','difficulties','suggestions'].map(key => item[key] ? (
                              <div key={key} className="rounded-xl bg-white border border-slate-100 px-3 py-2">
                                <p className="text-xs text-slate-400 mb-0.5">{key}</p>
                                <p className="text-sm font-medium text-slate-800">{item[key]}</p>
                              </div>
                            ) : null)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : submitted ? (
          <div className="rounded-[24px] bg-white/95 p-8 shadow-xl text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Спасибо за честный ответ!</h2>
            <p className="text-slate-600">Ваша анкета отправлена. Мы станем лучше вместе.</p>
            <button onClick={() => { setSubmitted(false); setSelectedTemplate(null); }}
              className="mt-6 rounded-2xl bg-violet-500 text-white px-6 py-3 font-semibold hover:bg-violet-600 transition">
              Пройти ещё
            </button>
          </div>
        ) : selectedTemplate ? (
          <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
            <button onClick={() => setSelectedTemplate(null)} className="mb-4 text-sm text-violet-500 hover:underline">← Назад</button>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedTemplate.title}</h2>
            {selectedTemplate.description && <p className="text-slate-500 mb-6">{selectedTemplate.description}</p>}
            <form onSubmit={handleSubmit} className="space-y-5">
              {selectedTemplate.questions.map((q, i) => (
                <label key={i} className={labelCls}>
                  <span className={spanCls}>{q.text}</span>
                  {renderInput(q, i)}
                </label>
              ))}
              <button type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white py-4 text-lg font-bold transition shadow-lg">
                Отправить анкету
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-[24px] bg-white/95 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-violet-500 flex items-center justify-center text-xl">📋</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Доступные</p>
                <h2 className="text-2xl font-bold text-slate-900">Опросы</h2>
              </div>
            </div>
            {loadingTemplates ? (
              <p className="text-slate-500 text-center py-8">Загрузка...</p>
            ) : templates.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-slate-500 text-center">
                Активных опросов пока нет.
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(t => {
                  const tid = String(t._id || t.id);
                  return (
                    <div key={tid} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-violet-300 transition">
                      <div>
                        <h3 className="font-bold text-slate-900">{t.title}</h3>
                        {t.description && <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>}
                        <p className="text-xs text-slate-400 mt-1">{t.questions?.length || 0} вопрос(ов)</p>
                      </div>
                      <button onClick={() => handleSelectSurvey(t)}
                        className="shrink-0 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 text-sm font-semibold transition shadow">
                        Пройти →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
    </div>
  );
}
