'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import ReceiptViewer from '@/components/ReceiptViewer'
import AgreementViewer from '@/components/AgreementViewer'
import DocumentPreview from '@/components/DocumentPreview'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Clock,
  CheckCheck,
  Ban,
  Building2,
  Car,
  Loader2,
  ShieldCheck,
  MessageSquare,
  FileCheck,
  Eye,
  Settings,
  Bell,
  Printer,
  Users,
  FilePlus,
  Search,
  Inbox,
  Sparkles,
  CreditCard,
  FileText,
  ChevronDown,
  Warehouse,
  Bus,
} from 'lucide-react'

interface BorrowingItem {
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
  jumlahPenumpang?: number
  sopir?: string
  catatanAdmin?: string
  nomorPerjanjian?: string
  userAcceptedAt?: string
  cancelReason?: string
  cancelRequestedAt?: string
  cancelRequestedBy?: string
  cancelApprovedBy?: string
  cancelApprovedAt?: string
  user: { id: string; name: string; email: string; instansi?: string }
  kendaraan?: { nama: string; platNomor: string }
  createdAt: string
  paymentStatus?: string
  paymentMethod?: string
  paymentVaNumber?: string
  paymentQrisUrl?: string
  paymentAmount?: string
  paidAt?: string
  paymentProof?: string
  paymentNotes?: string
  totalBiaya?: string
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-yellow-100/80 text-yellow-800 border-yellow-300 backdrop-blur-sm' },
  approved: { label: 'Disetujui', className: 'bg-emerald-100/80 text-emerald-800 border-emerald-300 backdrop-blur-sm' },
  rejected: { label: 'Ditolak', className: 'bg-red-100/80 text-red-800 border-red-300 backdrop-blur-sm' },
  completed: { label: 'Selesai', className: 'bg-teal-100/80 text-teal-800 border-teal-300 backdrop-blur-sm' },
  cancelled: { label: 'Dibatalkan', className: 'bg-gray-100/80 text-gray-600 border-gray-300 backdrop-blur-sm' },
  cancel_requested: { label: 'Pembatalan Diajukan', className: 'bg-orange-100/80 text-orange-800 border-orange-300 backdrop-blur-sm' },
}

const PAYMENT_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  unpaid: { label: 'Belum Bayar', className: 'bg-gray-100/80 text-gray-700 border-gray-300 backdrop-blur-sm' },
  pending: { label: 'Menunggu', className: 'bg-amber-100/80 text-amber-800 border-amber-300 backdrop-blur-sm' },
  paid: { label: 'Dibayar', className: 'bg-emerald-100/80 text-emerald-800 border-emerald-300 backdrop-blur-sm' },
  failed: { label: 'Gagal', className: 'bg-red-100/80 text-red-800 border-red-300 backdrop-blur-sm' },
  refunded: { label: 'Dikembalikan', className: 'bg-purple-100/80 text-purple-800 border-purple-300 backdrop-blur-sm' },
}

const STATUS_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'completed', label: 'Selesai' },
  { key: 'rejected', label: 'Ditolak' },
  { key: 'cancelled', label: 'Dibatalkan' },
  { key: 'cancel_requested', label: 'Pembatalan' },
]

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

