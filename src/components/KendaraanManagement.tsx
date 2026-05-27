'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/lib/store'
import { useIdentity } from '@/hooks/useIdentity'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Car,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Bus,
  Truck,
  Shield,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  Users,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────────────────────────── */

interface KendaraanItem {
  id: string
  nama: string
  jenis: string
  platNomor: string
  kapasitas: number
  status: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  bookedDates?: { id: string; from: string; to: string; status: string; kegiatan: string }[]
  isAvailable?: boolean
}

interface KendaraanFormState {
  nama: string
  jenis: string
  platNomor: string
  kapasitas: string
  status: string
  imageUrl: string
}

const EMPTY_FORM: KendaraanFormState = {
  nama: '',
  jenis: 'medium_bus',
  platNomor: '',
  kapasitas: '',
  status: 'tersedia',
  imageUrl: '',
}

/* ── Status badge map ── */
const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
  tersedia: {
    label: 'Tersedia',
    className: 'bg-emerald-100/80 text-emerald-800 border-emerald-300 backdrop-blur-sm',
  },
  digunakan: {
    label: 'Digunakan',
    className: 'bg-amber-100/80 text-amber-800 border-amber-300 backdrop-blur-sm',
  },
  perawatan: {
    label: 'Perawatan',
    className: 'bg-red-100/80 text-red-800 border-red-300 backdrop-blur-sm',
  },
}

/* ── Jenis badge map ── */
const JENIS_BADGE_MAP: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  medium_bus: {
    label: 'Bus Medium',
    icon: Bus,
    className: 'bg-teal-50/70 text-teal-700 border-teal-200',
  },
  mini_bus: {
    label: 'Mini Bus',
    icon: Truck,
    className: 'bg-cyan-50/70 text-cyan-700 border-cyan-200',
  },
}

