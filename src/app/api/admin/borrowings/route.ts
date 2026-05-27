import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { sendEmail, sendWhatsApp, getEmailTemplate, getWhatsappTemplate } from '@/lib/email';

/**
 * Send notification to user about borrowing status change.
 * Uses email templates from settings and actually sends via SMTP.
 * This is a fire-and-forget helper — errors are caught and logged.
 */
async function sendBorrowingNotification(
  borrowingId: string,
  status: string,
  userName: string,
  userEmail: string,
  userPhone: string | null,
  kegiatan: string,
  type: string,
  catatanAdmin?: string | null
) {
  try {
    const typeLabel = type === 'aula' ? 'Aula' : 'Kendaraan';

    const templateVariables = {
      nama: userName,
      kegiatan: kegiatan,
      tipe: typeLabel,
      tanggal: '-', // Will be populated if we have borrowing dates
      catatan: catatanAdmin || '-',
      nomor_perjanjian: '-',
    };

    // Get borrowing for date info
    const borrowing = await db.borrowing.findUnique({
      where: { id: borrowingId },
      select: { tanggalPinjam: true, tanggalKembali: true, nomorPerjanjian: true },
    });

    if (borrowing) {
      templateVariables.tanggal = `${borrowing.tanggalPinjam} s/d ${borrowing.tanggalKembali}`;
      templateVariables.nomor_perjanjian = borrowing.nomorPerjanjian || '-';
    }

    // Determine template type based on status
    const templateType = status === 'approved' ? 'approved' :
                         status === 'rejected' ? 'rejected' :
                         status === 'cancelled' ? 'cancelled' :
                         status === 'cancel_requested' ? 'cancel_requested' : 'new';

    // WhatsApp to user
    if (userPhone) {
      const waMessage = await getWhatsappTemplate(templateType, templateVariables);
      sendWhatsApp(userPhone, waMessage, borrowingId).catch(() => {});
    }

    // Email to user - actually send via SMTP using templates from settings
    const { subject, html } = await getEmailTemplate(templateType, templateVariables);
    sendEmail({
      to: userEmail,
      subject: `[E-Pakar] ${subject}`,
      html,
      borrowingId,
    }).catch(() => {});
  } catch (error) {
    console.error('Notification error (non-blocking):', error);
  }
}

/**
 * Send testimonial request notification to user after borrowing is completed.
 * Sends both WhatsApp and email with a link to submit a testimonial.
 * Fire-and-forget — errors are caught and logged.
 */
