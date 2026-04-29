'use client';

import { useState } from 'react';

export default function FileUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Выберите файл для загрузки');
      return;
    }
    setLoading(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    formData.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/files');
    if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      setLoading(false);
      if (xhr.status === 200) {
        setSuccess('Файл успешно загружен!');
        setFile(null);
        setProgress(0);
        if (onSuccess) onSuccess();
      } else {
        setError('Ошибка загрузки: ' + xhr.responseText);
      }
    };
    xhr.onerror = () => {
      setLoading(false);
      setError('Ошибка сети при загрузке файла');
    };
    xhr.send(formData);
  };

  return (
    <form onSubmit={handleUpload} className="mb-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-white/80 p-4 rounded-xl shadow-md max-w-xl mx-auto">
      <input type="file" onChange={handleChange} disabled={loading} className="flex-1 border rounded px-2 py-1" />
      <button type="submit" disabled={loading || !file} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50">Загрузить</button>
      {loading && (
        <div className="w-full sm:w-40 mt-2 sm:mt-0 bg-gray-200 rounded h-2">
          <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <div className="text-red-600 mt-2 w-full">{error}</div>}
      {success && <div className="text-green-600 mt-2 w-full">{success}</div>}
    </form>
  );
}
