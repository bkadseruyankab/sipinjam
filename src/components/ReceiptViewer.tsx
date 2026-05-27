'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, Printer, Download } from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { generateKOPHtml, generatePrintCSS, generateFooterHtml, type KopSettings, type TemplateSettings, DEFAULT_TEMPLATE } from '@/lib/kop-utils'

interface ReceiptViewerProps {
  borrowingId: string
}

interface TemplateData {
  primaryColor: string
  fontFamily: string
  fontSize: string
  kopLineStyle: 'double' | 'thick' | 'triple'
  paperSize: 'A4' | 'Folio' | 'Legal' | 'Letter'
  marginTop: string
  marginBottom: string
  marginLeft: string
  marginRight: string
  showKopLogo: string
  showFooter: string
  footerText: string
}

interface ReceiptData {
  nomor: string
  tanggal: string
  peminjam: {
    nama: string
    instansi: string
    email: string
    phone: string
    fotoTtd: string
  }
  kegiatan: string
  tipe: string
  tanggalPinjam: string
  tanggalKembali: string
  jumlahHari: number
  detail: {
    jenisKegiatan: string | null
    waktuPenggunaan: string | null
    keperluanKendaraan: string | null
    tujuan: string | null
    jumlahPenumpang: number | null
    sopir: string | null
  }
  tarif: string
  tarifAmount: number
  tarifPerDay: number
  jumlahHariDetail: number
  totalBiaya: string
  totalBiayaAmount: number
  nomorPerjanjian: string
  approvedBy: string | null
  approvedAt: string | null
  siteLogo: string | null
  perdaTitle: string
  kendaraan: {
    nama: string
    jenis: string
    platNomor: string
    kapasitas: number
  } | null
  catatanAdmin: string | null
  qrToken: string | null
  siteUrl: string | null
  kop: {
    namaInstansi: string
    kabupaten: string
    alamat: string
    telepon: string
    email: string
    website: string
    logo: string
  }
  penandatangan: {
    nama: string
    jabatan: string
    nip: string
    fotoTtd: string
  }
  template?: TemplateData
}

function formatCurrency(num: number): string {
  return `Rp ${num.toLocaleString('id-ID')}`
}

function formatDateLong(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateShort(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Indonesian number to words (terbilang)
function terbilang(n: number): string {
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas']
  if (n < 12) return satuan[n]
  if (n < 20) return terbilang(n - 10) + ' Belas'
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '')
  if (n < 200) return 'Seratus' + (n - 100 ? ' ' + terbilang(n - 100) : '')
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '')
  if (n < 2000) return 'Seribu' + (n - 1000 ? ' ' + terbilang(n - 1000) : '')
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '')
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' Juta' + (n % 1000000 ? ' ' + terbilang(n % 1000000) : '')
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' Miliar' + (n % 1000000000 ? ' ' + terbilang(n % 1000000000) : '')
  return 'Angka terlalu besar'
}

function terbilangRupiah(n: number): string {
  if (n === 0) return 'Nol Rupiah'
  return terbilang(n) + ' Rupiah'
}

