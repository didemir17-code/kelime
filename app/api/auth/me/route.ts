import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authData = await getCurrentUserFromRequest(req);

    if (!authData) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        totalStudied: true,
        streak: true,
        correctAnswers: true,
        quizzesCompleted: true,
        masteredWordIds: true,
        reviewedWordIds: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
