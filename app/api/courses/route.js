import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Course } from '@/lib/models';

export async function GET() {
  await connectDB();
  const courses = await Course.find().sort({ createdAt: -1 });
  return NextResponse.json(courses);
}

export async function POST(req) {
  await connectDB();
  const { title, description, steps } = await req.json();
  if (!title) return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
  const course = await Course.create({ title, description, steps: steps || [] });
  return NextResponse.json(course, { status: 201 });
}

export async function PUT(req) {
  await connectDB();
  const { id, title, description, steps } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const course = await Course.findByIdAndUpdate(id, { title, description, steps }, { new: true });
  return NextResponse.json(course);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await Course.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
