import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CourseProgress } from '@/lib/models';

// GET ?courseId=xxx&phone=xxx  OR  ?phone=xxx (all for user)
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  const phone = searchParams.get('phone');
  if (courseId && phone) {
    const progress = await CourseProgress.findOne({ courseId, phone });
    return NextResponse.json(progress || { courseId, phone, completedSteps: [] });
  }
  if (phone) {
    const all = await CourseProgress.find({ phone });
    return NextResponse.json(all);
  }
  return NextResponse.json({ error: 'phone required' }, { status: 400 });
}

// POST { courseId, phone, stepIndex }  — mark step as complete
export async function POST(req) {
  await connectDB();
  const { courseId, phone, stepIndex } = await req.json();
  if (!courseId || !phone || stepIndex === undefined) {
    return NextResponse.json({ error: 'courseId, phone, stepIndex required' }, { status: 400 });
  }
  let progress = await CourseProgress.findOne({ courseId, phone });
  if (!progress) {
    progress = new CourseProgress({ courseId, phone, completedSteps: [] });
  }
  if (!progress.completedSteps.includes(stepIndex)) {
    progress.completedSteps.push(stepIndex);
  }
  progress.updatedAt = new Date();
  await progress.save();
  return NextResponse.json(progress);
}
