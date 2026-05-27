'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  CreditCard,
  Building2,
  Copy,
  CheckCircle2,
  Clock,
  Upload,
  Loader2,
  ArrowLeft,
  Wallet,
  QrCode,
  Landmark,
  ChevronRight,
  XCircle,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react'

interface PaymentDetails {
  borrowingId: string
  method: string | null
  vaNumber: string | null
  qrisUrl: string | null
  amount: string | null
  status: string
  proof: string | null
  notes: string | null
  paidAt: string | null
  totalBiaya: string | null
  kegiatan: string | null
}

const PAYMENT_METHODS = [
  { key: 'va_bca', label: 'BCA Virtual Account', icon: Landmark, color: 'from-blue-500 to-blue-700', desc: 'Transfer via BCA VA' },
  { key: 'va_bri', label: 'BRI Virtual Account', icon: Landmark, color: 'from-blue-600 to-blue-800', desc: 'Transfer via BRI VA' },
  { key: 'va_mandiri', label: 'Mandiri Virtual Account', icon: Landmark, color: 'from-yellow-500 to-yellow-700', desc: 'Transfer via Mandiri VA' },
  { key: 'qris', label: 'QRIS', icon: QrCode, color: 'from-emerald-500 to-teal-600', desc: 'Scan QR Code' },
  { key: 'manual', label: 'Transfer Manual', icon: Wallet, color: 'from-amber-500 to-orange-600', desc: 'Transfer ke rekening & upload bukti' },
]

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string; dotClass: string }> = {
  unpaid: {
    label: 'Belum Bayar',
    className: 'bg-gray-100/80 text-gray-700 border-gray-300/70 backdrop-blur-sm',
    dotClass: 'bg-gray-500',
  },
  pending: {
    label: 'Menunggu Konfirmasi',
    className: 'bg-amber-100/80 text-amber-800 border-amber-300/70 backdrop-blur-sm',
    dotClass: 'bg-amber-500',
  },
  paid: {
    label: 'Dibayar',
    className: 'bg-emerald-100/80 text-emerald-800 border-emerald-300/70 backdrop-blur-sm',
    dotClass: 'bg-emerald-500',
  },
  failed: {
    label: 'Gagal',
    className: 'bg-red-100/80 text-red-800 border-red-300/70 backdrop-blur-sm',
    dotClass: 'bg-red-500',
  },
  refunded: {
    label: 'Dikembalikan',
    className: 'bg-purple-100/80 text-purple-800 border-purple-300/70 backdrop-blur-sm',
    dotClass: 'bg-purple-500',
  },
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.unpaid
  return (
    <Badge variant="outline" className={`${config.className} whitespace-nowrap text-[11px] gap-1.5`}>
      <span className={`size-1.5 rounded-full ${config.dotClass} ${status === 'pending' ? 'animate-pulse-glow' : ''}`} />
      {config.label}
    </Badge>
  )
}

function formatRupiah(amount: string | null | undefined): string {
  if (!amount) return 'Rp 0'
  const num = parseInt(amount)
  if (isNaN(num)) return amount
  return `Rp ${num.toLocaleString('id-ID')}`
}

const BANK_NAMES: Record<string, string> = {
  va_bca: 'BCA',
  va_bri: 'BRI',
  va_mandiri: 'Mandiri',
}

