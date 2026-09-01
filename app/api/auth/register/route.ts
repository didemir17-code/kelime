import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, avatar } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir isim girin (en az 2 karakter).' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir e-posta adresi girin.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanAvatar = avatar || '🦊';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten bulunmaktadır.' },
        { status: 409 }
      );
    }

    // Hash password & create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        avatar: cleanAvatar,
      },
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

    // Create JWT Token
    const token = await createAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Kayıt işlemi başarıyla tamamlandı!',
      user,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Kayıt sırasında bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