/* ── Counter animation hook ── */
function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef(0)

  useEffect(() => {
    startRef.current = 0
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}

/* ── Stat card with animated counter ── */
function StatCard({
  value,
  label,
  icon: Icon,
  gradientFrom,
  gradientTo,
  textColor,
  borderColor,
}: {
  value: number
  label: string
  icon: React.ElementType
  gradientFrom: string
  gradientTo: string
  textColor: string
  borderColor: string
}) {
  const animated = useAnimatedCounter(value)
  return (
    <Card className={`card-hover card-shine glass border-${borderColor} overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg animate-pulse-glow`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${textColor}`}>{animated}</p>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Skeleton rows for loading state ── */
function SkeletonRows() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton-modern h-4 w-28" />
          <div className="skeleton-modern h-4 w-36" />
          <div className="skeleton-modern h-6 w-16 rounded-full" />
          <div className="skeleton-modern h-4 w-24" />
          <div className="skeleton-modern h-6 w-20 rounded-full" />
          <div className="skeleton-modern h-8 w-24 rounded-md ml-auto" />
        </div>
      ))}
    </div>
  )
}

/* ── Empty state with animated illustration ── */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-6"
      >
        <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
          <Inbox className="size-10 text-emerald-400" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-200"
        >
          <Sparkles className="size-3 text-emerald-600" />
        </motion.div>
      </motion.div>
      <p className="text-lg font-semibold text-emerald-800">
        {hasFilters ? 'Tidak ada hasil' : 'Belum ada peminjaman'}
      </p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        {hasFilters
          ? 'Coba ubah filter untuk menampilkan data yang berbeda'
          : 'Data akan muncul ketika ada pengajuan baru'}
      </p>
    </motion.div>
  )
}

/* ── Tooltip wrapper (CSS-only) ── */
function TooltipButton({
  children,
  label,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <span className="group/btn relative inline-flex">
      <Button {...props}>{children}</Button>
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/btn:opacity-100 z-50">
        {label}
      </span>
    </span>
  )
}

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user, setCurrentView } = useAppStore()
  const [borrowings, setBorrowings] = useState<BorrowingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete' | 'cancel' | 'reject_cancel'>('approve')
  const [selectedBorrowing, setSelectedBorrowing] = useState<BorrowingItem | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [receiptBorrowingId, setReceiptBorrowingId] = useState<string | null>(null)

  // Agreement dialog state
  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false)
  const [agreementBorrowingId, setAgreementBorrowingId] = useState<string | null>(null)

  // Agreement generation state
  const [generatingAgreementId, setGeneratingAgreementId] = useState<string | null>(null)

  // Generate document dialog state
  const [generateDocDialogOpen, setGenerateDocDialogOpen] = useState(false)
  const [generateDocBorrowingId, setGenerateDocBorrowingId] = useState<string | null>(null)
  const [generateDocTemplates, setGenerateDocTemplates] = useState<{ id: string; name: string; type: string }[]>([])
  const [generateDocSelectedTemplate, setGenerateDocSelectedTemplate] = useState<string>('')
  const [generateDocHtml, setGenerateDocHtml] = useState('')
  const [generateDocTitle, setGenerateDocTitle] = useState('')
  const [generateDocLoading, setGenerateDocLoading] = useState(false)
  const [generateDocPreviewOpen, setGenerateDocPreviewOpen] = useState(false)

  // Payment confirmation dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentBorrowing, setPaymentBorrowing] = useState<BorrowingItem | null>(null)
  const [paymentAction, setPaymentAction] = useState<'confirm' | 'reject' | 'mark_paid'>('confirm')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) return
    const fetchBorrowings = async () => {
      try {
        const res = await fetch('/api/borrowing/list?userId=all')
        if (res.ok) {
          const data = await res.json()
          setBorrowings(data.borrowings || data)
        }
      } catch {
        toast.error('Gagal memuat data peminjaman')
      } finally {
        setLoading(false)
      }
    }
    fetchBorrowings()
  }, [isAdmin])

  const filteredBorrowings = borrowings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (typeFilter !== 'all' && b.type !== typeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesName = b.user?.name?.toLowerCase().includes(q)
      const matchesEmail = b.user?.email?.toLowerCase().includes(q)
      const matchesKegiatan = b.kegiatan?.toLowerCase().includes(q)
      const matchesInstansi = b.user?.instansi?.toLowerCase().includes(q)
      if (!matchesName && !matchesEmail && !matchesKegiatan && !matchesInstansi) return false
    }
    return true
  })

  const stats = {
    total: borrowings.length,
    pending: borrowings.filter((b) => b.status === 'pending').length,
    approved: borrowings.filter((b) => b.status === 'approved').length,
    completed: borrowings.filter((b) => b.status === 'completed').length,
    rejected: borrowings.filter((b) => b.status === 'rejected').length,
    cancelRequested: borrowings.filter((b) => b.status === 'cancel_requested').length,
  }

  const handleAction = (borrowing: BorrowingItem, type: 'approve' | 'reject' | 'complete' | 'cancel' | 'reject_cancel') => {
    setSelectedBorrowing(borrowing)
    setActionType(type)
    setAdminNotes(borrowing.catatanAdmin || '')
    setActionDialogOpen(true)
  }

  const submitAction = async () => {
    if (!selectedBorrowing) return
    setActionLoading(true)
    try {
      const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
        complete: 'completed',
        cancel: 'cancelled',
        reject_cancel: 'approved',
      }
      const newStatus = statusMap[actionType] || 'approved'
      const res = await fetch('/api/admin/borrowings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBorrowing.id,
          status: newStatus,
          catatanAdmin: adminNotes,
          approvedBy: user?.name || 'Admin',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal memperbarui status')
        return
      }

      // If approved, generate agreement automatically
      if (actionType === 'approve') {
        try {
          const agreementRes = await fetch('/api/agreement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ borrowingId: selectedBorrowing.id }),
          })
          const agreementData = await agreementRes.json()
          if (agreementRes.ok) {
            toast.success('Persetujuan berhasil & perjanjian telah dibuat')
          } else {
            toast.warning('Persetujuan berhasil, tetapi gagal membuat perjanjian')
          }
        } catch {
          toast.warning('Persetujuan berhasil, tetapi gagal membuat perjanjian')
        }
      } else if (actionType === 'complete') {
        toast.success('Peminjaman telah ditandai selesai. Notifikasi testimoni akan dikirim ke peminjam.')
      } else if (actionType === 'cancel') {
        toast.success('Pembatalan telah disetujui. Peminjaman dibatalkan.')
      } else if (actionType === 'reject_cancel') {
        toast.success('Permintaan pembatalan ditolak. Peminjaman tetap disetujui.')
      } else {
        toast.success('Peminjaman berhasil ditolak')
      }

      // Update local state
      setBorrowings((prev) =>
        prev.map((b) =>
          b.id === selectedBorrowing.id
            ? {
                ...b,
                status: newStatus,
                catatanAdmin: adminNotes,
                nomorPerjanjian: actionType === 'approve' ? 'generating...' : b.nomorPerjanjian,
              }
            : b
        )
      )

      // Refresh data to get updated agreement info
      const refreshRes = await fetch('/api/borrowing/list?userId=all')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setBorrowings(refreshData.borrowings || refreshData)
      }

      setActionDialogOpen(false)
      setAdminNotes('')
      setSelectedBorrowing(null)
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setActionLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white flex items-center justify-center dot-pattern">
        <div className="text-center">
          <ShieldCheck className="size-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Akses Terbatas</p>
          <p className="text-sm text-muted-foreground mt-1">Halaman ini hanya untuk administrator</p>
          <Button
            onClick={() => setCurrentView('home')}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white btn-modern"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Beranda
          </Button>
        </div>
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
            className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 btn-modern"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <ShieldCheck className="size-6" />
              Dashboard Admin
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setCurrentView('admin-aula')}
                className="border-teal-200 text-teal-700 hover:bg-teal-50 btn-modern"
              >
                <Warehouse className="size-4" />
                <span className="hidden sm:inline ml-1">Kelola Aula</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('admin-kendaraan')}
                className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 btn-modern"
              >
                <Bus className="size-4" />
                <span className="hidden sm:inline ml-1">Kelola Kendaraan</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('admin-notifications')}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 btn-modern"
              >
                <Bell className="size-4" />
                <span className="hidden sm:inline ml-1">Notifikasi</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('admin-users')}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 btn-modern"
              >
                <Users className="size-4" />
                <span className="hidden sm:inline ml-1">Pengguna</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('admin-settings')}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 btn-modern"
              >
                <Settings className="size-4" />
                <span className="hidden sm:inline ml-1">Pengaturan</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Kelola peminjaman aula dan kendaraan</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <StatCard
              value={stats.total}
              label="Total"
              icon={ClipboardList}
              gradientFrom="from-emerald-500"
              gradientTo="to-emerald-600"
              textColor="text-emerald-800"
              borderColor="emerald-200"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <StatCard
              value={stats.pending}
              label="Menunggu"
              icon={Clock}
              gradientFrom="from-amber-400"
              gradientTo="to-yellow-500"
              textColor="text-yellow-800"
              borderColor="yellow-200"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <StatCard
              value={stats.approved}
              label="Disetujui"
              icon={CheckCheck}
              gradientFrom="from-teal-500"
              gradientTo="to-teal-600"
              textColor="text-teal-800"
              borderColor="teal-200"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}>
            <StatCard
              value={stats.completed}
              label="Selesai"
              icon={CheckCircle2}
              gradientFrom="from-cyan-500"
              gradientTo="to-cyan-600"
              textColor="text-teal-800"
              borderColor="teal-200"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <StatCard
              value={stats.rejected}
              label="Ditolak"
              icon={Ban}
              gradientFrom="from-red-400"
              gradientTo="to-red-500"
              textColor="text-red-800"
              borderColor="red-200"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <StatCard
              value={stats.cancelRequested}
              label="Minta Batal"
              icon={XCircle}
              gradientFrom="from-orange-400"
              gradientTo="to-orange-500"
              textColor="text-orange-800"
              borderColor="orange-200"
            />
          </motion.div>
        </div>

        {/* Filters - Modern pill tabs + search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-emerald-200/60 shadow-md mb-4 overflow-hidden">
            <CardContent className="p-4 space-y-4">
              {/* Status pill tabs */}
              <div className="flex flex-wrap gap-1.5">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
                      statusFilter === tab.key
                        ? 'text-white'
                        : 'text-emerald-700 hover:bg-emerald-100/60'
                    }`}
                  >
                    {statusFilter === tab.key && (
                      <motion.span
                        layoutId="statusPill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Search + Type filter row */}
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-400" />
                  <Input
                    placeholder="Cari peminjam, kegiatan, instansi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 glass border-emerald-200/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 shadow-sm"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-44 glass border-emerald-200/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 shadow-sm">
                    <SelectValue placeholder="Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    <SelectItem value="aula">Aula</SelectItem>
                    <SelectItem value="kendaraan">Kendaraan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="glass border-emerald-200/60 shadow-md overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <SkeletonRows />
              ) : filteredBorrowings.length === 0 ? (
                <EmptyState hasFilters={statusFilter !== 'all' || typeFilter !== 'all' || !!searchQuery} />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 hover:from-emerald-50/80 hover:to-teal-50/80 border-b border-emerald-100">
                        <TableHead className="font-semibold text-emerald-800">Peminjam</TableHead>
                        <TableHead className="font-semibold text-emerald-800">Kegiatan</TableHead>
                        <TableHead className="font-semibold text-emerald-800">Tipe</TableHead>
                        <TableHead className="font-semibold text-emerald-800">Tanggal</TableHead>
                        <TableHead className="font-semibold text-emerald-800">Status</TableHead>
                        <TableHead className="font-semibold text-emerald-800">Pembayaran</TableHead>
                        <TableHead className="font-semibold text-emerald-800">Perjanjian</TableHead>
                        <TableHead className="text-right font-semibold text-emerald-800">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredBorrowings.map((item, idx) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, delay: idx * 0.03 }}
                            className={`group/row border-b border-emerald-50 transition-colors duration-200 hover:bg-emerald-50/50 ${
                              idx % 2 === 1 ? 'bg-emerald-50/20' : ''
                            }`}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{item.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{item.user?.email || '-'}</p>
                                {item.user?.instansi && (
                                  <p className="text-xs text-muted-foreground">{item.user.instansi}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm max-w-[180px] truncate">{item.kegiatan}</p>
                                {item.type === 'aula' && item.waktuPenggunaan && (
                                  <p className="text-xs text-muted-foreground">
                                    {item.waktuPenggunaan === 'siang' ? 'Siang' : 'Malam'}
                                  </p>
                                )}
                                {item.type === 'kendaraan' && item.tujuan && (
                                  <p className="text-xs text-muted-foreground">
                                    Tujuan: {item.tujuan}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`glass ${
                                  item.type === 'aula'
                                    ? 'bg-emerald-50/70 text-emerald-700 border-emerald-200'
                                    : 'bg-teal-50/70 text-teal-700 border-teal-200'
                                }`}
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
                              <div>
                                <Badge
                                  variant="outline"
                                  className={`glass ${STATUS_BADGE[item.status]?.className || STATUS_BADGE.pending.className} ${
                                    item.status === 'pending' ? 'animate-pulse-glow' : ''
                                  }`}
                                >
                                  {STATUS_BADGE[item.status]?.label || item.status}
                                </Badge>
                                {item.status === 'cancel_requested' && item.cancelReason && (
                                  <p className="text-[10px] text-orange-700 mt-1 max-w-[140px] truncate" title={item.cancelReason}>
                                    {item.cancelReason}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant="outline"
                                  className={`glass ${PAYMENT_STATUS_BADGE[item.paymentStatus || 'unpaid']?.className || PAYMENT_STATUS_BADGE.unpaid.className} ${
                                    item.paymentStatus === 'pending' ? 'animate-pulse-glow' : ''
                                  }`}
                                >
                                  {PAYMENT_STATUS_BADGE[item.paymentStatus || 'unpaid']?.label || 'Belum Bayar'}
                                </Badge>
                                {item.paymentStatus === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-fit"
                                    onClick={() => {
                                      setPaymentBorrowing(item)
                                      setPaymentAction('confirm')
                                      setPaymentNotes('')
                                      setPaymentDialogOpen(true)
                                    }}
                                  >
                                    <CreditCard className="size-3 mr-1" />
                                    Konfirmasi
                                  </Button>
                                )}
                                {item.paymentStatus === 'unpaid' && item.totalBiaya && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-fit"
                                    onClick={() => {
                                      setPaymentBorrowing(item)
                                      setPaymentAction('mark_paid')
                                      setPaymentNotes('')
                                      setPaymentDialogOpen(true)
                                    }}
                                  >
                                    <CheckCheck className="size-3 mr-1" />
                                    Tandai Lunas
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.nomorPerjanjian ? (
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className="glass bg-emerald-50/70 text-emerald-700 border-emerald-200 text-[10px]">
                                    <FileCheck className="size-3" />
                                    {item.nomorPerjanjian}
                                  </Badge>
                                  {item.userAcceptedAt ? (
                                    <span className="text-[10px] text-emerald-600">✓ Disetujui user</span>
                                  ) : (
                                    <span className="text-[10px] text-amber-600">Menunggu user</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {item.status === 'pending' ? (
                                  <>
                                    <TooltipButton
                                      variant="ghost"
                                      size="sm"
                                      label="Setujui"
                                      onClick={() => handleAction(item, 'approve')}
                                      className="btn-modern text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                    >
                                      <CheckCircle2 className="size-4" />
                                      <span className="hidden sm:inline ml-1">Setujui</span>
                                    </TooltipButton>
                                    <TooltipButton
                                      variant="ghost"
                                      size="sm"
                                      label="Tolak"
                                      onClick={() => handleAction(item, 'reject')}
                                      className="btn-modern text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                    >
                                      <XCircle className="size-4" />
                                      <span className="hidden sm:inline ml-1">Tolak</span>
                                    </TooltipButton>
                                  </>
                                ) : item.status === 'cancel_requested' ? (
                                  <>
                                    <TooltipButton
                                      variant="ghost"
                                      size="sm"
                                      label="Setujui Pembatalan"
                                      onClick={() => handleAction(item, 'cancel')}
                                      className="btn-modern text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-2"
                                    >
                                      <XCircle className="size-4" />
                                      <span className="hidden sm:inline ml-1">Setujui Pembatalan</span>
                                    </TooltipButton>
                                    <TooltipButton
                                      variant="ghost"
                                      size="sm"
                                      label="Tolak Pembatalan"
                                      onClick={() => handleAction(item, 'reject_cancel')}
                                      className="btn-modern text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                    >
                                      <CheckCircle2 className="size-4" />
                                      <span className="hidden sm:inline ml-1">Tolak Pembatalan</span>
                                    </TooltipButton>
                                  </>
                                ) : item.status === 'approved' ? (
                                  <>
                                    <TooltipButton
                                      variant="ghost"
                                      size="sm"
                                      label="Tandai Selesai"
                                      onClick={() => handleAction(item, 'complete')}
                                      className="btn-modern text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8 px-2"
                                    >
                                      <CheckCheck className="size-4" />
                                      <span className="hidden sm:inline ml-1">Selesai</span>
                                    </TooltipButton>
                                    <TooltipButton
                                      variant="ghost"
                                      size="sm"
                                      label="Catatan Admin"
                                      onClick={() => {
                                        setSelectedBorrowing(item)
                                        setAdminNotes(item.catatanAdmin || '')
                                        setActionType('approve')
                                        setActionDialogOpen(true)
                                      }}
                                      className="btn-modern text-muted-foreground hover:text-emerald-700 h-8 px-2"
                                    >
                                      <MessageSquare className="size-4" />
                                    </TooltipButton>
                                  </>
                                ) : (
                                  <TooltipButton
                                    variant="ghost"
                                    size="sm"
                                    label="Catatan Admin"
                                    onClick={() => {
                                      setSelectedBorrowing(item)
                                      setAdminNotes(item.catatanAdmin || '')
                                      setActionType(item.status === 'completed' ? 'complete' : 'reject')
                                      setActionDialogOpen(true)
                                    }}
                                    className="btn-modern text-muted-foreground hover:text-emerald-700 h-8 px-2"
                                  >
                                    <MessageSquare className="size-4" />
                                    <span className="hidden sm:inline ml-1">Catatan</span>
                                  </TooltipButton>
                                )}
                                {(item.status === 'approved' || item.status === 'completed') && !item.nomorPerjanjian && (
                                  <TooltipButton
                                    variant="ghost"
                                    size="sm"
                                    label="Buat Perjanjian"
                                    onClick={async () => {
                                      setGeneratingAgreementId(item.id)
                                      try {
                                        const agreementRes = await fetch('/api/agreement', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ borrowingId: item.id }),
                                        })
                                        const agreementData = await agreementRes.json()
                                        if (agreementRes.ok) {
                                          toast.success('Perjanjian berhasil dibuat!')
                                          // Update local state
                                          setBorrowings((prev) =>
                                            prev.map((b) =>
                                              b.id === item.id
                                                ? { ...b, nomorPerjanjian: agreementData.agreement?.nomorPerjanjian || 'generated' }
                                                : b
                                            )
                                          )
                                          // Refresh data
                                          const refreshRes = await fetch('/api/borrowing/list?userId=all')
                                          if (refreshRes.ok) {
                                            const refreshData = await refreshRes.json()
                                            setBorrowings(refreshData.borrowings || refreshData)
                                          }
                                        } else {
                                          toast.error(agreementData.error || 'Gagal membuat perjanjian')
                                        }
                                      } catch {
                                        toast.error('Terjadi kesalahan saat membuat perjanjian')
                                      } finally {
                                        setGeneratingAgreementId(null)
                                      }
                                    }}
                                    disabled={generatingAgreementId === item.id}
                                    className="btn-modern text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 px-2"
                                  >
                                    {generatingAgreementId === item.id ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <FilePlus className="size-4" />
                                    )}
                                    <span className="hidden sm:inline ml-1">Buat Perjanjian</span>
                                  </TooltipButton>
                                )}
                                {(item.status === 'approved' || item.status === 'completed') && item.nomorPerjanjian && (
                                  <TooltipButton
                                    variant="ghost"
                                    size="sm"
                                    label="Lihat Perjanjian"
                                    onClick={() => {
                                      setAgreementBorrowingId(item.id)
                                      setAgreementDialogOpen(true)
                                    }}
                                    className="btn-modern text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                  >
                                    <FileCheck className="size-4" />
                                    <span className="hidden sm:inline ml-1">Perjanjian</span>
                                  </TooltipButton>
                                )}
                                {(item.status === 'approved' || item.status === 'completed') && (
                                  <TooltipButton
                                    variant="ghost"
                                    size="sm"
                                    label="Cetak Kwitansi"
                                    onClick={() => {
                                      setReceiptBorrowingId(item.id)
                                      setReceiptDialogOpen(true)
                                    }}
                                    className="btn-modern text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                  >
                                    <Printer className="size-4" />
                                    <span className="hidden sm:inline ml-1">Kwitansi</span>
                                  </TooltipButton>
                                )}
                                {(item.status === 'approved' || item.status === 'completed') && (
                                  <TooltipButton
                                    variant="ghost"
                                    size="sm"
                                    label="Generate Dokumen"
                                    onClick={async () => {
                                      setGenerateDocBorrowingId(item.id)
                                      try {
                                        const res = await fetch('/api/templates?active=true')
                                        if (res.ok) {
                                          const data = await res.json()
                                          setGenerateDocTemplates(data.templates || [])
                                          if (data.templates?.length > 0) {
                                            setGenerateDocSelectedTemplate(data.templates[0].id)
                                          }
                                        }
                                      } catch {
                                        toast.error('Gagal memuat template')
                                      }
                                      setGenerateDocDialogOpen(true)
                                    }}
                                    className="btn-modern text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8 px-2"
                                  >
                                    <FileText className="size-4" />
                                    <span className="hidden sm:inline ml-1">Dokumen</span>
                                  </TooltipButton>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Agreement Dialog */}
        <Dialog open={agreementDialogOpen} onOpenChange={setAgreementDialogOpen}>
          <DialogContent className="glass sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <FileCheck className="size-5 text-emerald-600" />
                Surat Perjanjian
              </DialogTitle>
              <DialogDescription>
                Perjanjian resmi peminjaman
              </DialogDescription>
            </DialogHeader>
            {agreementBorrowingId && (
              <AgreementViewer borrowingId={agreementBorrowingId} />
            )}
          </DialogContent>
        </Dialog>

        {/* Receipt Dialog */}
        <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
          <DialogContent className="glass sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <Printer className="size-5 text-emerald-600" />
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

        {/* Generate Document Dialog */}
        <Dialog open={generateDocDialogOpen} onOpenChange={setGenerateDocDialogOpen}>
          <DialogContent className="glass sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <FileText className="size-5 text-emerald-600" />
                Generate Dokumen
              </DialogTitle>
              <DialogDescription>
                Pilih template untuk membuat dokumen dari data peminjaman
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {generateDocTemplates.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="size-10 text-emerald-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Belum ada template tersedia</p>
                  <p className="text-xs text-muted-foreground mt-1">Buat template terlebih dahulu di menu Template Dokumen</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pilih Template</Label>
                    <Select value={generateDocSelectedTemplate} onValueChange={setGenerateDocSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {generateDocTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!generateDocSelectedTemplate || !generateDocBorrowingId) return
                      setGenerateDocLoading(true)
                      try {
                        const res = await fetch('/api/templates/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            templateId: generateDocSelectedTemplate,
                            borrowingId: generateDocBorrowingId,
                          }),
                        })
                        const data = await res.json()
                        if (res.ok) {
                          setGenerateDocHtml(data.html)
                          setGenerateDocTitle(data.templateName || 'Dokumen')
                          setGenerateDocDialogOpen(false)
                          setGenerateDocPreviewOpen(true)
                        } else {
                          toast.error(data.error || 'Gagal membuat dokumen')
                        }
                      } catch {
                        toast.error('Terjadi kesalahan saat membuat dokumen')
                      } finally {
                        setGenerateDocLoading(false)
                      }
                    }}
                    disabled={generateDocLoading || !generateDocSelectedTemplate}
                    className="w-full btn-modern bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                  >
                    {generateDocLoading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                    Generate Dokumen
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Preview Dialog */}
        <Dialog open={generateDocPreviewOpen} onOpenChange={setGenerateDocPreviewOpen}>
          <DialogContent className="glass max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-emerald-800 flex items-center gap-2">
                  <Eye className="size-5" />
                  Preview: {generateDocTitle}
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="p-6 pt-4">
              <DocumentPreview html={generateDocHtml} title={generateDocTitle} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Action / Notes Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent className="glass sm:max-w-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-700">
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle2 className="size-5 text-emerald-600" />
                      Setujui Peminjaman
                    </>
                  ) : actionType === 'complete' ? (
                    <>
                      <CheckCheck className="size-5 text-teal-600" />
                      Tandai Selesai
                    </>
                  ) : actionType === 'cancel' ? (
                    <>
                      <XCircle className="size-5 text-red-600" />
                      Setujui Pembatalan
                    </>
                  ) : actionType === 'reject_cancel' ? (
                    <>
                      <CheckCircle2 className="size-5 text-emerald-600" />
                      Tolak Pembatalan
                    </>
                  ) : (
                    <>
                      <XCircle className="size-5 text-red-600" />
                      Tolak Peminjaman
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedBorrowing && (
                    <>
                      <span className="font-medium">{selectedBorrowing.kegiatan}</span>
                      {' '}oleh {selectedBorrowing.user?.name || 'Unknown'}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              {selectedBorrowing && (
                <div className="space-y-3 rounded-xl border border-emerald-100 glass-emerald p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      selectedBorrowing.type === 'aula'
                        ? 'glass bg-emerald-50/70 text-emerald-700 border-emerald-200'
                        : 'glass bg-teal-50/70 text-teal-700 border-teal-200'
                    }>
                      {selectedBorrowing.type === 'aula' ? 'Aula' : 'Kendaraan'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatDate(selectedBorrowing.tanggalPinjam)} - {formatDate(selectedBorrowing.tanggalKembali)}
                    </span>
                  </div>
                  {selectedBorrowing.type === 'kendaraan' && selectedBorrowing.kendaraan && (
                    <p className="text-muted-foreground">
                      Kendaraan: {selectedBorrowing.kendaraan.nama} ({selectedBorrowing.kendaraan.platNomor})
                    </p>
                  )}
                  {actionType === 'approve' && (
                    <div className="flex items-start gap-2 rounded-lg glass bg-blue-50/60 border border-blue-200/60 p-3 text-xs text-blue-800">
                      <FileCheck className="size-4 shrink-0 mt-0.5" />
                      <span>Perjanjian resmi akan dibuat secara otomatis dan dikirim ke peminjam setelah persetujuan.</span>
                    </div>
                  )}
                  {actionType === 'complete' && (
                    <div className="flex items-start gap-2 rounded-lg glass bg-teal-50/60 border border-teal-200/60 p-3 text-xs text-teal-800">
                      <MessageSquare className="size-4 shrink-0 mt-0.5" />
                      <span>Peminjam akan menerima notifikasi WhatsApp/Email untuk meminta testimoni tentang layanan ini.</span>
                    </div>
                  )}
                  {selectedBorrowing?.cancelReason && (
                    <div className="rounded-lg glass bg-orange-50/60 border border-orange-200/60 p-3 text-xs text-orange-800">
                      <strong>Alasan Pembatalan:</strong> {selectedBorrowing.cancelReason}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Catatan Admin</Label>
                <Textarea
                  placeholder="Tambahkan catatan (opsional)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-20 glass border-emerald-200/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 shadow-sm"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setActionDialogOpen(false)}
                  className="border-emerald-200 btn-modern"
                >
                  Batal
                </Button>
                <Button
                  onClick={submitAction}
                  disabled={actionLoading}
                  className={`btn-modern ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : actionType === 'complete'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : actionType === 'cancel'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : actionType === 'reject_cancel'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Memproses...
                    </>
                  ) : actionType === 'approve' ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Setujui & Buat Perjanjian
                    </>
                  ) : actionType === 'complete' ? (
                    <>
                      <CheckCheck className="size-4" />
                      Tandai Selesai
                    </>
                  ) : actionType === 'cancel' ? (
                    <>
                      <XCircle className="size-4" />
                      Setujui Pembatalan
                    </>
                  ) : actionType === 'reject_cancel' ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Tolak Pembatalan
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4" />
                      Tolak
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Payment Confirmation Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="glass sm:max-w-lg max-h-[90vh] overflow-y-auto border-emerald-200/60">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <CreditCard className="size-5" />
                {paymentAction === 'mark_paid' ? 'Tandai Lunas' : 'Konfirmasi Pembayaran'}
              </DialogTitle>
              <DialogDescription>
                {paymentAction === 'mark_paid'
                  ? `Tandai pembayaran lunas untuk peminjaman ${paymentBorrowing?.kegiatan}`
                  : `Verifikasi pembayaran untuk peminjaman ${paymentBorrowing?.kegiatan}`}
              </DialogDescription>
            </DialogHeader>
            {paymentBorrowing && (
              <div className="space-y-4">
                {/* Payment Details */}
                <div className="glass rounded-xl border border-emerald-200/60 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Peminjam</p>
                      <p className="font-medium">{paymentBorrowing.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Jumlah</p>
                      <p className="font-bold text-emerald-700">
                        Rp {parseInt(paymentBorrowing.paymentAmount || paymentBorrowing.totalBiaya || '0').toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Metode</p>
                      <p className="font-medium capitalize">{paymentBorrowing.paymentMethod?.replace('va_', 'VA ').replace('_', ' ') || (paymentAction === 'mark_paid' ? 'Manual/Tunai' : '-')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="outline" className={PAYMENT_STATUS_BADGE[paymentBorrowing.paymentStatus || 'unpaid']?.className}>
                        {PAYMENT_STATUS_BADGE[paymentBorrowing.paymentStatus || 'unpaid']?.label}
                      </Badge>
                    </div>
                    {paymentBorrowing.paymentVaNumber && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">No. VA</p>
                        <p className="font-mono font-medium">{paymentBorrowing.paymentVaNumber}</p>
                      </div>
                    )}
                  </div>
                  {paymentBorrowing.paymentProof && (
                    <div className="border-t border-emerald-100 pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Bukti Transfer</p>
                      <a href={paymentBorrowing.paymentProof} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <img src={paymentBorrowing.paymentProof} alt="Bukti Transfer" className="max-h-48 rounded-lg border border-emerald-200 shadow-sm" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {paymentAction === 'mark_paid' ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                    <div className="flex items-center gap-2 text-sm text-emerald-800 font-medium mb-2">
                      <CheckCheck className="size-4" />
                      Tandai sebagai Lunas
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pembayaran akan ditandai lunas secara manual (misal: pembayaran tunai). Tindakan ini tidak memerlukan bukti transfer.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPaymentAction('confirm')}
                      className={`flex-1 ${paymentAction === 'confirm' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white border border-emerald-200 text-emerald-700'}`}
                    >
                      <CheckCircle2 className="size-4 mr-2" />
                      Konfirmasi
                    </Button>
                    <Button
                      onClick={() => setPaymentAction('reject')}
                      className={`flex-1 ${paymentAction === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border border-red-200 text-red-600'}`}
                    >
                      <XCircle className="size-4 mr-2" />
                      Tolak
                    </Button>
                  </div>
                )}

                <Textarea
                  placeholder="Catatan pembayaran (opsional)"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />

                <Button
                  onClick={async () => {
                    if (!paymentBorrowing) return
                    setPaymentLoading(true)
                    try {
                      const res = await fetch('/api/payment', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          borrowingId: paymentBorrowing.id,
                          action: paymentAction,
                          notes: paymentNotes || undefined,
                        }),
                      })
                      const data = await res.json()
                      if (res.ok) {
                        toast.success(data.message)
                        setPaymentDialogOpen(false)
                        setPaymentBorrowing(null)
                        setPaymentNotes('')
                        // Refresh data
                        const refreshRes = await fetch('/api/borrowing/list?userId=all')
                        if (refreshRes.ok) {
                          const refreshData = await refreshRes.json()
                          setBorrowings(refreshData.borrowings || refreshData)
                        }
                      } else {
                        toast.error(data.error || 'Gagal memproses pembayaran')
                      }
                    } catch {
                      toast.error('Terjadi kesalahan')
                    } finally {
                      setPaymentLoading(false)
                    }
                  }}
                  disabled={paymentLoading}
                  className={`w-full btn-modern ${paymentAction === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                >
                  {paymentLoading ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : paymentAction === 'mark_paid' ? (
                    <CheckCheck className="size-4 mr-2" />
                  ) : paymentAction === 'confirm' ? (
                    <CheckCircle2 className="size-4 mr-2" />
                  ) : (
                    <XCircle className="size-4 mr-2" />
                  )}
                  {paymentAction === 'mark_paid' ? 'Tandai Lunas' : paymentAction === 'confirm' ? 'Konfirmasi Pembayaran' : 'Tolak Pembayaran'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
