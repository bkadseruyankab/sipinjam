'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  ArrowLeft,
  FileCheck,
  Loader2,
  CheckCircle2,
  Printer,
  AlertTriangle,
} from 'lucide-react'

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

export default function PerjanjianView() {
  const { user, setLoginDialogOpen, setCurrentView, selectedAgreementId, setSelectedAgreementId } = useAppStore()
  const [agreement, setAgreement] = useState<AgreementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    if (!selectedAgreementId) {
      setLoading(false)
      return
    }
    const fetchAgreement = async () => {
      try {
        const res = await fetch(`/api/agreement?id=${selectedAgreementId}`)
        if (res.ok) {
          const data = await res.json()
          setAgreement(data.borrowing)
          setAccepted(!!data.borrowing.userAcceptedAt)
        } else {
          toast.error('Gagal memuat perjanjian')
        }
      } catch {
        toast.error('Gagal memuat perjanjian')
      } finally {
        setLoading(false)
      }
    }
    fetchAgreement()
  }, [selectedAgreementId])

  const handleAccept = async () => {
    if (!selectedAgreementId) return
    setAccepting(true)
    try {
      const res = await fetch('/api/agreement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAgreementId }),
      })
      const data = await res.json()
      if (res.ok) {
        setAccepted(true)
        toast.success('Perjanjian berhasil disetujui!')
      } else {
        toast.error(data.error || 'Gagal menyetujui perjanjian')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setAccepting(false)
    }
  }

  const handlePrint = async () => {
    setPrinting(true)
    try {
      const printContent = document.getElementById('agreement-content')
      if (!printContent) {
        toast.error('Konten perjanjian tidak ditemukan')
        return
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

  const handleBack = () => {
    setSelectedAgreementId(null)
    setCurrentView('pengajuan-saya')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FileCheck className="size-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Silakan login untuk melihat perjanjian</p>
          <Button
            onClick={() => setLoginDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Pengajuan
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
            <FileCheck className="size-6" />
            Surat Perjanjian Peminjaman
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Perjanjian resmi peminjaman berdasarkan Peraturan Bupati
          </p>
        </div>

        {loading ? (
          <Card className="border-emerald-200">
            <CardContent className="py-12 flex items-center justify-center">
              <Loader2 className="size-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-muted-foreground">Memuat perjanjian...</span>
            </CardContent>
          </Card>
        ) : !agreement ? (
          <Card className="border-emerald-200">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="size-12 text-amber-400 mb-3" />
              <p className="text-muted-foreground font-medium">Perjanjian tidak ditemukan</p>
              <p className="text-sm text-muted-foreground mt-1">
                Perjanjian akan tersedia setelah peminjaman disetujui oleh admin
              </p>
              <Button
                variant="outline"
                onClick={handleBack}
                className="mt-4 border-emerald-200 text-emerald-700"
              >
                Lihat Pengajuan Saya
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status Banner */}
            <div className="mb-4">
              {accepted ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Perjanjian Telah Disetujui</p>
                    <p className="text-xs text-emerald-600">
                      Anda telah menyetujui perjanjian ini pada{' '}
                      {agreement.userAcceptedAt
                        ? new Date(agreement.userAcceptedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <AlertTriangle className="size-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Perjanjian Menunggu Persetujuan Anda</p>
                    <p className="text-xs text-amber-700">
                      Harap baca perjanjian dengan saksama, lalu berikan persetujuan Anda di bagian bawah halaman.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Agreement Meta Info */}
            <Card className="border-emerald-200 mb-4">
              <CardContent className="p-4">
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
                  </div>
                  <div className="flex gap-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Agreement Content */}
            <Card className="border-emerald-200 mb-6">
              <CardContent className="p-0">
                <div
                  id="agreement-content"
                  className="p-6 sm:p-10"
                  dangerouslySetInnerHTML={{ __html: agreement.perjanjianText }}
                />
              </CardContent>
            </Card>

            {/* Accept Agreement Section */}
            {!accepted && (
              <Card className="border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-emerald-800 mb-2">
                      Persetujuan Perjanjian
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 max-w-lg mx-auto">
                      Dengan menekan tombol di bawah ini, Anda menyatakan telah membaca, memahami,
                      dan menyetujui seluruh isi perjanjian ini sesuai dengan Peraturan Bupati tentang
                      Tarif Retribusi Daerah yang berlaku.
                    </p>
                    <Button
                      onClick={handleAccept}
                      disabled={accepting}
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                    >
                      {accepting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Memproses...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="size-4" />
                          Saya Setuju dengan Perjanjian Ini
                        </span>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Persetujuan ini bersifat mengikat dan dicatat dalam sistem
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {accepted && (
              <Card className="border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">
                        Perjanjian telah disetujui
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBack}
                      className="border-emerald-200 text-emerald-700"
                    >
                      Kembali ke Pengajuan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
