import { NextResponse } from 'next/server';
import { countRecentWishes, getWishes, saveWish } from '@/lib/db';
import {
  LIMITS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  checkText,
  hashIp,
  normalise,
} from '@/lib/validation';

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

    const name = normalise(body?.name);
    const message = normalise(body?.message);

    const problem =
      checkText(name, 'Name', LIMITS.name) ??
      checkText(message, 'Message', LIMITS.wishMessage);

    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
    }

    // This wall is public and unauthenticated, so cap how fast one submitter
    // can fill it.
    const ipHash = hashIp(request);
    if (ipHash) {
      const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
      const recent = await countRecentWishes(ipHash, since);

      if (recent >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          {
            error:
              'Thank you — you have already left a few blessings. Please try again in a little while.',
          },
          { status: 429 }
        );
      }
    }

    const saved = await saveWish({ name, message }, ipHash ?? undefined);

    return NextResponse.json({ success: true, wish: saved });
  } catch (error) {
    console.error('Wish submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
