import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/receipt?id=xxx - Generate receipt data for a borrowing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID peminjaman wajib diisi' },
        { status: 400 }
      );
    }

    // Fetch the borrowing with user and kendaraan relations
    const borrowing = await db.borrowing.findUnique({
      where: { id },
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
    });

    if (!borrowing) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    // Receipt is available for approved or completed borrowings
    // nomorPerjanjian is optional - we generate receipt regardless
    if (borrowing.status !== 'approved' && borrowing.status !== 'completed') {
      return NextResponse.json(
        { error: 'Kwitansi hanya tersedia untuk peminjaman yang telah disetujui' },
        { status: 400 }
      );
    }

    // Fetch relevant settings including KOP, signatory, and template
    const settingsKeys = [
      'site_logo',
      'perda_title',
      'kop_nama_instansi', 'kop_alamat', 'kop_telepon', 'kop_email',
      'kop_website', 'kop_logo', 'kop_kabupaten',
      'penandatangan_nama', 'penandatangan_jabatan', 'penandatangan_nip', 'penandatangan_foto_ttd',
      'template_primary_color', 'template_font_family', 'template_font_size',
      'template_kop_line_style', 'template_paper_size',
      'template_margin_top', 'template_margin_bottom', 'template_margin_left', 'template_margin_right',
      'template_show_kop_logo', 'template_show_footer', 'template_footer_text',
      'site_url',
    ];
    const settingsRecords = await db.settings.findMany({
      where: { key: { in: settingsKeys } },
    });
    const settingsMap: Record<string, string> = {};
    for (const s of settingsRecords) {
      settingsMap[s.key] = s.value;
    }

    // Generate receipt number: KWIT/BKAD/{year}/{sequence}
    const borrowingYear = new Date(borrowing.createdAt).getFullYear();
    const allApprovedOrCompleted = await db.borrowing.findMany({
      where: {
        createdAt: {
          gte: new Date(`${borrowingYear}-01-01T00:00:00.000Z`),
          lt: new Date(`${borrowingYear + 1}-01-01T00:00:00.000Z`),
        },
        status: { in: ['approved', 'completed'] },
      },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const sequenceIndex = allApprovedOrCompleted.findIndex((b) => b.id === borrowing.id);
    const sequence = String(sequenceIndex >= 0 ? sequenceIndex + 1 : allApprovedOrCompleted.length + 1).padStart(3, '0');
    const nomorKwitansi = `KWIT/BKAD/${borrowingYear}/${sequence}`;

    // Calculate tariff, days, and total - auto-calculate if not stored
    let tarifPerDay = parseInt(borrowing.tarif || '0');
    let totalBiayaAmount = parseInt(borrowing.totalBiaya || '0');

    // If tarif is not stored (no agreement generated yet), calculate from settings
    if (!borrowing.tarif || tarifPerDay === 0) {
      const allSettings = await db.settings.findMany();
      const sm: Record<string, string> = {};
      for (const s of allSettings) { sm[s.key] = s.value; }

      if (borrowing.type === 'aula') {
        const isPemerintah = borrowing.jenisKegiatan === 'pemerintah';
        const isSiang = borrowing.waktuPenggunaan === 'siang';
        const tarifKey = isPemerintah
          ? (isSiang ? 'tarif_aula_pemerintah_siang' : 'tarif_aula_pemerintah_malam')
          : (isSiang ? 'tarif_aula_umum_siang' : 'tarif_aula_umum_malam');
        tarifPerDay = parseInt(sm[tarifKey]) ||
          (isPemerintah ? (isSiang ? 1000000 : 1500000) : (isSiang ? 1500000 : 2000000));
      } else {
        const isPelajar = borrowing.keperluanKendaraan === 'pelajar';
        const isMediumBus = borrowing.kendaraan?.jenis === 'medium_bus';
        const tarifKey = isMediumBus
          ? (isPelajar ? 'tarif_kendaraan_medium_pelajar' : 'tarif_kendaraan_medium_komersil')
          : (isPelajar ? 'tarif_kendaraan_mini_pelajar' : 'tarif_kendaraan_mini_komersil');
        tarifPerDay = parseInt(sm[tarifKey]) ||
          (isMediumBus ? (isPelajar ? 500000 : 1000000) : (isPelajar ? 500000 : 750000));
        const tarifSopir = parseInt(sm.tarif_kendaraan_sopir) || 200000;
        tarifPerDay += tarifSopir;
      }

      const tglP = new Date(borrowing.tanggalPinjam);
      const tglK = new Date(borrowing.tanggalKembali);
      const diffT = Math.abs(tglK.getTime() - tglP.getTime());
      const jmlHari = Math.max(1, Math.ceil(diffT / (1000 * 60 * 60 * 24)) + 1);
      totalBiayaAmount = tarifPerDay * jmlHari;
    }
    
    // Calculate number of days from dates
    const tglPinjam = new Date(borrowing.tanggalPinjam);
    const tglKembali = new Date(borrowing.tanggalKembali);
    const diffTime = Math.abs(tglKembali.getTime() - tglPinjam.getTime());
    const jumlahHari = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const formatCurrency = (num: number) =>
      `Rp ${num.toLocaleString('id-ID')}`;

    // Build receipt data with KOP and signatory settings
    const receipt = {
      nomor: nomorKwitansi,
      tanggal: borrowing.approvedAt
        ? new Date(borrowing.approvedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      peminjam: {
        nama: borrowing.user.name,
        instansi: borrowing.user.instansi || '-',
        email: borrowing.user.email,
        phone: borrowing.user.phone || '-',
        fotoTtd: borrowing.user.fotoTtd || '',
      },
      kegiatan: borrowing.kegiatan,
      tipe: borrowing.type,
      tanggalPinjam: borrowing.tanggalPinjam,
      tanggalKembali: borrowing.tanggalKembali,
      jumlahHari,
      detail: {
        jenisKegiatan: borrowing.jenisKegiatan || null,
        waktuPenggunaan: borrowing.waktuPenggunaan || null,
        keperluanKendaraan: borrowing.keperluanKendaraan || null,
        tujuan: borrowing.tujuan || null,
        jumlahPenumpang: borrowing.jumlahPenumpang || null,
        sopir: borrowing.sopir || null,
      },
      tarifPerDay: tarifPerDay,
      tarif: formatCurrency(tarifPerDay),
      tarifAmount: tarifPerDay,
      jumlahHariDetail: jumlahHari,
      totalBiaya: formatCurrency(totalBiayaAmount),
      totalBiayaAmount,
      nomorPerjanjian: borrowing.nomorPerjanjian,
      approvedBy: borrowing.approvedBy || null,
      approvedAt: borrowing.approvedAt
        ? new Date(borrowing.approvedAt).toISOString().split('T')[0]
        : null,
      siteLogo: settingsMap.kop_logo || settingsMap.site_logo || null,
      perdaTitle: settingsMap.perda_title || 'Perda Kab. Seruyan No. 10 Tahun 2025',
      kendaraan: borrowing.kendaraan
        ? {
            nama: borrowing.kendaraan.nama,
            jenis: borrowing.kendaraan.jenis,
            platNomor: borrowing.kendaraan.platNomor,
            kapasitas: borrowing.kendaraan.kapasitas,
          }
        : null,
      catatanAdmin: borrowing.catatanAdmin || null,
      qrToken: borrowing.qrToken || null,
      siteUrl: settingsMap.site_url || process.env.NEXT_PUBLIC_APP_URL || null,
      // KOP settings
      kop: {
        namaInstansi: settingsMap.kop_nama_instansi || 'Badan Keuangan dan Aset Daerah',
        kabupaten: settingsMap.kop_kabupaten || 'Kabupaten Seruyan',
        alamat: settingsMap.kop_alamat || '',
        telepon: settingsMap.kop_telepon || '',
        email: settingsMap.kop_email || '',
        website: settingsMap.kop_website || '',
        logo: settingsMap.kop_logo || settingsMap.site_logo || '',
      },
      // Signatory settings
      penandatangan: {
        nama: settingsMap.penandatangan_nama || '',
        jabatan: settingsMap.penandatangan_jabatan || '',
        nip: settingsMap.penandatangan_nip || '',
        fotoTtd: settingsMap.penandatangan_foto_ttd || '',
      },
      // Template settings
      template: {
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
      },
    };

    return NextResponse.json({ receipt }, { status: 200 });
  } catch (error) {
    console.error('Generate receipt error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghasilkan kwitansi' },
      { status: 500 }
    );
  }
}
