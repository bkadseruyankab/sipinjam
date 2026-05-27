import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // Validate required fields
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, password baru, dan konfirmasi password wajib diisi' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password dan konfirmasi password tidak sama' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Find the reset token
    const resetRecord = await db.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Token reset tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Check if token has been used
    if (resetRecord.usedAt) {
      return NextResponse.json(
        { error: 'Token reset sudah digunakan. Silakan ajukan reset password baru.' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: 'Token reset sudah kadaluarsa. Silakan ajukan reset password baru.' },
        { status: 400 }
      );
    }

    // Update the user's password
    const hashedPassword = hashPassword(password);
    await db.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    // Mark the token as used
    await db.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Clean up expired tokens for this user
    await db.passwordReset.deleteMany({
      where: {
        userId: resetRecord.userId,
        expiresAt: { lt: new Date() },
      },
    });

    return NextResponse.json(
      { message: 'Password berhasil direset. Silakan login dengan password baru Anda.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

/**
 * GET handler to validate a reset token.
 * Used by the frontend to check if the token is still valid before showing the form.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 400 }
      );
    }

    const resetRecord = await db.passwordReset.findUnique({
      where: { token },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { valid: false, error: 'Token tidak valid' },
        { status: 200 }
      );
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { valid: false, error: 'Token sudah digunakan' },
        { status: 200 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'Token sudah kadaluarsa' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { valid: true, email: resetRecord.user.email, name: resetRecord.user.name },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
