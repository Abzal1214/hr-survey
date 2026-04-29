import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { logError } from '../../../lib/log';

function isAuthorized(request) {
  const auth = request.headers.get('authorization') || '';
  return !!auth && auth.startsWith('Bearer ');
}

export async function DELETE(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }
  try {
    const { pathname } = await request.json();
    if (!pathname) {
      return NextResponse.json({ error: 'Не указано имя файла' }, { status: 400 });
    }
    await del(pathname);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('DELETE /api/files/delete', error);
    return NextResponse.json({ error: 'Ошибка удаления файла: ' + error.message }, { status: 500 });
  }
}
