import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateKOPHtml, generatePrintCSS, parseTemplateSettings, type KopSettings, type TemplateSettings } from '@/lib/kop-utils';

// GET /api/agreement?id=xxx - Retrieve agreement for a borrowing
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

    if (!borrowing.nomorPerjanjian || !borrowing.perjanjianText) {
      return NextResponse.json(
        { error: 'Perjanjian belum tersedia untuk peminjaman ini' },
        { status: 404 }
      );
    }

    // Fetch KOP, signatory, and template settings for client-side use
    const settingsKeys = [
      'kop_nama_instansi', 'kop_alamat', 'kop_telepon', 'kop_email',
      'kop_website', 'kop_logo', 'kop_kabupaten',
      'penandatangan_nama', 'penandatangan_jabatan', 'penandatangan_nip', 'penandatangan_foto_ttd',
      'template_primary_color', 'template_font_family', 'template_font_size',
      'template_kop_line_style', 'template_paper_size',
      'template_margin_top', 'template_margin_bottom', 'template_margin_left', 'template_margin_right',
      'template_show_kop_logo', 'template_show_footer', 'template_footer_text',
    ];
    const settingsRecords = await db.settings.findMany({
      where: { key: { in: settingsKeys } },
    });
    const settingsMap: Record<string, string> = {};
    for (const s of settingsRecords) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      borrowing: {
        id: borrowing.id,
        type: borrowing.type,
        kegiatan: borrowing.kegiatan,
        tanggalPinjam: borrowing.tanggalPinjam,
        tanggalKembali: borrowing.tanggalKembali,
        status: borrowing.status,
        nomorPerjanjian: borrowing.nomorPerjanjian,
        tarif: borrowing.tarif,
        totalBiaya: borrowing.totalBiaya,
        perjanjianText: borrowing.perjanjianText,
        userAcceptedAt: borrowing.userAcceptedAt,
        catatanAdmin: borrowing.catatanAdmin,
        approvedAt: borrowing.approvedAt,
        createdAt: borrowing.createdAt,
        user: borrowing.user,
        kendaraan: borrowing.kendaraan,
        jenisKegiatan: borrowing.jenisKegiatan,
        waktuPenggunaan: borrowing.waktuPenggunaan,
        keperluanKendaraan: borrowing.keperluanKendaraan,
        tujuan: borrowing.tujuan,
        jumlahPenumpang: borrowing.jumlahPenumpang,
        sopir: borrowing.sopir,
        qrToken: borrowing.qrToken || null,
      },
      kopSettings: settingsMap,
    });
  } catch (error) {
    console.error('Get agreement error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil perjanjian' },
      { status: 500 }
    );
  }
}

