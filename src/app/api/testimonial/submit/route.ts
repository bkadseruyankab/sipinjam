import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/testimonial/submit
 * Submit testimonial from external source (WhatsApp/email link).
 *
 * Body: { borrowingId, token }
 *   - token is a base64 encoded string of "borrowingId:timestamp"
 *
 * This endpoint also accepts a full submission with:
 * Body: { borrowingId, token, name, instansi?, rating, message, source }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { borrowingId, token } = body;

    // Validate required fields
    if (!borrowingId || !token) {
      return NextResponse.json(
        { error: 'Field borrowingId dan token wajib diisi' },
        { status: 400 }
      );
    }

    // Decode and verify token
    let decodedToken: string;
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    const [tokenBorrowingId, tokenTimestamp] = decodedToken.split(':');

    if (!tokenBorrowingId || !tokenTimestamp) {
      return NextResponse.json(
        { error: 'Format token tidak valid' },
        { status: 400 }
      );
    }

    // Verify the token matches the borrowingId
    if (tokenBorrowingId !== borrowingId) {
      return NextResponse.json(
        { error: 'Token tidak sesuai dengan peminjaman' },
        { status: 400 }
      );
    }

    // Verify token hasn't expired (7 days)
    const tokenTime = parseInt(tokenTimestamp, 10);
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    if (isNaN(tokenTime) || now - tokenTime > sevenDaysMs) {
      return NextResponse.json(
        { error: 'Token telah kadaluarsa. Silakan ajukan testimoni melalui aplikasi.' },
        { status: 400 }
      );
    }

    // Look up the borrowing
    const borrowing = await db.borrowing.findUnique({
      where: { id: borrowingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            instansi: true,
          },
        },
      },
    });

    if (!borrowing) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify borrowing is completed
    if (borrowing.status !== 'completed') {
      return NextResponse.json(
        { error: 'Peminjaman belum selesai. Testimoni hanya bisa diberikan setelah peminjaman selesai.' },
        { status: 400 }
      );
    }

    // Check if a testimonial already exists for this borrowing
    const existingTestimonial = await db.testimonial.findFirst({
      where: { borrowingId },
    });

    if (existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimoni untuk peminjaman ini sudah pernah diberikan', testimonial: existingTestimonial },
        { status: 400 }
      );
    }

    // Determine source based on which medium the link was sent through
    // We detect this from the optional `source` field in body, defaulting to "whatsapp"
    const source = body.source === 'email' ? 'email' : 'whatsapp';

    // If the full submission data is provided, create the testimonial now
    const { name, rating, message, instansi } = body;

    if (name && message && rating) {
      // Validate rating
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating harus berupa angka antara 1-5' },
          { status: 400 }
        );
      }

      const testimonial = await db.testimonial.create({
        data: {
          userId: borrowing.user.id,
          borrowingId,
          name,
          instansi: instansi || borrowing.user.instansi || null,
          rating,
          message,
          isPublished: false,
          source,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              instansi: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: 'Testimoni berhasil dikirim! Terima kasih atas masukan Anda.',
          testimonial,
        },
        { status: 201 }
      );
    }

    // If only borrowingId and token are provided, return the borrowing info
    // so the frontend can render a form for the user to fill in
    return NextResponse.json({
      message: 'Verifikasi berhasil. Silakan isi testimoni Anda.',
      borrowing: {
        id: borrowing.id,
        kegiatan: borrowing.kegiatan,
        type: borrowing.type,
        tanggalPinjam: borrowing.tanggalPinjam,
        tanggalKembali: borrowing.tanggalKembali,
      },
      user: {
        name: borrowing.user.name,
        instansi: borrowing.user.instansi,
      },
    });
  } catch (error) {
    console.error('Submit testimonial error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses testimoni' },
      { status: 500 }
    );
  }
}
