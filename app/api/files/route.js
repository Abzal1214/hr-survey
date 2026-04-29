import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { logError } from '../../../lib/log';

function isAuthorized(request) {
  const auth = request.headers.get('authorization') || '';
  // Пример: токен хранится в localStorage и передаётся в заголовке
  // Здесь можно реализовать свою проверку (например, JWT или session cookie)
  return !!auth && auth.startsWith('Bearer ');
}

export async function GET() {
  try {
    const { blobs } = await list();
    const files = blobs.map(b => ({ name: b.pathname, url: b.url }));
    return NextResponse.json(files);
  } catch (error) {
    logError('GET /api/files', error);
    return NextResponse.json({ error: 'Не удалось получить файлы' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }
  try {
    const data = await request.formData();
    let files = data.getAll('files');
    const singleFile = data.get('file');
    if ((!files || !files.length || files.every(f => !f)) && singleFile) {
      files = [singleFile];
    }
    if (!files || !files.length) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }
    const uploaded = [];
    for (const file of files) {
      if (!file || !file.name) continue;
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const blob = await put(safeName, file, { access: 'public' });
      uploaded.push({ name: file.name, url: blob.url, type: file.type, size: file.size });
    }
    if (!uploaded.length) {
      return NextResponse.json({ error: 'Файлы не были загружены' }, { status: 400 });
    }
    return NextResponse.json({ fileUrls: uploaded.map(f => f.url), files: uploaded });
  } catch (error) {
    logError('POST /api/files', error);
    return NextResponse.json({ error: 'Ошибка загрузки файла: ' + error.message }, { status: 500 });
  }
}
