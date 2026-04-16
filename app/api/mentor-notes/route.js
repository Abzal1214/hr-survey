import { connectDB } from '@/lib/mongodb';
import { MentorNote } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const employeePhone = searchParams.get('employeePhone');
  const mentorPhone = searchParams.get('mentorPhone');
  const query = {};
  if (employeePhone) query.employeePhone = employeePhone;
  if (mentorPhone) query.mentorPhone = mentorPhone;
  const notes = await MentorNote.find(query).sort({ createdAt: -1 });
  return NextResponse.json(notes);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const note = await MentorNote.create(data);
  return NextResponse.json(note);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  await MentorNote.findByIdAndDelete(searchParams.get('id'));
  return NextResponse.json({ ok: true });
}
