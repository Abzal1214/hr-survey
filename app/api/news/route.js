import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { News } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const news = await News.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(news.map(n => ({ ...n, id: n._id })));
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить новости' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description } = body;
    if (!title || !description) {
      return NextResponse.json({ error: 'Заполните заголовок и описание' }, { status: 400 });
    }
    const post = await News.create({ title, description, imageUrl: body.imageUrl || '' });
    return NextResponse.json({ message: 'Новость добавлена', post: { ...post.toObject(), id: post._id } });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка добавления новости' }, { status: 500 });
  }
}
