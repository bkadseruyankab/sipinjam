'use client'

import { useState, useEffect, Fragment, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, Building2, Car, Inbox, CalendarDays, Clock, FileCheck, Eye, Star, Printer, XCircle, MoreHorizontal, ChevronDown, ChevronUp, Info, ClipboardList, CheckCircle2, Ban, Clock4, BarChart3, Search, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import TestimonialForm from '@/components/TestimonialForm'
import ReceiptViewer from '@/components/ReceiptViewer'

interface Borrowing {
  id: string
  type: string
  kegiatan: string
  tanggalPinjam: string
  tanggalKembali: string
  status: string
  jenisKegiatan?: string
  waktuPenggunaan?: string
  keperluanKendaraan?: string
  tujuan?: string
  kendaraan?: { nama: string; platNomor: string }
  catatanAdmin?: string
  nomorPerjanjian?: string
  userAcceptedAt?: string
  createdAt: string
  cancelReason?: string
  cancelRequestedAt?: string
  cancelRequestedBy?: string
  cancelApprovedBy?: string
  cancelApprovedAt?: string
  paymentStatus?: string
  paymentMethod?: string
  totalBiaya?: string
  paymentProof?: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string; dotClass: string }> = {
  pending: {
    label: 'Menunggu',
    className: 'bg-yellow-100/80 text-yellow-800 border-yellow-300/70 backdrop-blur-sm',
    dotClass: 'bg-yellow-500',
  },
  approved: {
    label: 'Disetujui',
    className: 'bg-emerald-100/80 text-emerald-800 border-emerald-300/70 backdrop-blur-sm',
    dotClass: 'bg-emerald-500',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-red-100/80 text-red-800 border-red-300/70 backdrop-blur-sm',
    dotClass: 'bg-red-500',
  },
  completed: {
    label: 'Selesai',
    className: 'bg-teal-100/80 text-teal-800 border-teal-300/70 backdrop-blur-sm',
    dotClass: 'bg-teal-500',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-gray-100/80 text-gray-600 border-gray-300/70 backdrop-blur-sm',
    dotClass: 'bg-gray-500',
  },
  cancel_requested: {
    label: 'Pembatalan Diajukan',
    className: 'bg-orange-100/80 text-orange-800 border-orange-300/70 backdrop-blur-sm',
    dotClass: 'bg-orange-500',
  },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <Badge variant="outline" className={`${config.className} whitespace-nowrap text-[11px] gap-1.5`}>
      <span className={`size-1.5 rounded-full ${config.dotClass} animate-pulse-glow`} />
      {config.label}
    </Badge>
  )
}

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

function formatDate(dateStr: string) {
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

function formatDateShort(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/* ─── useCountUp hook ─── */
function useCountUp(target: number, duration = 1200) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const [count, setCount] = useState(0)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!isInView) return
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    let startTime: number | null = null
    let rafId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, isInView])

  return { ref, count }
}

