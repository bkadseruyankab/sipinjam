'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import DocumentPreview from '@/components/DocumentPreview'
import {
  ArrowLeft,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  Copy,
  Loader2,
  FileDown,
  Sparkles,
  BookOpen,
  CheckCircle2,
  LayoutTemplate,
  X,
} from 'lucide-react'

interface Template {
  id: string
  name: string
  type: string
  content: string
  description: string | null
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  surat_permohonan: { label: 'Surat Permohonan', color: 'text-emerald-700', bg: 'bg-emerald-100/80', border: 'border-emerald-300', icon: FileText },
  surat_persetujuan: { label: 'Surat Persetujuan', color: 'text-teal-700', bg: 'bg-teal-100/80', border: 'border-teal-300', icon: CheckCircle2 },
  surat_keterangan: { label: 'Surat Keterangan', color: 'text-amber-700', bg: 'bg-amber-100/80', border: 'border-amber-300', icon: BookOpen },
  undangan: { label: 'Undangan', color: 'text-purple-700', bg: 'bg-purple-100/80', border: 'border-purple-300', icon: Sparkles },
  custom: { label: 'Kustom', color: 'text-gray-700', bg: 'bg-gray-100/80', border: 'border-gray-300', icon: LayoutTemplate },
}

const TYPE_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'surat_permohonan', label: 'Permohonan' },
  { key: 'surat_persetujuan', label: 'Persetujuan' },
  { key: 'surat_keterangan', label: 'Keterangan' },
  { key: 'undangan', label: 'Undangan' },
  { key: 'custom', label: 'Kustom' },
]