/* ── Kendaraan Card Component ── */
function KendaraanCard({
  item,
  onEdit,
  onDelete,
  index,
}: {
  item: KendaraanItem
  onEdit: () => void
  onDelete: () => void
  index: number
}) {
  const statusInfo = STATUS_BADGE_MAP[item.status] || STATUS_BADGE_MAP.tersedia
  const jenisInfo = JENIS_BADGE_MAP[item.jenis] || JENIS_BADGE_MAP.medium_bus
  const JenisIcon = jenisInfo.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      layout
    >
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Card Image */}
        <div className="relative h-44 bg-gradient-to-br from-cyan-100 to-teal-100 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.nama}
              className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Car className="size-16 text-cyan-300/70" />
            </div>
          )}
          {/* Status badge overlay */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="outline"
              className={`glass text-xs font-semibold shadow-md ${statusInfo.className}`}
            >
              {statusInfo.label}
            </Badge>
          </div>
          {/* Jenis badge overlay */}
          <div className="absolute top-3 right-12">
            <Badge
              variant="outline"
              className={`glass text-xs font-semibold shadow-md ${jenisInfo.className}`}
            >
              <JenisIcon className="size-3 mr-1" />
              {jenisInfo.label}
            </Badge>
          </div>
          {/* Action buttons overlay */}
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="icon"
              className="size-8 bg-white/90 hover:bg-white text-cyan-600 hover:text-cyan-700 shadow-md backdrop-blur-sm"
              onClick={onEdit}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="size-8 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 shadow-md backdrop-blur-sm"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base truncate" title={item.nama}>
              {item.nama}
            </h3>

            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
              <span className="font-mono font-semibold tracking-wide text-foreground/80">
                {item.platNomor}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-3.5 shrink-0" />
                <span>{item.kapasitas} orang</span>
              </div>
            </div>

            {item.bookedDates && item.bookedDates.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                <Clock className="size-3 shrink-0" />
                <span>{item.bookedDates.length} peminjaman aktif</span>
              </div>
            )}
          </div>

          {/* Mobile action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t sm:hidden">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-cyan-600 border-cyan-200 hover:bg-cyan-50 text-xs"
              onClick={onEdit}
            >
              <Pencil className="size-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-500 border-red-200 hover:bg-red-50 text-xs"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5 mr-1" />
              Hapus
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ── Empty state ── */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
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
        <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100">
          <Car className="size-10 text-cyan-400" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-cyan-200"
        >
          <Sparkles className="size-3 text-cyan-600" />
        </motion.div>
      </motion.div>
      <p className="text-lg font-semibold text-cyan-800">
        {hasFilters ? 'Tidak ada hasil' : 'Belum ada kendaraan'}
      </p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        {hasFilters
          ? 'Coba ubah filter atau kata kunci pencarian'
          : 'Tambahkan kendaraan baru untuk mulai mengelola armada dinas'}
      </p>
    </motion.div>
  )
}

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */
export default function KendaraanManagement() {
  const user = useAppStore((s) => s.user)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const { identity } = useIdentity()
  const siteName = identity.site_name || 'E-Pakar'

  // Data state
  const [kendaraanList, setKendaraanList] = useState<KendaraanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [jenisFilter, setJenisFilter] = useState<string>('all')

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<KendaraanFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<KendaraanItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = user?.role === 'admin'

  /* ── Fetch data ── */
  const fetchKendaraan = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/kendaraan?showAll=true')
      if (res.ok) {
        const data = await res.json()
        setKendaraanList(data.kendaraan || [])
      } else {
        toast.error('Gagal memuat data kendaraan')
      }
    } catch {
      toast.error('Gagal memuat data kendaraan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchKendaraan()
    }
  }, [isAdmin, fetchKendaraan])

  /* ── Computed stats ── */
  const stats = {
    total: kendaraanList.length,
    tersedia: kendaraanList.filter((k) => k.status === 'tersedia').length,
    digunakan: kendaraanList.filter((k) => k.status === 'digunakan').length,
    perawatan: kendaraanList.filter((k) => k.status === 'perawatan').length,
  }

  /* ── Filtered list ── */
  const filteredList = kendaraanList.filter((k) => {
    if (statusFilter !== 'all' && k.status !== statusFilter) return false
    if (jenisFilter !== 'all' && k.jenis !== jenisFilter) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      k.nama.toLowerCase().includes(q) ||
      k.platNomor.toLowerCase().includes(q) ||
      (JENIS_BADGE_MAP[k.jenis]?.label || '').toLowerCase().includes(q)
    )
  })

  /* ── Open create dialog ── */
  const openCreateDialog = () => {
    setIsEditing(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  /* ── Open edit dialog ── */
  const openEditDialog = (item: KendaraanItem) => {
    setIsEditing(true)
    setEditingId(item.id)
    setForm({
      nama: item.nama,
      jenis: item.jenis,
      platNomor: item.platNomor,
      kapasitas: String(item.kapasitas),
      status: item.status,
      imageUrl: item.imageUrl || '',
    })
    setFormOpen(true)
  }

  /* ── Submit form (create or update) ── */
  const handleSubmit = async () => {
    if (!form.nama.trim()) {
      toast.error('Nama kendaraan wajib diisi')
      return
    }
    if (!form.platNomor.trim()) {
      toast.error('Plat nomor wajib diisi')
      return
    }
    if (!form.kapasitas || parseInt(form.kapasitas) <= 0) {
      toast.error('Kapasitas wajib diisi dan harus lebih dari 0')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...(isEditing && editingId ? { id: editingId } : {}),
        nama: form.nama.trim(),
        jenis: form.jenis,
        platNomor: form.platNomor.trim().toUpperCase(),
        kapasitas: parseInt(form.kapasitas),
        status: form.status,
        imageUrl: form.imageUrl.trim() || undefined,
      }

      const res = await fetch('/api/kendaraan', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || `Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} kendaraan`)
        return
      }

      toast.success(isEditing ? 'Kendaraan berhasil diperbarui' : 'Kendaraan berhasil ditambahkan')
      setFormOpen(false)
      fetchKendaraan()
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Open delete dialog ── */
  const openDeleteDialog = (item: KendaraanItem) => {
    setDeletingItem(item)
    setDeleteOpen(true)
  }

  /* ── Confirm delete ── */
  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/kendaraan?id=${deletingItem.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus kendaraan')
        return
      }
      toast.success('Kendaraan berhasil dihapus')
      setDeleteOpen(false)
      setDeletingItem(null)
      fetchKendaraan()
    } catch {
      toast.error('Terjadi kesalahan saat menghapus kendaraan')
    } finally {
      setDeleting(false)
    }
  }

  /* ── Stat card definitions ── */
  const statCards = [
    {
      title: 'Total Kendaraan',
      value: stats.total,
      icon: Car,
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
    {
      title: 'Tersedia',
      value: stats.tersedia,
      icon: CheckCircle2,
      bgLight: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
    {
      title: 'Digunakan',
      value: stats.digunakan,
      icon: Clock,
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Perawatan',
      value: stats.perawatan,
      icon: Wrench,
      bgLight: 'bg-red-50',
      textColor: 'text-red-500',
    },
  ]

  /* ── Access denied ── */
  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman ini. Hanya admin yang dapat mengelola
            kendaraan.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => setCurrentView('admin-dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Gradient Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-700 pb-8 pt-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0"
              onClick={() => setCurrentView('admin-dashboard')}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Manajemen Kendaraan</h1>
              <p className="mt-1 text-sm text-cyan-100">Kelola data kendaraan dinas {siteName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Stats Cards ── */}
        <div className="-mt-6 mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${stat.bgLight}`}
                    >
                      <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Search & Filter Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama kendaraan, plat nomor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Label htmlFor="status-filter" className="text-sm text-muted-foreground whitespace-nowrap">
              Status:
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-[150px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="tersedia">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500" /> Tersedia
                  </span>
                </SelectItem>
                <SelectItem value="digunakan">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-500" /> Digunakan
                  </span>
                </SelectItem>
                <SelectItem value="perawatan">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="size-3.5 text-red-500" /> Perawatan
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={jenisFilter} onValueChange={setJenisFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="medium_bus">
                  <span className="flex items-center gap-1.5">
                    <Bus className="size-3.5" /> Bus Medium
                  </span>
                </SelectItem>
                <SelectItem value="mini_bus">
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-3.5" /> Mini Bus
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={openCreateDialog}
              className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Tambah Kendaraan</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </motion.div>

        {/* ── Card Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              <span className="ml-3 text-muted-foreground">Memuat data kendaraan...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <EmptyState
              hasFilters={statusFilter !== 'all' || jenisFilter !== 'all' || !!searchQuery}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-8">
              <AnimatePresence mode="popLayout">
                {filteredList.map((item, idx) => (
                  <KendaraanCard
                    key={item.id}
                    item={item}
                    index={idx}
                    onEdit={() => openEditDialog(item)}
                    onDelete={() => openDeleteDialog(item)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Add/Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Pencil className="h-5 w-5 text-cyan-600" />
                  Edit Kendaraan
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-cyan-600" />
                  Tambah Kendaraan Baru
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Perbarui informasi kendaraan. Semua perubahan akan langsung tersimpan.'
                : 'Isi data kendaraan baru yang akan ditambahkan ke sistem.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nama Kendaraan */}
            <div className="grid gap-2">
              <Label htmlFor="k-nama" className="text-sm font-medium">
                Nama Kendaraan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="k-nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Bus Medium ISUZU"
              />
            </div>

            {/* Jenis & Kapasitas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Jenis</Label>
                <Select
                  value={form.jenis}
                  onValueChange={(v) => setForm({ ...form, jenis: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medium_bus">
                      <span className="flex items-center gap-1.5">
                        <Bus className="size-3.5" /> Bus Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="mini_bus">
                      <span className="flex items-center gap-1.5">
                        <Truck className="size-3.5" /> Mini Bus
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="k-kapasitas" className="text-sm font-medium">
                  Kapasitas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="k-kapasitas"
                  type="number"
                  min="1"
                  value={form.kapasitas}
                  onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
                  placeholder="30"
                />
              </div>
            </div>

            {/* Plat Nomor & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="k-plat" className="text-sm font-medium">
                  Plat Nomor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="k-plat"
                  value={form.platNomor}
                  onChange={(e) => setForm({ ...form, platNomor: e.target.value.toUpperCase() })}
                  placeholder="KT 1234 AB"
                  className="font-mono tracking-wide uppercase"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tersedia">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" /> Tersedia
                      </span>
                    </SelectItem>
                    <SelectItem value="digunakan">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-amber-500" /> Digunakan
                      </span>
                    </SelectItem>
                    <SelectItem value="perawatan">
                      <span className="flex items-center gap-1.5">
                        <Wrench className="size-3.5 text-red-500" /> Perawatan
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label htmlFor="k-image" className="text-sm font-medium flex items-center gap-1.5">
                <ImageIcon className="size-3.5" />
                Image URL
                <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Input
                id="k-image"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {form.imageUrl && (
                <div className="mt-1 size-16 rounded-lg overflow-hidden border">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="size-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.nama.trim() || !form.platNomor.trim() || !form.kapasitas.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditing ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kendaraan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation AlertDialog ────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Kendaraan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kendaraan ini akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deletingItem && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 shrink-0">
                  <Car className="size-5 text-cyan-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{deletingItem.nama}</p>
                  <p className="text-sm text-muted-foreground font-mono">{deletingItem.platNomor}</p>
                  <p className="text-xs text-muted-foreground">
                    Kapasitas: {deletingItem.kapasitas} orang
                  </p>
                </div>
              </div>
              {deletingItem.bookedDates && deletingItem.bookedDates.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800 border border-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Kendaraan ini memiliki {deletingItem.bookedDates.length} peminjaman aktif.
                    Menghapus kendaraan dapat memengaruhi peminjaman yang sedang berjalan.
                  </span>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Kendaraan
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
