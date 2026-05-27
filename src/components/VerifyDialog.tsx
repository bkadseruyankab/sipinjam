'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { Loader2, CheckCircle2, XCircle, Shield, Calendar, User, FileText, CreditCard } from 'lucide-react'

interface VerificationData {
  valid: boolean
  data?: {
    type: string
    typeLabel: string
    status: string
    statusLabel: string
    kegiatan: string
    tanggalPinjam: string
    tanggalKembali: string
    userName: string
    userInstansi: string | null
    nomorPerjanjian: string | null
    paymentStatus: string
    approvedAt: string | null
    approvedBy: string | null
    kendaraan: {
      nama: string
      platNomor: string
    } | null
  }
}

export default function VerifyDialog() {
  const { verifyDialogOpen, setVerifyDialogOpen, verifyToken } = useAppStore()
  const [verification, setVerification] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (verifyDialogOpen && verifyToken) {
      fetchVerification(verifyToken)
    }
    if (!verifyDialogOpen) {
      setVerification(null)
      setError(null)
    }
  }, [verifyDialogOpen, verifyToken])

  const fetchVerification = async (token: string) => {
    setLoading(true)
    setError(null)
    setVerification(null)
    try {
      const res = await fetch(`/api/verify?token=${encodeURIComponent(token)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verifikasi gagal')
        return
      }
      setVerification(data)
    } catch {
      setError('Terjadi kesalahan saat verifikasi')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
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

  const paymentStatusLabel: Record<string, { label: string; color: string }> = {
    unpaid: { label: 'Belum Dibayar', color: 'text-amber-600' },
    pending: { label: 'Menunggu Pembayaran', color: 'text-amber-600' },
    paid: { label: 'Sudah Dibayar', color: 'text-emerald-600' },
    failed: { label: 'Gagal', color: 'text-red-600' },
    refunded: { label: 'Dikembalikan', color: 'text-blue-600' },
  }

  return (
    <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <Shield className="size-5" />
            Verifikasi Dokumen
          </DialogTitle>
          <DialogDescription>
            Hasil verifikasi dokumen berdasarkan kode QR
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-emerald-600" />
            <p className="mt-3 text-sm text-muted-foreground">Memverifikasi dokumen...</p>
          </div>
        )}

        {error && !loading && (
          <div className="glass rounded-xl p-6 text-center card-hover">
            <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="size-10 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-red-600 mb-1">Verifikasi Gagal</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {verification && !loading && !error && (
          <div className={`glass rounded-xl p-6 card-hover ${verification.valid ? 'border-emerald-200' : 'border-red-200'}`}>
            {/* Status Badge */}
            <div className="text-center mb-4">
              {verification.valid ? (
                <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="size-10 text-emerald-500" />
                </div>
              ) : (
                <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <XCircle className="size-10 text-red-500" />
                </div>
              )}
              <h3 className={`text-lg font-bold ${verification.valid ? 'text-emerald-600' : 'text-red-600'}`}>
                {verification.valid ? 'DOKUMEN VALID' : 'DOKUMEN TIDAK VALID'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {verification.valid
                  ? 'Dokumen ini telah diverifikasi dan sah'
                  : 'Dokumen ini tidak valid atau telah ditolak'}
              </p>
            </div>

            {/* Details */}
            {verification.data && (
              <div className="space-y-3 text-sm">
                {/* Document Type */}
                <div className="flex items-start gap-3 glass-dark rounded-lg p-3">
                  <FileText className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Jenis Dokumen</p>
                    <p className="font-medium">{verification.data.typeLabel}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-3 glass-dark rounded-lg p-3">
                  <Shield className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Status Peminjaman</p>
                    <p className={`font-medium ${verification.valid ? 'text-emerald-600' : 'text-red-600'}`}>
                      {verification.data.statusLabel}
                    </p>
                  </div>
                </div>

                {/* Kegiatan */}
                <div className="flex items-start gap-3 glass-dark rounded-lg p-3">
                  <Calendar className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Kegiatan</p>
                    <p className="font-medium">{verification.data.kegiatan}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(verification.data.tanggalPinjam)} s/d {formatDate(verification.data.tanggalKembali)}
                    </p>
                  </div>
                </div>

                {/* Peminjam */}
                <div className="flex items-start gap-3 glass-dark rounded-lg p-3">
                  <User className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Peminjam</p>
                    <p className="font-medium">{verification.data.userName}</p>
                    {verification.data.userInstansi && (
                      <p className="text-xs text-muted-foreground">{verification.data.userInstansi}</p>
                    )}
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-start gap-3 glass-dark rounded-lg p-3">
                  <CreditCard className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Status Pembayaran</p>
                    <p className={`font-medium ${paymentStatusLabel[verification.data.paymentStatus]?.color || 'text-gray-600'}`}>
                      {paymentStatusLabel[verification.data.paymentStatus]?.label || verification.data.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Nomor Perjanjian */}
                {verification.data.nomorPerjanjian && (
                  <div className="flex items-start gap-3 glass-dark rounded-lg p-3">
                    <FileText className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">Nomor Perjanjian</p>
                      <p className="font-mono font-medium text-xs">{verification.data.nomorPerjanjian}</p>
                    </div>
                  </div>
                )}

                {/* Kendaraan Info */}
                {verification.data.kendaraan && (
                  <div className="flex items-start gap-3 glass-dark rounded-lg p-3">
                    <Calendar className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">Kendaraan</p>
                      <p className="font-medium">{verification.data.kendaraan.nama} ({verification.data.kendaraan.platNomor})</p>
                    </div>
                  </div>
                )}

                {/* Approved By & Date */}
                {verification.data.approvedAt && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-gray-100">
                    Disetujui{verification.data.approvedBy ? ` oleh ${verification.data.approvedBy}` : ''} pada {verification.data.approvedAt}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
