import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decodeToken } from '@/lib/auth'
import { generateKOPHtml, generatePrintCSS, generateFooterHtml, parseTemplateSettings, type KopSettings } from '@/lib/kop-utils'

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

function formatRupiah(amount: string | null | undefined): string {
  if (!amount) return 'Rp 0'
  const num = parseInt(amount)
  if (isNaN(num)) return amount
  return `Rp ${num.toLocaleString('id-ID')}`
}

function formatDateIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// POST /api/templates/generate - Generate a document from a template
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat membuat dokumen.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { templateId, borrowingId } = body

    if (!templateId || !borrowingId) {
      return NextResponse.json(
        { error: 'Template ID dan Borrowing ID wajib diisi' },
        { status: 400 }
      )
    }

    // Fetch the template
    const template = await db.documentTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan' },
        { status: 404 }
      )
    }

    if (!template.isActive) {
      return NextResponse.json(
        { error: 'Template tidak aktif' },
        { status: 400 }
      )
    }

    // Fetch the borrowing with user and kendaraan
    const borrowing = await db.borrowing.findUnique({
      where: { id: borrowingId },
      include: {
        user: true,
        kendaraan: true,
      },
    })

    if (!borrowing) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      )
    }

    // Fetch settings for KOP and template
    const settingsRecords = await db.settings.findMany()
    const settingsMap: Record<string, string> = {}
    for (const s of settingsRecords) {
      settingsMap[s.key] = s.value
    }

    const templateSettings = parseTemplateSettings(settingsMap)

    const kopSettings: KopSettings = {
      namaInstansi: settingsMap.kop_nama_instansi || 'Badan Keuangan dan Aset Daerah',
      kabupaten: settingsMap.kop_kabupaten || 'Kabupaten Seruyan',
      alamat: settingsMap.kop_alamat || '',
      telepon: settingsMap.kop_telepon || '',
      email: settingsMap.kop_email || '',
      website: settingsMap.kop_website || '',
      logo: settingsMap.kop_logo || '',
    }

    const now = new Date()
    const tanggalCetak = formatDateIndo(now.toISOString())
    const waktuCetak = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    // Build placeholder values map
    const placeholders: Record<string, string> = {
      '{{nama}}': borrowing.user.name || '-',
      '{{email}}': borrowing.user.email || '-',
      '{{instansi}}': borrowing.user.instansi || '-',
      '{{kegiatan}}': borrowing.kegiatan || '-',
      '{{tanggalPinjam}}': formatDateIndo(borrowing.tanggalPinjam),
      '{{tanggalKembali}}': formatDateIndo(borrowing.tanggalKembali),
      '{{waktuMulai}}': borrowing.waktuMulam || '-',
      '{{waktuSelesai}}': borrowing.waktuSelesai || '-',
      '{{jenisKegiatan}}': borrowing.jenisKegiatan === 'pemerintah' ? 'Pemerintah' : borrowing.jenisKegiatan === 'umum' ? 'Umum' : (borrowing.jenisKegiatan || '-'),
      '{{waktuPenggunaan}}': borrowing.waktuPenggunaan === 'siang' ? 'Siang' : borrowing.waktuPenggunaan === 'malam' ? 'Malam' : (borrowing.waktuPenggunaan || '-'),
      '{{tujuan}}': borrowing.tujuan || '-',
      '{{jumlahPeserta}}': borrowing.jumlahPeserta ? String(borrowing.jumlahPeserta) : '-',
      '{{jumlahPenumpang}}': borrowing.jumlahPenumpang ? String(borrowing.jumlahPenumpang) : '-',
      '{{nomorPerjanjian}}': borrowing.nomorPerjanjian || '-',
      '{{tarif}}': formatRupiah(borrowing.tarif),
      '{{totalBiaya}}': formatRupiah(borrowing.totalBiaya),
      '{{catatanAdmin}}': borrowing.catatanAdmin || '-',
      '{{tanggalCetak}}': tanggalCetak,
      '{{namaKendaraan}}': borrowing.kendaraan?.nama || '-',
      '{{platNomor}}': borrowing.kendaraan?.platNomor || '-',
      '{{sopir}}': borrowing.sopir || '-',
      '{{namaInstansi}}': kopSettings.namaInstansi,
      '{{kabupaten}}': kopSettings.kabupaten,
    }

    // Replace all placeholders in template content
    let generatedContent = template.content
    for (const [placeholder, value] of Object.entries(placeholders)) {
      generatedContent = generatedContent.split(placeholder).join(value)
    }

    // Also replace any remaining {{xxx}} patterns that weren't matched
    generatedContent = generatedContent.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return placeholders[match] || match
    })

    // Generate KOP HTML
    const kopHtml = generateKOPHtml(kopSettings, templateSettings)

    // Generate footer HTML
    const footerHtml = generateFooterHtml({
      siteName: settingsMap.site_name || 'E-Pakar',
      perdaTitle: settingsMap.perda_title || 'Perda Kab. Seruyan',
      generatedDate: tanggalCetak,
      generatedTime: waktuCetak,
      customText: settingsMap.template_footer_text || undefined,
      showFooter: templateSettings.showFooter !== 'false',
    })

    // Generate print CSS
    const printCSS = generatePrintCSS(templateSettings)

    // Build the full HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${template.name}</title>
  <style>
    ${printCSS}
  </style>
</head>
<body>
  ${kopHtml}
  <div style="margin-top:24px;">
    ${generatedContent}
  </div>
  ${footerHtml}
</body>
</html>`

    return NextResponse.json({
      html: fullHtml,
      content: generatedContent,
      templateName: template.name,
      templateType: template.type,
    })
  } catch (error) {
    console.error('Generate document error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat dokumen' },
      { status: 500 }
    )
  }
}
