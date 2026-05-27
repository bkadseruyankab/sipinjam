'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Building2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Shield,
  Sparkles,
  MapPin,
  Users,
  CheckCircle2,
  Wrench,
  X,
  Ruler,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────────────────────────── */

interface AulaItem {
  id: string
  nama: string
  lokasi: string | null
  kapasitas: number
  luas: string | null
  jenisKegiatan: string
  fasilitas: string | null
  deskripsi: string | null
  status: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  bookedDates?: { id: string; from: string; to: string; status: string; kegiatan: string }[]
  isAvailable?: boolean
}

interface AulaFormState {
  nama: string
  lokasi: string
  kapasitas: string
  luas: string
  jenisKegiatan: string
  fasilitas: string[]
  deskripsi: string
  status: string
  imageUrl: string
}

const EMPTY_FORM: AulaFormState = {
  nama: '',
  lokasi: '',
  kapasitas: '',
  luas: '',
  jenisKegiatan: 'semua',
  fasilitas: [],
  deskripsi: '',
  status: 'tersedia',
  imageUrl: '',
}

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

const JENIS_KEGIATAN_MAP: Record<string, string> = {
  semua: 'Semua',
  pemerintah: 'Pemerintah',
  umum: 'Umum',
}

/* ── Parse fasilitas from JSON string ── */
function parseFasilitas(fasilitasStr: string | null): string[] {
  if (!fasilitasStr) return []
  try {
    const parsed = JSON.parse(fasilitasStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/* ── Fasilitas Tag Input ── */
function FasilitasTagInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const tag = inputValue.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setInputValue('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik fasilitas, tekan Enter..."
          className="glass border-emerald-200/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 shadow-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 shrink-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence mode="popLayout">
            {value.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-200 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/* ── Aula Card Component ── */
function AulaCard({
  item,
  onEdit,
  onDelete,
  index,
}: {
  item: AulaItem
  onEdit: () => void
  onDelete: () => void
  index: number
}) {
  const fasilitasArr = parseFasilitas(item.fasilitas)
  const statusInfo = STATUS_BADGE_MAP[item.status] || STATUS_BADGE_MAP.tersedia

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
        <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.nama}
              className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Building2 className="size-14 text-emerald-300/70" />
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
          {/* Action buttons overlay */}
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="icon"
              className="size-8 bg-white/90 hover:bg-white text-emerald-600 hover:text-emerald-700 shadow-md backdrop-blur-sm"
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

            {item.lokasi && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{item.lokasi}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-3.5 shrink-0" />
                <span>{item.kapasitas} orang</span>
              </div>
              {item.luas && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Ruler className="size-3.5 shrink-0" />
                  <span>{item.luas}</span>
                </div>
              )}
            </div>

            <Badge
              variant="outline"
              className="mt-2 text-[11px] bg-emerald-50/70 text-emerald-700 border-emerald-200"
            >
              {JENIS_KEGIATAN_MAP[item.jenisKegiatan] || item.jenisKegiatan}
            </Badge>

            {fasilitasArr.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {fasilitasArr.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="inline-block rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
                {fasilitasArr.length > 3 && (
                  <span className="inline-block rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    +{fasilitasArr.length - 3} lainnya
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Mobile action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t sm:hidden">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs"
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
        <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
          <Building2 className="size-10 text-emerald-400" />
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
        {hasFilters ? 'Tidak ada hasil' : 'Belum ada aula'}
      </p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        {hasFilters
          ? 'Coba ubah filter atau kata kunci pencarian'
          : 'Tambahkan aula baru untuk mulai mengelola peminjaman ruangan'}
      </p>
    </motion.div>
  )
}

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */
export default function AulaManagement() {
  const user = useAppStore((s) => s.user)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const { identity } = useIdentity()
  const siteName = identity.site_name || 'E-Pakar'

  // Data state
  const [aulaList, setAulaList] = useState<AulaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AulaFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<AulaItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = user?.role === 'admin'

  /* ── Fetch data ── */
  const fetchAula = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/aula?all=true')
      if (res.ok) {
        const data = await res.json()
        setAulaList(data.aula || [])
      } else {
        toast.error('Gagal memuat data aula')
      }
    } catch {
      toast.error('Gagal memuat data aula')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchAula()
    }
  }, [isAdmin, fetchAula])

  /* ── Computed stats ── */
  const stats = {
    total: aulaList.length,
    tersedia: aulaList.filter((a) => a.status === 'tersedia').length,
    digunakan: aulaList.filter((a) => a.status === 'digunakan').length,
    perawatan: aulaList.filter((a) => a.status === 'perawatan').length,
  }

  /* ── Filtered list ── */
  const filteredList = aulaList.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      a.nama.toLowerCase().includes(q) ||
      (a.lokasi && a.lokasi.toLowerCase().includes(q)) ||
      (a.deskripsi && a.deskripsi.toLowerCase().includes(q)) ||
      JENIS_KEGIATAN_MAP[a.jenisKegiatan]?.toLowerCase().includes(q)
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
  const openEditDialog = (item: AulaItem) => {
    setIsEditing(true)
    setEditingId(item.id)
    setForm({
      nama: item.nama,
      lokasi: item.lokasi || '',
      kapasitas: String(item.kapasitas),
      luas: item.luas || '',
      jenisKegiatan: item.jenisKegiatan || 'semua',
      fasilitas: parseFasilitas(item.fasilitas),
      deskripsi: item.deskripsi || '',
      status: item.status || 'tersedia',
      imageUrl: item.imageUrl || '',
    })
    setFormOpen(true)
  }

  /* ── Submit form (create or update) ── */
  const handleSubmit = async () => {
    if (!form.nama.trim()) {
      toast.error('Nama aula wajib diisi')
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
        lokasi: form.lokasi.trim() || undefined,
        kapasitas: parseInt(form.kapasitas),
        luas: form.luas.trim() || undefined,
        jenisKegiatan: form.jenisKegiatan,
        fasilitas: form.fasilitas.length > 0 ? form.fasilitas : undefined,
        deskripsi: form.deskripsi.trim() || undefined,
        status: form.status,
        imageUrl: form.imageUrl.trim() || undefined,
      }

      const res = await fetch('/api/aula', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal menyimpan data aula')
        return
      }

      toast.success(isEditing ? 'Aula berhasil diperbarui' : 'Aula berhasil ditambahkan')
      setFormOpen(false)
      fetchAula()
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Open delete dialog ── */
  const openDeleteDialog = (item: AulaItem) => {
    setDeletingItem(item)
    setDeleteOpen(true)
  }

  /* ── Confirm delete ── */
  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/aula?id=${deletingItem.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus aula')
        return
      }
      toast.success('Aula berhasil dihapus')
      setDeleteOpen(false)
      setDeletingItem(null)
      fetchAula()
    } catch {
      toast.error('Terjadi kesalahan saat menghapus aula')
    } finally {
      setDeleting(false)
    }
  }

  /* ── Stat card definitions ── */
  const statCards = [
    {
      title: 'Total Aula',
      value: stats.total,
      icon: Building2,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Tersedia',
      value: stats.tersedia,
      icon: CheckCircle2,
      color: 'from-teal-500 to-cyan-600',
      bgLight: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
    {
      title: 'Digunakan',
      value: stats.digunakan,
      icon: Users,
      color: 'from-amber-500 to-yellow-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Perawatan',
      value: stats.perawatan,
      icon: Wrench,
      color: 'from-red-400 to-red-600',
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
            aula.
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
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 pb-8 pt-6">
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
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Manajemen Aula</h1>
              <p className="mt-1 text-sm text-emerald-100">Kelola data aula dan ruangan {siteName}</p>
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
              placeholder="Cari nama atau lokasi aula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="text-sm text-muted-foreground whitespace-nowrap">
              Filter:
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
                    <Users className="size-3.5 text-amber-500" /> Digunakan
                  </span>
                </SelectItem>
                <SelectItem value="perawatan">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="size-3.5 text-red-500" /> Perawatan
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={openCreateDialog}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Tambah Aula</span>
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
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-3 text-muted-foreground">Memuat data aula...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <EmptyState
              hasFilters={statusFilter !== 'all' || !!searchQuery}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-8">
              <AnimatePresence mode="popLayout">
                {filteredList.map((item, idx) => (
                  <AulaCard
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
                  <Pencil className="h-5 w-5 text-emerald-600" />
                  Edit Aula
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-emerald-600" />
                  Tambah Aula Baru
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Perbarui informasi aula. Semua perubahan akan langsung tersimpan.'
                : 'Isi data aula baru yang akan ditambahkan ke sistem.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nama Aula */}
            <div className="grid gap-2">
              <Label htmlFor="aula-nama" className="text-sm font-medium">
                Nama Aula <span className="text-red-500">*</span>
              </Label>
              <Input
                id="aula-nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Aula Utama BKAD"
              />
            </div>

            {/* Lokasi */}
            <div className="grid gap-2">
              <Label htmlFor="aula-lokasi" className="text-sm font-medium">Lokasi</Label>
              <Input
                id="aula-lokasi"
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                placeholder="Contoh: Lantai 2, Gedung Utama"
              />
            </div>

            {/* Kapasitas & Luas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="aula-kapasitas" className="text-sm font-medium">
                  Kapasitas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="aula-kapasitas"
                  type="number"
                  min="1"
                  value={form.kapasitas}
                  onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="aula-luas" className="text-sm font-medium">Luas</Label>
                <Input
                  id="aula-luas"
                  value={form.luas}
                  onChange={(e) => setForm({ ...form, luas: e.target.value })}
                  placeholder="Contoh: 20x30 m"
                />
              </div>
            </div>

            {/* Jenis Kegiatan & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Jenis Kegiatan</Label>
                <Select
                  value={form.jenisKegiatan}
                  onValueChange={(v) => setForm({ ...form, jenisKegiatan: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="pemerintah">Pemerintah</SelectItem>
                    <SelectItem value="umum">Umum</SelectItem>
                  </SelectContent>
                </Select>
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
                        <Users className="size-3.5 text-amber-500" /> Digunakan
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

            {/* Fasilitas */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Fasilitas</Label>
              <FasilitasTagInput
                value={form.fasilitas}
                onChange={(tags) => setForm({ ...form, fasilitas: tags })}
              />
            </div>

            {/* Deskripsi */}
            <div className="grid gap-2">
              <Label htmlFor="aula-deskripsi" className="text-sm font-medium">Deskripsi</Label>
              <Textarea
                id="aula-deskripsi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat tentang aula..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label htmlFor="aula-image" className="text-sm font-medium flex items-center gap-1.5">
                <ImageIcon className="size-3.5" />
                Image URL
                <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Input
                id="aula-image"
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
              disabled={submitting || !form.nama.trim() || !form.kapasitas}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                  Tambah Aula
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
              Hapus Aula
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Aula ini akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deletingItem && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 shrink-0">
                  <Building2 className="size-5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{deletingItem.nama}</p>
                  {deletingItem.lokasi && (
                    <p className="text-sm text-muted-foreground truncate">{deletingItem.lokasi}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Kapasitas: {deletingItem.kapasitas} orang
                  </p>
                </div>
              </div>
              {deletingItem.bookedDates && deletingItem.bookedDates.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800 border border-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Aula ini memiliki {deletingItem.bookedDates.length} peminjaman aktif.
                    Menghapus aula dapat memengaruhi peminjaman yang sedang berjalan.
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
                  Hapus Aula
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
