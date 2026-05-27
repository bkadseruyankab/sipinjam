'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Bell,
  Loader2,
  MessageCircle,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  status: string
  recipient: string
  subject: string | null
  message: string
  borrowingId: string | null
  error: string | null
  sentAt: string | null
  createdAt: string
}

export default function NotificationsPage() {
  const { user, setCurrentView } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const isAdmin = user?.role === 'admin'

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', page.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/notifications/list?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setTotal(data.pagination?.total || 0)
      }
    } catch {
      toast.error('Gagal memuat notifikasi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) fetchNotifications()
    else setLoading(false)
  }, [isAdmin, typeFilter, statusFilter, page])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            <CheckCircle className="size-3 mr-1" />
            Terkirim
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            <XCircle className="size-3 mr-1" />
            Gagal
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
            <Clock className="size-3 mr-1" />
            Menunggu
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    if (type === 'whatsapp') {
      return <MessageCircle className="size-4 text-green-600" />
    }
    return <Mail className="size-4 text-blue-600" />
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Bell className="size-16 text-emerald-300 mx-auto mb-4" />
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

  // Stats
  const sentCount = notifications.filter((n) => n.status === 'sent').length
  const failedCount = notifications.filter((n) => n.status === 'failed').length
  const pendingCount = notifications.filter((n) => n.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('admin-dashboard')}
          className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
              <Bell className="size-6" />
              Riwayat Notifikasi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pantau pengiriman notifikasi WhatsApp dan Email
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setLoading(true); fetchNotifications() }}
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-3 text-center">
              <CheckCircle className="size-5 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">{sentCount}</p>
              <p className="text-xs text-green-600">Terkirim</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-3 text-center">
              <XCircle className="size-5 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-700">{failedCount}</p>
              <p className="text-xs text-red-600">Gagal</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-3 text-center">
              <Clock className="size-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-xs text-yellow-600">Menunggu</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tipe:</span>
            <div className="flex gap-1">
              <button
                onClick={() => { setTypeFilter(''); setPage(1) }}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  !typeFilter ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => { setTypeFilter('whatsapp'); setPage(1) }}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  typeFilter === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
                }`}
              >
                <MessageCircle className="size-3" />
                WhatsApp
              </button>
              <button
                onClick={() => { setTypeFilter('email'); setPage(1) }}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  typeFilter === 'email' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
                }`}
              >
                <Mail className="size-3" />
                Email
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="text-xs rounded-md border px-2 py-1 bg-white"
            >
              <option value="">Semua</option>
              <option value="sent">Terkirim</option>
              <option value="failed">Gagal</option>
              <option value="pending">Menunggu</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Memuat notifikasi...</span>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-emerald-200">
            <CardContent className="p-8 text-center">
              <Bell className="size-12 text-emerald-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Belum ada notifikasi</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className="border-emerald-200 hover:border-emerald-300 transition-colors cursor-pointer"
                onClick={() => setSelectedNotification(notif)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 shrink-0 mt-0.5">
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(notif.status)}
                        <span className="text-xs text-muted-foreground">
                          {notif.type === 'whatsapp' ? 'WhatsApp' : 'Email'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground truncate">
                        {notif.subject || notif.message.substring(0, 80) + '...'}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          Kepada: {notif.recipient}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>
                      {notif.error && (
                        <p className="text-xs text-red-500 mt-1 truncate">
                          Error: {notif.error}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-emerald-300"
            >
              Sebelumnya
            </Button>
            <span className="text-xs text-muted-foreground">
              Hal {page} dari {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setPage((p) => p + 1)}
              className="border-emerald-300"
            >
              Selanjutnya
            </Button>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                {selectedNotification && getTypeIcon(selectedNotification.type)}
                Detail Notifikasi
              </DialogTitle>
              <DialogDescription>
                {selectedNotification?.type === 'whatsapp' ? 'WhatsApp' : 'Email'} Notification
              </DialogDescription>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedNotification.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Penerima</span>
                    <span className="font-medium">{selectedNotification.recipient}</span>
                  </div>
                  {selectedNotification.subject && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subjek</span>
                      <span className="font-medium">{selectedNotification.subject}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dibuat</span>
                    <span className="font-medium">{formatDate(selectedNotification.createdAt)}</span>
                  </div>
                  {selectedNotification.sentAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Terkirim</span>
                      <span className="font-medium">{formatDate(selectedNotification.sentAt)}</span>
                    </div>
                  )}
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Pesan:</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
                {selectedNotification.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-xs text-red-600 font-medium mb-1">Error:</p>
                    <p className="text-sm text-red-700">{selectedNotification.error}</p>
                  </div>
                )}
                {selectedNotification.borrowingId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ID Peminjaman</span>
                    <span className="font-mono text-xs">{selectedNotification.borrowingId}</span>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
