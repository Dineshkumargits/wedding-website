import { NextResponse } from 'next/server';
import { saveRSVP } from '@/lib/db';
import { LIMITS, checkText, normalise } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = normalise(body?.name);
    const attendance = body?.attendance;
    const dietary = normalise(body?.dietary);
    const message = normalise(body?.message);

    if (!name || !attendance) {
      return NextResponse.json(
        { error: 'Name and Attendance fields are required.' },
        { status: 400 }
      );
    }

    const problem =
      checkText(name, 'Name', LIMITS.name) ??
      checkText(dietary, 'Dietary requirements', LIMITS.dietary, false) ??
      checkText(message, 'Message', LIMITS.rsvpMessage, false);

    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
    }

    // Clamped rather than rejected: a stray large number should not cost a
    // guest their RSVP, but it must not inflate the caterer's headcount either.
    const parsed = parseInt(body?.guestsCount, 10);
    const count = Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 0), LIMITS.maxGuests);

    const saved = await saveRSVP({
      name,
      attendance: attendance === 'yes' ? 'yes' : 'no',
      guestsCount: count,
      dietary,
      message,
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
