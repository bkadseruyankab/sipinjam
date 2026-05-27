import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users — List all users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          instansi: true,
          fotoTtd: true,
          createdAt: true,
          _count: {
            select: {
              borrowings: true,
              testimonials: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    // Transform _count to borrowCount and testimonialCount for the client
    const transformedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      phone: u.phone || '',
      instansi: u.instansi || '',
      fotoTtd: u.fotoTtd || null,
      borrowCount: u._count.borrowings,
      testimonialCount: u._count.testimonials,
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      users: transformedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Gagal mengambil data pengguna:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengguna' },
      { status: 500 }
    );
  }
}

// PUT /api/users — Update a user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, role, phone, instansi, fotoTtd } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID pengguna wajib diisi' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate email uniqueness if changing email
    if (email && email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh pengguna lain' },
          { status: 409 }
        );
      }
    }

    // Prevent demoting the last admin
    if (existingUser.role === 'admin' && role === 'user') {
      const adminCount = await db.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Tidak dapat mengubah role admin terakhir' },
          { status: 403 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (instansi !== undefined) updateData.instansi = instansi;
    if (fotoTtd !== undefined) updateData.fotoTtd = fotoTtd;

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        instansi: true,
        fotoTtd: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Gagal memperbarui pengguna:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengguna' },
      { status: 500 }
    );
  }
}

// DELETE /api/users — Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID pengguna wajib diisi' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'admin') {
      const adminCount = await db.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Tidak dapat menghapus admin terakhir' },
          { status: 403 }
        );
      }
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Gagal menghapus pengguna:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengguna' },
      { status: 500 }
    );
  }
}
