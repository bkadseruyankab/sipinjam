import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/testimonial
 * List testimonials with optional filters.
 *
 * Query params:
 *   published (boolean) - if "true", only return published testimonials
 *   userId   (string)  - filter by user ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};

    if (published === 'true') {
      where.isPublished = true;
    }

    if (userId) {
      where.userId = userId;
    }

    const testimonials = await db.testimonial.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            instansi: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil testimoni' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/testimonial
 * Create a new testimonial.
 *
 * Body: { userId, name, instansi?, rating, message, borrowingId?, source? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, instansi, rating, message, borrowingId, source } = body;

    // Validate required fields
    if (!userId || !name || !message || rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Field userId, name, message, dan rating wajib diisi' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating harus berupa angka antara 1-5' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // If borrowingId is provided, verify it exists
    if (borrowingId) {
      const borrowing = await db.borrowing.findUnique({ where: { id: borrowingId } });
      if (!borrowing) {
        return NextResponse.json(
          { error: 'Peminjaman tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    const testimonial = await db.testimonial.create({
      data: {
        userId,
        name,
        instansi: instansi || null,
        rating,
        message,
        borrowingId: borrowingId || null,
        source: source || 'app',
        isPublished: false,
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
      { message: 'Testimoni berhasil dibuat', testimonial },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create testimonial error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat testimoni' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/testimonial
 * Update testimonial (admin publish/unpublish).
 *
 * Body: { id, isPublished }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isPublished } = body;

    if (!id || isPublished === undefined || isPublished === null) {
      return NextResponse.json(
        { error: 'Field id dan isPublished wajib diisi' },
        { status: 400 }
      );
    }

    // Verify testimonial exists
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Testimoni tidak ditemukan' },
        { status: 404 }
      );
    }

    const testimonial = await db.testimonial.update({
      where: { id },
      data: { isPublished: Boolean(isPublished) },
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

    return NextResponse.json({
      message: isPublished
        ? 'Testimoni berhasil dipublikasikan'
        : 'Testimoni berhasil disembunyikan',
      testimonial,
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate testimoni' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/testimonial
 * Delete a testimonial.
 *
 * Body: { id }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Field id wajib diisi' },
        { status: 400 }
      );
    }

    // Verify testimonial exists
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Testimoni tidak ditemukan' },
        { status: 404 }
      );
    }

    await db.testimonial.delete({ where: { id } });

    return NextResponse.json({
      message: 'Testimoni berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus testimoni' },
      { status: 500 }
    );
  }
}
