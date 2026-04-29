'use client';

import { useEffect, useState } from 'react';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [token, setToken] = useState('');

  // Функция для обновления списка файлов
  const fetchFiles = () => {
    setLoading(true);
    setError(null);
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        setFiles(Array.isArray(data) ? data : data.files || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки файлов');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
    // Автоматическое обновление при загрузке новых файлов
    const handler = () => fetchFiles();
    window.addEventListener('filesChanged', handler);
    return () => window.removeEventListener('filesChanged', handler);
  }, []);

  // Удаление файла
  const handleDelete = async (pathname) => {
    if (!window.confirm('Удалить файл?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify({ pathname })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Файл удалён');
        fetchFiles();
        window.dispatchEvent(new Event('filesChanged'));
      } else {
        setError(data.error || 'Ошибка удаления файла');
      }
    } catch (e) {
      setError('Ошибка удаления файла');
    }
    setLoading(false);
  };

  // Пример валидации: только для отображения, загрузка реализуется отдельно
  // success и error сообщения можно использовать при загрузке/удалении файлов

  if (loading) return <div>Загрузка файлов...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (success) return <div className="text-green-600">{success}</div>;
  if (!files.length) return <div className="text-gray-500 text-center">Нет загруженных файлов</div>;

  return (
    <div className="bg-white/80 p-4 rounded-xl shadow-md max-w-xl mx-auto">
      <h3 className="font-bold mb-2 text-lg text-slate-800">Загруженные файлы:</h3>
      <ul className="space-y-2">
        {files.map((file, idx) => (
          <li key={idx} className="flex items-center gap-2 border-b last:border-b-0 py-1">
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1 truncate hover:text-blue-800 transition">
              {file.name || file.url}
            </a>
            <button onClick={() => handleDelete(file.name)} className="text-red-600 hover:underline text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition">Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
