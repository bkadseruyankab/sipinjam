import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, sendWhatsApp, getEmailTemplate, getWhatsappTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      kegiatan,
      tanggalPinjam,
      tanggalKembali,
      waktuMulam,
      waktuSelesai,
      suratPermohonan,
      // Aula specific
      jenisKegiatan,
      waktuPenggunaan,
      // Kendaraan specific
      kendaraanId,
      keperluanKendaraan,
      tujuan,
      jumlahPenumpang,
      sopir,
      // New fields
      nip,
      jumlahPeserta,
      setujuTarif,
      // Auto-save profile fields
      phone,
      instansi: formInstansi,
    } = body;

    // Validate required fields
    if (!userId || !type || !kegiatan || !tanggalPinjam || !tanggalKembali) {
      return NextResponse.json(
        { error: 'Field wajib belum lengkap (userId, type, kegiatan, tanggalPinjam, tanggalKembali)' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'aula' && type !== 'kendaraan') {
      return NextResponse.json(
        { error: 'Tipe peminjaman harus "aula" atau "kendaraan"' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // If kendaraan type, verify vehicle exists and check date overlap
    if (type === 'kendaraan' && kendaraanId) {
      const kendaraan = await db.kendaraan.findUnique({
        where: { id: kendaraanId },
      });

      if (!kendaraan) {
        return NextResponse.json(
          { error: 'Kendaraan tidak ditemukan' },
          { status: 404 }
        );
      }

      // Check if vehicle has overlapping approved/pending bookings for the same dates
      const overlapping = await db.borrowing.findFirst({
        where: {
          kendaraanId,
          status: { in: ['pending', 'approved'] },
          tanggalPinjam: { lte: tanggalKembali },
          tanggalKembali: { gte: tanggalPinjam },
        },
      });

      if (overlapping) {
        return NextResponse.json(
          { error: `Kendaraan sudah dipinjam pada tanggal tersebut (${overlapping.tanggalPinjam} s/d ${overlapping.tanggalKembali}). Silakan pilih tanggal lain.` },
          { status: 409 }
        );
      }
    }

    // Create borrowing record
    const borrowing = await db.borrowing.create({
      data: {
        userId,
        type,
        kegiatan,
        tanggalPinjam,
        tanggalKembali,
        waktuMulam: waktuMulam || null,
        waktuSelesai: waktuSelesai || null,
        suratPermohonan: suratPermohonan || null,
        // Aula specific
        jenisKegiatan: type === 'aula' ? (jenisKegiatan || null) : null,
        waktuPenggunaan: type === 'aula' ? (waktuPenggunaan || null) : null,
        setujuTarif: setujuTarif || false,
        // New common fields
        nip: nip || null,
        jumlahPeserta: jumlahPeserta || null,
        // Kendaraan specific
        kendaraanId: type === 'kendaraan' ? (kendaraanId || null) : null,
        keperluanKendaraan: type === 'kendaraan' ? (keperluanKendaraan || null) : null,
        tujuan: type === 'kendaraan' ? (tujuan || null) : null,
        jumlahPenumpang: type === 'kendaraan' ? (jumlahPenumpang || null) : null,
        sopir: type === 'kendaraan' ? (sopir || null) : null,
        status: 'pending',
      },
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

    // Send notification to ADMIN about new borrowing (fire-and-forget)
    // IMPORTANT: "new" template notification goes to ADMIN only, NOT to the user
    try {
      const typeLabel = type === 'aula' ? 'Aula' : 'Kendaraan';
      const templateVariables = {
        nama: user.name,
        kegiatan: kegiatan,
        tipe: typeLabel,
        tanggal: `${tanggalPinjam} s/d ${tanggalKembali}`,
        catatan: '-',
        nomor_perjanjian: '-',
      };

      // Get admin contact info from settings
      const adminSettings = await db.settings.findMany({
        where: { key: { in: ['admin_phone', 'admin_email'] } },
      });
      const adminMap: Record<string, string> = {};
      for (const s of adminSettings) {
        adminMap[s.key] = s.value;
      }

      // Fallback: if admin_email is not configured, get from admin users in DB
      let adminEmail = adminMap.admin_email;
      let adminPhone = adminMap.admin_phone;
      if (!adminEmail || !adminPhone) {
        const adminUsers = await db.user.findMany({
          where: { role: 'admin' },
          select: { email: true, phone: true },
        });
        if (!adminEmail && adminUsers.length > 0) {
          adminEmail = adminUsers[0].email;
        }
        if (!adminPhone && adminUsers.length > 0 && adminUsers[0].phone) {
          adminPhone = adminUsers[0].phone;
        }
      }

      // WhatsApp to admin
      if (adminPhone) {
        const waMessage = await getWhatsappTemplate('new', templateVariables);
        sendWhatsApp(adminPhone, waMessage, borrowing.id).catch(() => {});
      }

      // Email to admin only - NOT to the borrower
      if (adminEmail) {
        const { subject, html } = await getEmailTemplate('new', templateVariables);
        sendEmail({
          to: adminEmail,
          subject: `[E-Pakar] ${subject}`,
          html,
          borrowingId: borrowing.id,
        }).catch(() => {});
      }
    } catch (notificationError) {
      console.error('Notification error (non-blocking):', notificationError);
    }

    // Auto-save phone and instansi to user profile if they are empty
    try {
      const updateData: Record<string, string> = {};
      if (phone && !user.phone) {
        updateData.phone = phone;
      }
      if (formInstansi && !user.instansi) {
        updateData.instansi = formInstansi;
      }
      if (Object.keys(updateData).length > 0) {
        await db.user.update({
          where: { id: userId },
          data: updateData,
        });
      }
    } catch (profileUpdateError) {
      console.error('Auto-save profile error (non-blocking):', profileUpdateError);
    }

    return NextResponse.json(
      {
        message: 'Peminjaman berhasil dibuat',
        borrowing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create borrowing error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat peminjaman' },
      { status: 500 }
    );
  }
}
