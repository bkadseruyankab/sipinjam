import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'Jika email terdaftar, link reset password telah dikirim ke email Anda' },
        { status: 200 }
      );
    }

    // Invalidate any existing unused reset tokens for this user
    await db.passwordReset.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() }, // Mark as used to invalidate
    });

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save the reset token
    await db.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Build the reset URL using site_url from settings (avoid localhost)
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '';
    if (!baseUrl) {
      const siteUrlSetting = await db.settings.findUnique({ where: { key: 'site_url' } });
      baseUrl = siteUrlSetting?.value || '';
    }
    // Fallback to request origin only if nothing else is configured
    if (!baseUrl) {
      baseUrl = request.nextUrl.origin;
    }
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/+$/, '');
    const resetUrl = `${baseUrl}/?reset-password=${token}`;

    // Send the reset email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Reset Password</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Halo <strong>${user.name}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk membuat password baru:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
            Atau salin link berikut ke browser Anda:
          </p>
          <p style="color: #059669; font-size: 13px; word-break: break-all; background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">
            ${resetUrl}
          </p>
          <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; border: 1px solid #fde68a;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              ⚠️ Link ini hanya berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini — password Anda tetap aman.
            </p>
          </div>
        </div>
        <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
          Email ini dikirim secara otomatis oleh sistem E-Pakar. Mohon tidak membalas email ini.
        </div>
      </div>
    `;

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Reset Password - E-Pakar',
      html: htmlContent,
    });

    // Even if email fails, we don't reveal that to the user
    // But log it for admin awareness
    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
    }

    return NextResponse.json(
      { message: 'Jika email terdaftar, link reset password telah dikirim ke email Anda' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
