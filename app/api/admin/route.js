import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { Survey } from '../../../lib/models';

export async function GET() {
  try {
    await connectDB();
    const data = await Survey.find({}).sort({ timestamp: -1 }).lean();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    await Survey.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}