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