'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/lib/store'
import { generateKOPHtml, generatePrintCSS, generateFooterHtml, generateSignatureHtml, type KopSettings, type TemplateSettings, DEFAULT_TEMPLATE } from '@/lib/kop-utils'
import { toast } from 'sonner'
import {
  ArrowLeft,
  BarChart3,
  Printer,
  FileText,
  Loader2,
  ClipboardList,
  CheckCheck,
  XCircle,
  Clock,
  Building2,
  Car,
  TrendingUp,
  CalendarDays,
  ShieldCheck,
  Download,
} from 'lucide-react'

interface MonthlyBreakdown {
  month: string
  totalBorrowings: number
  totalApproved: number
  totalRejected: number
  totalPending: number
  totalCompleted: number
  totalRevenue: number
}

interface ReportSummary {
  totalBorrowings: number
  totalApproved: number
  totalRejected: number
  totalPending: number
  totalCompleted: number
  totalCancelled: number
  totalRevenue: number
  byType: Record<string, number>
  revenueByType: Record<string, number>
  monthlyBreakdown: MonthlyBreakdown[]
}

interface ReportDetail {
  id: string
  kegiatan: string
  type: string
  status: string
  tanggalPinjam: string
  tanggalKembali: string
  jenisKegiatan: string | null
  waktuPenggunaan: string | null
  keperluanKendaraan: string | null
  tujuan: string | null
  jumlahPenumpang: number | null
  sopir: string | null
  tarif: string | null
  tarifAmount: number
  totalBiaya: string | null
  totalBiayaAmount: number
  nomorPerjanjian: string | null
  approvedBy: string | null
  approvedAt: string | null
  catatanAdmin: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    instansi: string | null
    phone: string | null
  }
  kendaraan: {
    id: string
    nama: string
    jenis: string
    platNomor: string
    kapasitas: number
  } | null
}

