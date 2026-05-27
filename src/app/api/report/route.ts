import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/report - Generate report data
// Query params: type, status, from, to, format
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // "aula", "kendaraan", "all"
    const status = searchParams.get('status') || 'all'; // status filter or "all"
    const from = searchParams.get('from') || `${new Date().getFullYear()}-01-01`; // default: start of current year
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0]; // default: today
    const format = searchParams.get('format') || 'summary'; // "summary" or "detail"

    // Validate type param
    if (!['aula', 'kendaraan', 'all'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe harus salah satu dari: aula, kendaraan, all' },
        { status: 400 }
      );
    }

    // Validate format param
    if (!['summary', 'detail'].includes(format)) {
      return NextResponse.json(
        { error: 'Format harus salah satu dari: summary, detail' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Prisma.BorrowingWhereInput = {};

    // Filter by type
    if (type !== 'all') {
      where.type = type;
    }

    // Filter by status
    if (status !== 'all') {
      where.status = status;
    }

    // Filter by date range
    if (from || to) {
      const tanggalPinjamFilter: Prisma.StringFilter = {};
      if (from) {
        tanggalPinjamFilter.gte = from;
      }
      if (to) {
        tanggalPinjamFilter.lte = to;
      }
      where.tanggalPinjam = tanggalPinjamFilter;
    }

    // Fetch borrowings with relations
    const borrowings = await db.borrowing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            instansi: true,
            fotoTtd: true,
          },
        },
        kendaraan: true,
      },
      orderBy: {
        tanggalPinjam: 'desc',
      },
    });

    // Fetch KOP, penandatangan, and template settings
    const settingKeys = [
      'kop_nama_instansi', 'kop_kabupaten', 'kop_alamat', 'kop_telepon', 'kop_email', 'kop_website', 'kop_logo',
      'penandatangan_nama', 'penandatangan_jabatan', 'penandatangan_nip', 'penandatangan_foto_ttd',
      'perda_title', 'site_name',
      'template_primary_color', 'template_font_family', 'template_font_size',
      'template_kop_line_style', 'template_paper_size',
      'template_margin_top', 'template_margin_bottom', 'template_margin_left', 'template_margin_right',
      'template_show_kop_logo', 'template_show_footer', 'template_footer_text',
    ];
    const settingsRows = await db.settings.findMany({
      where: { key: { in: settingKeys } },
    });
    const settingsMap: Record<string, string> = {};
    for (const s of settingsRows) {
      settingsMap[s.key] = s.value;
    }

    const kop = {
      namaInstansi: settingsMap.kop_nama_instansi || 'Badan Keuangan dan Aset Daerah',
      kabupaten: settingsMap.kop_kabupaten || 'Kabupaten Seruyan',
      alamat: settingsMap.kop_alamat || '',
      telepon: settingsMap.kop_telepon || '',
      email: settingsMap.kop_email || '',
      website: settingsMap.kop_website || '',
      logo: settingsMap.kop_logo || '',
    };

    const template = {
      primaryColor: settingsMap.template_primary_color || '#065f46',
      fontFamily: settingsMap.template_font_family || 'Times New Roman',
      fontSize: settingsMap.template_font_size || '12',
      kopLineStyle: settingsMap.template_kop_line_style || 'double',
      paperSize: settingsMap.template_paper_size || 'A4',
      marginTop: settingsMap.template_margin_top || '15',
      marginBottom: settingsMap.template_margin_bottom || '15',
      marginLeft: settingsMap.template_margin_left || '15',
      marginRight: settingsMap.template_margin_right || '15',
      showKopLogo: settingsMap.template_show_kop_logo || 'true',
      showFooter: settingsMap.template_show_footer || 'true',
      footerText: settingsMap.template_footer_text || '',
    };

    const penandatangan = {
      nama: settingsMap.penandatangan_nama || '',
      jabatan: settingsMap.penandatangan_jabatan || 'Kepala BKAD',
      nip: settingsMap.penandatangan_nip || '',
      foto: settingsMap.penandatangan_foto_ttd || '',
    };

    const perdaTitle = settingsMap.perda_title || 'Peraturan Daerah Kabupaten Seruyan';
    const siteName = settingsMap.site_name || 'E-Pakar';

    // Build summary stats
    const totalBorrowings = borrowings.length;
    const totalApproved = borrowings.filter((b) => b.status === 'approved').length;
    const totalRejected = borrowings.filter((b) => b.status === 'rejected').length;
    const totalPending = borrowings.filter((b) => b.status === 'pending').length;
    const totalCompleted = borrowings.filter((b) => b.status === 'completed').length;
    const totalCancelled = borrowings.filter((b) => b.status === 'cancelled').length;
    const totalCancelRequested = borrowings.filter((b) => b.status === 'cancel_requested').length;

    // Calculate total revenue from completed and approved borrowings
    const revenueBorrowings = borrowings.filter(
      (b) => b.status === 'completed' || b.status === 'approved'
    );
    const totalRevenue = revenueBorrowings.reduce((sum, b) => {
      return sum + parseInt(b.totalBiaya || '0');
    }, 0);

    // Breakdown by type
    const byType: Record<string, number> = {};
    for (const b of borrowings) {
      byType[b.type] = (byType[b.type] || 0) + 1;
    }

    // Revenue by type
    const revenueByType: Record<string, number> = {};
    for (const b of revenueBorrowings) {
      revenueByType[b.type] = (revenueByType[b.type] || 0) + parseInt(b.totalBiaya || '0');
    }

    // Monthly breakdown
    const monthlyBreakdown: Array<{
      month: string;
      totalBorrowings: number;
      totalApproved: number;
      totalRejected: number;
      totalPending: number;
      totalCompleted: number;
      totalCancelRequested: number;
      totalRevenue: number;
    }> = [];

    const monthMap = new Map<string, {
      totalBorrowings: number;
      totalApproved: number;
      totalRejected: number;
      totalPending: number;
      totalCompleted: number;
      totalCancelRequested: number;
      totalRevenue: number;
    }>();

    for (const b of borrowings) {
      const dateStr = b.tanggalPinjam.split('T')[0];
      const monthKey = dateStr.substring(0, 7);

      const existing = monthMap.get(monthKey) || {
        totalBorrowings: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalPending: 0,
        totalCompleted: 0,
        totalCancelRequested: 0,
        totalRevenue: 0,
      };

      existing.totalBorrowings += 1;
      if (b.status === 'approved') existing.totalApproved += 1;
      if (b.status === 'rejected') existing.totalRejected += 1;
      if (b.status === 'pending') existing.totalPending += 1;
      if (b.status === 'completed') existing.totalCompleted += 1;
      if (b.status === 'cancel_requested') existing.totalCancelRequested += 1;
      if (b.status === 'completed' || b.status === 'approved') {
        existing.totalRevenue += parseInt(b.totalBiaya || '0');
      }

      monthMap.set(monthKey, existing);
    }

    // Sort monthly breakdown by month key
    const sortedMonths = Array.from(monthMap.keys()).sort();
    for (const monthKey of sortedMonths) {
      const data = monthMap.get(monthKey)!;
      monthlyBreakdown.push({
        month: monthKey,
        ...data,
      });
    }

    // Build filters object for response
    const filters = {
      type,
      status,
      from,
      to,
      format,
    };

    // Build response
    const report: Record<string, unknown> = {
      filters,
      summary: {
        totalBorrowings,
        totalApproved,
        totalRejected,
        totalPending,
        totalCompleted,
        totalCancelled,
        totalCancelRequested,
        totalRevenue,
        byType,
        revenueByType,
        monthlyBreakdown,
      },
      kop,
      template,
      penandatangan,
      perdaTitle,
      siteName,
      generatedAt: new Date().toISOString(),
    };

    // For detail format, include full borrowing list
    if (format === 'detail') {
      const details = borrowings.map((b) => ({
        id: b.id,
        kegiatan: b.kegiatan,
        type: b.type,
        status: b.status,
        tanggalPinjam: b.tanggalPinjam,
        tanggalKembali: b.tanggalKembali,
        jenisKegiatan: b.jenisKegiatan || null,
        waktuPenggunaan: b.waktuPenggunaan || null,
        keperluanKendaraan: b.keperluanKendaraan || null,
        tujuan: b.tujuan || null,
        jumlahPenumpang: b.jumlahPenumpang || null,
        sopir: b.sopir || null,
        tarif: b.tarif || null,
        tarifAmount: parseInt(b.tarif || '0'),
        totalBiaya: b.totalBiaya || null,
        totalBiayaAmount: parseInt(b.totalBiaya || '0'),
        nomorPerjanjian: b.nomorPerjanjian || null,
        approvedBy: b.approvedBy || null,
        approvedAt: b.approvedAt ? new Date(b.approvedAt).toISOString() : null,
        catatanAdmin: b.catatanAdmin || null,
        cancelReason: b.cancelReason || null,
        cancelRequestedAt: b.cancelRequestedAt ? new Date(b.cancelRequestedAt).toISOString() : null,
        cancelRequestedBy: b.cancelRequestedBy || null,
        cancelApprovedBy: b.cancelApprovedBy || null,
        cancelApprovedAt: b.cancelApprovedAt ? new Date(b.cancelApprovedAt).toISOString() : null,
        createdAt: new Date(b.createdAt).toISOString(),
        user: {
          id: b.user.id,
          name: b.user.name,
          email: b.user.email,
          instansi: b.user.instansi || null,
          phone: b.user.phone || null,
        },
        kendaraan: b.kendaraan
          ? {
              id: b.kendaraan.id,
              nama: b.kendaraan.nama,
              jenis: b.kendaraan.jenis,
              platNomor: b.kendaraan.platNomor,
              kapasitas: b.kendaraan.kapasitas,
            }
          : null,
      }));

      report.details = details;
      report.totalDetails = details.length;
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghasilkan laporan' },
      { status: 500 }
    );
  }
}
