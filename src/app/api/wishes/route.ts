import { NextResponse } from 'next/server';
import { getWishes, saveWish } from '@/lib/db';

export async function GET() {
  try {
    const wishes = await getWishes();
    return NextResponse.json({ success: true, wishes });
  } catch (error) {
    console.error('Wishes retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve wishes.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and Message fields are required.' },
        { status: 400 }
      );
    }

    const saved = await saveWish({
      name,
      message,
    });

    return NextResponse.json({ success: true, wish: saved });
  } catch (error) {
    console.error('Wish submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
