import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authData = await getCurrentUserFromRequest(req);

    if (!authData) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      totalStudied,
      streak,
      correctAnswers,
      quizzesCompleted,
      masteredWordIds,
      reviewedWordIds,
      avatar,
      name,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof totalStudied === 'number') updateData.totalStudied = totalStudied;
    if (typeof streak === 'number') updateData.streak = streak;
    if (typeof correctAnswers === 'number') updateData.correctAnswers = correctAnswers;
    if (typeof quizzesCompleted === 'number') updateData.quizzesCompleted = quizzesCompleted;
    if (Array.isArray(masteredWordIds)) updateData.masteredWordIds = masteredWordIds;
    if (Array.isArray(reviewedWordIds)) updateData.reviewedWordIds = reviewedWordIds;
    if (typeof avatar === 'string' && avatar.trim()) updateData.avatar = avatar;
    if (typeof name === 'string' && name.trim()) updateData.name = name.trim();

    const updatedUser = await prisma.user.update({
      where: { id: authData.userId },
      data: updateData,
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

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { error: 'İlerleme kaydedilirken hata oluştu.' },
      { status: 500 }
    );
  }
}
