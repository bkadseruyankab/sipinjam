import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendWhatsApp } from '@/lib/email';

/**
 * POST /api/notify
 * Send notification via WhatsApp (Fonnte) and/or Email (SMTP)
 *
 * Body:
 * {
 *   type: "whatsapp" | "email" | "both",
 *   to: string,          // phone number or email address
 *   subject?: string,    // email subject
 *   message: string,     // message content (plain text for WA, HTML for email)
 *   borrowingId?: string // related borrowing ID
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, subject, message, borrowingId } = body;

    if (!type || !to || !message) {
      return NextResponse.json(
        { error: 'Field type, to, dan message wajib diisi' },
        { status: 400 }
      );
    }

    if (!['whatsapp', 'email', 'both'].includes(type)) {
      return NextResponse.json(
        { error: 'Type harus salah satu dari: whatsapp, email, both' },
        { status: 400 }
      );
    }

    const results: { whatsapp?: { success: boolean; error?: string }; email?: { success: boolean; error?: string } } = {};

    // Handle WhatsApp notification
    if (type === 'whatsapp' || type === 'both') {
      const waResult = await sendWhatsApp(to, message, borrowingId);
      results.whatsapp = { success: waResult.success, error: waResult.error };
    }

    // Handle Email notification via SMTP
    if (type === 'email' || type === 'both') {
      const emailResult = await sendEmail({
        to,
        subject: subject || 'Notifikasi E-Pakar',
        html: message,
        borrowingId,
      });
      results.email = { success: emailResult.success, error: emailResult.error };
    }

    const allSuccess =
      (type === 'whatsapp' && results.whatsapp?.success) ||
      (type === 'email' && results.email?.success) ||
      (type === 'both' && (results.whatsapp?.success || results.email?.success));

    return NextResponse.json(
      {
        message: allSuccess ? 'Notifikasi berhasil dikirim' : 'Sebagian notifikasi gagal dikirim',
        results,
      },
      { status: allSuccess ? 200 : 207 }
    );
  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim notifikasi' },
      { status: 500 }
    );
  }
}
