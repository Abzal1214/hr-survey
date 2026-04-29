'use client';

import { useEffect, useState } from 'react';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

  if (loading) return <div>Загрузка файлов...</div>;
  if (error) return <div>{error}</div>;
  if (!files.length) return <div>Нет загруженных файлов</div>;

  return (
    <div>
      <h3 className="font-bold mb-2">Загруженные файлы:</h3>
      <ul className="space-y-1">
        {files.map((file, idx) => (
          <li key={idx}>
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {file.name || file.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
