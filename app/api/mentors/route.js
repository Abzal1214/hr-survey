import { connectDB } from '@/lib/mongodb';
import { Mentor } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();
  const mentors = await Mentor.find().sort({ createdAt: 1 });
  return NextResponse.json(mentors);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const mentor = await Mentor.create(data);
  return NextResponse.json(mentor);
}

export async function PUT(req) {
  await connectDB();
  const { _id, ...data } = await req.json();
  const mentor = await Mentor.findByIdAndUpdate(_id, data, { new: true });
  return NextResponse.json(mentor);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await Mentor.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
