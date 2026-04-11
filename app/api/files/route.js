import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

const safeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');

export async function GET() {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const files = fs.readdirSync(uploadDir).map((name) => ({
      name,
      url: `/uploads/${encodeURIComponent(name)}`
    }));
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось получить файлы' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    let files = data.getAll('files');
    const singleFile = data.get('file');
    if ((!files || !files.length || files.every((file) => !file)) && singleFile) {
      files = [singleFile];
    }
    if (!files || !files.length) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uploaded = [];
    for (const file of files) {
      if (!file || !file.name) continue;
      const originalName = file.name;
      const safeName = `${Date.now()}-${safeFileName(originalName)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, buffer);
      uploaded.push({
        name: originalName,
        url: `/uploads/${encodeURIComponent(safeName)}`,
        type: file.type,
        size: buffer.length,
      });
    }
    if (!uploaded.length) {
      return NextResponse.json({ error: 'Файлы не были загружены' }, { status: 400 });
    }
    return NextResponse.json({ fileUrls: uploaded.map((item) => item.url), files: uploaded });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
  }
}
