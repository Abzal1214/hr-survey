import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export async function GET() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      const data = JSON.parse(fileContent);
      // Сортировка по дате (новые сверху)
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return NextResponse.json(data);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}