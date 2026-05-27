import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/notifications/list
 * List all notifications (for admin dashboard)
 *
 * Query params:
 * - type: filter by type ("whatsapp" | "email")
 * - status: filter by status ("pending" | "sent" | "failed")
 * - page: page number (default 1)
 * - limit: items per page (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, string> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where }),
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List notifications error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data notifikasi' },
      { status: 500 }
    );
  }
}
