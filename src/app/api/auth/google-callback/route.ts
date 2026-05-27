import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { generateToken, sanitizeUser } from '@/lib/auth';
import { getPublicBaseUrl } from '@/lib/public-url';

/**
 * GET /api/auth/google-callback
 * After Google OAuth via NextAuth, this endpoint syncs the user
 * with our custom auth system (sets the epakar-token cookie).
 */
export async function GET(request: NextRequest) {
  const baseUrl = getPublicBaseUrl(request);

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      // Not authenticated via NextAuth, redirect to home
      return NextResponse.redirect(new URL('/', baseUrl));
    }

    // Find or create user in our DB
    let user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // This shouldn't happen since signIn callback already creates the user,
      // but handle it just in case
      user = await db.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'Pengguna Google',
          password: 'google_oauth_' + Date.now(),
          role: 'user',
        },
      });
    }

    // Generate our custom token
    const token = generateToken(user.id, user.email);

    // Redirect to home with the cookie set
    const response = NextResponse.redirect(new URL('/', baseUrl));

    response.cookies.set('epakar-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/', baseUrl));
  }
}