// POST /api/agreement - Generate agreement for a borrowing (called on approval)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { borrowingId } = body;

    if (!borrowingId) {
      return NextResponse.json(
        { error: 'ID peminjaman wajib diisi' },
        { status: 400 }
      );
    }

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

    if (borrowing.status !== 'approved' && borrowing.status !== 'completed') {
      return NextResponse.json(
        { error: 'Perjanjian hanya dapat dibuat untuk peminjaman yang disetujui' },
        { status: 400 }
      );
    }

    // If agreement already exists, return it instead of generating a new one
    if (borrowing.nomorPerjanjian && borrowing.perjanjianText) {
      return NextResponse.json({
        message: 'Perjanjian sudah tersedia',
        agreement: {
          nomorPerjanjian: borrowing.nomorPerjanjian,
          tarif: borrowing.tarif,
          totalBiaya: borrowing.totalBiaya,
        },
      });
    }

    // Generate agreement number
    const year = new Date().getFullYear();
    const count = await db.borrowing.count({
      where: {
        nomorPerjanjian: { not: null },
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
    });
    const seqNum = String(count + 1).padStart(3, '0');
    const nomorPerjanjian = `PERJ/BKAD/${year}/${seqNum}`;

    // Calculate tariff using settings from DB
    const settingsRecords = await db.settings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settingsRecords) {
      settingsMap[s.key] = s.value;
    }

    let tarifPerDay = 0;
    let detailTarif = '';

    if (borrowing.type === 'aula') {
      const isPemerintah = borrowing.jenisKegiatan === 'pemerintah';
      const isSiang = borrowing.waktuPenggunaan === 'siang';
      const tarifKey = isPemerintah
        ? (isSiang ? 'tarif_aula_pemerintah_siang' : 'tarif_aula_pemerintah_malam')
        : (isSiang ? 'tarif_aula_umum_siang' : 'tarif_aula_umum_malam');
      tarifPerDay = parseInt(settingsMap[tarifKey]) ||
        (isPemerintah ? (isSiang ? 1000000 : 1500000) : (isSiang ? 1500000 : 2000000));
      detailTarif = isPemerintah
        ? `Kegiatan Pemerintah & Organisasi - ${isSiang ? 'Siang (07:00-17:00 WIB)' : 'Malam (17:00-23:00 WIB)'}`
        : `Keperluan Umum & Komersil - ${isSiang ? 'Siang (07:00-17:00 WIB)' : 'Malam (17:00-23:00 WIB)'}`;
    } else {
      const isPelajar = borrowing.keperluanKendaraan === 'pelajar';
      const isMediumBus = borrowing.kendaraan?.jenis === 'medium_bus';
      const tarifKey = isMediumBus
        ? (isPelajar ? 'tarif_kendaraan_medium_pelajar' : 'tarif_kendaraan_medium_komersil')
        : (isPelajar ? 'tarif_kendaraan_mini_pelajar' : 'tarif_kendaraan_mini_komersil');
      tarifPerDay = parseInt(settingsMap[tarifKey]) ||
        (isMediumBus ? (isPelajar ? 500000 : 1000000) : (isPelajar ? 500000 : 750000));
      detailTarif = `${isMediumBus ? 'Medium Bus' : 'Mini Bus'} - ${isPelajar ? 'Pelajar' : 'Komersil'}`;

      // Add sopir fee
      const tarifSopir = parseInt(settingsMap.tarif_kendaraan_sopir) || 200000;
      tarifPerDay += tarifSopir;
      detailTarif += ` + Sopir (${tarifSopir.toLocaleString('id-ID')})`;
    }

    // Calculate number of days
    const tglPinjam = new Date(borrowing.tanggalPinjam);
    const tglKembali = new Date(borrowing.tanggalKembali);
    const diffTime = Math.abs(tglKembali.getTime() - tglPinjam.getTime());
    const jumlahHari = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1); // +1 to include both start and end dates
    
    // Calculate total: tarif per day × number of days
    const totalBiaya = tarifPerDay * jumlahHari;

    const formatCurrency = (num: number) =>
      `Rp ${num.toLocaleString('id-ID')}`;

    const tanggalPinjam = new Date(borrowing.tanggalPinjam).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const tanggalKembali = new Date(borrowing.tanggalKembali).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const tanggalPersetujuan = borrowing.approvedAt
      ? new Date(borrowing.approvedAt).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      : new Date().toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
        });

    // Generate agreement HTML text with KOP and signatory
    const perdaTitle = settingsMap.perda_title || 'Perda Kab. Seruyan No. 10 Tahun 2025';
    const perjanjianText = generateAgreementHTML({
      nomorPerjanjian,
      borrowing,
      tanggalPinjam,
      tanggalKembali,
      tanggalPersetujuan,
      detailTarif,
      formatCurrency: (n: number) => formatCurrency(n),
      tarifPerDay,
      jumlahHari,
      totalBiaya,
      perdaTitle,
      settingsMap,
    });

    // Update borrowing with agreement data
    const updated = await db.borrowing.update({
      where: { id: borrowingId },
      data: {
        nomorPerjanjian,
        tarif: tarifPerDay.toString(),
        totalBiaya: totalBiaya.toString(),
        perjanjianText,
      },
    });

    return NextResponse.json({
      message: 'Perjanjian berhasil dibuat',
      agreement: {
        nomorPerjanjian: updated.nomorPerjanjian,
        tarif: updated.tarif,
        totalBiaya: updated.totalBiaya,
        jumlahHari,
        tarifPerDay,
      },
    });
  } catch (error) {
    console.error('Generate agreement error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat perjanjian' },
      { status: 500 }
    );
  }
}

