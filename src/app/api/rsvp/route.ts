import { NextResponse } from 'next/server';
import { saveRSVP } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, attendance, guestsCount, dietary, message } = body;

    if (!name || !attendance) {
      return NextResponse.json(
        { error: 'Name and Attendance fields are required.' },
        { status: 400 }
      );
    }

    const count = parseInt(guestsCount, 10);
    const saved = await saveRSVP({
      name,
      attendance: attendance === 'yes' ? 'yes' : 'no',
      guestsCount: isNaN(count) ? 1 : count,
      dietary: dietary || '',
      message: message || '',
    });

    return NextResponse.json({ success: true, rsvp: saved });
  } catch (error) {
    console.error('RSVP submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