const PLACEHOLDER_LIST = [
  { key: '{{nama}}', desc: 'Nama peminjam' },
  { key: '{{email}}', desc: 'Email peminjam' },
  { key: '{{instansi}}', desc: 'Instansi/organisasi' },
  { key: '{{kegiatan}}', desc: 'Nama kegiatan' },
  { key: '{{tanggalPinjam}}', desc: 'Tanggal pinjam' },
  { key: '{{tanggalKembali}}', desc: 'Tanggal kembali' },
  { key: '{{waktuMulai}}', desc: 'Waktu mulai' },
  { key: '{{waktuSelesai}}', desc: 'Waktu selesai' },
  { key: '{{jenisKegiatan}}', desc: 'Jenis kegiatan' },
  { key: '{{waktuPenggunaan}}', desc: 'Waktu penggunaan' },
  { key: '{{tujuan}}', desc: 'Tujuan' },
  { key: '{{jumlahPeserta}}', desc: 'Jumlah peserta' },
  { key: '{{jumlahPenumpang}}', desc: 'Jumlah penumpang' },
  { key: '{{nomorPerjanjian}}', desc: 'Nomor perjanjian' },
  { key: '{{tarif}}', desc: 'Tarif (Rupiah)' },
  { key: '{{totalBiaya}}', desc: 'Total biaya (Rupiah)' },
  { key: '{{catatanAdmin}}', desc: 'Catatan admin' },
  { key: '{{tanggalCetak}}', desc: 'Tanggal cetak' },
  { key: '{{namaKendaraan}}', desc: 'Nama kendaraan' },
  { key: '{{platNomor}}', desc: 'Plat nomor' },
  { key: '{{sopir}}', desc: 'Nama sopir' },
  { key: '{{namaInstansi}}', desc: 'Nama instansi (KOP)' },
  { key: '{{kabupaten}}', desc: 'Kabupaten (KOP)' },
]

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState<{
    id: string
    name: string
    type: string
    content: string
    description: string
    isDefault: boolean
    isActive: boolean
  }>({
    id: '',
    name: '',
    type: 'surat_permohonan',
    content: '',
    description: '',
    isDefault: false,
    isActive: true,
  })
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Preview state
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)

  // Seeding state
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch {
      toast.error('Gagal memuat data template')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    return true
  })

  const handleCreate = () => {
    setIsCreating(true)
    setEditForm({
      id: '',
      name: '',
      type: 'surat_permohonan',
      content: '<div style="text-align:center;margin-bottom:20px;">\n  <h3 style="margin:0;font-size:13px;text-decoration:underline;">JUDUL SURAT</h3>\n</div>\n\n<p style="font-size:12px;">Isi template di sini... Gunakan placeholder seperti {{nama}}, {{kegiatan}}, dll.</p>',
      description: '',
      isDefault: false,
      isActive: true,
    })
    setEditDialogOpen(true)
  }

  const handleEdit = (template: Template) => {
    setIsCreating(false)
    setEditForm({
      id: template.id,
      name: template.name,
      type: template.type,
      content: template.content,
      description: template.description || '',
      isDefault: template.isDefault,
      isActive: template.isActive,
    })
    setEditDialogOpen(true)
  }

  const handleDuplicate = (template: Template) => {
    setIsCreating(true)
    setEditForm({
      id: '',
      name: `${template.name} (Salinan)`,
      type: template.type,
      content: template.content,
      description: template.description || '',
      isDefault: false,
      isActive: true,
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.content.trim()) {
      toast.error('Nama dan konten template wajib diisi')
      return
    }

    setSaving(true)
    try {
      const url = '/api/templates'
      const method = isCreating ? 'POST' : 'PATCH'
      const body = isCreating
        ? {
            name: editForm.name,
            type: editForm.type,
            content: editForm.content,
            description: editForm.description,
            isDefault: editForm.isDefault,
            isActive: editForm.isActive,
          }
        : {
            id: editForm.id,
            name: editForm.name,
            type: editForm.type,
            content: editForm.content,
            description: editForm.description,
            isDefault: editForm.isDefault,
            isActive: editForm.isActive,
          }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(isCreating ? 'Template berhasil dibuat' : 'Template berhasil diperbarui')
        setEditDialogOpen(false)
        fetchTemplates()
      } else {
        toast.error(data.error || 'Gagal menyimpan template')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Template berhasil dihapus')
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        fetchTemplates()
      } else {
        toast.error(data.error || 'Gagal menghapus template')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus')
    }
  }

  const handleToggleActive = async (template: Template) => {
    try {
      const res = await fetch('/api/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: template.id, isActive: !template.isActive }),
      })
      if (res.ok) {
        toast.success(template.isActive ? 'Template dinonaktifkan' : 'Template diaktifkan')
        fetchTemplates()
      }
    } catch {
      toast.error('Gagal mengubah status template')
    }
  }

  const handleSetDefault = async (template: Template) => {
    try {
      const res = await fetch('/api/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: template.id, isDefault: true }),
      })
      if (res.ok) {
        toast.success('Template default berhasil diubah')
        fetchTemplates()
      }
    } catch {
      toast.error('Gagal mengubah template default')
    }
  }

  const handlePreview = (template: Template) => {
    // Build a simple preview with sample data
    let preview = template.content
    const sampleData: Record<string, string> = {
      '{{nama}}': 'Dr. Budi Santoso',
      '{{email}}': 'budi@example.com',
      '{{instansi}}': 'Dinas Pendidikan Kab. Seruyan',
      '{{kegiatan}}': 'Rapat Koordinasi Pendidikan',
      '{{tanggalPinjam}}': '15 Maret 2026',
      '{{tanggalKembali}}': '15 Maret 2026',
      '{{waktuMulai}}': '08:00',
      '{{waktuSelesai}}': '12:00',
      '{{jenisKegiatan}}': 'Pemerintah',
      '{{waktuPenggunaan}}': 'Siang',
      '{{tujuan}}': 'Kuala Pembuang',
      '{{jumlahPeserta}}': '50',
      '{{jumlahPenumpang}}': '25',
      '{{nomorPerjanjian}}': 'SPK/BKAD/2026/001',
      '{{tarif}}': 'Rp 1.000.000',
      '{{totalBiaya}}': 'Rp 1.200.000',
      '{{catatanAdmin}}': '-',
      '{{tanggalCetak}}': new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      '{{namaKendaraan}}': 'Medium Bus Isuzu',
      '{{platNomor}}': 'KH 1234 AB',
      '{{sopir}}': 'Ahmad Ridwan',
      '{{namaInstansi}}': 'Badan Keuangan dan Aset Daerah',
      '{{kabupaten}}': 'Kabupaten Seruyan',
    }
    for (const [placeholder, value] of Object.entries(sampleData)) {
      preview = preview.split(placeholder).join(value)
    }
    // Replace any remaining placeholders
    preview = preview.replace(/\{\{(\w+)\}\}/g, '............')

    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Times New Roman', Georgia, serif; margin: 0; padding: 20px; color: #1a1a1a; line-height: 1.6; font-size: 12px; }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:10px;border-bottom:2px solid #065f46;padding-bottom:10px;">
    <h2 style="margin:0;font-size:14px;color:#065f46;">PEMERINTAH KABUPATEN SERUYAN</h2>
    <h2 style="margin:0;font-size:14px;color:#065f46;">BADAN KEUANGAN DAN ASET DAERAH</h2>
    <div style="height:3px;background:#065f46;margin-top:8px;"></div>
    <div style="height:1px;background:#065f46;margin-top:2px;"></div>
  </div>
  ${preview}
</body>
</html>`

    setPreviewHtml(fullHtml)
    setPreviewTitle(template.name)
    setPreviewDialogOpen(true)
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/templates/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        fetchTemplates()
      } else {
        toast.error(data.error || 'Gagal meng-seed template')
      }
    } catch {
      toast.error('Terjadi kesalahan saat meng-seed template')
    } finally {
      setSeeding(false)
    }
  }

  const handleExport = () => {
    const data = JSON.stringify(templates, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `templates-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Template berhasil diekspor')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const imported = JSON.parse(text)
        if (!Array.isArray(imported)) {
          toast.error('Format file tidak valid')
          return
        }
        let count = 0
        for (const tpl of imported) {
          if (!tpl.name || !tpl.type || !tpl.content) continue
          const res = await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `${tpl.name} (Import)`,
              type: tpl.type,
              content: tpl.content,
              description: tpl.description,
              isDefault: false,
              isActive: tpl.isActive ?? true,
            }),
          })
          if (res.ok) count++
        }
        toast.success(`${count} template berhasil diimpor`)
        fetchTemplates()
      } catch {
        toast.error('Gagal membaca file impor')
      }
    }
    input.click()
  }

  const insertPlaceholder = (placeholder: string) => {
    setEditForm((prev) => ({
      ...prev,
      content: prev.content + placeholder,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white dot-pattern">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
            <FileText className="size-6" />
            Template Dokumen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola template surat dan dokumen untuk peminjaman aula & kendaraan
          </p>
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <Button
            onClick={handleCreate}
            className="btn-modern bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
          >
            <Plus className="size-4" />
            Buat Template
          </Button>
          <Button
            onClick={handleSeed}
            disabled={seeding}
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 btn-modern"
          >
            {seeding ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Seed Default
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 btn-modern"
            disabled={templates.length === 0}
          >
            <FileDown className="size-4" />
            Ekspor
          </Button>
          <Button
            onClick={handleImport}
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 btn-modern"
          >
            <Copy className="size-4" />
            Impor
          </Button>
        </motion.div>

        {/* Type Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-1.5 mb-6"
        >
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
                typeFilter === tab.key
                  ? 'text-white'
                  : 'text-emerald-700 hover:bg-emerald-100/60'
              }`}
            >
              {typeFilter === tab.key && (
                <motion.span
                  layoutId="templateTypePill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-muted-foreground">Memuat template...</span>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="flex size-20 items-center justify-center rounded-2xl bg-emerald-100 mb-4">
              <FileText className="size-8 text-emerald-400" />
            </div>
            <p className="text-lg font-semibold text-emerald-800">
              {typeFilter !== 'all' ? 'Tidak ada template untuk tipe ini' : 'Belum ada template'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Klik &ldquo;Buat Template&rdquo; atau &ldquo;Seed Default&rdquo; untuk menambahkan template
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template, idx) => {
                const typeConf = TYPE_CONFIG[template.type] || TYPE_CONFIG.custom
                const TypeIcon = typeConf.icon
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Card className="card-hover card-shine glass border-emerald-200/60 shadow-md overflow-hidden h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`flex size-8 items-center justify-center rounded-lg ${typeConf.bg} ${typeConf.color} shrink-0`}>
                              <TypeIcon className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-sm font-semibold text-emerald-800 truncate">
                                {template.name}
                              </CardTitle>
                              {template.isDefault && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                                  <Star className="size-3 fill-amber-400" /> Default
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${typeConf.bg} ${typeConf.color} ${typeConf.border}`}
                          >
                            {typeConf.label}
                          </Badge>
                        </div>
                        {template.description && (
                          <CardDescription className="text-xs mt-1 line-clamp-2">
                            {template.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0 mt-auto">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={template.isActive}
                              onCheckedChange={() => handleToggleActive(template)}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                            <span className="text-xs text-muted-foreground">
                              {template.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(template)}
                            className="btn-modern text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(template)}
                            className="btn-modern text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8 px-2"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(template)}
                            className="btn-modern text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 px-2"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                          {!template.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(template)}
                              className="btn-modern text-muted-foreground hover:text-amber-600 h-8 px-2"
                              title="Jadikan default"
                            >
                              <Star className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeleteTarget(template)
                              setDeleteDialogOpen(true)
                            }}
                            className="btn-modern text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 ml-auto"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="glass max-w-5xl max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-emerald-800 flex items-center gap-2">
                {isCreating ? (
                  <><Plus className="size-5" /> Buat Template Baru</>
                ) : (
                  <><Pencil className="size-5" /> Edit Template</>
                )}
              </DialogTitle>
              <DialogDescription>
                {isCreating
                  ? 'Buat template dokumen baru dengan placeholder yang akan diganti otomatis'
                  : 'Perbarui konten dan pengaturan template'}
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Form */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nama Template</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Contoh: Surat Permohonan Aula"
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tipe Template</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(v) => setEditForm((p) => ({ ...p, type: v }))}
                      >
                        <SelectTrigger className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="surat_permohonan">Surat Permohonan</SelectItem>
                          <SelectItem value="surat_persetujuan">Surat Persetujuan</SelectItem>
                          <SelectItem value="surat_keterangan">Surat Keterangan</SelectItem>
                          <SelectItem value="undangan">Undangan</SelectItem>
                          <SelectItem value="custom">Kustom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Deskripsi (opsional)</Label>
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Deskripsi singkat template"
                      className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Konten Template (HTML)</Label>
                    <Textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
                      className="font-mono text-xs min-h-[320px] focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 bg-white/80"
                      placeholder="Tulis konten template HTML di sini..."
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editForm.isDefault}
                        onCheckedChange={(v) => setEditForm((p) => ({ ...p, isDefault: v }))}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <Label className="text-sm font-medium">Jadikan Default</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editForm.isActive}
                        onCheckedChange={(v) => setEditForm((p) => ({ ...p, isActive: v }))}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <Label className="text-sm font-medium">Aktif</Label>
                    </div>
                  </div>
                </div>

                {/* Right: Placeholder Reference */}
                <div className="space-y-3">
                  <div className="sticky top-0">
                    <h4 className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5 mb-2">
                      <BookOpen className="size-4" />
                      Placeholder Tersedia
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Klik placeholder untuk menambahkannya ke konten
                    </p>
                    <ScrollArea className="h-[400px] rounded-lg border border-emerald-200/60 bg-white/50 p-2">
                      <div className="space-y-1">
                        {PLACEHOLDER_LIST.map((ph) => (
                          <button
                            key={ph.key}
                            onClick={() => insertPlaceholder(ph.key)}
                            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-emerald-50 transition-colors group"
                          >
                            <code className="text-[11px] font-mono text-emerald-700 group-hover:text-emerald-900">{ph.key}</code>
                            <p className="text-[10px] text-muted-foreground">{ph.desc}</p>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-emerald-200"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="btn-modern bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                {isCreating ? 'Buat Template' : 'Simpan Perubahan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="glass max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-emerald-800 flex items-center gap-2">
                  <Eye className="size-5" />
                  Preview: {previewTitle}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewDialogOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <DialogDescription>
                Preview template dengan data contoh
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-4">
              <DocumentPreview html={previewHtml} title={previewTitle} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="glass">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Template?</AlertDialogTitle>
              <AlertDialogDescription>
                Template &ldquo;{deleteTarget?.name}&rdquo; akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
