import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decodeToken, sanitizeUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Try to get userId from query param first
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    if (userIdParam) {
      const user = await db.user.findUnique({
        where: { id: userIdParam },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({ user: sanitizeUser(user) }, { status: 200 });
    }

    // Fall back to token from cookie
    const token = request.cookies.get('epakar-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const decoded = decodeToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: sanitizeUser(user) }, { status: 200 });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    );
  }
}
