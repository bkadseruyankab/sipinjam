'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { toast } from 'sonner'
import {
  ArrowLeft,
  Star,
  Trash2,
  Loader2,
  MessageSquareQuote,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Mail,
  Smartphone,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react'

interface TestimonialItem {
  id: string
  borrowingId?: string | null
  userId: string
  name: string
  instansi?: string | null
  rating: number
  message: string
  isPublished: boolean
  source: string
  createdAt: string
  user?: {
    name: string
    email: string
    instansi?: string | null
  }
}

function SourceBadge({ source }: { source: string }) {
  switch (source) {
    case 'whatsapp':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] gap-1 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
          <MessageCircle className="size-3" />
          WhatsApp
        </Badge>
      )
    case 'email':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] gap-1 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
          <Mail className="size-3" />
          Email
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
          <Smartphone className="size-3" />
          App
        </Badge>
      )
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3.5 ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </div>
  )
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

export default function AdminTestimonials() {
  const { user, setCurrentView } = useAppStore()
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const isAdmin = user?.role === 'admin'

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonial')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.testimonials || [])
      }
    } catch {
      toast.error('Gagal memuat testimoni')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchTestimonials()
  }, [isAdmin])

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === 'published') return t.isPublished
    if (filter === 'unpublished') return !t.isPublished
    return true
  })

  const stats = {
    total: testimonials.length,
    published: testimonials.filter((t) => t.isPublished).length,
    unpublished: testimonials.filter((t) => !t.isPublished).length,
    avgRating: testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
      : '0',
  }

  const handleTogglePublish = async (testimonial: TestimonialItem) => {
    setTogglingId(testimonial.id)
    try {
      const res = await fetch('/api/testimonial', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testimonial.id,
          isPublished: !testimonial.isPublished,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal mengubah status')
        return
      }

      toast.success(
        testimonial.isPublished
          ? 'Testimoni berhasil disembunyikan'
          : 'Testimoni berhasil dipublikasikan'
      )
      // Update local state
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === testimonial.id ? { ...t, isPublished: !t.isPublished } : t
        )
      )
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch('/api/testimonial', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus testimoni')
        return
      }

      toast.success('Testimoni berhasil dihapus')
      setTestimonials((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setDeleting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('admin-dashboard')}
          className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/20"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <MessageSquareQuote className="size-6" />
            Kelola Testimoni
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Tinjau dan kelola testimoni dari pengguna</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <Card className="border-emerald-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <MessageSquareQuote className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Testimoni</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{stats.published}</p>
                  <p className="text-xs text-muted-foreground">Dipublikasi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <XCircle className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{stats.unpublished}</p>
                  <p className="text-xs text-muted-foreground">Belum Diterbitkan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <Star className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{stats.avgRating}</p>
                  <p className="text-xs text-muted-foreground">Rata-rata Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="border-emerald-200 dark:border-gray-700 mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 shrink-0">Filter:</p>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-gray-800 dark:border-gray-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Testimoni</SelectItem>
                  <SelectItem value="published">Dipublikasi</SelectItem>
                  <SelectItem value="unpublished">Belum Diterbitkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-emerald-200 dark:border-gray-700">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-emerald-600" />
                <span className="ml-2 text-muted-foreground">Memuat data...</span>
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquareQuote className="size-12 text-emerald-300 dark:text-emerald-700 mb-3" />
                <p className="text-muted-foreground font-medium">Tidak ada testimoni</p>
                <p className="text-sm text-muted-foreground">Testimoni akan muncul ketika ada pengguna yang memberikan testimoni</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50/50 dark:bg-gray-800/50 hover:bg-emerald-50/50 dark:hover:bg-gray-800/50">
                        <TableHead>Pengguna</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Testimoni</TableHead>
                        <TableHead>Sumber</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTestimonials.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm dark:text-gray-200">{item.name}</p>
                              {item.instansi && (
                                <p className="text-xs text-muted-foreground">{item.instansi}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StarRating rating={item.rating} />
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-700 dark:text-gray-300 max-w-[280px] truncate">
                              {item.message}
                            </p>
                          </TableCell>
                          <TableCell>
                            <SourceBadge source={item.source} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.isPublished}
                                onCheckedChange={() => handleTogglePublish(item)}
                                disabled={togglingId === item.id}
                                className="data-[state=checked]:bg-emerald-600"
                              />
                              <span className="text-xs text-muted-foreground">
                                {item.isPublished ? (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <Eye className="size-3" /> Publish
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-gray-400">
                                    <EyeOff className="size-3" /> Draft
                                  </span>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(item)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-2"
                            >
                              <Trash2 className="size-4" />
                              <span className="hidden sm:inline ml-1">Hapus</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-4 max-h-[600px] overflow-y-auto">
                  {filteredTestimonials.map((item) => (
                    <Card key={item.id} className="border-emerald-100 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm dark:text-gray-200">{item.name}</p>
                            {item.instansi && (
                              <p className="text-xs text-muted-foreground">{item.instansi}</p>
                            )}
                            <div className="mt-1">
                              <StarRating rating={item.rating} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <SourceBadge source={item.source} />
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 line-clamp-3">
                          {item.message}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isPublished}
                              onCheckedChange={() => handleTogglePublish(item)}
                              disabled={togglingId === item.id}
                              className="data-[state=checked]:bg-emerald-600"
                            />
                            <span className="text-xs text-muted-foreground">
                              {item.isPublished ? 'Publish' : 'Draft'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(item)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 px-2"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="size-5" />
              Hapus Testimoni
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus testimoni dari{' '}
              <span className="font-semibold">{deleteTarget?.name}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTarget && (
            <div className="rounded-lg border border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-3 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={deleteTarget.rating} />
                <SourceBadge source={deleteTarget.source} />
              </div>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{deleteTarget.message}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="border-emerald-200 dark:border-gray-600">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
