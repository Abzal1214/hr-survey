import { connectDB } from '@/lib/mongodb';
import { MentorTask, Notification } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const employeePhone = searchParams.get('employeePhone');
  const mentorPhone = searchParams.get('mentorPhone');
  const query = {};
  if (employeePhone) query.employeePhone = employeePhone;
  if (mentorPhone) query.mentorPhone = mentorPhone;
  const tasks = await MentorTask.find(query).sort({ createdAt: -1 });
  return NextResponse.json(tasks);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const task = await MentorTask.create(data);
  if (data.employeePhone) {
    await Notification.create({
      phone: data.employeePhone,
      type: 'info',
      title: '📋 Новая задача от наставника',
      body: data.title || 'Вам назначена новая задача',
      link: '/mentors',
    });
  }
  return NextResponse.json(task);
}

export async function PUT(req) {
  await connectDB();
  const { _id, ...data } = await req.json();
  const task = await MentorTask.findByIdAndUpdate(_id, data, { new: true });
  return NextResponse.json(task);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  await MentorTask.findByIdAndDelete(searchParams.get('id'));
  return NextResponse.json({ ok: true });
}
