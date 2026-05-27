'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Printer, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'

interface AgreementViewerProps {
  borrowingId: string
}

interface AgreementData {
  id: string
  type: string
  kegiatan: string
  tanggalPinjam: string
  tanggalKembali: string
  status: string
  nomorPerjanjian: string
  tarif: string
  totalBiaya: string
  perjanjianText: string
  userAcceptedAt: string | null
  catatanAdmin: string | null
  approvedAt: string | null
  createdAt: string
  qrToken: string | null
  user: {
    id: string
    name: string
    email: string
    phone?: string | null
    instansi?: string | null
  }
  kendaraan?: {
    nama: string
    platNomor: string
  } | null
  jenisKegiatan?: string | null
  waktuPenggunaan?: string | null
  keperluanKendaraan?: string | null
  tujuan?: string | null
  jumlahPenumpang?: number | null
  sopir?: string | null
}

export default function AgreementViewer({ borrowingId }: AgreementViewerProps) {
  const [agreement, setAgreement] = useState<AgreementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState(false)
  const [siteUrl, setSiteUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await fetch(`/api/agreement?id=${borrowingId}`)
        if (res.ok) {
          const data = await res.json()
          setAgreement(data.borrowing)
          // Extract site URL from kopSettings if available
          if (data.kopSettings?.site_url) {
            setSiteUrl(data.kopSettings.site_url)
          } else {
            setSiteUrl(process.env.NEXT_PUBLIC_APP_URL || null)
          }
        } else {
          const data = await res.json()
          toast.error(data.error || 'Gagal memuat perjanjian')
        }
      } catch {
        toast.error('Gagal memuat perjanjian')
      } finally {
        setLoading(false)
      }
    }
    if (borrowingId) {
      fetchAgreement()
    }
  }, [borrowingId])

  const handlePrint = async () => {
    setPrinting(true)
    try {
      const printContent = document.getElementById(`agreement-content-${borrowingId}`)
      if (!printContent) {
        toast.error('Konten perjanjian tidak ditemukan')
        return
      }

      // Build QR code HTML for print
      let qrHtml = ''
      if (agreement?.qrToken) {
        const qrEl = document.getElementById('agreement-qr-code')
        if (qrEl) {
          qrHtml = `
            <div style="margin-top:20px;text-align:right;">
              <div style="display:inline-block;text-align:center;">
                ${qrEl.outerHTML}
                <p style="margin:4px 0 0;font-size:9px;color:#6b7280;">Scan untuk verifikasi</p>
              </div>
            </div>
          `
        }
      }

      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        window.print()
        return
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Perjanjian ${agreement?.nomorPerjanjian || ''}</title>
            <style>
              body { font-family: 'Times New Roman', serif; margin: 20px; color: #1a1a1a; line-height: 1.7; }
              @media print { body { margin: 0; } }
              @page { margin: 15mm; }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            ${qrHtml}
          </body>
        </html>
      `)
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
      }, 800)
    } catch {
      toast.error('Gagal mencetak perjanjian')
    } finally {
      setPrinting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-muted-foreground">Memuat perjanjian...</span>
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground font-medium">Perjanjian tidak ditemukan</p>
        <p className="text-sm text-muted-foreground mt-1">
          Perjanjian belum tersedia untuk peminjaman ini
        </p>
      </div>
    )
  }

  const qrVerifyUrl = `${siteUrl || (typeof window !== 'undefined' ? window.location.origin : '')}/?verify=${agreement.qrToken}`

  return (
    <div className="space-y-4">
      {/* Meta info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono">
            {agreement.nomorPerjanjian}
          </Badge>
          <Badge variant="outline" className={
            agreement.type === 'aula'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-teal-50 text-teal-700 border-teal-200'
          }>
            {agreement.type === 'aula' ? 'Aula BKAD' : 'Kendaraan Bermotor'}
          </Badge>
          {agreement.userAcceptedAt && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="size-3" />
              Disetujui User
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          disabled={printing}
          className="border-emerald-200 text-emerald-700"
        >
          {printing ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
          {printing ? 'Mencetak...' : 'Cetak'}
        </Button>
      </div>

      {/* Agreement Content */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div
          id={`agreement-content-${borrowingId}`}
          className="p-6 sm:p-10"
          dangerouslySetInnerHTML={{ __html: agreement.perjanjianText }}
        />

        {/* QR Verification Code */}
        {agreement.qrToken && (
          <div className="px-6 pb-6 sm:px-10 sm:pb-10 flex justify-end">
            <div className="text-center">
              <div id="agreement-qr-code">
                <QRCodeSVG
                  value={qrVerifyUrl}
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
      </div>
    </div>
  )
}