export default function PengajuanSaya() {
  const { user, setLoginDialogOpen, setCurrentView, setSelectedAgreementId, setPaymentDialogOpen, setPaymentBorrowingId } = useAppStore()
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(true)
  const [testimonialFormOpen, setTestimonialFormOpen] = useState(false)
  const [testimonialBorrowingId, setTestimonialBorrowingId] = useState<string | undefined>(undefined)

  // Expand row state
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Active tab
  const [activeTab, setActiveTab] = useState<'aula' | 'kendaraan'>('aula')

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) {
      setLoginDialogOpen(true)
      setLoading(false)
      return
    }
    const fetchBorrowings = async () => {
      try {
        const res = await fetch(`/api/borrowing/list?userId=${user.id}`)
        const data = await res.json()
        if (res.ok) {
          setBorrowings(data.borrowings || data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchBorrowings()
  }, [user, setLoginDialogOpen])

  const aulaBorrowings = borrowings.filter((b) => b.type === 'aula')
  const kendaraanBorrowings = borrowings.filter((b) => b.type === 'kendaraan')

  // Statistics derived from borrowings
  const stats = {
    total: borrowings.length,
    menunggu: borrowings.filter((b) => b.status === 'pending').length,
    disetujui: borrowings.filter((b) => b.status === 'approved').length,
    selesai: borrowings.filter((b) => b.status === 'completed').length,
    ditolak: borrowings.filter((b) => b.status === 'rejected').length,
    dibatalkan: borrowings.filter((b) => b.status === 'cancelled' || b.status === 'cancel_requested').length,
  }

  const STAT_CARDS: { key: string; label: string; icon: React.ReactNode; count: number; gradientFrom: string; gradientTo: string; iconBgClass: string; iconTextClass: string; countClass: string }[] = [
    {
      key: 'total',
      label: 'Total Pengajuan',
      icon: <ClipboardList className="size-5" />,
      count: stats.total,
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-500',
      iconBgClass: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      iconTextClass: 'text-white',
      countClass: 'text-emerald-800',
    },
    {
      key: 'menunggu',
      label: 'Menunggu',
      icon: <Clock4 className="size-5" />,
      count: stats.menunggu,
      gradientFrom: 'from-amber-400',
      gradientTo: 'to-yellow-500',
      iconBgClass: 'bg-gradient-to-br from-amber-400 to-yellow-500',
      iconTextClass: 'text-white',
      countClass: 'text-amber-800',
    },
    {
      key: 'disetujui',
      icon: <CheckCircle2 className="size-5" />,
      label: 'Disetujui',
      count: stats.disetujui,
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-500',
      iconBgClass: 'bg-gradient-to-br from-green-500 to-emerald-500',
      iconTextClass: 'text-white',
      countClass: 'text-green-800',
    },
    {
      key: 'selesai',
      label: 'Selesai',
      icon: <BarChart3 className="size-5" />,
      count: stats.selesai,
      gradientFrom: 'from-teal-500',
      gradientTo: 'to-cyan-500',
      iconBgClass: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      iconTextClass: 'text-white',
      countClass: 'text-teal-800',
    },
    {
      key: 'ditolak',
      label: 'Ditolak',
      icon: <XCircle className="size-5" />,
      count: stats.ditolak,
      gradientFrom: 'from-red-400',
      gradientTo: 'to-rose-500',
      iconBgClass: 'bg-gradient-to-br from-red-400 to-rose-500',
      iconTextClass: 'text-white',
      countClass: 'text-red-800',
    },
    {
      key: 'dibatalkan',
      label: 'Dibatalkan',
      icon: <Ban className="size-5" />,
      count: stats.dibatalkan,
      gradientFrom: 'from-gray-400',
      gradientTo: 'to-slate-500',
      iconBgClass: 'bg-gradient-to-br from-gray-400 to-slate-500',
      iconTextClass: 'text-white',
      countClass: 'text-gray-700',
    },
  ]

  const handleViewAgreement = (borrowingId: string) => {
    setSelectedAgreementId(borrowingId)
    setCurrentView('perjanjian')
  }

  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [receiptBorrowingId, setReceiptBorrowingId] = useState<string | null>(null)

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelBorrowingId, setCancelBorrowingId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  const handleViewReceipt = (borrowingId: string) => {
    setReceiptBorrowingId(borrowingId)
    setReceiptDialogOpen(true)
  }

  const handleOpenCancelDialog = (borrowingId: string) => {
    setCancelBorrowingId(borrowingId)
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  const handleSubmitCancel = async () => {
    if (!cancelBorrowingId || !cancelReason.trim() || !user) return
    setCancelLoading(true)
    try {
      const res = await fetch('/api/borrowing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cancelBorrowingId,
          cancelReason: cancelReason.trim(),
          userId: user.id,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Permintaan pembatalan berhasil diajukan', {
          description: 'Menunggu persetujuan admin',
        })
        setCancelDialogOpen(false)
        setCancelBorrowingId(null)
        setCancelReason('')
        // Refresh borrowings list
        const listRes = await fetch(`/api/borrowing/list?userId=${user.id}`)
        const listData = await listRes.json()
        if (listRes.ok) {
          setBorrowings(listData.borrowings || listData)
        }
      } else {
        toast.error('Gagal mengajukan pembatalan', {
          description: data.error || 'Terjadi kesalahan',
        })
      }
    } catch {
      toast.error('Gagal mengajukan pembatalan', {
        description: 'Terjadi kesalahan jaringan',
      })
    } finally {
      setCancelLoading(false)
    }
  }

  const cancelBorrowingItem = borrowings.find((b) => b.id === cancelBorrowingId)

  /* ─── Animated Empty State ─── */
  const EmptyState = ({ type }: { type: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-6"
      >
        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200/60 shadow-lg shadow-emerald-100/50">
          <Inbox className="size-9 text-emerald-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">0</span>
        </div>
      </motion.div>
      <p className="text-foreground font-semibold text-lg">Belum ada pengajuan {type}</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
        Ajukan peminjaman {type} untuk melihat riwayat di sini
      </p>
    </motion.div>
  )

  /* ─── Stat Card Component ─── */
  function StatCard({ card, index }: { card: typeof STAT_CARDS[number]; index: number }) {
    const { ref, count } = useCountUp(card.count, 1200)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
        className={`card-hover card-shine glass rounded-xl border border-white/40 p-4 min-w-[155px] shrink-0 relative overflow-hidden`}
      >
        {/* Subtle gradient accent at top */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.gradientFrom} ${card.gradientTo} opacity-60`} />
        <div className="flex items-center gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl shadow-md ${card.iconBgClass} ${card.iconTextClass}`}>
            {card.icon}
          </div>
          <div className="min-w-0">
            <p className={`text-2xl font-bold leading-tight ${card.countClass}`}>
              <span ref={ref}>{count}</span>
            </p>
            <p className="text-[11px] text-muted-foreground font-medium leading-tight truncate">{card.label}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  /* ─── Borrowing Table ─── */
  const BorrowingTable = ({ items, typeLabel }: { items: Borrowing[]; typeLabel: string }) => {
    // Filter items by search query
    const filtered = searchQuery.trim()
      ? items.filter((item) =>
          item.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tujuan && item.tujuan.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.nomorPerjanjian && item.nomorPerjanjian.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (STATUS_CONFIG[item.status]?.label || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items

    if (items.length === 0) {
      return <EmptyState type={typeLabel} />
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-xl border border-emerald-200/50 overflow-hidden glass shadow-sm"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/60 hover:bg-emerald-50/60 border-b-emerald-200/40 backdrop-blur-sm">
                <TableHead className="w-[50px] text-center font-semibold text-emerald-800">No</TableHead>
                <TableHead className="min-w-[180px] font-semibold text-emerald-800">Kegiatan</TableHead>
                <TableHead className="min-w-[140px] font-semibold text-emerald-800">Tanggal Pinjam</TableHead>
                <TableHead className="min-w-[140px] font-semibold text-emerald-800">Tanggal Kembali</TableHead>
                {typeLabel === 'aula' && (
                  <TableHead className="min-w-[100px] font-semibold text-emerald-800">Waktu</TableHead>
                )}
                {typeLabel === 'kendaraan' && (
                  <TableHead className="min-w-[120px] font-semibold text-emerald-800">Tujuan</TableHead>
                )}
                <TableHead className="min-w-[140px] font-semibold text-emerald-800">Status</TableHead>
                <TableHead className="min-w-[100px] font-semibold text-emerald-800">Pembayaran</TableHead>
                <TableHead className="min-w-[100px] font-semibold text-emerald-800">No. Perjanjian</TableHead>
                <TableHead className="text-center w-[60px] font-semibold text-emerald-800">Detail</TableHead>
                <TableHead className="text-center w-[80px] font-semibold text-emerald-800">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="size-5 opacity-40" />
                      <span className="text-sm">Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, index) => (
                  <Fragment key={item.id}>
                    <TableRow
                      key={item.id}
                      className={`border-b-emerald-100/40 hover:bg-emerald-50/25 transition-all duration-200 cursor-pointer group ${
                        index % 2 === 1 ? 'bg-emerald-50/[0.07]' : ''
                      } ${expandedRow === item.id ? 'bg-emerald-50/30' : ''}`}
                      onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                    >
                      <TableCell className="text-center text-sm text-muted-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                            item.type === 'aula'
                              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                              : 'bg-gradient-to-br from-teal-400 to-teal-600 text-white'
                          }`}>
                            {item.type === 'aula' ? <Building2 className="size-4" /> : <Car className="size-4" />}
                          </div>
                          <span className="font-medium text-sm truncate max-w-[150px] group-hover:text-emerald-700 transition-colors" title={item.kegiatan}>
                            {item.kegiatan}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="size-3 shrink-0" />
                          <span className="whitespace-nowrap">{formatDateShort(item.tanggalPinjam)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="size-3 shrink-0" />
                          <span className="whitespace-nowrap">{formatDateShort(item.tanggalKembali)}</span>
                        </div>
                      </TableCell>
                      {typeLabel === 'aula' && (
                        <TableCell className="text-sm text-muted-foreground">
                          {item.waktuPenggunaan === 'siang' ? 'Siang' : item.waktuPenggunaan === 'malam' ? 'Malam' : '-'}
                        </TableCell>
                      )}
                      {typeLabel === 'kendaraan' && (
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[120px]" title={item.tujuan}>
                          {item.tujuan || '-'}
                        </TableCell>
                      )}
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <PaymentStatusBadge status={item.paymentStatus || 'unpaid'} />
                          {(item.paymentStatus === 'unpaid' || item.paymentStatus === 'failed') && item.totalBiaya && (item.status === 'approved' || item.status === 'completed') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-fit"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPaymentBorrowingId(item.id)
                                setPaymentDialogOpen(true)
                              }}
                            >
                              <CreditCard className="size-3 mr-1" />
                              Bayar
                            </Button>
                          )}
                          {item.paymentStatus === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-amber-600 hover:text-amber-700 hover:bg-amber-50 w-fit"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPaymentBorrowingId(item.id)
                                setPaymentDialogOpen(true)
                              }}
                            >
                              <CreditCard className="size-3 mr-1" />
                              Lihat
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.nomorPerjanjian ? (
                          <Badge variant="outline" className="glass-emerald text-emerald-700 border-emerald-200/60 text-[10px] gap-1">
                            <FileCheck className="size-3" />
                            {item.nomorPerjanjian}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0 text-muted-foreground hover:text-emerald-700 hover:bg-emerald-100/60"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedRow(expandedRow === item.id ? null : item.id)
                          }}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {expandedRow === item.id ? (
                              <motion.div
                                key="up"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronUp className="size-4" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="down"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="size-4" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <ActionDropdown item={item} />
                      </TableCell>
                    </TableRow>

                    {/* Expanded Detail Row */}
                    <AnimatePresence>
                      {expandedRow === item.id && (
                        <TableRow key={`${item.id}-detail`} className="border-b-emerald-200/30">
                          <TableCell colSpan={typeLabel === 'aula' ? 10 : 10} className="p-0 border-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-4 space-y-3 bg-emerald-50/20">
                                {/* Detail Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {item.type === 'aula' && item.jenisKegiatan && (
                                    <div className="glass rounded-lg border border-emerald-100/60 p-3">
                                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Jenis Kegiatan</p>
                                      <p className="text-sm font-medium mt-0.5 capitalize">{item.jenisKegiatan}</p>
                                    </div>
                                  )}
                                  {item.type === 'aula' && item.waktuPenggunaan && (
                                    <div className="glass rounded-lg border border-emerald-100/60 p-3">
                                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Waktu Penggunaan</p>
                                      <p className="text-sm font-medium mt-0.5">
                                        <Clock className="size-3 inline mr-1" />
                                        {item.waktuPenggunaan === 'siang' ? 'Siang (06:00-18:00)' : 'Malam (18:00-06:00)'}
                                      </p>
                                    </div>
                                  )}
                                  {item.type === 'kendaraan' && item.kendaraan && (
                                    <div className="glass rounded-lg border border-emerald-100/60 p-3">
                                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Kendaraan</p>
                                      <p className="text-sm font-medium mt-0.5">{item.kendaraan.nama} ({item.kendaraan.platNomor})</p>
                                    </div>
                                  )}
                                  {item.type === 'kendaraan' && item.keperluanKendaraan && (
                                    <div className="glass rounded-lg border border-emerald-100/60 p-3">
                                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Keperluan</p>
                                      <p className="text-sm font-medium mt-0.5 capitalize">{item.keperluanKendaraan}</p>
                                    </div>
                                  )}
                                  {item.tujuan && (
                                    <div className="glass rounded-lg border border-emerald-100/60 p-3">
                                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Tujuan</p>
                                      <p className="text-sm font-medium mt-0.5">{item.tujuan}</p>
                                    </div>
                                  )}
                                  <div className="glass rounded-lg border border-emerald-100/60 p-3">
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Tanggal Pengajuan</p>
                                    <p className="text-sm font-medium mt-0.5">{formatDate(item.createdAt)}</p>
                                  </div>
                                </div>

                                {/* Admin Notes */}
                                {item.catatanAdmin && (
                                  <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-lg p-3">
                                    <p className="text-[11px] text-amber-700 uppercase tracking-wider font-medium mb-1">Catatan Admin</p>
                                    <p className="text-sm text-amber-800">{item.catatanAdmin}</p>
                                  </div>
                                )}

                                {/* Agreement Status for Approved/Completed */}
                                {(item.status === 'approved' || item.status === 'completed') && item.nomorPerjanjian && (
                                  <div className="glass-emerald rounded-lg border border-emerald-200/60 p-3 flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <FileCheck className="size-4 text-emerald-600" />
                                      <span className="text-sm font-medium text-emerald-800">Perjanjian: {item.nomorPerjanjian}</span>
                                    </div>
                                    {item.userAcceptedAt ? (
                                      <span className="text-xs text-emerald-600 font-medium bg-emerald-50/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-emerald-200/50">✓ Perjanjian disetujui</span>
                                    ) : (
                                      <span className="text-xs text-amber-600 font-medium bg-amber-50/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-amber-200/50 animate-pulse-glow">⏳ Menunggu persetujuan Anda</span>
                                    )}
                                  </div>
                                )}

                                {/* Approved without agreement */}
                                {item.status === 'approved' && !item.nomorPerjanjian && (
                                  <div className="bg-sky-50/80 backdrop-blur-sm border border-sky-200/60 rounded-lg p-3 flex items-center gap-2">
                                    <Info className="size-4 text-sky-600" />
                                    <span className="text-sm text-sky-700">Perjanjian sedang diproses...</span>
                                  </div>
                                )}

                                {/* Cancel requested info */}
                                {item.status === 'cancel_requested' && (
                                  <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200/60 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-orange-700 font-medium">
                                      <Clock className="size-4" />
                                      Menunggu persetujuan admin
                                    </div>
                                    {item.cancelReason && (
                                      <p className="text-sm text-orange-600">
                                        Alasan pembatalan: {item.cancelReason}
                                      </p>
                                    )}
                                    {item.cancelRequestedAt && (
                                      <p className="text-xs text-orange-500">
                                        Diajukan pada: {formatDate(item.cancelRequestedAt)}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Cancelled info */}
                                {item.status === 'cancelled' && (
                                  <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200/60 rounded-lg p-3 space-y-2">
                                    {item.cancelReason && (
                                      <p className="text-sm text-gray-600">
                                        Alasan pembatalan: {item.cancelReason}
                                      </p>
                                    )}
                                    {item.cancelApprovedBy && (
                                      <p className="text-xs text-gray-500">
                                        Disetujui oleh: {item.cancelApprovedBy}
                                      </p>
                                    )}
                                    {item.cancelApprovedAt && (
                                      <p className="text-xs text-gray-500">
                                        Tanggal persetujuan: {formatDate(item.cancelApprovedAt)}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Payment Status & Action for expanded row */}
                                {(item.paymentStatus === 'unpaid' || item.paymentStatus === 'pending' || item.paymentStatus === 'failed') && item.totalBiaya && (item.status === 'approved' || item.status === 'completed') && (
                                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200/60 bg-emerald-50/30 p-3">
                                    <PaymentStatusBadge status={item.paymentStatus || 'unpaid'} />
                                    <span className="text-sm font-medium text-emerald-800">
                                      {item.totalBiaya ? `Rp ${parseInt(item.totalBiaya).toLocaleString('id-ID')}` : ''}
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setPaymentBorrowingId(item.id)
                                        setPaymentDialogOpen(true)
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs btn-modern ml-auto"
                                    >
                                      <CreditCard className="size-3.5 mr-1" />
                                      {item.paymentStatus === 'pending' ? 'Lihat Pembayaran' : 'Bayar Sekarang'}
                                    </Button>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {(item.status === 'approved' || item.status === 'completed') && item.nomorPerjanjian && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewAgreement(item.id)}
                                        className="btn-modern border-emerald-200/60 text-emerald-700 hover:bg-emerald-50/80 hover:text-emerald-800 h-8 text-xs glass-emerald"
                                      >
                                        <Eye className="size-3.5 mr-1" />
                                        {item.userAcceptedAt ? 'Lihat Perjanjian' : 'Lihat & Setujui Perjanjian'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewReceipt(item.id)}
                                        className="btn-modern border-emerald-200/60 text-emerald-700 hover:bg-emerald-50/80 hover:text-emerald-800 h-8 text-xs glass-emerald"
                                      >
                                        <Printer className="size-3.5 mr-1" />
                                        Kwitansi
                                      </Button>
                                    </>
                                  )}
                                  {(item.status === 'pending' || item.status === 'approved') && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenCancelDialog(item.id)}
                                      className="btn-modern border-red-200/60 text-red-600 hover:bg-red-50/80 hover:text-red-700 h-8 text-xs"
                                    >
                                      <XCircle className="size-3.5 mr-1" />
                                      Batalkan
                                    </Button>
                                  )}
                                  {item.status === 'completed' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setTestimonialBorrowingId(item.id)
                                        setTestimonialFormOpen(true)
                                      }}
                                      className="btn-modern border-amber-200/60 text-amber-700 hover:bg-amber-50/80 hover:text-amber-800 h-8 text-xs"
                                    >
                                      <Star className="size-3.5 mr-1" />
                                      Beri Testimoni
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    )
  }

  const ActionDropdown = ({ item }: { item: Borrowing }) => {
    const hasActions =
      (item.status === 'approved' || item.status === 'completed') && item.nomorPerjanjian ||
      item.status === 'pending' || item.status === 'approved' ||
      item.status === 'completed' ||
      ((item.paymentStatus === 'unpaid' || item.paymentStatus === 'pending' || item.paymentStatus === 'failed') && item.totalBiaya && (item.status === 'approved' || item.status === 'completed'))

    if (!hasActions) return <span className="text-muted-foreground text-xs">-</span>

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="size-7 p-0 hover:bg-emerald-100/60 rounded-lg">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 glass rounded-xl border-emerald-200/40 shadow-lg">
          {(item.paymentStatus === 'unpaid' || item.paymentStatus === 'pending' || item.paymentStatus === 'failed') && item.totalBiaya && (item.status === 'approved' || item.status === 'completed') && (
            <DropdownMenuItem
              onClick={() => {
                setPaymentBorrowingId(item.id)
                setPaymentDialogOpen(true)
              }}
              className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50/60 rounded-lg"
            >
              <CreditCard className="size-4 mr-2" />
              {item.paymentStatus === 'unpaid' || item.paymentStatus === 'failed' ? 'Bayar' : 'Lihat Pembayaran'}
            </DropdownMenuItem>
          )}
          {(item.status === 'approved' || item.status === 'completed') && item.nomorPerjanjian && (
            <>
              <DropdownMenuItem onClick={() => handleViewAgreement(item.id)} className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50/60 rounded-lg">
                <Eye className="size-4 mr-2" />
                {item.userAcceptedAt ? 'Lihat Perjanjian' : 'Lihat & Setujui Perjanjian'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewReceipt(item.id)} className="text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50/60 rounded-lg">
                <Printer className="size-4 mr-2" />
                Cetak Kwitansi
              </DropdownMenuItem>
            </>
          )}
          {(item.status === 'pending' || item.status === 'approved') && (
            <DropdownMenuItem onClick={() => handleOpenCancelDialog(item.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50/60 rounded-lg">
              <XCircle className="size-4 mr-2" />
              Batalkan
            </DropdownMenuItem>
          )}
          {item.status === 'completed' && (
            <DropdownMenuItem
              onClick={() => {
                setTestimonialBorrowingId(item.id)
                setTestimonialFormOpen(true)
              }}
              className="text-amber-700 focus:text-amber-800 focus:bg-amber-50/60 rounded-lg"
            >
              <Star className="size-4 mr-2" />
              Beri Testimoni
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white dot-pattern flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4">Silakan login untuk melihat pengajuan Anda</p>
          <Button
            onClick={() => setLoginDialogOpen(true)}
            className="btn-modern bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Login
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white dot-pattern">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => setCurrentView('home')}
            className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/60"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold gradient-text">Pengajuan Saya</h1>
          <p className="text-sm text-muted-foreground mt-1">Riwayat pengajuan peminjaman Anda</p>
        </motion.div>

        {/* Statistics Dashboard */}
        {!loading && borrowings.length > 0 && (
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-x-visible sm:pb-0">
            {STAT_CARDS.map((card, i) => (
              <StatCard key={card.key} card={card} index={i} />
            ))}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-emerald-200/40 overflow-hidden glass shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50/60">
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead className="min-w-[180px]">Kegiatan</TableHead>
                    <TableHead className="min-w-[140px]">Tanggal Pinjam</TableHead>
                    <TableHead className="min-w-[140px]">Tanggal Kembali</TableHead>
                    <TableHead className="min-w-[130px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">No. Perjanjian</TableHead>
                    <TableHead className="w-[60px]">Detail</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><div className="skeleton-modern h-4 w-6 mx-auto" /></TableCell>
                      <TableCell><div className="skeleton-modern h-4 w-32" /></TableCell>
                      <TableCell><div className="skeleton-modern h-4 w-24" /></TableCell>
                      <TableCell><div className="skeleton-modern h-4 w-24" /></TableCell>
                      <TableCell><div className="skeleton-modern h-5 w-20" /></TableCell>
                      <TableCell><div className="skeleton-modern h-4 w-16" /></TableCell>
                      <TableCell><div className="skeleton-modern h-4 w-6 mx-auto" /></TableCell>
                      <TableCell><div className="skeleton-modern h-4 w-6 mx-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : borrowings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-emerald-200/40 glass p-12"
          >
            <EmptyState type="" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Search/Filter Input */}
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari kegiatan, tujuan, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-xl border border-emerald-200/50 glass text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-300/60 transition-all"
                />
              </div>
            </div>

            {/* Modern Tab Switcher with Animated Pill */}
            <div className="mb-4">
              <div className="relative inline-flex items-center glass rounded-xl border border-emerald-200/40 p-1 gap-1">
                {/* Animated pill background */}
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-200/50"
                  style={{
                    left: activeTab === 'aula' ? '4px' : undefined,
                    width: 'calc(50% - 4px)',
                  }}
                  animate={{
                    x: activeTab === 'aula' ? 0 : '100%',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                <button
                  onClick={() => setActiveTab('aula')}
                  className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'aula' ? 'text-white' : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                >
                  <Building2 className="size-4" />
                  Aula
                  <span className={`inline-flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${
                    activeTab === 'aula' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {aulaBorrowings.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('kendaraan')}
                  className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'kendaraan' ? 'text-white' : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                >
                  <Car className="size-4" />
                  Kendaraan
                  <span className={`inline-flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${
                    activeTab === 'kendaraan' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {kendaraanBorrowings.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'aula' ? (
                <motion.div
                  key="aula"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <BorrowingTable items={aulaBorrowings} typeLabel="aula" />
                </motion.div>
              ) : (
                <motion.div
                  key="kendaraan"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <BorrowingTable items={kendaraanBorrowings} typeLabel="kendaraan" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        <TestimonialForm
          borrowingId={testimonialBorrowingId}
          open={testimonialFormOpen}
          onOpenChange={setTestimonialFormOpen}
        />

        {/* Receipt Dialog */}
        <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto glass border-emerald-200/40 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                  <Printer className="size-4" />
                </div>
                Cetak Kwitansi
              </DialogTitle>
              <DialogDescription>
                Kwitansi pembayaran peminjaman
              </DialogDescription>
            </DialogHeader>
            {receiptBorrowingId && (
              <ReceiptViewer borrowingId={receiptBorrowingId} />
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="sm:max-w-md glass border-red-200/40 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-700">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-sm">
                  <XCircle className="size-4" />
                </div>
                Ajukan Pembatalan
              </DialogTitle>
              <DialogDescription>
                {cancelBorrowingItem
                  ? `Batalkan pengajuan "${cancelBorrowingItem.kegiatan}"`
                  : 'Ajukan pembatalan pengajuan'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Alasan Pembatalan <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Masukkan alasan pembatalan..."
                  rows={3}
                  className="resize-none glass border-emerald-200/40 focus:ring-red-200/50"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={cancelLoading}
                  className="glass"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSubmitCancel}
                  disabled={!cancelReason.trim() || cancelLoading}
                  className="btn-modern"
                >
                  {cancelLoading ? 'Memproses...' : 'Ajukan Pembatalan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
