import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { SurveyTemplate } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const data = await SurveyTemplate.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load surveys' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const created = await SurveyTemplate.create(body);
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    await SurveyTemplate.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}
