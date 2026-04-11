import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { Survey } from '../../../lib/models';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    await Survey.create(body);
    return NextResponse.json({ message: 'Data saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}