import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decodeToken } from '@/lib/auth'

// Helper: Get authenticated admin user from request
async function getAdminUser(request: NextRequest) {
  const token = request.cookies.get('epakar-token')?.value
  if (!token) return null

  const decoded = decodeToken(token)
  if (!decoded) return null

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  })

  if (!user || user.role !== 'admin') return null
  return user
}

const DEFAULT_TEMPLATES = [
  {
    name: 'Surat Permohonan Peminjaman Aula',
    type: 'surat_permohonan',
    description: 'Template surat permohonan untuk peminjaman aula',
    isDefault: true,
    isActive: true,
    content: `<div style="text-align:center;margin-bottom:20px;">
  <h3 style="margin:0;font-size:13px;text-decoration:underline;">SURAT PERMOHONAN PEMINJAMAN AULA</h3>
  <p style="margin:4px 0 0;font-size:11px;">Nomor: &lowast;&lowast;&lowast;&lowast;&lowast;&lowast;</p>
</div>

<p style="text-align:right;font-size:12px;">{{namaInstansi}}, {{tanggalCetak}}</p>

<p style="font-size:12px;">Kepada Yth.<br/>
Bapak/Ibu Kepala {{namaInstansi}}<br/>
{{kabupaten}}<br/>
di Tempat</p>

<p style="font-size:12px;margin-top:16px;">Perihal: <strong>Permohonan Peminjaman Aula</strong></p>

<p style="font-size:12px;margin-top:16px;">Dengan hormat,</p>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Yang bertanda tangan di bawah ini, kami dari <strong>{{instansi}}</strong>, dengan ini mengajukan permohonan peminjaman Aula untuk keperluan kegiatan sebagai berikut:
</p>

<table style="font-size:12px;margin:12px 0 12px 40px;border-collapse:collapse;" cellpadding="4">
  <tr><td style="vertical-align:top;width:180px;">Nama Kegiatan</td><td style="vertical-align:top;width:10px;">:</td><td>{{kegiatan}}</td></tr>
  <tr><td style="vertical-align:top;">Jenis Kegiatan</td><td style="vertical-align:top;">:</td><td>{{jenisKegiatan}}</td></tr>
  <tr><td style="vertical-align:top;">Waktu Penggunaan</td><td style="vertical-align:top;">:</td><td>{{waktuPenggunaan}}</td></tr>
  <tr><td style="vertical-align:top;">Tanggal Pinjam</td><td style="vertical-align:top;">:</td><td>{{tanggalPinjam}}</td></tr>
  <tr><td style="vertical-align:top;">Tanggal Kembali</td><td style="vertical-align:top;">:</td><td>{{tanggalKembali}}</td></tr>
  <tr><td style="vertical-align:top;">Jumlah Peserta</td><td style="vertical-align:top;">:</td><td>{{jumlahPeserta}} orang</td></tr>
  <tr><td style="vertical-align:top;">Penanggung Jawab</td><td style="vertical-align:top;">:</td><td>{{nama}}</td></tr>
  <tr><td style="vertical-align:top;">Instansi</td><td style="vertical-align:top;">:</td><td>{{instansi}}</td></tr>
</table>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Demikian surat permohonan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.
</p>

<table style="font-size:12px;margin-top:24px;width:100%;">
  <tr>
    <td style="width:50%;"></td>
    <td style="width:50%;text-align:center;">
      <p style="margin:0;">Hormat kami,</p>
      <div style="height:65px;"></div>
      <p style="margin:0;border-top:1px solid #1a1a1a;display:inline-block;padding-top:2px;">{{nama}}</p>
      <p style="margin:2px 0 0;font-size:11px;color:#4b5563;">{{instansi}}</p>
    </td>
  </tr>
</table>`,
  },
  {
    name: 'Surat Permohonan Peminjaman Kendaraan',
    type: 'surat_permohonan',
    description: 'Template surat permohonan untuk peminjaman kendaraan',
    isDefault: false,
    isActive: true,
    content: `<div style="text-align:center;margin-bottom:20px;">
  <h3 style="margin:0;font-size:13px;text-decoration:underline;">SURAT PERMOHONAN PEMINJAMAN KENDARAAN</h3>
  <p style="margin:4px 0 0;font-size:11px;">Nomor: &lowast;&lowast;&lowast;&lowast;&lowast;&lowast;</p>
</div>

<p style="text-align:right;font-size:12px;">{{namaInstansi}}, {{tanggalCetak}}</p>

<p style="font-size:12px;">Kepada Yth.<br/>
Bapak/Ibu Kepala {{namaInstansi}}<br/>
{{kabupaten}}<br/>
di Tempat</p>

<p style="font-size:12px;margin-top:16px;">Perihal: <strong>Permohonan Peminjaman Kendaraan</strong></p>

<p style="font-size:12px;margin-top:16px;">Dengan hormat,</p>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Yang bertanda tangan di bawah ini, kami dari <strong>{{instansi}}</strong>, dengan ini mengajukan permohonan peminjaman kendaraan untuk keperluan kegiatan sebagai berikut:
</p>

<table style="font-size:12px;margin:12px 0 12px 40px;border-collapse:collapse;" cellpadding="4">
  <tr><td style="vertical-align:top;width:180px;">Nama Kegiatan</td><td style="vertical-align:top;width:10px;">:</td><td>{{kegiatan}}</td></tr>
  <tr><td style="vertical-align:top;">Tanggal Pinjam</td><td style="vertical-align:top;">:</td><td>{{tanggalPinjam}}</td></tr>
  <tr><td style="vertical-align:top;">Tanggal Kembali</td><td style="vertical-align:top;">:</td><td>{{tanggalKembali}}</td></tr>
  <tr><td style="vertical-align:top;">Tujuan</td><td style="vertical-align:top;">:</td><td>{{tujuan}}</td></tr>
  <tr><td style="vertical-align:top;">Kendaraan</td><td style="vertical-align:top;">:</td><td>{{namaKendaraan}}</td></tr>
  <tr><td style="vertical-align:top;">Plat Nomor</td><td style="vertical-align:top;">:</td><td>{{platNomor}}</td></tr>
  <tr><td style="vertical-align:top;">Jumlah Penumpang</td><td style="vertical-align:top;">:</td><td>{{jumlahPenumpang}} orang</td></tr>
  <tr><td style="vertical-align:top;">Sopir</td><td style="vertical-align:top;">:</td><td>{{sopir}}</td></tr>
  <tr><td style="vertical-align:top;">Penanggung Jawab</td><td style="vertical-align:top;">:</td><td>{{nama}}</td></tr>
  <tr><td style="vertical-align:top;">Instansi</td><td style="vertical-align:top;">:</td><td>{{instansi}}</td></tr>
</table>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Demikian surat permohonan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.
</p>

<table style="font-size:12px;margin-top:24px;width:100%;">
  <tr>
    <td style="width:50%;"></td>
    <td style="width:50%;text-align:center;">
      <p style="margin:0;">Hormat kami,</p>
      <div style="height:65px;"></div>
      <p style="margin:0;border-top:1px solid #1a1a1a;display:inline-block;padding-top:2px;">{{nama}}</p>
      <p style="margin:2px 0 0;font-size:11px;color:#4b5563;">{{instansi}}</p>
    </td>
  </tr>
</table>`,
  },
  {
    name: 'Surat Persetujuan',
    type: 'surat_persetujuan',
    description: 'Template surat persetujuan peminjaman',
    isDefault: true,
    isActive: true,
    content: `<div style="text-align:center;margin-bottom:20px;">
  <h3 style="margin:0;font-size:13px;text-decoration:underline;">SURAT PERSETUJUAN PEMINJAMAN</h3>
  <p style="margin:4px 0 0;font-size:11px;">Nomor: {{nomorPerjanjian}}</p>
</div>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Yang bertanda tangan di bawah ini, Kepala {{namaInstansi}} {{kabupaten}}, dengan ini menyatakan menyetujui permohonan peminjaman dari <strong>{{instansi}}</strong> untuk penggunaan fasilitas sebagaimana tercantum di bawah ini:
</p>

<table style="font-size:12px;margin:12px 0 12px 40px;border-collapse:collapse;" cellpadding="4">
  <tr><td style="vertical-align:top;width:180px;">Nama Peminjam</td><td style="vertical-align:top;width:10px;">:</td><td>{{nama}}</td></tr>
  <tr><td style="vertical-align:top;">Instansi</td><td style="vertical-align:top;">:</td><td>{{instansi}}</td></tr>
  <tr><td style="vertical-align:top;">Nama Kegiatan</td><td style="vertical-align:top;">:</td><td>{{kegiatan}}</td></tr>
  <tr><td style="vertical-align:top;">Tanggal Pinjam</td><td style="vertical-align:top;">:</td><td>{{tanggalPinjam}}</td></tr>
  <tr><td style="vertical-align:top;">Tanggal Kembali</td><td style="vertical-align:top;">:</td><td>{{tanggalKembali}}</td></tr>
  <tr><td style="vertical-align:top;">Jumlah Peserta/Penumpang</td><td style="vertical-align:top;">:</td><td>{{jumlahPeserta}} orang</td></tr>
  <tr><td style="vertical-align:top;">Tarif</td><td style="vertical-align:top;">:</td><td>{{tarif}}</td></tr>
  <tr><td style="vertical-align:top;">Total Biaya</td><td style="vertical-align:top;">:</td><td>{{totalBiaya}}</td></tr>
</table>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Peminjam diwajibkan menjaga dan memelihara fasilitas yang dipinjam dengan baik. Apabila terjadi kerusakan atau kehilangan akibat kelalaian peminjam, maka peminjam bertanggung jawab atas ganti rugi sesuai ketentuan yang berlaku.
</p>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Demikian surat persetujuan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
</p>

<table style="font-size:12px;margin-top:30px;width:100%;">
  <tr>
    <td style="width:50%;text-align:center;">
      <p style="margin:0;">Peminjam,</p>
      <div style="height:65px;"></div>
      <p style="margin:0;border-top:1px solid #1a1a1a;display:inline-block;padding-top:2px;">{{nama}}</p>
    </td>
    <td style="width:50%;text-align:center;">
      <p style="margin:0;">{{kabupaten}}, {{tanggalCetak}}</p>
      <p style="margin:0;">Kepala {{namaInstansi}},</p>
      <div style="height:50px;"></div>
      <p style="margin:0;border-top:1px solid #1a1a1a;display:inline-block;padding-top:2px;">............................</p>
      <p style="margin:2px 0 0;font-size:11px;color:#4b5563;">NIP. ............................</p>
    </td>
  </tr>
</table>`,
  },
  {
    name: 'Surat Keterangan Peminjaman',
    type: 'surat_keterangan',
    description: 'Template surat keterangan peminjaman untuk keperluan administrasi',
    isDefault: true,
    isActive: true,
    content: `<div style="text-align:center;margin-bottom:20px;">
  <h3 style="margin:0;font-size:13px;text-decoration:underline;">SURAT KETERANGAN PEMINJAMAN</h3>
  <p style="margin:4px 0 0;font-size:11px;">Nomor: {{nomorPerjanjian}}</p>
</div>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Yang bertanda tangan di bawah ini, Kepala {{namaInstansi}} {{kabupaten}}, menerangkan dengan sebenarnya bahwa:
</p>

<table style="font-size:12px;margin:12px 0 12px 40px;border-collapse:collapse;" cellpadding="4">
  <tr><td style="vertical-align:top;width:180px;">Nama</td><td style="vertical-align:top;width:10px;">:</td><td>{{nama}}</td></tr>
  <tr><td style="vertical-align:top;">Instansi/Perusahaan</td><td style="vertical-align:top;">:</td><td>{{instansi}}</td></tr>
  <tr><td style="vertical-align:top;">Email</td><td style="vertical-align:top;">:</td><td>{{email}}</td></tr>
</table>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Telah melakukan peminjaman fasilitas milik {{namaInstansi}} {{kabupaten}} dengan rincian sebagai berikut:
</p>

<table style="font-size:12px;margin:12px 0 12px 40px;border-collapse:collapse;" cellpadding="4">
  <tr><td style="vertical-align:top;width:180px;">Kegiatan</td><td style="vertical-align:top;width:10px;">:</td><td>{{kegiatan}}</td></tr>
  <tr><td style="vertical-align:top;">Jenis Kegiatan</td><td style="vertical-align:top;">:</td><td>{{jenisKegiatan}}</td></tr>
  <tr><td style="vertical-align:top;">Tanggal Pinjam</td><td style="vertical-align:top;">:</td><td>{{tanggalPinjam}}</td></tr>
  <tr><td style="vertical-align:top;">Tanggal Kembali</td><td style="vertical-align:top;">:</td><td>{{tanggalKembali}}</td></tr>
  <tr><td style="vertical-align:top;">Total Biaya</td><td style="vertical-align:top;">:</td><td>{{totalBiaya}}</td></tr>
  <tr><td style="vertical-align:top;">Catatan</td><td style="vertical-align:top;">:</td><td>{{catatanAdmin}}</td></tr>
</table>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
</p>

<table style="font-size:12px;margin-top:30px;width:100%;">
  <tr>
    <td style="width:55%;"></td>
    <td style="width:45%;text-align:center;">
      <p style="margin:0;">{{kabupaten}}, {{tanggalCetak}}</p>
      <p style="margin:0;">Kepala {{namaInstansi}},</p>
      <div style="height:50px;"></div>
      <p style="margin:0;border-top:1px solid #1a1a1a;display:inline-block;padding-top:2px;">............................</p>
      <p style="margin:2px 0 0;font-size:11px;color:#4b5563;">NIP. ............................</p>
    </td>
  </tr>
</table>`,
  },
  {
    name: 'Undangan Rapat/Kegiatan',
    type: 'undangan',
    description: 'Template undangan rapat atau kegiatan di aula',
    isDefault: true,
    isActive: true,
    content: `<div style="text-align:center;margin-bottom:20px;">
  <h3 style="margin:0;font-size:14px;text-decoration:underline;">UNDANGAN</h3>
  <p style="margin:4px 0 0;font-size:12px;">{{kegiatan}}</p>
</div>

<p style="font-size:12px;">Dengan hormat,</p>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Sehubungan dengan akan dilaksanakannya kegiatan <strong>{{kegiatan}}</strong>, dengan ini kami mengundang Bapak/Ibu untuk hadir pada:
</p>

<table style="font-size:12px;margin:12px 0 12px 40px;border-collapse:collapse;" cellpadding="4">
  <tr><td style="vertical-align:top;width:140px;">Hari/Tanggal</td><td style="vertical-align:top;width:10px;">:</td><td>{{tanggalPinjam}}</td></tr>
  <tr><td style="vertical-align:top;">Waktu</td><td style="vertical-align:top;">:</td><td>{{waktuMulai}} - {{waktuSelesai}} WIB</td></tr>
  <tr><td style="vertical-align:top;">Tempat</td><td style="vertical-align:top;">:</td><td>Aula {{namaInstansi}} {{kabupaten}}</td></tr>
  <tr><td style="vertical-align:top;">Jenis Kegiatan</td><td style="vertical-align:top;">:</td><td>{{jenisKegiatan}}</td></tr>
</table>

<p style="font-size:12px;text-align:justify;text-indent:40px;">
  Demikian undangan ini kami sampaikan, atas kehadiran Bapak/Ibu kami ucapkan terima kasih.
</p>

<table style="font-size:12px;margin-top:30px;width:100%;">
  <tr>
    <td style="width:55%;"></td>
    <td style="width:45%;text-align:center;">
      <p style="margin:0;">{{kabupaten}}, {{tanggalCetak}}</p>
      <p style="margin:0;">Kepala {{namaInstansi}},</p>
      <div style="height:50px;"></div>
      <p style="margin:0;border-top:1px solid #1a1a1a;display:inline-block;padding-top:2px;">............................</p>
      <p style="margin:2px 0 0;font-size:11px;color:#4b5563;">NIP. ............................</p>
    </td>
  </tr>
</table>`,
  },
]

// POST /api/templates/seed - Seed default templates if none exist
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat meng-seed template.' },
        { status: 403 }
      )
    }

    const existingCount = await db.documentTemplate.count()

    if (existingCount > 0) {
      return NextResponse.json({
        message: `Template sudah ada (${existingCount} template). Tidak ada template baru yang ditambahkan.`,
        count: existingCount,
        seeded: false,
      })
    }

    // Seed default templates
    const created = []
    for (const tpl of DEFAULT_TEMPLATES) {
      const template = await db.documentTemplate.create({
        data: {
          name: tpl.name,
          type: tpl.type,
          content: tpl.content,
          description: tpl.description,
          isDefault: tpl.isDefault,
          isActive: tpl.isActive,
        },
      })
      created.push(template)
    }

    return NextResponse.json({
      message: `${created.length} template default berhasil ditambahkan`,
      count: created.length,
      seeded: true,
      templates: created,
    })
  } catch (error) {
    console.error('Seed templates error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat meng-seed template' },
      { status: 500 }
    )
  }
}
