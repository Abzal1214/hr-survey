import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { News, Notification } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const news = await News.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(news.map(n => ({ ...n, id: n._id })), { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' } });
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
    // Broadcast notification to all employees
    await Notification.create({
      phone: '',
      type: 'news',
      title: '📰 Новая новость',
      body: title,
      link: '/news',
    });
    return NextResponse.json({ message: 'Новость добавлена', post: { ...post.toObject(), id: post._id } });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка добавления новости' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, title, description, imageUrl } = body;
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    const post = await News.findByIdAndUpdate(id, { title, description, imageUrl }, { new: true });
    if (!post) return NextResponse.json({ error: 'Новость не найдена' }, { status: 404 });
    return NextResponse.json({ ...post.toObject(), id: post._id });
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления новости' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    await News.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления новости' }, { status: 500 });
  }
}