// PUT /api/agreement - User accepts agreement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID peminjaman wajib diisi' },
        { status: 400 }
      );
    }

    const borrowing = await db.borrowing.findUnique({
      where: { id },
    });

    if (!borrowing) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!borrowing.nomorPerjanjian) {
      return NextResponse.json(
        { error: 'Perjanjian belum tersedia' },
        { status: 400 }
      );
    }

    if (borrowing.userAcceptedAt) {
      return NextResponse.json(
        { error: 'Perjanjian sudah disetujui sebelumnya' },
        { status: 400 }
      );
    }

    const updated = await db.borrowing.update({
      where: { id },
      data: {
        userAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Perjanjian berhasil disetujui',
      userAcceptedAt: updated.userAcceptedAt,
    });
  } catch (error) {
    console.error('Accept agreement error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyetujui perjanjian' },
      { status: 500 }
    );
  }
}

function generateAgreementHTML({
  nomorPerjanjian,
  borrowing,
  tanggalPinjam,
  tanggalKembali,
  tanggalPersetujuan,
  detailTarif,
  formatCurrency,
  tarifPerDay,
  jumlahHari,
  totalBiaya,
  perdaTitle,
  settingsMap,
}: {
  nomorPerjanjian: string;
  borrowing: {
    type: string;
    kegiatan: string;
    user: { name: string; email: string; phone?: string | null; instansi?: string | null; fotoTtd?: string | null };
    kendaraan?: { nama: string; platNomor: string; jenis: string; kapasitas: number } | null;
    jenisKegiatan?: string | null;
    waktuPenggunaan?: string | null;
    keperluanKendaraan?: string | null;
    tujuan?: string | null;
    jumlahPenumpang?: number | null;
    sopir?: string | null;
    catatanAdmin?: string | null;
  };
  tanggalPinjam: string;
  tanggalKembali: string;
  tanggalPersetujuan: string;
  detailTarif: string;
  formatCurrency: (n: number) => string;
  tarifPerDay: number;
  jumlahHari: number;
  totalBiaya: number;
  perdaTitle?: string;
  settingsMap: Record<string, string>;
}): string {
  const isAula = borrowing.type === 'aula';
  const jenisPeminjaman = isAula ? 'Sewa Aula BKAD' : 'Pemakaian Kendaraan Bermotor';
  const pasalTarif = isAula ? 'Pasal 4' : 'Pasal 7';
  const perdaRef = perdaTitle || 'Perda Kab. Seruyan No. 10 Tahun 2025';

  // KOP settings
  const kopNamaInstansi = settingsMap.kop_nama_instansi || 'Badan Keuangan dan Aset Daerah';
  const kopKabupaten = settingsMap.kop_kabupaten || 'Kabupaten Seruyan';
  const kopAlamat = settingsMap.kop_alamat || 'Kantor BKAD Kabupaten Seruyan';
  const kopTelepon = settingsMap.kop_telepon || '';
  const kopEmail = settingsMap.kop_email || '';
  const kopWebsite = settingsMap.kop_website || '';
  const kopLogo = settingsMap.kop_logo || '';

  // Template settings
  const template = parseTemplateSettings(settingsMap);
  const color = template.primaryColor;

  // KOP settings for shared utility
  const kopSettings: KopSettings = {
    namaInstansi: kopNamaInstansi,
    kabupaten: kopKabupaten,
    alamat: kopAlamat,
    telepon: kopTelepon,
    email: kopEmail,
    website: kopWebsite,
    logo: kopLogo,
  };

  // KOP HTML using shared utility
  const kopHtml = generateKOPHtml(kopSettings, template);

  // Signatory settings
  const penandatanganNama = settingsMap.penandatangan_nama || 'Kepala Badan Keuangan dan Aset Daerah';
  const penandatanganJabatan = settingsMap.penandatangan_jabatan || 'Kepala BKAD';
  const penandatanganNip = settingsMap.penandatangan_nip || '';
  const penandatanganFotoTtd = settingsMap.penandatangan_foto_ttd || '';

  // Build signature image HTML
  const ttdImgHtml = penandatanganFotoTtd
    ? `<img src="${penandatanganFotoTtd}" alt="Tanda Tangan" style="height:60px;margin:4px auto;" />`
    : '<div style="height:60px;"></div>';

  const kendaraanInfo = !isAula && borrowing.kendaraan
    ? `
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};width:180px;">Kendaraan</td>
            <td style="padding:6px 12px;">${borrowing.kendaraan.nama} (${borrowing.kendaraan.platNomor})</td>
          </tr>
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};">Kapasitas</td>
            <td style="padding:6px 12px;">${borrowing.kendaraan.kapasitas} orang</td>
          </tr>
          ${borrowing.tujuan ? `<tr><td style="padding:6px 12px;font-weight:600;color:${color};">Tujuan</td><td style="padding:6px 12px;">${borrowing.tujuan}</td></tr>` : ''}
          ${borrowing.jumlahPenumpang ? `<tr><td style="padding:6px 12px;font-weight:600;color:${color};">Jumlah Penumpang</td><td style="padding:6px 12px;">${borrowing.jumlahPenumpang} orang</td></tr>` : ''}
          ${borrowing.sopir ? `<tr><td style="padding:6px 12px;font-weight:600;color:${color};">Sopir</td><td style="padding:6px 12px;">${borrowing.sopir}</td></tr>` : ''}
    `
    : '';

  const aulaInfo = isAula
    ? `
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};width:180px;">Jenis Kegiatan</td>
            <td style="padding:6px 12px;">${borrowing.jenisKegiatan === 'pemerintah' ? 'Kegiatan Pemerintah & Organisasi' : 'Keperluan Umum & Komersil'}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};">Waktu Penggunaan</td>
            <td style="padding:6px 12px;">${borrowing.waktuPenggunaan === 'siang' ? 'Siang (07:00 - 17:00 WIB)' : 'Malam (17:00 - 23:00 WIB)'}</td>
          </tr>
    `
    : '';

  return `
    <div style="font-family:'${template.fontFamily}',serif;max-width:700px;margin:0 auto;padding:40px 30px;color:#1a1a1a;line-height:1.7;">
      <!-- KOP Header -->
      ${kopHtml}

      <!-- Title -->
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="margin:0;font-size:18px;font-weight:bold;text-transform:uppercase;text-decoration:underline;color:#1a1a1a;">
          Surat Perjanjian ${jenisPeminjaman}
        </h1>
        <p style="margin:4px 0 0;font-size:13px;color:${color};font-weight:600;">
          Nomor: ${nomorPerjanjian}
        </p>
      </div>

      <!-- Preamble -->
      <div style="margin-bottom:20px;font-size:14px;text-align:justify;">
        <p>Pada hari ini, <strong>${tanggalPersetujuan}</strong>, yang bertanda tangan di bawah ini:</p>
      </div>

      <!-- Party 1 - with signatory settings -->
      <div style="margin-bottom:16px;font-size:14px;">
        <p style="font-weight:bold;margin-bottom:4px;">PIHAK PERTAMA (Pemberi Pinjaman):</p>
        <table style="border:none;margin-left:16px;">
          <tr><td style="padding:2px 12px;vertical-align:top;width:120px;">Nama</td><td style="padding:2px 12px;vertical-align:top;">: ${penandatanganNama}</td></tr>
          <tr><td style="padding:2px 12px;vertical-align:top;">Jabatan</td><td style="padding:2px 12px;vertical-align:top;">: ${penandatanganJabatan} ${kopKabupaten}</td></tr>
          ${penandatanganNip ? `<tr><td style="padding:2px 12px;vertical-align:top;">NIP</td><td style="padding:2px 12px;vertical-align:top;">: ${penandatanganNip}</td></tr>` : ''}
          <tr><td style="padding:2px 12px;vertical-align:top;">Alamat</td><td style="padding:2px 12px;vertical-align:top;">: ${kopAlamat}</td></tr>
        </table>
      </div>

      <!-- Party 2 -->
      <div style="margin-bottom:20px;font-size:14px;">
        <p style="font-weight:bold;margin-bottom:4px;">PIHAK KEDUA (Peminjam):</p>
        <table style="border:none;margin-left:16px;">
          <tr><td style="padding:2px 12px;vertical-align:top;width:120px;">Nama</td><td style="padding:2px 12px;vertical-align:top;">: ${borrowing.user.name}</td></tr>
          ${borrowing.user.instansi ? `<tr><td style="padding:2px 12px;vertical-align:top;">Instansi</td><td style="padding:2px 12px;vertical-align:top;">: ${borrowing.user.instansi}</td></tr>` : ''}
          <tr><td style="padding:2px 12px;vertical-align:top;">Email</td><td style="padding:2px 12px;vertical-align:top;">: ${borrowing.user.email}</td></tr>
          ${borrowing.user.phone ? `<tr><td style="padding:2px 12px;vertical-align:top;">Telepon</td><td style="padding:2px 12px;vertical-align:top;">: ${borrowing.user.phone}</td></tr>` : ''}
        </table>
      </div>

      <!-- Agreement Body -->
      <div style="margin-bottom:20px;font-size:14px;text-align:justify;">
        <p>Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong> dan <strong>PIHAK KEDUA</strong>, sepakat mengadakan perjanjian ${jenisPeminjaman.toLowerCase()} dengan ketentuan sebagai berikut:</p>
      </div>

      <!-- Pasal 1 - Objek Perjanjian -->
      <div style="margin-bottom:16px;font-size:14px;">
        <p style="font-weight:bold;margin-bottom:6px;">PASAL 1 - OBJEK PERJANJIAN</p>
        <ol style="margin:0;padding-left:24px;text-align:justify;">
          <li>PIHAK PERTAMA memberikan ${isAula ? 'Aula BKAD' : 'Kendaraan Bermotor'} kepada PIHAK KEDUA untuk digunakan dalam kegiatan <strong>"${borrowing.kegiatan}"</strong>.</li>
          <li>Perincian peminjaman sebagai berikut:</li>
        </ol>
        <table style="width:100%;border-collapse:collapse;margin:8px 0 8px 24px;font-size:13px;">
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};width:180px;">Jenis Peminjaman</td>
            <td style="padding:6px 12px;">${jenisPeminjaman}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};">Kegiatan</td>
            <td style="padding:6px 12px;">${borrowing.kegiatan}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};">Tanggal Pinjam</td>
            <td style="padding:6px 12px;">${tanggalPinjam}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};">Tanggal Kembali</td>
            <td style="padding:6px 12px;">${tanggalKembali}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px;font-weight:600;color:${color};">Jumlah Hari</td>
            <td style="padding:6px 12px;">${jumlahHari} hari</td>
          </tr>
          ${aulaInfo}
          ${kendaraanInfo}
        </table>
      </div>

      <!-- Pasal 2 - Tarif with auto-calculation -->
      <div style="margin-bottom:16px;font-size:14px;">
        <p style="font-weight:bold;margin-bottom:6px;">PASAL 2 - TARIF RETRIBUSI</p>
        <ol style="margin:0;padding-left:24px;text-align:justify;">
          <li>Berdasarkan ${pasalTarif} Peraturan Bupati tentang Tarif Retribusi atas Pelayanan ${jenisPeminjaman} sesuai ${perdaRef}, PIHAK KEDUA wajib membayar retribusi sebesar:</li>
        </ol>
        <div style="margin:10px 0 10px 24px;padding:12px;background:${color}10;border:1px solid ${color}30;border-radius:6px;">
          <p style="margin:0;font-size:12px;color:${color};">${detailTarif}</p>
          <table style="width:100%;margin-top:8px;font-size:13px;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 8px;">Tarif per Hari</td>
              <td style="padding:4px 8px;text-align:right;font-weight:600;">${formatCurrency(tarifPerDay)}</td>
            </tr>
            <tr>
              <td style="padding:4px 8px;">Jumlah Hari</td>
              <td style="padding:4px 8px;text-align:right;font-weight:600;">${jumlahHari} hari</td>
            </tr>
            <tr style="border-top:2px solid ${color};">
              <td style="padding:6px 8px;font-weight:bold;font-size:15px;">TOTAL BIAYA</td>
              <td style="padding:6px 8px;text-align:right;font-weight:bold;font-size:18px;color:${color};">${formatCurrency(totalBiaya)}</td>
            </tr>
          </table>
          <p style="margin:6px 0 0;font-size:11px;color:${color};font-style:italic;">(${terbilang(totalBiaya)} Rupiah)</p>
        </div>
        <ol start="2" style="margin:0;padding-left:24px;text-align:justify;">
          <li>Pembayaran dilakukan melalui Kas Daerah sebelum pelaksanaan kegiatan.</li>
          <li>Bukti pembayaran wajib ditunjukkan pada saat penyerahan ${isAula ? 'Aula' : 'Kendaraan'}.</li>
        </ol>
      </div>

      <!-- Pasal 3 - Kewajiban -->
      <div style="margin-bottom:16px;font-size:14px;">
        <p style="font-weight:bold;margin-bottom:6px;">PASAL 3 - KEWAJIBAN PIHAK KEDUA</p>
        <ol style="margin:0;padding-left:24px;text-align:justify;">
          ${isAula ? `
          <li>Menjaga kebersihan dan kerapian Aula selama dan setelah penggunaan.</li>
          <li>Memulangkan Aula sesuai waktu yang telah disepakati.</li>
          <li>Bertanggung jawab atas kerusakan yang terjadi akibat kelalaian.</li>
          <li>Tidak memindahkan atau mengubah tata letak perabot tanpa izin.</li>
          ` : `
          <li>Menjaga keamanan dan kebersihan kendaraan selama peminjaman.</li>
          <li>Mengembalikan kendaraan tepat waktu sesuai kesepakatan.</li>
          <li>Bertanggung jawab atas kerusakan atau kehilangan akibat kelalaian.</li>
          <li>Tidak menggunakan kendaraan untuk tujuan di luar yang disepakati.</li>
          <li>Menanggung seluruh biaya bahan bakar selama peminjaman.</li>
          <li>Melaporkan segala kerusakan atau kecelakaan kepada BKAD.</li>
          `}
        </ol>
      </div>

      <!-- Pasal 4 - Sanksi -->
      <div style="margin-bottom:16px;font-size:14px;">
        <p style="font-weight:bold;margin-bottom:6px;">PASAL 4 - SANKSI</p>
        <ol style="margin:0;padding-left:24px;text-align:justify;">
          <li>Keterlambatan pengembalian dikenakan denda sebesar 10% dari tarif per ${isAula ? 'jam' : 'hari'} keterlambatan.</li>
          <li>Kerusakan akibat kelalaian menjadi tanggung jawab PIHAK KEDUA sepenuhnya.</li>
          <li>Pelanggaran ketentuan dapat mengakibatkan pemblokiran peminjaman di masa mendatang.</li>
        </ol>
      </div>

      <!-- Pasal 5 - Penutup -->
      <div style="margin-bottom:20px;font-size:14px;text-align:justify;">
        <p style="font-weight:bold;margin-bottom:6px;">PASAL 5 - PENUTUP</p>
        <ol style="margin:0;padding-left:24px;">
          <li>Perjanjian ini berlaku sejak tanggal ditandatangani sampai dengan selesainya kegiatan.</li>
          <li>Perjanjian ini dibuat rangkap 2 (dua) dan masing-masing pihak mendapatkan 1 (satu) rangkap.</li>
          <li>Perubahan atas perjanjian ini harus disetujui oleh kedua belah pihak secara tertulis.</li>
        </ol>
      </div>

      ${borrowing.catatanAdmin ? `
      <!-- Catatan Khusus -->
      <div style="margin-bottom:20px;font-size:14px;">
        <p style="font-weight:bold;margin-bottom:6px;">CATATAN KHUSUS:</p>
        <div style="padding:10px;background:#fef9c3;border:1px solid #fde047;border-radius:6px;font-size:13px;">
          ${borrowing.catatanAdmin}
        </div>
      </div>
      ` : ''}

      <!-- Signatures with signatory settings -->
      <div style="margin-top:30px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;">
          <div style="text-align:center;width:45%;">
            <p style="font-weight:bold;">PIHAK PERTAMA,</p>
            <p>${penandatanganJabatan}</p>
            ${ttdImgHtml}
            <p style="font-weight:bold;text-decoration:underline;">(${penandatanganNama})</p>
            ${penandatanganNip ? `<p>NIP. ${penandatanganNip}</p>` : ''}
          </div>
          <div style="text-align:center;width:45%;">
            <p style="font-weight:bold;">PIHAK KEDUA,</p>
            <p>Peminjam</p>
            ${borrowing.user.fotoTtd ? `<img src="${borrowing.user.fotoTtd}" alt="Tanda Tangan Peminjam" style="height:60px;margin:4px auto;" />` : '<div style="height:60px;"></div>'}
            <p style="font-weight:bold;text-decoration:underline;">(${borrowing.user.name})</p>
            ${borrowing.user.instansi ? `<p>${borrowing.user.instansi}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top:30px;padding-top:12px;border-top:2px solid ${color};text-align:center;font-size:11px;color:#6b7280;">
        <p>Dokumen ini dihasilkan secara otomatis oleh Sistem E-Pakar - ${kopNamaInstansi}</p>
        <p>Tanggal persetujuan: ${tanggalPersetujuan}</p>
      </div>
    </div>
  `;
}

// Helper: Convert number to Indonesian words (terbilang)
function terbilang(num: number): string {
  if (num === 0) return 'nol';
  
  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  const belasan = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
  
  function convert(n: number): string {
    if (n === 0) return '';
    if (n < 10) return satuan[n];
    if (n < 20) return belasan[n - 10];
    if (n < 100) {
      const s = Math.floor(n / 10);
      const r = n % 10;
      return satuan[s] + ' puluh' + (r ? ' ' + satuan[r] : '');
    }
    if (n < 200) return 'seratus' + (n - 100 ? ' ' + convert(n - 100) : '');
    if (n < 1000) {
      const s = Math.floor(n / 100);
      const r = n % 100;
      return satuan[s] + ' ratus' + (r ? ' ' + convert(r) : '');
    }
    if (n < 2000) return 'seribu' + (n - 1000 ? ' ' + convert(n - 1000) : '');
    if (n < 1000000) {
      const s = Math.floor(n / 1000);
      const r = n % 1000;
      return convert(s) + ' ribu' + (r ? ' ' + convert(r) : '');
    }
    if (n < 1000000000) {
      const s = Math.floor(n / 1000000);
      const r = n % 1000000;
      return convert(s) + ' juta' + (r ? ' ' + convert(r) : '');
    }
    if (n < 1000000000000) {
      const s = Math.floor(n / 1000000000);
      const r = n % 1000000000;
      return convert(s) + ' miliar' + (r ? ' ' + convert(r) : '');
    }
    return convert(Math.floor(n / 1000000000000)) + ' triliun' + (n % 1000000000000 ? ' ' + convert(n % 1000000000000) : '');
  }
  
  return convert(num);
}
