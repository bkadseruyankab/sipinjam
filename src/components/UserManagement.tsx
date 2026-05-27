'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useIdentity } from '@/hooks/useIdentity';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCog,
  Search,
  Edit,
  Trash2,
  Shield,
  ArrowLeft,
  Loader2,
  Plus,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  instansi: string;
  role: 'admin' | 'user';
  borrowCount: number;
  testimonialCount: number;
  createdAt: string;
}

interface UsersApiResponse {
  users: UserData[];
  total: number;
  page: number;
  totalPages: number;
}

interface StatsData {
  totalUsers: number;
  adminCount: number;
  regularCount: number;
  newThisMonth: number;
}

// ─── Color helper for avatars ────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-pink-500',
  'bg-violet-500',
  'bg-indigo-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UserManagement() {
  const { user: currentUser, setCurrentView } = useAppStore();
  const { identity } = useIdentity();
  const siteName = identity.site_name || 'E-Pakar';

  // ── State ────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    adminCount: 0,
    regularCount: 0,
    newThisMonth: 0,
  });

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    instansi: '',
    role: 'user' as 'admin' | 'user',
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const limit = 10;

  // ── Access Control ───────────────────────────────────────────────────────
  const isAdmin = currentUser?.role === 'admin';

  // ── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat data pengguna');
      const data: UsersApiResponse = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);

      // Compute stats from response
      const adminCount = data.users.filter((u) => u.role === 'admin').length;
      const regularCount = data.users.filter((u) => u.role === 'user').length;
      const now = new Date();
      const newThisMonth = data.users.filter((u) => {
        const d = new Date(u.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // For total stats we estimate from total count (server should ideally provide these)
      setStats((prev) => ({
        totalUsers: data.total || prev.totalUsers,
        adminCount: data.total > limit ? prev.adminCount : adminCount,
        regularCount: data.total > limit ? prev.regularCount : regularCount,
        newThisMonth: data.total > limit ? prev.newThisMonth : newThisMonth,
      }));
    } catch (err) {
      toast.error('Gagal memuat data pengguna');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, limit]);

  // Fetch stats separately for accuracy
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/users?limit=1000');
      if (!res.ok) return;
      const data: UsersApiResponse = await res.json();
      const allUsers = data.users || [];
      const now = new Date();
      setStats({
        totalUsers: data.total || allUsers.length,
        adminCount: allUsers.filter((u) => u.role === 'admin').length,
        regularCount: allUsers.filter((u) => u.role === 'user').length,
        newThisMonth: allUsers.filter((u) => {
          const d = new Date(u.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
      });
    } catch {
      // silent fail for stats
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [page, search, roleFilter, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const openEditDialog = (user: UserData) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      instansi: user.instansi || '',
      role: user.role,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUser.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          instansi: editForm.instansi,
          role: editForm.role,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menyimpan perubahan');
      }
      toast.success('Data pengguna berhasil diperbarui');
      setEditOpen(false);
      fetchUsers();
      fetchStats();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (user: UserData) => {
    setDeleteUser(user);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    // Check if this is the last admin
    if (deleteUser.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        toast.error('Tidak dapat menghapus admin terakhir. Minimal harus ada satu admin.');
        setDeleteOpen(false);
        return;
      }
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteUser.id }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menghapus pengguna');
      }
      toast.success('Pengguna berhasil dihapus');
      setDeleteOpen(false);
      // If we're on a page that won't exist anymore, go back
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUsers();
      }
      fetchStats();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus pengguna');
    } finally {
      setDeleting(false);
    }
  };

  // ── Access Denied ────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman ini. Hanya admin yang dapat mengelola
            pengguna.
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
    );
  }

  // ─── Stats Cards ──────────────────────────────────────────────────────────

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Admin',
      value: stats.adminCount,
      icon: Shield,
      color: 'from-teal-500 to-cyan-600',
      bgLight: 'bg-teal-50 dark:bg-teal-950/40',
      textColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      title: 'Pengguna Biasa',
      value: stats.regularCount,
      icon: UserCog,
      color: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50 dark:bg-green-950/40',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Baru Bulan Ini',
      value: stats.newThisMonth,
      icon: Plus,
      color: 'from-cyan-500 to-teal-600',
      bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
      textColor: 'text-cyan-600 dark:text-cyan-400',
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Manajemen Pengguna</h1>
              <p className="mt-1 text-sm text-emerald-100">Kelola semua pengguna {siteName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats */}
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

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="role-filter" className="text-sm text-muted-foreground whitespace-nowrap">
              Filter:
            </Label>
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger id="role-filter" className="w-[130px]">
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Pengguna</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-5 w-5 text-emerald-600" />
                Daftar Pengguna
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {total} pengguna
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  <span className="ml-3 text-muted-foreground">Memuat data...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Users className="mb-3 h-12 w-12 opacity-30" />
                  <p className="text-lg font-medium">Tidak ada pengguna ditemukan</p>
                  <p className="text-sm">Coba ubah kata kunci pencarian atau filter</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[280px]">Pengguna</TableHead>
                          <TableHead>Instansi</TableHead>
                          <TableHead className="w-[90px]">Role</TableHead>
                          <TableHead className="w-[90px] text-center">Pinjam</TableHead>
                          <TableHead className="w-[90px] text-center">Testimoni</TableHead>
                          <TableHead className="w-[130px]">Terdaftar</TableHead>
                          <TableHead className="w-[100px] text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence mode="popLayout">
                          {users.map((user) => (
                            <motion.tr
                              key={user.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback
                                      className={`${getAvatarColor(user.name)} text-white text-xs font-semibold`}
                                    >
                                      {getInitials(user.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                      {user.name}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Mail className="h-3 w-3 shrink-0" />
                                      <span className="truncate">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{user.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="truncate max-w-[160px]">
                                    {user.instansi || '-'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    user.role === 'admin'
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                  }
                                >
                                  {user.role === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {user.borrowCount ?? 0}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {user.testimonialCount ?? 0}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                  {formatDate(user.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                    onClick={() => openEditDialog(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    onClick={() => openDeleteDialog(user)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="md:hidden divide-y">
                    <AnimatePresence mode="popLayout">
                      {users.map((user) => (
                        <motion.div
                          key={user.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-11 w-11 shrink-0">
                              <AvatarFallback
                                className={`${getAvatarColor(user.name)} text-white text-sm font-semibold`}
                              >
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground truncate">
                                  {user.name}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className={
                                    user.role === 'admin'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shrink-0'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 shrink-0'
                                  }
                                >
                                  {user.role === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                              </div>
                              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                                {user.instansi && (
                                  <div className="flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{user.instansi}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Pinjam: {user.borrowCount ?? 0}</span>
                                <span>Testimoni: {user.testimonialCount ?? 0}</span>
                                <span>{formatDate(user.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => openEditDialog(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => openDeleteDialog(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
                  <p className="text-sm text-muted-foreground">
                    Halaman {page} dari {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        // Show first, last, current, and adjacent pages
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - page) <= 1) return true;
                        return false;
                      })
                      .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                        if (i > 0) {
                          const prev = arr[i - 1];
                          if (p - prev > 1) acc.push('ellipsis');
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        item === 'ellipsis' ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={item}
                            variant={page === item ? 'default' : 'outline'}
                            size="icon"
                            className={`h-8 w-8 ${
                              page === item
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : ''
                            }`}
                            onClick={() => setPage(item)}
                          >
                            {item}
                          </Button>
                        ),
                      )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Pengguna
            </DialogTitle>
            <DialogDescription>
              Perbarui informasi pengguna. Password tidak dapat diubah di sini.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="email@contoh.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Telepon</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-instansi">Instansi</Label>
                <Input
                  id="edit-instansi"
                  value={editForm.instansi}
                  onChange={(e) => setEditForm({ ...editForm, instansi: e.target.value })}
                  placeholder="Nama instansi"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm({ ...editForm, role: v as 'admin' | 'user' })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Pengguna</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editForm.name.trim() || !editForm.email.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Pengguna
            </DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua data terkait pengguna ini akan dihapus
              secara permanen.
            </DialogDescription>
          </DialogHeader>

          {deleteUser && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className={`${getAvatarColor(deleteUser.name)} text-white text-sm font-semibold`}
                  >
                    {getInitials(deleteUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{deleteUser.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{deleteUser.email}</p>
                </div>
              </div>
              {deleteUser.role === 'admin' && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Perhatian: Pengguna ini adalah admin. Menghapus admin terakhir tidak
                    diperbolehkan.
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Pengguna
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