export default function PaymentDialog() {
  const { paymentDialogOpen, setPaymentDialogOpen, paymentBorrowingId, setPaymentBorrowingId, user } = useAppStore()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'status'>('amount')
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  // Fetch payment details when dialog opens
  const fetchPaymentDetails = useCallback(async () => {
    if (!paymentBorrowingId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/borrowing/list?userId=${user?.id || ''}`)
      if (res.ok) {
        const data = await res.json()
        const borrowings = data.borrowings || data
        const borrowing = borrowings.find((b: Record<string, unknown>) => b.id === paymentBorrowingId)
        if (borrowing) {
          const details: PaymentDetails = {
            borrowingId: borrowing.id as string,
            method: (borrowing.paymentMethod as string) || null,
            vaNumber: (borrowing.paymentVaNumber as string) || null,
            qrisUrl: (borrowing.paymentQrisUrl as string) || null,
            amount: (borrowing.paymentAmount as string) || null,
            status: (borrowing.paymentStatus as string) || 'unpaid',
            proof: (borrowing.paymentProof as string) || null,
            notes: (borrowing.paymentNotes as string) || null,
            paidAt: (borrowing.paidAt as string) || null,
            totalBiaya: (borrowing.totalBiaya as string) || null,
            kegiatan: (borrowing.kegiatan as string) || null,
          }
          setPaymentDetails(details)
          if (details.status !== 'unpaid' && details.method) {
            setStep('status')
          } else {
            setStep('amount')
          }
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [paymentBorrowingId, user?.id])

  useEffect(() => {
    if (paymentDialogOpen && paymentBorrowingId) {
      fetchPaymentDetails()
    }
  }, [paymentDialogOpen, paymentBorrowingId, fetchPaymentDetails])

  const handleClose = () => {
    setPaymentDialogOpen(false)
    setPaymentBorrowingId('')
    setPaymentDetails(null)
    setSelectedMethod(null)
    setStep('amount')
    setUploadFile(null)
  }

  const handleCreatePayment = async (method: string) => {
    if (!paymentBorrowingId) return
    setCreatingPayment(true)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowingId: paymentBorrowingId, method }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Pembayaran berhasil dibuat')
        await fetchPaymentDetails()
        setStep('details')
      } else {
        toast.error(data.error || 'Gagal membuat pembayaran')
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setCreatingPayment(false)
    }
  }

  const handleCopyVa = async (vaNumber: string) => {
    try {
      await navigator.clipboard.writeText(vaNumber)
      setCopied(true)
      toast.success('Nomor VA berhasil disalin')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Gagal menyalin nomor VA')
    }
  }

  const handleUploadProof = async () => {
    if (!uploadFile || !paymentBorrowingId) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('borrowingId', paymentBorrowingId)
      formData.append('file', uploadFile)
      const res = await fetch('/api/payment/proof', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Bukti transfer berhasil diunggah')
        await fetchPaymentDetails()
        setStep('status')
        setUploadFile(null)
      } else {
        toast.error(data.error || 'Gagal mengunggah bukti transfer')
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setUploading(false)
    }
  }

  const currentMethod = PAYMENT_METHODS.find(m => m.key === (selectedMethod || paymentDetails?.method))

  return (
    <Dialog open={paymentDialogOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="glass sm:max-w-lg max-h-[90vh] overflow-y-auto border-emerald-200/60 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-800">
            <CreditCard className="size-5" />
            Pembayaran
          </DialogTitle>
          <DialogDescription>
            {paymentDetails?.kegiatan ? `Pembayaran untuk: ${paymentDetails.kegiatan}` : 'Proses pembayaran peminjaman'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Memuat data pembayaran...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Step 1: Show Amount */}
            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="glass rounded-xl border border-emerald-200/60 p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                  <p className="text-3xl font-bold gradient-text">
                    {formatRupiah(paymentDetails?.totalBiaya || paymentDetails?.amount)}
                  </p>
                  {paymentDetails?.kegiatan && (
                    <p className="text-xs text-muted-foreground mt-2">{paymentDetails.kegiatan}</p>
                  )}
                </div>

                {paymentDetails?.status === 'unpaid' ? (
                  <Button
                    onClick={() => setStep('method')}
                    className="w-full btn-modern bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-11"
                  >
                    Pilih Metode Pembayaran
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <div className="text-center">
                    <PaymentStatusBadge status={paymentDetails?.status || 'unpaid'} />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Choose Payment Method */}
            {step === 'method' && (
              <motion.div
                key="method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <Button
                  variant="ghost"
                  onClick={() => setStep('amount')}
                  className="mb-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/60 -ml-2"
                >
                  <ArrowLeft className="size-4" />
                  Kembali
                </Button>

                <p className="text-sm font-medium text-emerald-800 mb-3">Pilih Metode Pembayaran</p>

                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.key}
                      onClick={() => setSelectedMethod(method.key)}
                      className={`w-full glass rounded-xl border p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md text-left ${
                        selectedMethod === method.key
                          ? 'border-emerald-400 shadow-md ring-2 ring-emerald-200/50 bg-emerald-50/30'
                          : 'border-emerald-200/40 hover:border-emerald-300/60'
                      }`}
                    >
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${method.color} text-white shadow-md`}>
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </div>
                      <div className={`size-5 rounded-full border-2 transition-colors ${
                        selectedMethod === method.key
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedMethod === method.key && (
                          <CheckCircle2 className="size-5 text-white" />
                        )}
                      </div>
                    </button>
                  )
                })}

                <Button
                  onClick={() => selectedMethod && handleCreatePayment(selectedMethod)}
                  disabled={!selectedMethod || creatingPayment}
                  className="w-full btn-modern bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-11 mt-4"
                >
                  {creatingPayment ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Lanjutkan Pembayaran
                      <ChevronRight className="size-4 ml-1" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Step 3: Payment Details */}
            {step === 'details' && paymentDetails && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Button
                  variant="ghost"
                  onClick={() => setStep('method')}
                  className="mb-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/60 -ml-2"
                >
                  <ArrowLeft className="size-4" />
                  Ganti Metode
                </Button>

                {/* Amount */}
                <div className="glass rounded-xl border border-emerald-200/60 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Pembayaran</p>
                  <p className="text-2xl font-bold gradient-text">
                    {formatRupiah(paymentDetails.amount || paymentDetails.totalBiaya)}
                  </p>
                </div>

                {/* VA Method */}
                {paymentDetails.method?.startsWith('va_') && paymentDetails.vaNumber && (
                  <div className="glass rounded-xl border border-emerald-200/60 p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${currentMethod?.color || 'from-blue-500 to-blue-700'} text-white shadow-md`}>
                        <Landmark className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Virtual Account {BANK_NAMES[paymentDetails.method] || ''}</p>
                        <p className="text-xs text-muted-foreground">Transfer tepat sesuai nominal</p>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-lg border border-emerald-100 p-4">
                      <p className="text-xs text-muted-foreground mb-1">Nomor Virtual Account</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-lg font-mono font-bold tracking-wider text-emerald-800">
                          {paymentDetails.vaNumber}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyVa(paymentDetails.vaNumber!)}
                          className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          {copied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                          <span className="ml-1 text-xs">{copied ? 'Disalin' : 'Salin'}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/40 rounded-lg p-3">
                        <p className="text-muted-foreground">Bank</p>
                        <p className="font-medium">{BANK_NAMES[paymentDetails.method] || '-'}</p>
                      </div>
                      <div className="bg-white/40 rounded-lg p-3">
                        <p className="text-muted-foreground">Batas Waktu</p>
                        <p className="font-medium">24 Jam</p>
                      </div>
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700">
                        <p className="font-medium">Penting:</p>
                        <p>Transfer tepat sesuai nominal yang tertera. Pembayaran akan otomatis dikonfirmasi dalam 1x24 jam.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* QRIS Method */}
                {paymentDetails.method === 'qris' && paymentDetails.qrisUrl && (
                  <div className="glass rounded-xl border border-emerald-200/60 p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                        <QrCode className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">QRIS Payment</p>
                        <p className="text-xs text-muted-foreground">Scan dengan e-wallet atau mobile banking</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 p-4 flex justify-center">
                      <QRCodeSVG
                        value={paymentDetails.qrisUrl}
                        size={200}
                        level="M"
                        includeMargin
                        bgColor="#ffffff"
                        fgColor="#065f46"
                      />
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700">
                        <p className="font-medium">Cara Pembayaran:</p>
                        <p>Buka e-wallet atau mobile banking, pilih bayar via QRIS, lalu scan kode di atas.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Transfer Method */}
                {paymentDetails.method === 'manual' && (
                  <div className="glass rounded-xl border border-emerald-200/60 p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                        <Wallet className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Transfer Manual</p>
                        <p className="text-xs text-muted-foreground">Transfer ke rekening & upload bukti</p>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-lg border border-emerald-100 p-4 space-y-3">
                      <p className="text-xs font-medium text-emerald-800">Informasi Rekening Tujuan:</p>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank</span>
                          <span className="font-medium">Bank BRI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">No. Rekening</span>
                          <span className="font-mono font-medium">0012 3456 7890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Atas Nama</span>
                          <span className="font-medium">BKAD Kab. Seruyan</span>
                        </div>
                      </div>
                    </div>

                    {/* Upload Bukti Transfer */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-emerald-800">Upload Bukti Transfer</p>
                      {!paymentDetails.proof ? (
                        <>
                          <div className="flex items-center gap-3">
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                              className="flex-1 text-sm"
                            />
                          </div>
                          {uploadFile && (
                            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-lg p-3 flex items-center gap-2">
                              <ImageIcon className="size-4 text-emerald-600" />
                              <span className="text-xs text-emerald-700 truncate">{uploadFile.name}</span>
                            </div>
                          )}
                          <Button
                            onClick={handleUploadProof}
                            disabled={!uploadFile || uploading}
                            className="w-full btn-modern bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Mengunggah...
                              </>
                            ) : (
                              <>
                                <Upload className="size-4 mr-2" />
                                Upload Bukti Transfer
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-lg p-3 flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span className="text-xs text-emerald-700">Bukti transfer sudah diunggah</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Status */}
                <div className="flex items-center justify-between">
                  <PaymentStatusBadge status={paymentDetails.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('status')}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs"
                  >
                    Lihat Status
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Status */}
            {step === 'status' && paymentDetails && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {(paymentDetails.status === 'unpaid' || paymentDetails.method) && step === 'status' && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (paymentDetails.status === 'unpaid') setStep('amount')
                      else setStep('details')
                    }}
                    className="mb-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/60 -ml-2"
                  >
                    <ArrowLeft className="size-4" />
                    Kembali
                  </Button>
                )}

                {/* Status Card */}
                <div className="glass rounded-xl border border-emerald-200/60 p-6 text-center">
                  {paymentDetails.status === 'paid' ? (
                    <>
                      <div className="flex size-16 mx-auto items-center justify-center rounded-full bg-emerald-100 mb-3">
                        <CheckCircle2 className="size-8 text-emerald-600" />
                      </div>
                      <p className="text-lg font-bold text-emerald-800">Pembayaran Dikonfirmasi</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {paymentDetails.paidAt
                          ? `Dibayar pada: ${new Date(paymentDetails.paidAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                          : 'Pembayaran telah berhasil'}
                      </p>
                    </>
                  ) : paymentDetails.status === 'pending' ? (
                    <>
                      <div className="flex size-16 mx-auto items-center justify-center rounded-full bg-amber-100 mb-3">
                        <Clock className="size-8 text-amber-600" />
                      </div>
                      <p className="text-lg font-bold text-amber-800">Menunggu Konfirmasi</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pembayaran Anda sedang diverifikasi oleh admin
                      </p>
                    </>
                  ) : paymentDetails.status === 'failed' ? (
                    <>
                      <div className="flex size-16 mx-auto items-center justify-center rounded-full bg-red-100 mb-3">
                        <XCircle className="size-8 text-red-600" />
                      </div>
                      <p className="text-lg font-bold text-red-800">Pembayaran Gagal</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pembayaran ditolak oleh admin. Silakan coba lagi.
                      </p>
                      <Button
                        onClick={() => setStep('amount')}
                        className="mt-4 btn-modern bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      >
                        Coba Bayar Lagi
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex size-16 mx-auto items-center justify-center rounded-full bg-gray-100 mb-3">
                        <CreditCard className="size-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-bold text-gray-700">Belum Bayar</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Silakan lakukan pembayaran
                      </p>
                      <Button
                        onClick={() => setStep('amount')}
                        className="mt-4 btn-modern bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      >
                        Bayar Sekarang
                      </Button>
                    </>
                  )}
                </div>

                {/* Payment Info */}
                {paymentDetails.method && (
                  <div className="glass rounded-xl border border-emerald-200/60 p-4 space-y-2">
                    <p className="text-xs font-medium text-emerald-800 mb-2">Detail Pembayaran</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Metode</p>
                        <p className="font-medium">{PAYMENT_METHODS.find(m => m.key === paymentDetails.method)?.label || paymentDetails.method}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Jumlah</p>
                        <p className="font-medium">{formatRupiah(paymentDetails.amount || paymentDetails.totalBiaya)}</p>
                      </div>
                      {paymentDetails.vaNumber && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">No. VA</p>
                          <p className="font-mono font-medium">{paymentDetails.vaNumber}</p>
                        </div>
                      )}
                      {paymentDetails.proof && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Bukti Transfer</p>
                          <a href={paymentDetails.proof} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium text-xs">
                            Lihat Bukti Transfer
                          </a>
                        </div>
                      )}
                      {paymentDetails.notes && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Catatan</p>
                          <p className="font-medium">{paymentDetails.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </DialogContent>
    </Dialog>
  )
}