async function sendTestimonialRequest(
  borrowingId: string,
  userName: string,
  userEmail: string,
  userPhone: string | null,
  kegiatan: string
) {
  try {
    // Generate token: base64(borrowingId:timestamp)
    const timestamp = Date.now().toString();
    const token = Buffer.from(`${borrowingId}:${timestamp}`).toString('base64');

    // Build testimonial link pointing to the app's home page with testimonial form params
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '';
    if (!baseUrl) {
      const siteUrlSetting = await db.settings.findUnique({ where: { key: 'site_url' } });
      baseUrl = siteUrlSetting?.value || '';
    }
    if (!baseUrl) {
      baseUrl = 'http://localhost:3000';
    }
    baseUrl = baseUrl.replace(/\/+$/, '');
    const testimonialLink = `${baseUrl}/?testimonial=true&borrowingId=${borrowingId}&token=${encodeURIComponent(token)}`;

    // --- WhatsApp testimonial request ---
    if (userPhone) {
      const waMessage = `🌟 *Bagikan Testimoni Anda!*\n\nHalo ${userName}, peminjaman Anda untuk kegiatan "${kegiatan}" telah selesai. Kami sangat menghargai jika Anda bersedia memberikan testimoni tentang layanan kami.\n\nKlik link berikut untuk memberikan testimoni:\n${testimonialLink}\n\nTerima kasih! 🙏`;
      sendWhatsApp(userPhone, waMessage, borrowingId).catch(() => {});
    }

    // --- Email testimonial request ---
    const emailSubject = '🌟 Bagikan Testimoni Anda! - E-Pakar';
    const emailMessage = `<h2>🌟 Bagikan Testimoni Anda!</h2><p>Halo <strong>${userName}</strong>,</p><p>Peminjaman Anda untuk kegiatan <strong>"${kegiatan}"</strong> telah selesai. Kami sangat menghargai jika Anda bersedia memberikan testimoni tentang layanan kami.</p><p><a href="${testimonialLink}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Berikan Testimoni</a></p><p>Terima kasih! 🙏</p>`;

    sendEmail({
      to: userEmail,
      subject: emailSubject,
      html: emailMessage,
      borrowingId,
    }).catch(() => {});
  } catch (error) {
    console.error('Testimonial request notification error (non-blocking):', error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, catatanAdmin, approvedBy, cancelApprovedBy } = body;

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID peminjaman dan status wajib diisi' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'cancel_requested'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status harus salah satu dari: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if borrowing exists
    const existing = await db.borrowing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            instansi: true,
            role: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status,
      catatanAdmin: catatanAdmin || null,
    };

    // If approving, set approval info and generate QR token
    if (status === 'approved') {
      updateData.approvedBy = approvedBy || null;
      updateData.approvedAt = new Date();
      // Generate a unique QR verification token if not already present
      if (!existing.qrToken) {
        updateData.qrToken = randomUUID();
      }
      // If admin rejects a cancellation request (sets back to approved), clear cancel fields
      if (existing.status === 'cancel_requested') {
        updateData.cancelReason = null;
        updateData.cancelRequestedAt = null;
        updateData.cancelRequestedBy = null;
        updateData.cancelApprovedBy = null;
        updateData.cancelApprovedAt = null;
      }
    }

    // If cancelling (admin approves the cancellation), set cancel approval info
    if (status === 'cancelled') {
      updateData.cancelApprovedBy = cancelApprovedBy || approvedBy || null;
      updateData.cancelApprovedAt = new Date();
    }

    // If completing a kendaraan borrowing, update vehicle status back to tersedia
    if (status === 'completed' && existing.type === 'kendaraan' && existing.kendaraanId) {
      await db.kendaraan.update({
        where: { id: existing.kendaraanId },
        data: { status: 'tersedia' },
      });
    }

    // If approving a kendaraan borrowing, update vehicle status to digunakan
    if (status === 'approved' && existing.type === 'kendaraan' && existing.kendaraanId) {
      await db.kendaraan.update({
        where: { id: existing.kendaraanId },
        data: { status: 'digunakan' },
      });
    }

    // If rejecting a previously approved kendaraan borrowing, set vehicle back to tersedia
    if (status === 'rejected' && existing.status === 'approved' && existing.type === 'kendaraan' && existing.kendaraanId) {
      await db.kendaraan.update({
        where: { id: existing.kendaraanId },
        data: { status: 'tersedia' },
      });
    }

    // If cancelling a kendaraan borrowing, set vehicle back to tersedia
    if (status === 'cancelled' && existing.type === 'kendaraan' && existing.kendaraanId) {
      await db.kendaraan.update({
        where: { id: existing.kendaraanId },
        data: { status: 'tersedia' },
      });
    }

    const borrowing = await db.borrowing.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            instansi: true,
            role: true,
          },
        },
        kendaraan: true,
      },
    });

    // Send notification to user (fire-and-forget, non-blocking)
    if (['approved', 'rejected', 'completed', 'cancelled', 'cancel_requested'].includes(status)) {
      sendBorrowingNotification(
        id,
        status,
        borrowing.user.name,
        borrowing.user.email,
        borrowing.user.phone,
        borrowing.kegiatan,
        borrowing.type,
        catatanAdmin
      ).catch(() => {
        // Silently fail — notification errors should not block the API response
      });
    }

    // Send testimonial request when borrowing is completed
    if (status === 'completed') {
      sendTestimonialRequest(
        id,
        borrowing.user.name,
        borrowing.user.email,
        borrowing.user.phone,
        borrowing.kegiatan
      ).catch(() => {
        // Silently fail — testimonial request errors should not block the API response
      });
    }

    return NextResponse.json(
      {
        message: `Status peminjaman berhasil diubah menjadi "${status}"`,
        borrowing,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update borrowing status error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah status peminjaman' },
      { status: 500 }
    );
  }
}