interface KopData {
  namaInstansi: string
  kabupaten: string
  alamat: string
  telepon: string
  email: string
  website: string
  logo: string
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

interface PenandatanganData {
  nama: string
  jabatan: string
  nip: string
  foto: string
}

interface ReportData {
  filters: {
    type: string
    status: string
    from: string
    to: string
    format: string
  }
  summary: ReportSummary
  details?: ReportDetail[]
  totalDetails?: number
  kop?: KopData
  template?: TemplateData
  penandatangan?: PenandatanganData
  perdaTitle?: string
  siteName?: string
  generatedAt: string
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  approved: { label: 'Disetujui', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800 border-red-300' },
  completed: { label: 'Selesai', className: 'bg-teal-100 text-teal-800 border-teal-300' },
  cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  cancel_requested: { label: 'Pembatalan Diajukan', className: 'bg-orange-100 text-orange-800 border-orange-300' },
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu Persetujuan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  cancel_requested: 'Pembatalan Diajukan',
}

function formatDate(dateStr: string) {
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

function formatDateLong(dateStr: string) {
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

function formatCurrency(num: number): string {
  return `Rp ${num.toLocaleString('id-ID')}`
}

function getMonthLabel(monthKey: string): string {
  try {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } catch {
    return monthKey
  }
}

function getMonthLabelLong(monthKey: string): string {
  try {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  } catch {
    return monthKey
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

export default function ReportPage() {
  const { user, setCurrentView } = useAppStore()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>(() => {
    const year = new Date().getFullYear()
    return `${year - 1}-01-01`
  })
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [format, setFormat] = useState<string>('summary')

  const isAdmin = user?.role === 'admin'

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: typeFilter,
        status: statusFilter,
        from: fromDate,
        to: toDate,
        format,
      })
      const res = await fetch(`/api/report?${params}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal memuat laporan')
        return
      }
      setReport(data.report)
    } catch {
      toast.error('Terjadi kesalahan saat memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (!isAdmin) return
    fetchReport()
  }, [isAdmin])

  const handlePrint = () => {
    if (!report) return

    // Parse template settings
    const t = report.template
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
    const kopData: KopSettings = {
      namaInstansi: report.kop?.namaInstansi || 'Badan Keuangan dan Aset Daerah',
      kabupaten: report.kop?.kabupaten || 'Kabupaten Seruyan',
      alamat: report.kop?.alamat || '',
      telepon: report.kop?.telepon || '',
      email: report.kop?.email || '',
      website: report.kop?.website || '',
      logo: report.kop?.logo || '',
    }

    const ttd = report.penandatangan || { nama: '', jabatan: 'Kepala BKAD', nip: '', foto: '' }
    const perdaTitle = report.perdaTitle || 'Peraturan Daerah Kabupaten Seruyan'
    const siteName = report.siteName || 'E-Pakar'
    const color = template.primaryColor

    // KOP HTML using shared utility
    const kopHtml = generateKOPHtml(kopData, template)

    // Period and filter description
    const periodeText = `${formatDateLong(fromDate)} s/d ${formatDateLong(toDate)}`
    const filterParts: string[] = []
    if (typeFilter !== 'all') filterParts.push(`Tipe: ${typeFilter === 'aula' ? 'Aula' : 'Kendaraan'}`)
    if (statusFilter !== 'all') filterParts.push(`Status: ${STATUS_LABEL[statusFilter] || statusFilter}`)
    const filterText = filterParts.length > 0 ? ` (${filterParts.join(', ')})` : ''

    const generatedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const generatedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })

    // Signature HTML using shared utility
    const signatureHtml = generateSignatureHtml({
      leftTitle: 'Mengetahui,',
      leftSubtitle: ttd.jabatan,
      leftName: ttd.nama,
      leftNip: ttd.nip,
      leftSignImg: ttd.foto,
      rightTitle: 'Dibuat oleh,',
      rightSubtitle: `Petugas ${siteName}`,
      rightName: user?.name || '',
      rightExtra: generatedDate,
      color,
    })

    // Footer HTML using shared utility
    const footerHtml = generateFooterHtml({
      siteName,
      perdaTitle,
      generatedDate,
      generatedTime,
      customText: template.footerText,
      showFooter: template.showFooter !== 'false',
    })

    // Build report content based on format
    let reportContentHtml = ''

    if (format === 'summary') {
      const s = report.summary
      reportContentHtml = `
        <!-- Title -->
        <div style="text-align:center;margin:16px 0 24px;">
          <h1 style="margin:0;font-size:16px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:${color};">LAPORAN RINGKASAN PEMINJAMAN</h1>
          <p style="margin:8px 0 0;font-size:12px;color:#4b5563;">Periode: ${periodeText}${filterText}</p>
        </div>

        <!-- I. STATISTIK UMUM -->
        <div style="margin-bottom:20px;">
          <h3 style="font-size:12px;font-weight:bold;margin:0 0 8px;text-transform:uppercase;color:${color};">I. Statistik Umum</h3>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:${color}15;">
                <th style="border:1px solid ${color}40;padding:8px 12px;text-align:left;font-size:11px;">Uraian</th>
                <th style="border:1px solid ${color}40;padding:8px 12px;text-align:center;font-size:11px;width:100px;">Jumlah</th>
                <th style="border:1px solid ${color}40;padding:8px 12px;text-align:center;font-size:11px;width:100px;">Persentase</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="border:1px solid #d1d5db;padding:6px 12px;font-weight:600;">Total Peminjaman</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;font-weight:bold;">${s.totalBorrowings}</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">100%</td></tr>
              <tr style="background:#f9fafb;"><td style="border:1px solid #d1d5db;padding:6px 12px;">&nbsp;&nbsp;Menunggu Persetujuan</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalPending}</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalBorrowings ? ((s.totalPending / s.totalBorrowings) * 100).toFixed(1) : '0.0'}%</td></tr>
              <tr><td style="border:1px solid #d1d5db;padding:6px 12px;">&nbsp;&nbsp;Disetujui</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalApproved}</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalBorrowings ? ((s.totalApproved / s.totalBorrowings) * 100).toFixed(1) : '0.0'}%</td></tr>
              <tr style="background:#f9fafb;"><td style="border:1px solid #d1d5db;padding:6px 12px;">&nbsp;&nbsp;Selesai</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalCompleted}</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalBorrowings ? ((s.totalCompleted / s.totalBorrowings) * 100).toFixed(1) : '0.0'}%</td></tr>
              <tr><td style="border:1px solid #d1d5db;padding:6px 12px;">&nbsp;&nbsp;Ditolak</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalRejected}</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalBorrowings ? ((s.totalRejected / s.totalBorrowings) * 100).toFixed(1) : '0.0'}%</td></tr>
              <tr style="background:#f9fafb;"><td style="border:1px solid #d1d5db;padding:6px 12px;">&nbsp;&nbsp;Dibatalkan</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalCancelled}</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.totalBorrowings ? ((s.totalCancelled / s.totalBorrowings) * 100).toFixed(1) : '0.0'}%</td></tr>
            </tbody>
          </table>
        </div>

        <!-- II. RINGKASAN BERDASARKAN TIPE -->
        <div style="margin-bottom:20px;">
          <h3 style="font-size:12px;font-weight:bold;margin:0 0 8px;text-transform:uppercase;color:${color};">II. Ringkasan Berdasarkan Tipe Peminjaman</h3>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:${color}15;">
                <th style="border:1px solid ${color}40;padding:8px 12px;text-align:left;font-size:11px;">Tipe Peminjaman</th>
                <th style="border:1px solid ${color}40;padding:8px 12px;text-align:center;font-size:11px;width:80px;">Jumlah</th>
                <th style="border:1px solid ${color}40;padding:8px 12px;text-align:right;font-size:11px;width:140px;">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="border:1px solid #d1d5db;padding:6px 12px;">Aula</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.byType.aula || 0}</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:right;">${formatCurrency(s.revenueByType.aula || 0)}</td></tr>
              <tr style="background:#f9fafb;"><td style="border:1px solid #d1d5db;padding:6px 12px;">Kendaraan</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:center;">${s.byType.kendaraan || 0}</td><td style="border:1px solid #d1d5db;padding:6px 12px;text-align:right;">${formatCurrency(s.revenueByType.kendaraan || 0)}</td></tr>
              <tr style="font-weight:bold;background:#e5e7eb;"><td style="border:1px solid #374151;padding:8px 12px;">TOTAL</td><td style="border:1px solid #374151;padding:8px 12px;text-align:center;">${s.totalBorrowings}</td><td style="border:1px solid #374151;padding:8px 12px;text-align:right;">${formatCurrency(s.totalRevenue)}</td></tr>
            </tbody>
          </table>
          <p style="margin:6px 0 0;font-size:11px;font-style:italic;color:#4b5563;">Terbilang: ${terbilangRupiah(s.totalRevenue)}</p>
        </div>

        <!-- III. RINCIAN BULANAN -->
        ${s.monthlyBreakdown.length > 0 ? `
        <div style="margin-bottom:20px;">
          <h3 style="font-size:12px;font-weight:bold;margin:0 0 8px;text-transform:uppercase;color:${color};">III. Rincian Bulanan</h3>
          <table style="width:100%;border-collapse:collapse;font-size:11px;">
            <thead>
              <tr style="background:${color}15;">
                <th style="border:1px solid ${color}40;padding:6px 10px;text-align:left;font-size:10px;" rowspan="2">Bulan</th>
                <th style="border:1px solid ${color}40;padding:6px 10px;text-align:center;font-size:10px;" rowspan="2" width="60">Total</th>
                <th style="border:1px solid ${color}40;padding:6px 6px;text-align:center;font-size:10px;" colspan="4">Status</th>
                <th style="border:1px solid ${color}40;padding:6px 10px;text-align:right;font-size:10px;" rowspan="2" width="120">Pendapatan</th>
              </tr>
              <tr style="background:${color}15;">
                <th style="border:1px solid ${color}40;padding:4px 6px;text-align:center;font-size:9px;width:50;">Setuju</th>
                <th style="border:1px solid ${color}40;padding:4px 6px;text-align:center;font-size:9px;width:50;">Tolak</th>
                <th style="border:1px solid ${color}40;padding:4px 6px;text-align:center;font-size:9px;width:50;">Tunggu</th>
                <th style="border:1px solid ${color}40;padding:4px 6px;text-align:center;font-size:9px;width:50;">Selesai</th>
              </tr>
            </thead>
            <tbody>
              ${s.monthlyBreakdown.map((m, i) => `
              <tr style="${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
                <td style="border:1px solid #d1d5db;padding:5px 10px;">${getMonthLabelLong(m.month)}</td>
                <td style="border:1px solid #d1d5db;padding:5px 10px;text-align:center;font-weight:600;">${m.totalBorrowings}</td>
                <td style="border:1px solid #d1d5db;padding:5px 6px;text-align:center;">${m.totalApproved}</td>
                <td style="border:1px solid #d1d5db;padding:5px 6px;text-align:center;">${m.totalRejected}</td>
                <td style="border:1px solid #d1d5db;padding:5px 6px;text-align:center;">${m.totalPending}</td>
                <td style="border:1px solid #d1d5db;padding:5px 6px;text-align:center;">${m.totalCompleted}</td>
                <td style="border:1px solid #d1d5db;padding:5px 10px;text-align:right;font-weight:500;">${formatCurrency(m.totalRevenue)}</td>
              </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight:bold;background:#e5e7eb;">
                <td style="border:1px solid #374151;padding:6px 10px;">TOTAL</td>
                <td style="border:1px solid #374151;padding:6px 10px;text-align:center;">${s.totalBorrowings}</td>
                <td style="border:1px solid #374151;padding:6px 6px;text-align:center;">${s.totalApproved}</td>
                <td style="border:1px solid #374151;padding:6px 6px;text-align:center;">${s.totalRejected}</td>
                <td style="border:1px solid #374151;padding:6px 6px;text-align:center;">${s.totalPending}</td>
                <td style="border:1px solid #374151;padding:6px 6px;text-align:center;">${s.totalCompleted}</td>
                <td style="border:1px solid #374151;padding:6px 10px;text-align:right;">${formatCurrency(s.totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ` : ''}
      `
    } else {
      // Detail format
      const details = report.details || []
      const totalBiaya = details.reduce((sum, d) => sum + d.totalBiayaAmount, 0)

      reportContentHtml = `
        <!-- Title -->
        <div style="text-align:center;margin:16px 0 24px;">
          <h1 style="margin:0;font-size:16px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:${color};">LAPORAN DETAIL PEMINJAMAN</h1>
          <p style="margin:8px 0 0;font-size:12px;color:#4b5563;">Periode: ${periodeText}${filterText}</p>
        </div>

        <!-- Detail Table -->
        <div style="margin-bottom:12px;">
          <table style="width:100%;border-collapse:collapse;font-size:10px;">
            <thead>
              <tr style="background:${color}15;">
                <th style="border:1px solid ${color}40;padding:6px 8px;text-align:center;font-size:9px;width:30;">No</th>
                <th style="border:1px solid ${color}40;padding:6px 8px;text-align:left;font-size:9px;">Peminjam / Instansi</th>
                <th style="border:1px solid ${color}40;padding:6px 8px;text-align:left;font-size:9px;">Kegiatan</th>
                <th style="border:1px solid ${color}40;padding:6px 8px;text-align:center;font-size:9px;width:55px;">Tipe</th>
                <th style="border:1px solid ${color}40;padding:6px 8px;text-align:center;font-size:9px;width:90px;">Tanggal Pinjam</th>
                <th style="border:1px solid ${color}40;padding:6px 8px;text-align:center;font-size:9px;width:90px;">Tanggal Kembali</th>
                <th style="border:1px solid ${color}40;padding:6px 8px;text-align:center;font-size:9px;width:65px;">Status</th>
                <th style="border:1px solid ${color}40;padding:6px 8px;text-align:right;font-size:9px;width:100px;">Total Biaya</th>
              </tr>
            </thead>
            <tbody>
              ${details.length === 0 ? `
              <tr><td colspan="8" style="border:1px solid #d1d5db;padding:12px;text-align:center;color:#6b7280;">Tidak ada data peminjaman</td></tr>
              ` : details.map((d, i) => `
              <tr style="${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
                <td style="border:1px solid #d1d5db;padding:4px 8px;text-align:center;">${i + 1}</td>
                <td style="border:1px solid #d1d5db;padding:4px 8px;">
                  <span style="font-weight:600;">${d.user?.name || '-'}</span><br/>
                  <span style="font-size:9px;color:#6b7280;">${d.user?.instansi || d.user?.email || '-'}</span>
                </td>
                <td style="border:1px solid #d1d5db;padding:4px 8px;">${d.kegiatan}</td>
                <td style="border:1px solid #d1d5db;padding:4px 8px;text-align:center;">${d.type === 'aula' ? 'Aula' : 'Kendaraan'}</td>
                <td style="border:1px solid #d1d5db;padding:4px 8px;text-align:center;">${formatDate(d.tanggalPinjam)}</td>
                <td style="border:1px solid #d1d5db;padding:4px 8px;text-align:center;">${formatDate(d.tanggalKembali)}</td>
                <td style="border:1px solid #d1d5db;padding:4px 8px;text-align:center;font-size:9px;">${STATUS_LABEL[d.status] || d.status}</td>
                <td style="border:1px solid #d1d5db;padding:4px 8px;text-align:right;font-weight:500;">${d.totalBiayaAmount > 0 ? formatCurrency(d.totalBiayaAmount) : '-'}</td>
              </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight:bold;background:#e5e7eb;">
                <td colspan="7" style="border:1px solid #374151;padding:6px 8px;text-align:right;">TOTAL</td>
                <td style="border:1px solid #374151;padding:6px 8px;text-align:right;">${formatCurrency(totalBiaya)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="margin:6px 0 0;font-size:11px;font-style:italic;color:#4b5563;">Terbilang: ${terbilangRupiah(totalBiaya)}</p>
          <p style="margin:4px 0 0;font-size:10px;color:#6b7280;">Total Data: ${details.length} peminjaman</p>
        </div>
      `
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Laporan Peminjaman - ${siteName}</title>
          <style>
            ${generatePrintCSS(template, `
              table { width: 100%; border-collapse: collapse; }
              h1, h2, h3 { margin: 0; }
              @page {
                @bottom-center {
                  content: "Halaman " counter(page) " dari " counter(pages);
                  font-size: 9px;
                  color: #6b7280;
                }
              }
            `)}
          </style>
        </head>
        <body>
          ${kopHtml}
          ${reportContentHtml}
          ${signatureHtml}
          ${footerHtml}
        </body>
      </html>
    `

    // Print using popup window
    try {
      const printWindow = window.open('', '_blank', 'width=900,height=700')
      if (printWindow) {
        printWindow.document.open()
        printWindow.document.write(fullHtml)
        printWindow.document.close()
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
      toast.error('Gagal mencetak laporan')
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="size-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Akses Terbatas</p>
          <p className="text-sm text-muted-foreground mt-1">Halaman ini hanya untuk administrator</p>
          <Button
            onClick={() => setCurrentView('home')}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    )
  }

  // Calculate chart max for bar rendering
  const maxMonthlyBorrowings = report?.summary.monthlyBreakdown.length
    ? Math.max(...report.summary.monthlyBreakdown.map(m => m.totalBorrowings), 1)
    : 1

  const maxMonthlyRevenue = report?.summary.monthlyBreakdown.length
    ? Math.max(...report.summary.monthlyBreakdown.map(m => m.totalRevenue), 1)
    : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setCurrentView('admin-dashboard')}
          className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 print:hidden"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Dashboard
        </Button>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <BarChart3 className="size-6" />
              Laporan Peminjaman
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Lihat dan cetak laporan peminjaman aula dan kendaraan sesuai standar pemerintah</p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!report}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
            >
              <Printer className="size-4" />
              Cetak Laporan
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="border-emerald-200 dark:border-emerald-800 mb-6 print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CalendarDays className="size-4" />
              Filter Laporan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tipe</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                    <SelectValue placeholder="Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="aula">Aula</SelectItem>
                    <SelectItem value="kendaraan">Kendaraan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Dari Tanggal</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Sampai Tanggal</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
                </div>
              <Button
                onClick={fetchReport}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                Tampilkan
              </Button>
            </div>

            {/* Format Toggle */}
            <div className="mt-4">
              <Tabs value={format} onValueChange={setFormat}>
                <TabsList className="bg-emerald-50 dark:bg-emerald-900/30">
                  <TabsTrigger value="summary" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                    <BarChart3 className="size-3.5" />
                    Ringkasan
                  </TabsTrigger>
                  <TabsTrigger value="detail" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                    <FileText className="size-3.5" />
                    Detail
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Memuat laporan...</span>
          </div>
        )}

        {/* Report Content */}
        {!loading && report && (
          <div id="report-print-area">
            {format === 'summary' ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Card className="border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                          <ClipboardList className="size-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{report.summary.totalBorrowings}</p>
                          <p className="text-xs text-muted-foreground">Total Peminjaman</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                          <CheckCheck className="size-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{report.summary.totalApproved}</p>
                          <p className="text-xs text-muted-foreground">Disetujui</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400">
                          <XCircle className="size-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-800 dark:text-red-300">{report.summary.totalRejected}</p>
                          <p className="text-xs text-muted-foreground">Ditolak</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-teal-200 dark:border-teal-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400">
                          <TrendingUp className="size-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-teal-800 dark:text-teal-300">{formatCurrency(report.summary.totalRevenue)}</p>
                          <p className="text-xs text-muted-foreground">Pendapatan Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Breakdown Chart */}
                {report.summary.monthlyBreakdown.length > 0 && (
                  <Card className="border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <BarChart3 className="size-4" />
                        Grafik Bulanan - Jumlah Peminjaman
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="space-y-3">
                        {report.summary.monthlyBreakdown.map((m) => (
                          <div key={m.month} className="flex items-center gap-3">
                            <div className="w-20 text-xs font-medium text-muted-foreground shrink-0 text-right">
                              {getMonthLabel(m.month)}
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-6 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                  style={{ width: `${Math.max((m.totalBorrowings / maxMonthlyBorrowings) * 100, 2)}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-1 text-xs shrink-0">
                                <span className="font-bold text-emerald-700 dark:text-emerald-400">{m.totalBorrowings}</span>
                                <span className="text-muted-foreground">
                                  ({m.totalApproved}✓ {m.totalRejected}✗)
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Revenue Chart */}
                {report.summary.monthlyBreakdown.length > 0 && (
                  <Card className="border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <TrendingUp className="size-4" />
                        Grafik Bulanan - Pendapatan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="space-y-3">
                        {report.summary.monthlyBreakdown.map((m) => (
                          <div key={m.month} className="flex items-center gap-3">
                            <div className="w-20 text-xs font-medium text-muted-foreground shrink-0 text-right">
                              {getMonthLabel(m.month)}
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-6 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                                  style={{ width: `${Math.max((m.totalRevenue / maxMonthlyRevenue) * 100, m.totalRevenue > 0 ? 2 : 0)}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 shrink-0 min-w-[80px] text-right">
                                {formatCurrency(m.totalRevenue)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Type Breakdown */}
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      Ringkasan Berdasarkan Tipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-emerald-200 dark:border-emerald-700 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300">Aula</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Jumlah Peminjaman</span>
                            <span className="font-medium">{report.summary.byType.aula || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pendapatan</span>
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">{formatCurrency(report.summary.revenueByType.aula || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-teal-200 dark:border-teal-700 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Car className="size-5 text-teal-600 dark:text-teal-400" />
                          <span className="font-semibold text-teal-800 dark:text-teal-300">Kendaraan</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Jumlah Peminjaman</span>
                            <span className="font-medium">{report.summary.byType.kendaraan || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pendapatan</span>
                            <span className="font-medium text-teal-700 dark:text-teal-400">{formatCurrency(report.summary.revenueByType.kendaraan || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {report.summary.totalBorrowings === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="size-12 text-emerald-300 mb-3" />
                    <p className="text-muted-foreground font-medium">Tidak ada data peminjaman</p>
                    <p className="text-sm text-muted-foreground">Coba ubah filter untuk melihat data</p>
                  </div>
                )}
              </div>
            ) : (
              /* Detail View */
              <div className="space-y-4">
                {!report.details || report.details.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="size-12 text-emerald-300 mb-3" />
                    <p className="text-muted-foreground font-medium">Tidak ada data peminjaman</p>
                    <p className="text-sm text-muted-foreground">Coba ubah filter untuk melihat data</p>
                  </div>
                ) : (
                  <>
                    <Card className="border-emerald-200 dark:border-emerald-800">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20">
                              <TableHead>No</TableHead>
                              <TableHead>Peminjam</TableHead>
                              <TableHead>Kegiatan</TableHead>
                              <TableHead>Tipe</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Tarif</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.details.map((item, idx) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-xs">{idx + 1}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{item.user?.name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{item.user?.instansi || item.user?.email || '-'}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <p className="font-medium text-sm max-w-[180px] truncate">{item.kegiatan}</p>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={item.type === 'aula'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-teal-50 text-teal-700 border-teal-200'
                                    }
                                  >
                                    {item.type === 'aula' ? (
                                      <><Building2 className="size-3" /> Aula</>
                                    ) : (
                                      <><Car className="size-3" /> Kendaraan</>
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-xs">
                                    <p>{formatDate(item.tanggalPinjam)}</p>
                                    <p className="text-muted-foreground">s/d {formatDate(item.tanggalKembali)}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={STATUS_BADGE[item.status]?.className || STATUS_BADGE.pending.className}
                                  >
                                    {STATUS_BADGE[item.status]?.label || item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {item.totalBiayaAmount > 0 ? formatCurrency(item.totalBiayaAmount) : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <Card className="border-emerald-200 dark:border-emerald-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Data: {report.details.length} peminjaman</span>
                          <span className="font-bold text-emerald-800 dark:text-emerald-300">
                            Total: {formatCurrency(report.details.reduce((sum, d) => sum + d.totalBiayaAmount, 0))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* No report loaded yet */}
        {!loading && !report && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="size-12 text-emerald-300 mb-3" />
            <p className="text-muted-foreground font-medium">Belum ada laporan ditampilkan</p>
            <p className="text-sm text-muted-foreground">Atur filter dan klik "Tampilkan" untuk melihat laporan</p>
          </div>
        )}
      </div>
    </div>
  )
}