export default function ReceiptViewer({ borrowingId }: ReceiptViewerProps) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/receipt?id=${borrowingId}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Gagal memuat kwitansi')
          return
        }
        setReceipt({
          ...data.receipt,
          siteUrl: data.receipt.siteUrl || null,
        })
      } catch {
        setError('Terjadi kesalahan saat memuat kwitansi')
      } finally {
        setLoading(false)
      }
    }
    if (borrowingId) {
      fetchReceipt()
    }
  }, [borrowingId])

  const handlePrint = () => {
    if (!receipt) return

    // Parse template settings
    const t = receipt.template
    const template: TemplateSettings = {
      primaryColor: t?.primaryColor || DEFAULT_TEMPLATE.primaryColor,
      fontFamily: t?.fontFamily || DEFAULT_TEMPLATE.fontFamily,
      fontSize: t?.fontSize || DEFAULT_TEMPLATE.fontSize,
      kopLineStyle: t?.kopLineStyle || DEFAULT_TEMPLATE.kopLineStyle,
      paperSize: t?.paperSize || DEFAULT_TEMPLATE.paperSize,
      marginTop: t?.marginTop || DEFAULT_TEMPLATE.marginTop,
      marginBottom: t?.marginBottom || DEFAULT_TEMPLATE.marginBottom,
      marginLeft: t?.marginLeft || DEFAULT_TEMPLATE.marginLeft,
      marginRight: t?.marginRight || DEFAULT_TEMPLATE.marginRight,
      showKopLogo: t?.showKopLogo || DEFAULT_TEMPLATE.showKopLogo,
      showFooter: t?.showFooter || DEFAULT_TEMPLATE.showFooter,
      footerText: t?.footerText || DEFAULT_TEMPLATE.footerText,
    }

    // Parse KOP settings
    const kop: KopSettings = {
      namaInstansi: receipt.kop.namaInstansi,
      kabupaten: receipt.kop.kabupaten,
      alamat: receipt.kop.alamat,
      telepon: receipt.kop.telepon,
      email: receipt.kop.email,
      website: receipt.kop.website,
      logo: receipt.kop.logo,
    }

    const color = template.primaryColor
    const fontFamily = template.fontFamily

    // KOP HTML using shared utility
    const kopHtml = generateKOPHtml(kop, template)

    // Build description text
    const descriptionLines: string[] = []
    descriptionLines.push(receipt.kegiatan)
    descriptionLines.push(receipt.tipe === 'aula' ? 'Peminjaman Aula' : 'Peminjaman Kendaraan')
    if (receipt.detail.waktuPenggunaan) {
      descriptionLines.push(`Waktu: ${receipt.detail.waktuPenggunaan === 'siang' ? 'Siang' : 'Malam'}`)
    }
    if (receipt.kendaraan) {
      descriptionLines.push(`${receipt.kendaraan.nama} (${receipt.kendaraan.platNomor})`)
    }
    if (receipt.detail.tujuan) {
      descriptionLines.push(`Tujuan: ${receipt.detail.tujuan}`)
    }

    const jumlahHari = receipt.jumlahHariDetail || receipt.jumlahHari
    const generatedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const generatedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })

    // Content HTML
    const contentHtml = `
      <!-- Title & Receipt Number -->
      <div style="text-align:center;margin:20px 0 16px;">
        <h1 style="margin:0;font-size:16px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#1a1a1a;">KWITANSI PEMBAYARAN</h1>
        <p style="margin:8px 0 0;font-size:12px;color:#4b5563;">Nomor: ${receipt.nomor}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#6b7280;">Tanggal: ${formatDateLong(receipt.tanggal)}</p>
      </div>

      <div style="height:1px;background:#d1d5db;margin:16px 0;"></div>

      <!-- Peminjam Info -->
      <div style="margin:16px 0;">
        <h3 style="font-size:12px;font-weight:bold;color:${color};margin-bottom:8px;">Penerima / Peminjam</h3>
        <table style="border:none;font-size:12px;">
          <tr><td style="padding:2px 12px;color:#6b7280;width:100px;">Nama</td><td style="padding:2px 0;font-weight:600;">${receipt.peminjam.nama}</td></tr>
          <tr><td style="padding:2px 12px;color:#6b7280;">Instansi</td><td style="padding:2px 0;">${receipt.peminjam.instansi}</td></tr>
          <tr><td style="padding:2px 12px;color:#6b7280;">Email</td><td style="padding:2px 0;">${receipt.peminjam.email}</td></tr>
          ${receipt.peminjam.phone && receipt.peminjam.phone !== '-' ? `<tr><td style="padding:2px 12px;color:#6b7280;">Telepon</td><td style="padding:2px 0;">${receipt.peminjam.phone}</td></tr>` : ''}
        </table>
      </div>

      <div style="height:1px;background:#d1d5db;margin:16px 0;"></div>

      <!-- Item Table -->
      <div style="margin:16px 0;">
        <h3 style="font-size:12px;font-weight:bold;color:${color};margin-bottom:8px;">Rincian Peminjaman</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:${color}15;">
              <th style="text-align:left;padding:8px 12px;font-size:10px;text-transform:uppercase;color:#374151;border-bottom:2px solid ${color}40;">Keterangan</th>
              <th style="text-align:center;padding:8px 12px;font-size:10px;text-transform:uppercase;color:#374151;border-bottom:2px solid ${color}40;width:50px;">Hari</th>
              <th style="text-align:right;padding:8px 12px;font-size:10px;text-transform:uppercase;color:#374151;border-bottom:2px solid ${color}40;width:140px;">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
                ${descriptionLines.map((line, i) => `<p style="margin:${i === 0 ? '0' : '2px 0 0'};${i === 0 ? 'font-weight:600;' : 'font-size:11px;color:#6b7280;'}">${line}</p>`).join('')}
                <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">${formatDateShort(receipt.tanggalPinjam)} s/d ${formatDateShort(receipt.tanggalKembali)}</p>
              </td>
              <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #e5e7eb;font-weight:600;">${jumlahHari}</td>
              <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0;font-size:11px;color:#6b7280;">Tarif/Hari</p>
                <p style="margin:2px 0 0;font-weight:600;">${receipt.tarif}</p>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="border-top:2px solid ${color};">
              <td style="padding:8px 12px;font-weight:bold;font-size:11px;" colspan="2">Total (${jumlahHari} hari × ${receipt.tarif}/hari)</td>
              <td style="padding:8px 12px;text-align:right;font-weight:600;">${formatCurrency(jumlahHari * receipt.tarifAmount)}</td>
            </tr>
            <tr style="background:${color}10;">
              <td style="padding:10px 12px;font-weight:bold;font-size:14px;border-top:2px solid ${color};" colspan="2">TOTAL BIAYA</td>
              <td style="padding:10px 12px;text-align:right;font-weight:bold;font-size:16px;color:${color};border-top:2px solid ${color};">${receipt.totalBiaya}</td>
            </tr>
          </tfoot>
        </table>
        <p style="margin:6px 0 0;font-size:11px;font-style:italic;color:#4b5563;">Terbilang: ${terbilangRupiah(receipt.totalBiayaAmount)}</p>
      </div>

      <!-- Perjanjian Reference -->
      ${receipt.nomorPerjanjian ? `
      <div style="margin:12px 0;font-size:11px;color:#6b7280;">
        Ref: ${receipt.nomorPerjanjian}
        ${receipt.approvedBy ? ` | Disetujui oleh: ${receipt.approvedBy}` : ''}
      </div>
      ` : ''}

      <!-- Catatan Admin -->
      ${receipt.catatanAdmin ? `
      <div style="margin:12px 0;font-size:11px;color:#6b7280;border:1px solid #e5e7eb;border-radius:4px;padding:8px;">
        <strong>Catatan:</strong> ${receipt.catatanAdmin}
      </div>
      ` : ''}

      <div style="height:1px;background:#d1d5db;margin:20px 0;"></div>

      <!-- Signature Area -->
      <div style="display:flex;justify-content:space-between;margin-top:30px;font-size:12px;">
        <div style="text-align:center;width:45%;">
          <p style="font-weight:bold;margin-bottom:4px;color:${color};">Penerima,</p>
          <div style="height:65px;display:flex;align-items:flex-end;justify-content:center;">
            ${receipt.peminjam.fotoTtd ? `<img src="${receipt.peminjam.fotoTtd}" alt="Tanda Tangan Penerima" style="max-height:60px;object-fit:contain;" />` : ''}
          </div>
          <div style="border-bottom:1px solid #1a1a1a;width:70%;margin:0 auto;"></div>
          <p style="font-weight:600;margin-top:6px;">(${receipt.peminjam.nama})</p>
          ${receipt.peminjam.instansi && receipt.peminjam.instansi !== '-' ? `<p style="font-size:11px;color:#6b7280;">${receipt.peminjam.instansi}</p>` : ''}
        </div>
        <div style="text-align:center;width:45%;">
          <p style="font-weight:bold;margin-bottom:4px;color:${color};">${receipt.penandatangan.jabatan || 'Kuasa Pengguna Anggaran'},</p>
          <div style="height:65px;display:flex;align-items:flex-end;justify-content:center;">
            ${receipt.penandatangan.fotoTtd ? `<img src="${receipt.penandatangan.fotoTtd}" alt="Tanda Tangan" style="max-height:60px;object-fit:contain;" />` : ''}
          </div>
          <div style="border-bottom:1px solid #1a1a1a;width:70%;margin:0 auto;"></div>
          <p style="font-weight:600;margin-top:6px;">(${receipt.penandatangan.nama || receipt.approvedBy || '............................'})</p>
          ${receipt.penandatangan.nip ? `<p style="font-size:11px;color:#6b7280;">NIP. ${receipt.penandatangan.nip}</p>` : ''}
        </div>
      </div>

      <!-- QR Verification Code -->
      ${receipt.qrToken ? `
      <div style="margin-top:20px;text-align:right;">
        <div style="display:inline-block;text-align:center;">
          <div id="receipt-print-qr"></div>
          <p style="margin:4px 0 0;font-size:9px;color:#6b7280;">Scan untuk verifikasi</p>
        </div>
      </div>
      ` : ''}
    `

    // Footer HTML using shared utility
    const footerHtml = generateFooterHtml({
      siteName: 'E-Pakar',
      perdaTitle: receipt.perdaTitle,
      generatedDate,
      generatedTime,
      customText: template.footerText,
      showFooter: template.showFooter !== 'false',
    })

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kwitansi ${receipt.nomor}</title>
          <style>
            ${generatePrintCSS(template)}
          </style>
        </head>
        <body>
          <div style="max-width:700px;margin:0 auto;">
            ${kopHtml}
            ${contentHtml}
            ${footerHtml}
          </div>
        </body>
      </html>
    `

    // Print using popup window
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.open()
        printWindow.document.write(fullHtml)
        printWindow.document.close()

        // Inject QR code SVG into the print document after it's loaded
        if (receipt.qrToken) {
          const qrEl = document.getElementById('receipt-qr-code')
          if (qrEl) {
            const printQrPlaceholder = printWindow.document.getElementById('receipt-print-qr')
            if (printQrPlaceholder) {
              printQrPlaceholder.innerHTML = qrEl.outerHTML
            }
          }
        }

        setTimeout(() => {
          try { printWindow.print() } catch { /* already printing */ }
        }, 800)
        return
      }
    } catch {
      // popup blocked
    }

    // Fallback: blob URL
    try {
      const blob = new Blob([fullHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      toast.error('Gagal mencetak kwitansi')
    }
  }

  const handleDownloadPDF = () => {
    toast.info('Gunakan "Save as PDF" dari dialog cetak untuk mengunduh sebagai PDF')
    handlePrint()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-muted-foreground">Memuat kwitansi...</span>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="size-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <span className="text-red-600 text-xl">!</span>
        </div>
        <p className="text-muted-foreground font-medium">{error || 'Kwitansi tidak tersedia'}</p>
        <p className="text-sm text-muted-foreground mt-1">Kwitansi hanya tersedia untuk peminjaman yang telah disetujui</p>
      </div>
    )
  }

  // Template settings for inline display
  const color = receipt.template?.primaryColor || '#065f46'

  // KOP info for inline display
  const kopContactParts: string[] = []
  if (receipt.kop.alamat) kopContactParts.push(receipt.kop.alamat)
  if (receipt.kop.telepon) kopContactParts.push(`Telp: ${receipt.kop.telepon}`)
  if (receipt.kop.email) kopContactParts.push(`Email: ${receipt.kop.email}`)

  // Build description text for the table
  const descriptionLines: string[] = []
  descriptionLines.push(receipt.kegiatan)
  descriptionLines.push(receipt.tipe === 'aula' ? 'Peminjaman Aula' : 'Peminjaman Kendaraan')
  if (receipt.detail.waktuPenggunaan) {
    descriptionLines.push(`Waktu: ${receipt.detail.waktuPenggunaan === 'siang' ? 'Siang' : 'Malam'}`)
  }
  if (receipt.kendaraan) {
    descriptionLines.push(`${receipt.kendaraan.nama} (${receipt.kendaraan.platNomor})`)
  }
  if (receipt.detail.tujuan) {
    descriptionLines.push(`Tujuan: ${receipt.detail.tujuan}`)
  }

  const jumlahHari = receipt.jumlahHariDetail || receipt.jumlahHari

  // KOP line style for inline display
  const kopLineStyle = receipt.template?.kopLineStyle || 'double'
  const showKopLogo = receipt.template?.showKopLogo !== 'false'

  return (
    <div className="receipt-wrapper">
      {/* Action buttons - hidden on print */}
      <div className="flex items-center justify-end gap-2 mb-4 print:hidden">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <Printer className="size-4" />
          Cetak
        </Button>
        <Button
          onClick={handleDownloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="size-4" />
          Unduh PDF
        </Button>
      </div>

      {/* Receipt Card - always white background for printing */}
      <Card className="print:bg-white print:text-black print:shadow-none print:border-gray-300 bg-white border border-gray-200 shadow-md max-w-2xl mx-auto">
        <CardContent className="p-6 sm:p-8 print:p-8">
          <div id="receipt-print-content">
            {/* KOP Header - unified style */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-3 mb-2">
                {showKopLogo && receipt.kop.logo ? (
                  <img
                    src={receipt.kop.logo}
                    alt="Logo"
                    className="rounded-lg object-contain"
                    style={{ height: '50px', width: '50px' }}
                  />
                ) : showKopLogo ? (
                  <div className="flex items-center justify-center rounded-lg text-white font-bold shadow-md h-12 w-12 text-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                    EP
                  </div>
                ) : null}
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color }}>Pemerintah {receipt.kop.kabupaten}</p>
                  <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color }}>{receipt.kop.namaInstansi}</h2>
                  {kopContactParts.length > 0 && (
                    <p className="text-[10px] text-gray-500">{kopContactParts.join(' | ')}</p>
                  )}
                </div>
              </div>
              {kopLineStyle === 'double' && (
                <>
                  <div className="w-full h-[3px]" style={{ backgroundColor: color }} />
                  <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: color }} />
                </>
              )}
              {kopLineStyle === 'thick' && (
                <div className="w-full h-[4px]" style={{ backgroundColor: color }} />
              )}
              {kopLineStyle === 'triple' && (
                <>
                  <div className="w-full h-[3px]" style={{ backgroundColor: color }} />
                  <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: color }} />
                  <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: color }} />
                </>
              )}
            </div>

            {/* Title & Receipt Number */}
            <div className="text-center my-4">
              <h1 className="text-lg font-bold text-gray-900 tracking-wide uppercase">KWITANSI PEMBAYARAN</h1>
              <p className="text-xs text-gray-500 mt-1">Nomor: {receipt.nomor}</p>
              <p className="text-xs text-gray-500 mt-0.5">Tanggal: {formatDateLong(receipt.tanggal)}</p>
            </div>

            <Separator className="my-3 bg-gray-200 print:bg-gray-400" />

            {/* Peminjam Info */}
            <div className="my-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color }}>Penerima / Peminjam</h3>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-gray-800">
                <span className="text-gray-500">Nama</span>
                <span className="font-medium">{receipt.peminjam.nama}</span>
                <span className="text-gray-500">Instansi</span>
                <span>{receipt.peminjam.instansi}</span>
                <span className="text-gray-500">Email</span>
                <span>{receipt.peminjam.email}</span>
                {receipt.peminjam.phone && receipt.peminjam.phone !== '-' && (
                  <>
                    <span className="text-gray-500">Telepon</span>
                    <span>{receipt.peminjam.phone}</span>
                  </>
                )}
              </div>
            </div>

            <Separator className="my-3 bg-gray-200 print:bg-gray-400" />

            {/* Item Table with day calculation */}
            <div className="my-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color }}>Rincian Peminjaman</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden print:rounded-none">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: color + '15' }}>
                      <th className="text-left px-3 py-2 font-semibold text-xs uppercase" style={{ color }}>Keterangan</th>
                      <th className="text-center px-3 py-2 font-semibold text-xs uppercase w-16" style={{ color }}>Hari</th>
                      <th className="text-right px-3 py-2 font-semibold text-xs uppercase w-36" style={{ color }}>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 print:border-gray-300">
                      <td className="px-3 py-3 text-gray-800">
                        {descriptionLines.map((line, i) => (
                          <p key={i} className={i === 0 ? 'font-medium' : 'text-xs text-gray-500'}>{line}</p>
                        ))}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateShort(receipt.tanggalPinjam)} s/d {formatDateShort(receipt.tanggalKembali)}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center align-top text-gray-800 font-medium">
                        {jumlahHari}
                      </td>
                      <td className="px-3 py-3 text-right align-top">
                        <p className="text-xs text-gray-500">Tarif/Hari</p>
                        <p className="font-medium text-gray-800">{receipt.tarif}</p>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-300" style={{ backgroundColor: color + '08' }}>
                      <td className="px-3 py-2 font-semibold text-gray-700 text-xs" colSpan={2}>
                        Total ({jumlahHari} hari × {receipt.tarif}/hari)
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">{formatCurrency(jumlahHari * receipt.tarifAmount)}</td>
                    </tr>
                    <tr className="border-t-2" style={{ borderColor: color, backgroundColor: color + '10' }}>
                      <td className="px-3 py-3 font-bold text-gray-900" colSpan={2}>TOTAL BIAYA</td>
                      <td className="px-3 py-3 text-right font-bold text-base" style={{ color }}>{receipt.totalBiaya}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="text-xs text-gray-500 italic mt-1">Terbilang: {terbilangRupiah(receipt.totalBiayaAmount)}</p>
            </div>

            {/* Perjanjian Reference */}
            {receipt.nomorPerjanjian && (
              <div className="my-4 flex items-center gap-2 text-xs text-gray-500">
                <span>Ref: {receipt.nomorPerjanjian}</span>
                {receipt.approvedBy && <span>| Disetujui oleh: {receipt.approvedBy}</span>}
              </div>
            )}

            {/* Catatan Admin */}
            {receipt.catatanAdmin && (
              <div className="my-3 text-xs text-gray-500 border border-gray-200 rounded-md p-2 print:border-gray-300">
                <span className="font-medium">Catatan:</span> {receipt.catatanAdmin}
              </div>
            )}

            <Separator className="my-4 bg-gray-200 print:bg-gray-400" />

            {/* Signature Area with signatory settings */}
            <div className="grid grid-cols-2 gap-8 mt-6 mb-4">
              <div className="text-center">
                <p className="text-xs mb-2 font-bold" style={{ color }}>Penerima</p>
                {receipt.peminjam.fotoTtd ? (
                  <img
                    src={receipt.peminjam.fotoTtd}
                    alt="Tanda Tangan Penerima"
                    className="h-14 mx-auto object-contain"
                  />
                ) : (
                  <div className="h-14" />
                )}
                <Separator className="bg-gray-400 print:bg-gray-600 w-3/4 mx-auto" />
                <p className="text-xs font-medium text-gray-700 mt-1">{receipt.peminjam.nama}</p>
              </div>
              <div className="text-center">
                <p className="text-xs mb-1 font-bold" style={{ color }}>
                  {receipt.penandatangan.jabatan || 'Kuasa Pengguna Anggaran'}
                </p>
                {receipt.penandatangan.fotoTtd ? (
                  <img
                    src={receipt.penandatangan.fotoTtd}
                    alt="Tanda Tangan"
                    className="h-14 mx-auto object-contain"
                  />
                ) : (
                  <div className="h-14" />
                )}
                <Separator className="bg-gray-400 print:bg-gray-600 w-3/4 mx-auto" />
                <p className="text-xs font-medium text-gray-700 mt-1">
                  {receipt.penandatangan.nama || receipt.approvedBy || 'Administrator'}
                </p>
                {receipt.penandatangan.nip && (
                  <p className="text-[10px] text-gray-500">NIP. {receipt.penandatangan.nip}</p>
                )}
              </div>
            </div>

            {/* QR Verification Code */}
            {receipt.qrToken && (
              <div className="mt-4 flex justify-end">
                <div className="text-center">
                  <div id="receipt-qr-code">
                    <QRCodeSVG
                      value={`${receipt.siteUrl || window.location.origin}/?verify=${receipt.qrToken}`}
                      size={80}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#065f46"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Scan untuk verifikasi</p>
                </div>
              </div>
            )}

            {/* Footer */}
            {receipt.template?.showFooter !== 'false' && (
              <div className="mt-6 text-center">
                <Separator className="mb-3 bg-gray-200 print:bg-gray-400" />
                {receipt.template?.footerText && (
                  <p className="text-[10px] text-gray-400 print:text-gray-500">{receipt.template.footerText}</p>
                )}
                <p className="text-[10px] text-gray-400 print:text-gray-500">
                  Dokumen ini sah berdasarkan {receipt.perdaTitle}
                </p>
                <p className="text-[10px] text-gray-400 print:text-gray-500 mt-0.5">
                  Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
