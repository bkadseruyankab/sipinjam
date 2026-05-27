'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { invalidateIdentityCache } from '@/hooks/useIdentity'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import ImageUploader from '@/components/ImageUploader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Loader2,
  Settings as SettingsIcon,
  Scale,
  Building2,
  Car,
  Save,
  Bell,
  MessageCircle,
  Mail,
  Image as ImageIcon,
  Globe,
  Truck,
  Send,
  Shield,
  Info,
  Sparkles,
  FileText,
  Phone,
  Server,
  Palette,
  MapPin,
  Copyright,
  Type,
  Heading,
  PenLine,
  Key,
  Lock,
  Rocket,
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  Users,
  Coffee,
  Snowflake,
  Volume2,
  Monitor,
  Wifi,
  Video,
  Printer,
  CreditCard,
  List,
  type LucideIcon,
} from 'lucide-react'

interface SettingsForm {
  // Identitas Aplikasi
  site_name: string
  site_url: string
  site_tagline: string
  site_description: string
  site_address: string
  site_phone: string
  site_email: string
  site_copyright: string
  hero_title: string
  hero_subtitle: string
  hero_badge_text: string
  hero_cta_aula: string
  hero_cta_kendaraan: string
  footer_description: string
  footer_layanan_title: string
  footer_kontak_title: string
  // Peraturan Daerah
  perda_title: string
  perda_description: string
  perda_full: string
  // Tarif Aula
  tarif_aula_title: string
  tarif_aula_pemerintah_siang: string
  tarif_aula_pemerintah_malam: string
  tarif_aula_umum_siang: string
  tarif_aula_umum_malam: string
  tarif_aula_pemerintah_label: string
  tarif_aula_umum_label: string
  tarif_aula_note: string
  // Tarif Kendaraan
  tarif_kendaraan_medium_pelajar: string
  tarif_kendaraan_medium_komersil: string
  tarif_kendaraan_mini_pelajar: string
  tarif_kendaraan_mini_komersil: string
  tarif_kendaraan_sopir: string
  // Agreement text
  tarif_agreement_text: string
  // Notifications - Basic
  fonnte_token: string
  fonnte_enabled: string
  email_enabled: string
  admin_phone: string
  admin_email: string
  // SMTP Email settings
  smtp_host: string
  smtp_port: string
  smtp_user: string
  smtp_pass: string
  smtp_from: string
  smtp_secure: string
  // WhatsApp message templates
  wa_template_new: string
  wa_template_approved: string
  wa_template_rejected: string
  wa_template_cancel_requested: string
  wa_template_cancelled: string
  // Email message templates
  email_template_new: string
  email_template_approved: string
  email_template_rejected: string
  email_template_cancel_requested: string
  email_template_cancelled: string
  email_subject_new: string
  email_subject_approved: string
  email_subject_rejected: string
  email_subject_cancel_requested: string
  email_subject_cancelled: string
  // Images
  site_logo: string
  site_favicon: string
  aula_image: string
  aula_gallery: string // JSON array of image URLs
  fasilitas_aula_images: string // JSON array of image URLs
  hero_image: string
  // KOP / Letterhead
  kop_nama_instansi: string
  kop_kabupaten: string
  kop_alamat: string
  kop_telepon: string
  kop_email: string
  kop_website: string
  kop_logo: string
  // BKAD Signatory / Penandatangan
  penandatangan_nama: string
  penandatangan_jabatan: string
  penandatangan_nip: string
  penandatangan_foto_ttd: string
  // Template Cetak / Print Template
  template_primary_color: string
  template_font_family: string
  template_font_size: string
  template_kop_line_style: string
  template_paper_size: string
  template_margin_top: string
  template_margin_bottom: string
  template_margin_left: string
  template_margin_right: string
  template_show_kop_logo: string
  template_show_footer: string
  template_footer_text: string
  // Payment settings
  payment_bank_name: string
  payment_bank_account: string
  payment_account_holder: string
  payment_qris_merchant: string
  payment_instructions: string
  payment_auto_confirm: string
  payment_deadline_days: string
  // Google OAuth settings
  google_client_id: string
  google_client_secret: string
  nextauth_secret: string
  google_oauth_enabled: string
}

const defaultSettings: SettingsForm = {
  // Identity defaults
  site_name: 'E-Pakar',
  site_url: '',
  site_tagline: 'Sistem Peminjaman Elektronik Aula dan Kendaraan Roda 4 dan 6',
  site_description: 'Sistem peminjaman yang efisien, transparan, dan mudah diakses. Ajukan peminjaman aula dan kendaraan secara online dengan proses yang cepat dan terintegrasi.',
  site_address: 'Jl. Merdeka No. 1, Kelurahan Sukajadi,\nKecamatan Bandung Wetan,\nKota Bandung, Jawa Barat 40116',
  site_phone: '(022) 4235050',
  site_email: 'epakar@bandung.go.id',
  site_copyright: '© 2025 E-Pakar. Hak Cipta Dilindungi.',
  hero_title: 'Aplikasi Elektronik Peminjaman Aula dan Kendaraan Roda 4 dan 6',
  hero_subtitle: 'Sistem peminjaman yang efisien, transparan, dan mudah diakses. Ajukan peminjaman aula dan kendaraan secara online dengan proses yang cepat dan terintegrasi.',
  hero_badge_text: 'Sistem Peminjaman Online',
  hero_cta_aula: 'Pinjam Aula',
  hero_cta_kendaraan: 'Pinjam Kendaraan',
  footer_description: 'Sistem Peminjaman Elektronik Aula dan Kendaraan Roda 4 dan 6. Platform resmi untuk pengajuan peminjaman secara online yang efisien, transparan, dan mudah diakses.',
  footer_layanan_title: 'Layanan',
  footer_kontak_title: 'Kontak Kami',
  perda_title: 'Perda Kab. Seruyan No. 10 Tahun 2025',
  perda_description: 'Tarif resmi berdasarkan Perubahan Perda No. 1 Tahun 2024 tentang Pajak dan Retribusi Daerah',
  perda_full: 'Peraturan Daerah Kabupaten Seruyan Nomor 10 Tahun 2025 tentang Perubahan Perda No. 1 Tahun 2024 tentang Pajak dan Retribusi Daerah',
  tarif_aula_title: 'Aula + Sound System + Videotron',
  tarif_aula_pemerintah_siang: '1000000',
  tarif_aula_pemerintah_malam: '1500000',
  tarif_aula_umum_siang: '1500000',
  tarif_aula_umum_malam: '2000000',
  tarif_aula_pemerintah_label: 'Kegiatan Pemerintah & Organisasi',
  tarif_aula_umum_label: 'Keperluan Umum & Komersil',
  tarif_aula_note: 'Jasa & kebersihan ditanggung penyewa',
  tarif_kendaraan_medium_pelajar: '500000',
  tarif_kendaraan_medium_komersil: '1000000',
  tarif_kendaraan_mini_pelajar: '500000',
  tarif_kendaraan_mini_komersil: '750000',
  tarif_kendaraan_sopir: '200000',
  tarif_agreement_text: 'Saya telah membaca dan menyetujui ketentuan tarif retribusi berdasarkan Perda Kab. Seruyan No. 10 Tahun 2025 dan bersedia membayar sesuai tarif yang berlaku.',
  // Notification defaults
  fonnte_token: '',
  fonnte_enabled: 'false',
  email_enabled: 'true',
  admin_phone: '',
  admin_email: '',
  // SMTP defaults
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_pass: '',
  smtp_from: '',
  smtp_secure: 'true',
  // WhatsApp template defaults
  wa_template_new: '🔔 *Peminjaman Baru*\n\nNama: {nama}\nKegiatan: {kegiatan}\nTipe: {tipe}\nTanggal: {tanggal}\n\nSilakan cek dashboard admin untuk memproses.',
  wa_template_approved: '✅ *Peminjaman Disetujui*\n\nHalo {nama}, peminjaman Anda untuk kegiatan "{kegiatan}" pada {tanggal} telah *DISSETUJUI*. Silakan cek email untuk detail perjanjian.',
  wa_template_rejected: '❌ *Peminjaman Ditolak*\n\nHalo {nama}, peminjaman Anda untuk kegiatan "{kegiatan}" pada {tanggal} telah *DITOLAK*. {catatan}',
  wa_template_cancel_requested: '⚠️ *Permintaan Pembatalan*\n\nHalo {nama}, permintaan pembatalan Anda untuk kegiatan "{kegiatan}" pada {tanggal} telah *DIAJUKAN*. Alasan: {catatan}\n\nMenunggu persetujuan admin.',
  wa_template_cancelled: '🚫 *Peminjaman Dibatalkan*\n\nHalo {nama}, peminjaman Anda untuk kegiatan "{kegiatan}" pada {tanggal} telah *DIBATALKAN*. {catatan}',
  // Email template defaults
  email_template_new: '<h2>🔔 Peminjaman Baru</h2><p><strong>Nama:</strong> {nama}</p><p><strong>Kegiatan:</strong> {kegiatan}</p><p><strong>Tipe:</strong> {tipe}</p><p><strong>Tanggal:</strong> {tanggal}</p><p>Silakan cek dashboard admin untuk memproses.</p>',
  email_template_approved: '<h2>✅ Peminjaman Disetujui</h2><p>Halo <strong>{nama}</strong>,</p><p>Peminjaman Anda untuk kegiatan <strong>"{kegiatan}"</strong> pada {tanggal} telah <strong>DISSETUJUI</strong>.</p><p>Nomor Perjanjian: {nomor_perjanjian}</p><p>Silakan cek email untuk detail perjanjian.</p>',
  email_template_rejected: '<h2>❌ Peminjaman Ditolak</h2><p>Halo <strong>{nama}</strong>,</p><p>Peminjaman Anda untuk kegiatan <strong>"{kegiatan}"</strong> pada {tanggal} telah <strong>DITOLAK</strong>.</p><p>Catatan: {catatan}</p>',
  email_template_cancel_requested: '<h2>⚠️ Permintaan Pembatalan</h2><p>Halo <strong>{nama}</strong>,</p><p>Permintaan pembatalan Anda untuk kegiatan <strong>"{kegiatan}"</strong> pada {tanggal} telah <strong>DIAJUKAN</strong>.</p><p>Alasan: {catatan}</p><p>Menunggu persetujuan admin.</p>',
  email_template_cancelled: '<h2>🚫 Peminjaman Dibatalkan</h2><p>Halo <strong>{nama}</strong>,</p><p>Peminjaman Anda untuk kegiatan <strong>"{kegiatan}"</strong> pada {tanggal} telah <strong>DIBATALKAN</strong>.</p><p>Catatan: {catatan}</p>',
  email_subject_new: 'Peminjaman Baru - {kegiatan}',
  email_subject_approved: 'Peminjaman Disetujui - {kegiatan}',
  email_subject_rejected: 'Peminjaman Ditolak - {kegiatan}',
  email_subject_cancel_requested: 'Permintaan Pembatalan - {kegiatan}',
  email_subject_cancelled: 'Peminjaman Dibatalkan - {kegiatan}',
  // Images defaults
  site_logo: '',
  site_favicon: '',
  aula_image: '',
  aula_gallery: '[]',
  fasilitas_aula_images: '[]',
  hero_image: '',
  // KOP / Letterhead defaults
  kop_nama_instansi: 'Badan Keuangan dan Aset Daerah',
  kop_kabupaten: 'Kabupaten Seruyan',
  kop_alamat: 'Kantor BKAD Kabupaten Seruyan',
  kop_telepon: '',
  kop_email: '',
  kop_website: '',
  kop_logo: '',
  // BKAD Signatory defaults
  penandatangan_nama: '',
  penandatangan_jabatan: 'Kepala BKAD',
  penandatangan_nip: '',
  penandatangan_foto_ttd: '',
  // Template Cetak defaults
  template_primary_color: '#065f46',
  template_font_family: 'Times New Roman',
  template_font_size: '12',
  template_kop_line_style: 'double',
  template_paper_size: 'A4',
  template_margin_top: '15',
  template_margin_bottom: '15',
  template_margin_left: '15',
  template_margin_right: '15',
  template_show_kop_logo: 'true',
  template_show_footer: 'true',
  template_footer_text: '',
  // Payment defaults
  payment_bank_name: 'Bank BRI',
  payment_bank_account: '0012 3456 7890',
  payment_account_holder: 'BKAD Kab. Seruyan',
  payment_qris_merchant: '',
  payment_instructions: 'Silakan lakukan pembayaran sesuai metode yang dipilih. Untuk transfer manual, upload bukti transfer setelah pembayaran berhasil.',
  payment_auto_confirm: 'false',
  payment_deadline_days: '3',
  // Google OAuth defaults
  google_client_id: '',
  google_client_secret: '',
  nextauth_secret: '',
  google_oauth_enabled: 'false',
}

// Default identity values for display when settings are empty
export const DEFAULT_IDENTITY = {
  site_name: defaultSettings.site_name,
  site_tagline: defaultSettings.site_tagline,
  site_description: defaultSettings.site_description,
  site_address: defaultSettings.site_address,
  site_phone: defaultSettings.site_phone,
  site_email: defaultSettings.site_email,
  site_copyright: defaultSettings.site_copyright,
  hero_title: defaultSettings.hero_title,
  hero_subtitle: defaultSettings.hero_subtitle,
  hero_badge_text: defaultSettings.hero_badge_text,
  hero_cta_aula: defaultSettings.hero_cta_aula,
  hero_cta_kendaraan: defaultSettings.hero_cta_kendaraan,
  footer_description: defaultSettings.footer_description,
  footer_layanan_title: defaultSettings.footer_layanan_title,
  footer_kontak_title: defaultSettings.footer_kontak_title,
}

function formatRupiahPreview(numStr: string): string {
  const num = parseInt(numStr)
  if (isNaN(num)) return '-'
  return `Rp ${num.toLocaleString('id-ID')}`
}

// Gallery image manager component
function GalleryManager({ 
  value, 
  onChange, 
  category,
  label 
}: { 
  value: string
  onChange: (val: string) => void
  category: string
  label: string
}) {
  const images: string[] = (() => {
    try { return JSON.parse(value || '[]') } catch { return [] }
  })()

  const addImage = (url: string) => {
    const updated = [...images, url]
    onChange(JSON.stringify(updated))
  }

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(JSON.stringify(updated))
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <div className="h-20 w-20 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50">
                <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <ImageUploader
        value=""
        onChange={addImage}
        category={category}
        label=""
        hint="Upload gambar untuk ditambahkan ke galeri"
        previewClassName="h-20 w-20"
      />
    </div>
  )
}

function TemplateDokumenSummary() {
  const store = useAppStore()
  const setTemplateManagerOpen = store?.setTemplateManagerOpen
  const [templateCount, setTemplateCount] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/templates')
        if (res.ok) {
          const data = await res.json()
          const templates = data.templates || []
          const count: Record<string, number> = {}
          for (const t of templates) {
            count[t.type] = (count[t.type] || 0) + 1
          }
          count['total'] = templates.length
          setTemplateCount(count)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  const refreshCounts = async () => {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json()
        const templates = data.templates || []
        const count: Record<string, number> = {}
        for (const t of templates) {
          count[t.type] = (count[t.type] || 0) + 1
        }
        count['total'] = templates.length
        setTemplateCount(count)
      }
    } catch {
      // ignore
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/templates/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        await refreshCounts()
      } else {
        toast.error(data.error || 'Gagal meng-seed template')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSeeding(false)
    }
  }

  const handleOpenManager = () => {
    if (typeof setTemplateManagerOpen === 'function') {
      setTemplateManagerOpen(true)
    } else {
      // Fallback: refresh page to pick up new store
      toast.info('Memuat ulang untuk membuka Template Manager...')
      setTimeout(() => window.location.reload(), 500)
    }
  }

  const typeLabels: Record<string, { label: string; color: string }> = {
    surat_permohonan: { label: 'Surat Permohonan', color: 'text-emerald-700 bg-emerald-100' },
    surat_persetujuan: { label: 'Surat Persetujuan', color: 'text-teal-700 bg-teal-100' },
    surat_keterangan: { label: 'Surat Keterangan', color: 'text-amber-700 bg-amber-100' },
    undangan: { label: 'Undangan', color: 'text-purple-700 bg-purple-100' },
    custom: { label: 'Kustom', color: 'text-gray-700 bg-gray-100' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-emerald-600" />
        <span className="ml-2 text-sm text-muted-foreground">Memuat ringkasan template...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-800">
            {templateCount.total || 0} template tersedia
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola template surat permohonan, persetujuan, keterangan, dan undangan
          </p>
        </div>
        <Button
          onClick={handleOpenManager}
          className="btn-modern bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
        >
          <Plus className="size-4" />
          Buka Template Manager
        </Button>
      </div>

      {/* Type summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(typeLabels).map(([type, conf]) => (
          <div key={type} className="flex items-center gap-2 p-3 rounded-lg border border-emerald-200/60 bg-white/50">
            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${conf.color}`}>
              {conf.label}
            </span>
            <span className="text-lg font-bold text-emerald-800">{templateCount[type] || 0}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleSeed}
          disabled={seeding}
          variant="outline"
          size="sm"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          {seeding ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Seed Default Template
        </Button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, setCurrentView } = useAppStore()
  const [form, setForm] = useState<SettingsForm>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingWhatsApp, setTestingWhatsApp] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [activeTab, setActiveTab] = useState<'identitas' | 'perda' | 'tarif-aula' | 'tarif-kendaraan' | 'images' | 'notifications' | 'agreement' | 'kop' | 'penandatangan' | 'fasilitas' | 'template' | 'template-dokumen' | 'oauth' | 'payment'>('identitas')

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          const settings = data.settings || {}
          setForm({
            // Identity settings
            site_name: settings.site_name || defaultSettings.site_name,
            site_url: settings.site_url || defaultSettings.site_url,
            site_tagline: settings.site_tagline || defaultSettings.site_tagline,
            site_description: settings.site_description || defaultSettings.site_description,
            site_address: settings.site_address || defaultSettings.site_address,
            site_phone: settings.site_phone || defaultSettings.site_phone,
            site_email: settings.site_email || defaultSettings.site_email,
            site_copyright: settings.site_copyright || defaultSettings.site_copyright,
            hero_title: settings.hero_title || defaultSettings.hero_title,
            hero_subtitle: settings.hero_subtitle || defaultSettings.hero_subtitle,
            hero_badge_text: settings.hero_badge_text || defaultSettings.hero_badge_text,
            hero_cta_aula: settings.hero_cta_aula || defaultSettings.hero_cta_aula,
            hero_cta_kendaraan: settings.hero_cta_kendaraan || defaultSettings.hero_cta_kendaraan,
            footer_description: settings.footer_description || defaultSettings.footer_description,
            footer_layanan_title: settings.footer_layanan_title || defaultSettings.footer_layanan_title,
            footer_kontak_title: settings.footer_kontak_title || defaultSettings.footer_kontak_title,
            perda_title: settings.perda_title || defaultSettings.perda_title,
            perda_description: settings.perda_description || defaultSettings.perda_description,
            perda_full: settings.perda_full || defaultSettings.perda_full,
            tarif_aula_title: settings.tarif_aula_title || defaultSettings.tarif_aula_title,
            tarif_aula_pemerintah_siang: settings.tarif_aula_pemerintah_siang || defaultSettings.tarif_aula_pemerintah_siang,
            tarif_aula_pemerintah_malam: settings.tarif_aula_pemerintah_malam || defaultSettings.tarif_aula_pemerintah_malam,
            tarif_aula_umum_siang: settings.tarif_aula_umum_siang || defaultSettings.tarif_aula_umum_siang,
            tarif_aula_umum_malam: settings.tarif_aula_umum_malam || defaultSettings.tarif_aula_umum_malam,
            tarif_aula_pemerintah_label: settings.tarif_aula_pemerintah_label || defaultSettings.tarif_aula_pemerintah_label,
            tarif_aula_umum_label: settings.tarif_aula_umum_label || defaultSettings.tarif_aula_umum_label,
            tarif_aula_note: settings.tarif_aula_note || defaultSettings.tarif_aula_note,
            tarif_kendaraan_medium_pelajar: settings.tarif_kendaraan_medium_pelajar || defaultSettings.tarif_kendaraan_medium_pelajar,
            tarif_kendaraan_medium_komersil: settings.tarif_kendaraan_medium_komersil || defaultSettings.tarif_kendaraan_medium_komersil,
            tarif_kendaraan_mini_pelajar: settings.tarif_kendaraan_mini_pelajar || defaultSettings.tarif_kendaraan_mini_pelajar,
            tarif_kendaraan_mini_komersil: settings.tarif_kendaraan_mini_komersil || defaultSettings.tarif_kendaraan_mini_komersil,
            tarif_kendaraan_sopir: settings.tarif_kendaraan_sopir || defaultSettings.tarif_kendaraan_sopir,
            tarif_agreement_text: settings.tarif_agreement_text || defaultSettings.tarif_agreement_text,
            // Notification settings
            fonnte_token: settings.fonnte_token || defaultSettings.fonnte_token,
            fonnte_enabled: settings.fonnte_enabled || defaultSettings.fonnte_enabled,
            email_enabled: settings.email_enabled || defaultSettings.email_enabled,
            admin_phone: settings.admin_phone || defaultSettings.admin_phone,
            admin_email: settings.admin_email || defaultSettings.admin_email,
            // SMTP settings
            smtp_host: settings.smtp_host || defaultSettings.smtp_host,
            smtp_port: settings.smtp_port || defaultSettings.smtp_port,
            smtp_user: settings.smtp_user || defaultSettings.smtp_user,
            smtp_pass: settings.smtp_pass || defaultSettings.smtp_pass,
            smtp_from: settings.smtp_from || defaultSettings.smtp_from,
            smtp_secure: settings.smtp_secure || defaultSettings.smtp_secure,
            // WhatsApp templates
            wa_template_new: settings.wa_template_new || defaultSettings.wa_template_new,
            wa_template_approved: settings.wa_template_approved || defaultSettings.wa_template_approved,
            wa_template_rejected: settings.wa_template_rejected || defaultSettings.wa_template_rejected,
            wa_template_cancel_requested: settings.wa_template_cancel_requested || defaultSettings.wa_template_cancel_requested,
            wa_template_cancelled: settings.wa_template_cancelled || defaultSettings.wa_template_cancelled,
            // Email templates
            email_template_new: settings.email_template_new || defaultSettings.email_template_new,
            email_template_approved: settings.email_template_approved || defaultSettings.email_template_approved,
            email_template_rejected: settings.email_template_rejected || defaultSettings.email_template_rejected,
            email_template_cancel_requested: settings.email_template_cancel_requested || defaultSettings.email_template_cancel_requested,
            email_template_cancelled: settings.email_template_cancelled || defaultSettings.email_template_cancelled,
            email_subject_new: settings.email_subject_new || defaultSettings.email_subject_new,
            email_subject_approved: settings.email_subject_approved || defaultSettings.email_subject_approved,
            email_subject_rejected: settings.email_subject_rejected || defaultSettings.email_subject_rejected,
            email_subject_cancel_requested: settings.email_subject_cancel_requested || defaultSettings.email_subject_cancel_requested,
            email_subject_cancelled: settings.email_subject_cancelled || defaultSettings.email_subject_cancelled,
            // Images
            site_logo: settings.site_logo || defaultSettings.site_logo,
            site_favicon: settings.site_favicon || defaultSettings.site_favicon,
            aula_image: settings.aula_image || defaultSettings.aula_image,
            aula_gallery: settings.aula_gallery || defaultSettings.aula_gallery,
            fasilitas_aula_images: settings.fasilitas_aula_images || defaultSettings.fasilitas_aula_images,
            hero_image: settings.hero_image || defaultSettings.hero_image,
            // KOP / Letterhead
            kop_nama_instansi: settings.kop_nama_instansi || defaultSettings.kop_nama_instansi,
            kop_kabupaten: settings.kop_kabupaten || defaultSettings.kop_kabupaten,
            kop_alamat: settings.kop_alamat || defaultSettings.kop_alamat,
            kop_telepon: settings.kop_telepon || defaultSettings.kop_telepon,
            kop_email: settings.kop_email || defaultSettings.kop_email,
            kop_website: settings.kop_website || defaultSettings.kop_website,
            kop_logo: settings.kop_logo || defaultSettings.kop_logo,
            // BKAD Signatory
            penandatangan_nama: settings.penandatangan_nama || defaultSettings.penandatangan_nama,
            penandatangan_jabatan: settings.penandatangan_jabatan || defaultSettings.penandatangan_jabatan,
            penandatangan_nip: settings.penandatangan_nip || defaultSettings.penandatangan_nip,
            penandatangan_foto_ttd: settings.penandatangan_foto_ttd || defaultSettings.penandatangan_foto_ttd,
            // Template Cetak
            template_primary_color: settings.template_primary_color || defaultSettings.template_primary_color,
            template_font_family: settings.template_font_family || defaultSettings.template_font_family,
            template_font_size: settings.template_font_size || defaultSettings.template_font_size,
            template_kop_line_style: settings.template_kop_line_style || defaultSettings.template_kop_line_style,
            template_paper_size: settings.template_paper_size || defaultSettings.template_paper_size,
            template_margin_top: settings.template_margin_top || defaultSettings.template_margin_top,
            template_margin_bottom: settings.template_margin_bottom || defaultSettings.template_margin_bottom,
            template_margin_left: settings.template_margin_left || defaultSettings.template_margin_left,
            template_margin_right: settings.template_margin_right || defaultSettings.template_margin_right,
            template_show_kop_logo: settings.template_show_kop_logo || defaultSettings.template_show_kop_logo,
            template_show_footer: settings.template_show_footer || defaultSettings.template_show_footer,
            template_footer_text: settings.template_footer_text || defaultSettings.template_footer_text,
            // Payment settings
            payment_bank_name: settings.payment_bank_name || defaultSettings.payment_bank_name,
            payment_bank_account: settings.payment_bank_account || defaultSettings.payment_bank_account,
            payment_account_holder: settings.payment_account_holder || defaultSettings.payment_account_holder,
            payment_qris_merchant: settings.payment_qris_merchant || defaultSettings.payment_qris_merchant,
            payment_instructions: settings.payment_instructions || defaultSettings.payment_instructions,
            payment_auto_confirm: settings.payment_auto_confirm || defaultSettings.payment_auto_confirm,
            payment_deadline_days: settings.payment_deadline_days || defaultSettings.payment_deadline_days,
            // Google OAuth settings
            google_client_id: settings.google_client_id || defaultSettings.google_client_id,
            google_client_secret: settings.google_client_secret || defaultSettings.google_client_secret,
            nextauth_secret: settings.nextauth_secret || defaultSettings.nextauth_secret,
            google_oauth_enabled: settings.google_oauth_enabled || defaultSettings.google_oauth_enabled,
          })
        }
      } catch {
        toast.error('Gagal memuat pengaturan')
      } finally {
        setLoading(false)
      }
    }
    if (isAdmin) fetchSettings()
    else setLoading(false)
  }, [isAdmin])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: form }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Pengaturan berhasil disimpan')
        invalidateIdentityCache()
      } else {
        const errorMsg = data.error || 'Gagal menyimpan pengaturan'
        const detail = data.detail ? ` (${data.detail})` : ''
        toast.error(errorMsg + detail, { duration: 6000 })
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan'
      toast.error('Gagal menyimpan: ' + errMsg, { duration: 6000 })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: keyof SettingsForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleTestWhatsApp = async () => {
    if (!form.admin_phone) {
      toast.error('Isi nomor WhatsApp admin terlebih dahulu')
      return
    }
    if (!form.fonnte_token) {
      toast.error('Isi Fonnte API Token terlebih dahulu')
      return
    }
    setTestingWhatsApp(true)
    try {
      const testMessage = form.wa_template_new
        .replace('{nama}', 'John Doe')
        .replace('{kegiatan}', 'Rapat Koordinasi')
        .replace('{tipe}', 'Aula')
        .replace('{tanggal}', '15 Maret 2026')
        .replace('{catatan}', '-')
        .replace('{nomor_perjanjian}', 'SPK-001/2026')
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'whatsapp',
          to: form.admin_phone,
          message: testMessage,
        }),
      })
      const data = await res.json()
      if (res.ok && data.results?.whatsapp?.success) {
        toast.success('Notifikasi WhatsApp berhasil dikirim!')
      } else {
        toast.error(data.results?.whatsapp?.error || data.error || 'Gagal mengirim notifikasi WhatsApp')
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengirim test WhatsApp')
    } finally {
      setTestingWhatsApp(false)
    }
  }

  const handleTestEmail = async () => {
    if (!form.admin_email) {
      toast.error('Isi email admin terlebih dahulu')
      return
    }
    if (!form.smtp_host) {
      toast.error('Isi SMTP Host terlebih dahulu')
      return
    }
    setTestingEmail(true)
    try {
      const testMessage = form.email_template_new
        .replace('{nama}', 'John Doe')
        .replace('{kegiatan}', 'Rapat Koordinasi')
        .replace('{tipe}', 'Aula')
        .replace('{tanggal}', '15 Maret 2026')
        .replace('{catatan}', '-')
        .replace('{nomor_perjanjian}', 'SPK-001/2026')
      const testSubject = form.email_subject_new
        .replace('{kegiatan}', 'Rapat Koordinasi')
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          to: form.admin_email,
          subject: `[Test] ${testSubject}`,
          message: testMessage,
        }),
      })
      const data = await res.json()
      if (res.ok && data.results?.email?.success) {
        toast.success('Notifikasi email berhasil dikirim!')
      } else {
        toast.error(data.results?.email?.error || data.error || 'Gagal mengirim notifikasi email')
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengirim test email')
    } finally {
      setTestingEmail(false)
    }
  }

  type TabId = 'identitas' | 'perda' | 'tarif-aula' | 'tarif-kendaraan' | 'images' | 'notifications' | 'agreement' | 'kop' | 'penandatangan' | 'fasilitas' | 'template' | 'template-dokumen' | 'oauth' | 'payment'

  // Status indicator: green = configured, yellow = partial, gray = not configured
  const getTabStatus = (tabId: TabId): 'configured' | 'partial' | 'empty' => {
    switch (tabId) {
      case 'identitas': {
        const filled = [form.site_name, form.site_tagline, form.site_email, form.site_phone].filter(Boolean).length
        if (filled >= 4) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'kop': {
        const filled = [form.kop_nama_instansi, form.kop_kabupaten, form.kop_alamat].filter(Boolean).length
        if (filled >= 3) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'penandatangan': {
        const filled = [form.penandatangan_nama, form.penandatangan_jabatan, form.penandatangan_nip].filter(Boolean).length
        if (filled >= 3) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'perda': {
        const filled = [form.perda_title, form.perda_description, form.perda_full].filter(Boolean).length
        if (filled >= 3) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'tarif-aula': {
        const filled = [form.tarif_aula_title, form.tarif_aula_pemerintah_siang, form.tarif_aula_umum_siang].filter(Boolean).length
        if (filled >= 3) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'tarif-kendaraan': {
        const filled = [form.tarif_kendaraan_medium_pelajar, form.tarif_kendaraan_mini_pelajar, form.tarif_kendaraan_sopir].filter(Boolean).length
        if (filled >= 3) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'payment': {
        const filled = [form.payment_bank_name, form.payment_bank_account, form.payment_account_holder].filter(Boolean).length
        if (filled >= 3) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'agreement': {
        if (form.tarif_agreement_text) return 'configured'
        return 'empty'
      }
      case 'fasilitas': return 'configured'
      case 'images': {
        const filled = [form.site_logo, form.aula_image, form.hero_image].filter(Boolean).length
        if (filled >= 3) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'oauth': {
        if (form.google_client_id && form.google_client_secret && form.nextauth_secret) return 'configured'
        if (form.google_client_id || form.google_client_secret) return 'partial'
        return 'empty'
      }
      case 'notifications': {
        const waOk = form.fonnte_token && form.fonnte_enabled === 'true'
        const emailOk = form.smtp_host && form.email_enabled === 'true'
        if (waOk && emailOk) return 'configured'
        if (waOk || emailOk || form.admin_phone || form.admin_email) return 'partial'
        return 'empty'
      }
      case 'template': {
        const filled = [form.template_primary_color, form.template_font_family, form.template_paper_size].filter(Boolean).length
        if (filled >= 3) return 'configured'
        if (filled > 0) return 'partial'
        return 'empty'
      }
      case 'template-dokumen': return 'configured'
      default: return 'empty'
    }
  }

  const statusDotClass = (status: 'configured' | 'partial' | 'empty') => {
    switch (status) {
      case 'configured': return 'bg-emerald-500'
      case 'partial': return 'bg-amber-400'
      case 'empty': return 'bg-gray-300'
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-4">
            <SettingsIcon className="size-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Akses Terbatas</p>
          <p className="text-sm text-gray-500 mt-1">Halaman ini hanya untuk administrator</p>
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

  // All tabs in a flat list for the sidebar
  const allTabs: { id: TabId; label: string; icon: LucideIcon; group?: string }[] = [
    { id: 'identitas', label: 'Identitas', icon: Palette, group: 'Umum' },
    { id: 'kop', label: 'Kop Surat', icon: FileText, group: 'Umum' },
    { id: 'penandatangan', label: 'Penandatangan', icon: PenLine, group: 'Umum' },
    { id: 'perda', label: 'Peraturan Daerah', icon: Scale, group: 'Tarif & Peraturan' },
    { id: 'tarif-aula', label: 'Tarif Aula', icon: Building2, group: 'Tarif & Peraturan' },
    { id: 'tarif-kendaraan', label: 'Tarif Kendaraan', icon: Car, group: 'Tarif & Peraturan' },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard, group: 'Tarif & Peraturan' },
    { id: 'agreement', label: 'Persetujuan', icon: Scale, group: 'Tarif & Peraturan' },
    { id: 'fasilitas', label: 'Fasilitas Aula', icon: LayoutGrid, group: 'Fasilitas' },
    { id: 'images', label: 'Gambar', icon: ImageIcon, group: 'Fasilitas' },
    { id: 'notifications', label: 'Notifikasi', icon: Bell, group: 'Notifikasi' },
    { id: 'oauth', label: 'Google OAuth', icon: Lock, group: 'Keamanan' },
    { id: 'template', label: 'Template Cetak', icon: Printer, group: 'Template' },
    { id: 'template-dokumen', label: 'Template Dokumen', icon: FileText, group: 'Template' },
  ]

  // Group tabs by group for rendering dividers
  const groupedTabs: { group: string; tabs: typeof allTabs }[] = []
  for (const tab of allTabs) {
    const lastGroup = groupedTabs[groupedTabs.length - 1]
    if (lastGroup && lastGroup.group === tab.group) {
      lastGroup.tabs.push(tab)
    } else {
      groupedTabs.push({ group: tab.group || '', tabs: [tab] })
    }
  }

  // Find current tab info for mobile header
  const currentTabInfo = allTabs.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('admin-dashboard')}
            className="mb-3 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 -ml-2"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <SettingsIcon className="size-5" />
            </div>
            Pengaturan
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-12">
            Kelola konfigurasi aplikasi Anda
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-500">Memuat pengaturan...</span>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar - Modern & Clean */}
            <aside className="hidden lg:block w-60 shrink-0">
              <nav className="sticky top-6 rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2">
                    Navigasi
                  </h2>
                </div>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                  <div className="p-2">
                    {groupedTabs.map((group, groupIdx) => (
                      <div key={group.group}>
                        {groupIdx > 0 && (
                          <div className="mx-3 my-2 border-t border-gray-100" />
                        )}
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                          {group.group}
                        </div>
                        {group.tabs.map((tab) => {
                          const TabIcon = tab.icon
                          const status = getTabStatus(tab.id)
                          const isActive = activeTab === tab.id
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <TabIcon className={`size-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                              <span className="flex-1 text-left truncate">{tab.label}</span>
                              <span className={`size-1.5 rounded-full shrink-0 ${statusDotClass(status)}`} />
                              {tab.id === 'oauth' && form.google_oauth_enabled === 'true' && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">ON</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </nav>
            </aside>

            {/* Mobile Navigation - Clean dropdown */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center gap-3">
                <Select value={activeTab} onValueChange={(val) => setActiveTab(val as TabId)}>
                  <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-emerald-500/20">
                    <div className="flex items-center gap-2">
                      {currentTabInfo && (
                        <>
                          <currentTabInfo.icon className="size-4 text-emerald-600" />
                          <SelectValue />
                        </>
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {groupedTabs.map((group) => (
                      <SelectGroup key={group.group}>
                        <SelectLabel className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                          {group.group}
                        </SelectLabel>
                        {group.tabs.map((tab) => (
                          <SelectItem key={tab.id} value={tab.id}>
                            <div className="flex items-center gap-2">
                              <tab.icon className="size-3.5 text-gray-400" />
                              {tab.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 space-y-6">

            {/* Tab: Identitas Aplikasi */}
            {activeTab === 'identitas' && (
              <div className="space-y-6">
                {/* App Name & Tagline */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Type className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Nama & Tagline</CardTitle>
                        <CardDescription>Nama aplikasi dan deskripsi singkat yang ditampilkan di seluruh halaman</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="site_name" className="text-sm font-medium flex items-center gap-1.5">
                        <Type className="size-3.5 text-emerald-600" />
                        Nama Aplikasi
                      </Label>
                      <Input
                        id="site_name"
                        value={form.site_name}
                        onChange={(e) => updateField('site_name', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="E-Pakar"
                      />
                      <p className="text-xs text-muted-foreground">Ditampilkan di navbar, footer, judul halaman, dan seluruh aplikasi</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_url" className="text-sm font-medium flex items-center gap-1.5">
                        <Globe className="size-3.5 text-emerald-600" />
                        URL Aplikasi
                      </Label>
                      <Input
                        id="site_url"
                        value={form.site_url}
                        onChange={(e) => updateField('site_url', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="https://epakar.seruyankab.go.id"
                      />
                      <p className="text-xs text-muted-foreground">URL publik aplikasi (tanpa trailing slash). Digunakan untuk link reset password, link testimoni, dll. Jika kosong, akan menggunakan domain server.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_tagline" className="text-sm font-medium flex items-center gap-1.5">
                        <PenLine className="size-3.5 text-emerald-600" />
                        Tagline / Slogan
                      </Label>
                      <Input
                        id="site_tagline"
                        value={form.site_tagline}
                        onChange={(e) => updateField('site_tagline', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Sistem Peminjaman Elektronik Aula dan Kendaraan"
                      />
                      <p className="text-xs text-muted-foreground">Kalimat pendek di bawah nama aplikasi</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_description" className="text-sm font-medium flex items-center gap-1.5">
                        <Info className="size-3.5 text-emerald-600" />
                        Deskripsi Aplikasi
                      </Label>
                      <Textarea
                        id="site_description"
                        value={form.site_description}
                        onChange={(e) => updateField('site_description', e.target.value)}
                        className="min-h-20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Deskripsi lengkap tentang aplikasi Anda"
                      />
                      <p className="text-xs text-muted-foreground">Ditampilkan di hero section dan bagian tentang aplikasi</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Hero Section Settings */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                        <Heading className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Hero / Halaman Utama</CardTitle>
                        <CardDescription>Kustomisasi tampilan bagian atas halaman utama</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero_badge_text" className="text-sm font-medium flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-amber-600" />
                        Teks Badge Hero
                      </Label>
                      <Input
                        id="hero_badge_text"
                        value={form.hero_badge_text}
                        onChange={(e) => updateField('hero_badge_text', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Sistem Peminjaman Online"
                      />
                      <p className="text-xs text-muted-foreground">Teks kecil di badge atas hero section</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero_title" className="text-sm font-medium flex items-center gap-1.5">
                        <Heading className="size-3.5 text-amber-600" />
                        Judul Utama Hero
                      </Label>
                      <Textarea
                        id="hero_title"
                        value={form.hero_title}
                        onChange={(e) => updateField('hero_title', e.target.value)}
                        className="min-h-20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Aplikasi Elektronik Peminjaman Aula dan Kendaraan Roda 4 dan 6"
                      />
                      <p className="text-xs text-muted-foreground">Judul besar di halaman utama</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero_subtitle" className="text-sm font-medium flex items-center gap-1.5">
                        <PenLine className="size-3.5 text-amber-600" />
                        Subtitle Hero
                      </Label>
                      <Textarea
                        id="hero_subtitle"
                        value={form.hero_subtitle}
                        onChange={(e) => updateField('hero_subtitle', e.target.value)}
                        className="min-h-16 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Sistem peminjaman yang efisien, transparan, dan mudah diakses."
                      />
                    </div>
                    <Separator className="bg-emerald-100" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="hero_cta_aula" className="text-sm font-medium flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-emerald-600" />
                          Teks Tombol Aula
                        </Label>
                        <Input
                          id="hero_cta_aula"
                          value={form.hero_cta_aula}
                          onChange={(e) => updateField('hero_cta_aula', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="Pinjam Aula"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero_cta_kendaraan" className="text-sm font-medium flex items-center gap-1.5">
                          <Car className="size-3.5 text-teal-600" />
                          Teks Tombol Kendaraan
                        </Label>
                        <Input
                          id="hero_cta_kendaraan"
                          value={form.hero_cta_kendaraan}
                          onChange={(e) => updateField('hero_cta_kendaraan', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="Pinjam Kendaraan"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Footer Settings */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 text-white">
                        <Globe className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Footer / Kaki Halaman</CardTitle>
                        <CardDescription>Kustomisasi informasi di bagian bawah halaman</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="footer_description" className="text-sm font-medium flex items-center gap-1.5">
                        <PenLine className="size-3.5 text-gray-600" />
                        Deskripsi Footer
                      </Label>
                      <Textarea
                        id="footer_description"
                        value={form.footer_description}
                        onChange={(e) => updateField('footer_description', e.target.value)}
                        className="min-h-16 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Deskripsi singkat aplikasi di footer"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="footer_layanan_title" className="text-sm font-medium">Judul Kolom Layanan</Label>
                        <Input
                          id="footer_layanan_title"
                          value={form.footer_layanan_title}
                          onChange={(e) => updateField('footer_layanan_title', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="Layanan"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer_kontak_title" className="text-sm font-medium">Judul Kolom Kontak</Label>
                        <Input
                          id="footer_kontak_title"
                          value={form.footer_kontak_title}
                          onChange={(e) => updateField('footer_kontak_title', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="Kontak Kami"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_copyright" className="text-sm font-medium flex items-center gap-1.5">
                        <Copyright className="size-3.5 text-gray-600" />
                        Teks Hak Cipta
                      </Label>
                      <Input
                        id="site_copyright"
                        value={form.site_copyright}
                        onChange={(e) => updateField('site_copyright', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="© 2025 E-Pakar. Hak Cipta Dilindungi."
                      />
                      <p className="text-xs text-muted-foreground">Ditampilkan di bagian paling bawah footer</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                        <Phone className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Informasi Kontak</CardTitle>
                        <CardDescription>Alamat, telepon, dan email yang ditampilkan di footer</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="site_address" className="text-sm font-medium flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-rose-600" />
                        Alamat Lengkap
                      </Label>
                      <Textarea
                        id="site_address"
                        value={form.site_address}
                        onChange={(e) => updateField('site_address', e.target.value)}
                        className="min-h-20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Jl. Merdeka No. 1, Kota Bandung"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="site_phone" className="text-sm font-medium flex items-center gap-1.5">
                          <Phone className="size-3.5 text-amber-600" />
                          Nomor Telepon
                        </Label>
                        <Input
                          id="site_phone"
                          value={form.site_phone}
                          onChange={(e) => updateField('site_phone', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="(022) 4235050"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site_email" className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="size-3.5 text-purple-600" />
                          Email Kontak
                        </Label>
                        <Input
                          id="site_email"
                          type="email"
                          value={form.site_email}
                          onChange={(e) => updateField('site_email', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="info@example.go.id"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview */}
                <Card className="border-dashed border-2 border-emerald-300 bg-emerald-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-emerald-600" />
                      <CardTitle className="text-emerald-800 text-base">Pratinjau Identitas</CardTitle>
                    </div>
                    <CardDescription>Gambaran tampilan identitas Anda saat ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-emerald-200 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
                      {/* Preview Navbar */}
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-100 dark:border-gray-700 bg-gradient-to-r from-white via-emerald-50/80 to-teal-50/80 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-800/80">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-[8px] font-bold">
                          {form.site_name ? form.site_name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <span className="text-sm font-bold gradient-text">{form.site_name || 'E-Pakar'}</span>
                      </div>
                      {/* Preview Hero */}
                      <div className="bg-gradient-to-br from-emerald-900/95 via-emerald-800/90 to-teal-700/85 px-4 py-5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 px-2 py-0.5 text-[8px] text-emerald-100 border border-emerald-400/30">
                          <span className="h-1 w-1 rounded-full bg-emerald-400" />
                          {form.hero_badge_text || 'Sistem Peminjaman Online'}
                        </span>
                        <p className="mt-2 text-xs font-bold text-white leading-tight line-clamp-2">{form.hero_title || 'Aplikasi Elektronik Peminjaman Aula dan Kendaraan Roda 4 dan 6'}</p>
                        <p className="mt-1 text-[8px] text-emerald-100/80 line-clamp-2">{form.hero_subtitle || 'Sistem peminjaman yang efisien, transparan, dan mudah diakses.'}</p>
                        <div className="mt-2 flex gap-1.5">
                          <span className="rounded bg-white px-2 py-0.5 text-[7px] font-semibold text-emerald-700">{form.hero_cta_aula || 'Pinjam Aula'}</span>
                          <span className="rounded bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[7px] font-semibold text-white">{form.hero_cta_kendaraan || 'Pinjam Kendaraan'}</span>
                        </div>
                      </div>
                      {/* Preview Footer */}
                      <div className="bg-gray-900 px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-[6px] font-bold">
                            {form.site_name ? form.site_name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <span className="text-[9px] font-bold gradient-text">{form.site_name || 'E-Pakar'}</span>
                        </div>
                        <p className="text-[7px] text-gray-400 line-clamp-2">{form.footer_description || 'Sistem Peminjaman Elektronik Aula dan Kendaraan Roda 4 dan 6.'}</p>
                        <div className="mt-2 border-t border-gray-800/50 pt-1">
                          <p className="text-[6px] text-gray-500 text-center">{form.site_copyright || '© 2025 E-Pakar. Hak Cipta Dilindungi.'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: KOP Surat / Letterhead */}
            {activeTab === 'kop' && (
              <div className="space-y-6">
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Kop Surat (Letterhead)</CardTitle>
                        <CardDescription>Kustomisasi header kop surat untuk perjanjian dan kwitansi</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="kop_nama_instansi" className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-emerald-600" />
                        Nama Instansi
                      </Label>
                      <Input
                        id="kop_nama_instansi"
                        value={form.kop_nama_instansi}
                        onChange={(e) => updateField('kop_nama_instansi', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Badan Keuangan dan Aset Daerah"
                      />
                      <p className="text-xs text-muted-foreground">Nama instansi yang muncul di kop surat perjanjian dan kwitansi</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kop_kabupaten" className="text-sm font-medium flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-emerald-600" />
                        Kabupaten / Kota
                      </Label>
                      <Input
                        id="kop_kabupaten"
                        value={form.kop_kabupaten}
                        onChange={(e) => updateField('kop_kabupaten', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Kabupaten Seruyan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kop_alamat" className="text-sm font-medium flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-emerald-600" />
                        Alamat Kantor
                      </Label>
                      <Textarea
                        id="kop_alamat"
                        value={form.kop_alamat}
                        onChange={(e) => updateField('kop_alamat', e.target.value)}
                        className="min-h-16 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Jl. Merdeka No. 1, Kuala Pembuang"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="kop_telepon" className="text-sm font-medium flex items-center gap-1.5">
                          <Phone className="size-3.5 text-emerald-600" />
                          Telepon
                        </Label>
                        <Input
                          id="kop_telepon"
                          value={form.kop_telepon}
                          onChange={(e) => updateField('kop_telepon', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="(0532) 123456"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kop_email" className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="size-3.5 text-emerald-600" />
                          Email
                        </Label>
                        <Input
                          id="kop_email"
                          value={form.kop_email}
                          onChange={(e) => updateField('kop_email', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="bkad@seruyankab.go.id"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kop_website" className="text-sm font-medium flex items-center gap-1.5">
                        <Globe className="size-3.5 text-emerald-600" />
                        Website
                      </Label>
                      <Input
                        id="kop_website"
                        value={form.kop_website}
                        onChange={(e) => updateField('kop_website', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="www.seruyankab.go.id"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Logo KOP */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                        <ImageIcon className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Logo Kop Surat</CardTitle>
                        <CardDescription>Logo yang ditampilkan di header kop surat perjanjian dan kwitansi</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ImageUploader
                      value={form.kop_logo}
                      onChange={(val) => updateField('kop_logo', val)}
                      category="logo"
                      label="Logo Kop Surat"
                      hint="Upload logo instansi untuk kop surat. Format: JPG, PNG. Maks 5MB"
                      previewClassName="h-24 w-24"
                    />
                    {form.kop_logo && (
                      <div className="mt-4 p-4 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/30">
                        <p className="text-xs text-muted-foreground mb-2">Pratinjau Logo di Kop Surat:</p>
                        <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-lg border">
                          <img src={form.kop_logo} alt="Logo Preview" className="h-12 object-contain" />
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: form.template_primary_color }}>Pemerintah {form.kop_kabupaten}</p>
                            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: form.template_primary_color }}>{form.kop_nama_instansi}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* KOP Preview */}
                <Card className="border-dashed border-2 border-emerald-300 bg-emerald-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-emerald-600" />
                      <CardTitle className="text-emerald-800 text-base">Pratinjau Kop Surat</CardTitle>
                    </div>
                    <CardDescription>Gambaran tampilan kop surat Anda saat ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-gray-300 bg-white p-4 text-center">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        {form.kop_logo ? (
                          <img src={form.kop_logo} alt="Logo" className="h-12 object-contain" />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Logo</div>
                        )}
                        <div>
                          <p className="text-xs uppercase tracking-wider" style={{ color: form.template_primary_color }}>Pemerintah {form.kop_kabupaten}</p>
                          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: form.template_primary_color }}>{form.kop_nama_instansi || 'Nama Instansi'}</p>
                          {form.kop_alamat && <p className="text-[10px] text-gray-500">{form.kop_alamat}</p>}
                          <div className="text-[10px] text-gray-500">
                            {[form.kop_telepon && `Telp: ${form.kop_telepon}`, form.kop_email, form.kop_website].filter(Boolean).join(' | ')}
                          </div>
                        </div>
                      </div>
                      {form.template_kop_line_style === 'double' && (
                        <>
                          <div className="w-full h-[3px]" style={{ backgroundColor: form.template_primary_color }} />
                          <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: form.template_primary_color }} />
                        </>
                      )}
                      {form.template_kop_line_style === 'thick' && (
                        <div className="w-full h-[4px]" style={{ backgroundColor: form.template_primary_color }} />
                      )}
                      {form.template_kop_line_style === 'triple' && (
                        <>
                          <div className="w-full h-[3px]" style={{ backgroundColor: form.template_primary_color }} />
                          <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: form.template_primary_color }} />
                          <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: form.template_primary_color }} />
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Penandatangan / Signatory */}
            {activeTab === 'penandatangan' && (
              <div className="space-y-6">
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <PenLine className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Penandatangan Pihak BKAD</CardTitle>
                        <CardDescription>Data pejabat penandatangan perjanjian sewa dari pihak BKAD (Pihak Pertama)</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="penandatangan_nama" className="text-sm font-medium flex items-center gap-1.5">
                        <PenLine className="size-3.5 text-emerald-600" />
                        Nama Penandatangan
                      </Label>
                      <Input
                        id="penandatangan_nama"
                        value={form.penandatangan_nama}
                        onChange={(e) => updateField('penandatangan_nama', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Nama lengkap pejabat penandatangan"
                      />
                      <p className="text-xs text-muted-foreground">Nama yang akan muncul di bagian tanda tangan Pihak Pertama perjanjian</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="penandatangan_jabatan" className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-emerald-600" />
                        Jabatan
                      </Label>
                      <Input
                        id="penandatangan_jabatan"
                        value={form.penandatangan_jabatan}
                        onChange={(e) => updateField('penandatangan_jabatan', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Kepala BKAD"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="penandatangan_nip" className="text-sm font-medium flex items-center gap-1.5">
                        <Key className="size-3.5 text-emerald-600" />
                        NIP
                      </Label>
                      <Input
                        id="penandatangan_nip"
                        value={form.penandatangan_nip}
                        onChange={(e) => updateField('penandatangan_nip', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="NIP pejabat penandatangan"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Foto Tanda Tangan */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                        <ImageIcon className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Foto Tanda Tangan</CardTitle>
                        <CardDescription>Upload foto tanda tangan basah yang akan tampil di dokumen perjanjian dan kwitansi</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <ImageUploader
                      value={form.penandatangan_foto_ttd}
                      onChange={(val) => updateField('penandatangan_foto_ttd', val)}
                      category="signatures"
                      label="Foto Tanda Tangan"
                      hint="Upload foto tanda tangan (scan/foto dengan latar putih). Format: JPG, PNG. Maks 5MB"
                      previewClassName="h-20 w-40"
                      accept="image/jpeg,image/jpg,image/png"
                    />
                    {form.penandatangan_foto_ttd && (
                      <div className="mt-4 p-4 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/30">
                        <p className="text-xs text-muted-foreground mb-2">Pratinjau Tanda Tangan:</p>
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <img src={form.penandatangan_foto_ttd} alt="Tanda Tangan Preview" className="h-16 mx-auto object-contain" />
                          <div className="mt-2 w-3/4 mx-auto border-t border-gray-400" />
                          <p className="text-xs font-medium text-gray-700 mt-1">
                            {form.penandatangan_nama || '(..........................................)'}
                          </p>
                          {form.penandatangan_nip && (
                            <p className="text-[10px] text-gray-500">NIP. {form.penandatangan_nip}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Signature Preview */}
                <Card className="border-dashed border-2 border-emerald-300 bg-emerald-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-emerald-600" />
                      <CardTitle className="text-emerald-800 text-base">Pratinjau Bagian Tanda Tangan</CardTitle>
                    </div>
                    <CardDescription>Gambaran tampilan bagian tanda tangan di perjanjian</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-gray-300 bg-white p-6">
                      <div className="flex justify-between">
                        <div className="text-center w-[45%]">
                          <p className="text-xs font-bold">PIHAK PERTAMA,</p>
                          <p className="text-xs">{form.penandatangan_jabatan || 'Kepala BKAD'}</p>
                          <div className="h-14 flex items-center justify-center">
                            {form.penandatangan_foto_ttd ? (
                              <img src={form.penandatangan_foto_ttd} alt="TTD" className="h-12 object-contain" />
                            ) : (
                              <span className="text-xs text-gray-300 italic">Belum ada ttd</span>
                            )}
                          </div>
                          <div className="w-3/4 mx-auto border-t border-gray-400" />
                          <p className="text-xs font-bold mt-1 underline">
                            ({form.penandatangan_nama || '..........................................'})
                          </p>
                          {form.penandatangan_nip && (
                            <p className="text-[10px] text-gray-500">NIP. {form.penandatangan_nip}</p>
                          )}
                        </div>
                        <div className="text-center w-[45%]">
                          <p className="text-xs font-bold">PIHAK KEDUA,</p>
                          <p className="text-xs">Peminjam</p>
                          <div className="h-14" />
                          <div className="w-3/4 mx-auto border-t border-gray-400" />
                          <p className="text-xs font-bold mt-1 underline">(Nama Peminjam)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Peraturan Daerah */}
            {activeTab === 'perda' && (
              <Card className="border-emerald-200 shadow-md">
                <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Scale className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-800">Peraturan Daerah</CardTitle>
                      <CardDescription>Atur referensi peraturan daerah yang ditampilkan</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="perda_title" className="text-sm font-medium">Judul Singkat Peraturan</Label>
                    <Input
                      id="perda_title"
                      value={form.perda_title}
                      onChange={(e) => updateField('perda_title', e.target.value)}
                      className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                    <p className="text-xs text-muted-foreground">Ditampilkan di banner tarif dan formulir</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perda_description" className="text-sm font-medium">Deskripsi Singkat</Label>
                    <Textarea
                      id="perda_description"
                      value={form.perda_description}
                      onChange={(e) => updateField('perda_description', e.target.value)}
                      className="min-h-16 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perda_full" className="text-sm font-medium">Teks Lengkap Peraturan</Label>
                    <Textarea
                      id="perda_full"
                      value={form.perda_full}
                      onChange={(e) => updateField('perda_full', e.target.value)}
                      className="min-h-20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                    <p className="text-xs text-muted-foreground">Ditampilkan di bagian dasar hukum</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab: Tarif Aula */}
            {activeTab === 'tarif-aula' && (
              <Card className="border-emerald-200 shadow-md">
                <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-800">Tarif Sewa Aula BKAD</CardTitle>
                      <CardDescription>Atur tarif dan label untuk peminjaman aula</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tarif_aula_title" className="text-sm font-medium">Judul Fasilitas Aula</Label>
                    <Input
                      id="tarif_aula_title"
                      value={form.tarif_aula_title}
                      onChange={(e) => updateField('tarif_aula_title', e.target.value)}
                      className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tarif_aula_note" className="text-sm font-medium">Catatan Tarif</Label>
                    <Input
                      id="tarif_aula_note"
                      value={form.tarif_aula_note}
                      onChange={(e) => updateField('tarif_aula_note', e.target.value)}
                      className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                  </div>

                  <Separator className="bg-emerald-100" />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-emerald-800">Kegiatan Pemerintah & Organisasi</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Tarif Siang (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_aula_pemerintah_siang}
                          onChange={(e) => updateField('tarif_aula_pemerintah_siang', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_aula_pemerintah_siang)} / hari</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tarif Malam (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_aula_pemerintah_malam}
                          onChange={(e) => updateField('tarif_aula_pemerintah_malam', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_aula_pemerintah_malam)} / hari</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-emerald-800">Keperluan Umum & Komersil</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Tarif Siang (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_aula_umum_siang}
                          onChange={(e) => updateField('tarif_aula_umum_siang', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_aula_umum_siang)} / hari</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tarif Malam (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_aula_umum_malam}
                          onChange={(e) => updateField('tarif_aula_umum_malam', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_aula_umum_malam)} / hari</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab: Tarif Kendaraan */}
            {activeTab === 'tarif-kendaraan' && (
              <Card className="border-emerald-200 shadow-md">
                <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                      <Car className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-800">Tarif Pemakaian Kendaraan</CardTitle>
                      <CardDescription>Atur tarif untuk peminjaman kendaraan bermotor</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-teal-800">Medium Bus</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Tarif Pelajar (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_kendaraan_medium_pelajar}
                          onChange={(e) => updateField('tarif_kendaraan_medium_pelajar', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_kendaraan_medium_pelajar)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tarif Komersil (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_kendaraan_medium_komersil}
                          onChange={(e) => updateField('tarif_kendaraan_medium_komersil', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_kendaraan_medium_komersil)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-teal-800">Mini Bus</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Tarif Pelajar (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_kendaraan_mini_pelajar}
                          onChange={(e) => updateField('tarif_kendaraan_mini_pelajar', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_kendaraan_mini_pelajar)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tarif Komersil (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_kendaraan_mini_komersil}
                          onChange={(e) => updateField('tarif_kendaraan_mini_komersil', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_kendaraan_mini_komersil)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-emerald-100" />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-teal-800">Biaya Sopir</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Biaya Sopir per Hari (Rp)</Label>
                        <Input
                          type="number"
                          value={form.tarif_kendaraan_sopir}
                          onChange={(e) => updateField('tarif_kendaraan_sopir', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Preview: {formatRupiahPreview(form.tarif_kendaraan_sopir)} / hari</p>
                      </div>
                      <div className="flex items-center">
                        <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3 w-full">
                          <p className="text-xs text-teal-700">Biaya sopir dikenakan jika peminjam memilih opsi &quot;Dengan Sopir&quot;. Jika &quot;Tanpa Sopir&quot;, tidak ada biaya tambahan.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab: Gambar */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                {/* Site Logo */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Globe className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Logo & Favicon</CardTitle>
                        <CardDescription>Logo dan favicon yang ditampilkan di seluruh aplikasi</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <ImageUploader
                      value={form.site_logo}
                      onChange={(url) => updateField('site_logo', url)}
                      category="logo"
                      label="Logo Aplikasi"
                      hint="Logo ditampilkan di navbar dan footer. Disarankan ukuran 200x60px atau persegi panjang"
                      previewClassName="h-16 w-auto min-w-[80px] max-w-[200px]"
                    />
                    <ImageUploader
                      value={form.site_favicon}
                      onChange={(url) => updateField('site_favicon', url)}
                      category="favicon"
                      label="Favicon"
                      hint="Ikon kecil di tab browser. Disarankan ukuran 32x32px atau 64x64px (format ICO/PNG)"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/x-icon,image/vnd.microsoft.icon"
                      previewClassName="h-10 w-10"
                    />
                  </CardContent>
                </Card>

                {/* Aula Images */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Gambar Aula</CardTitle>
                        <CardDescription>Gambar utama dan galeri aula BKAD</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <ImageUploader
                      value={form.hero_image}
                      onChange={(url) => updateField('hero_image', url)}
                      category="aula"
                      label="Gambar Hero / Background Utama"
                      hint="Gambar latar belakang di halaman utama. Disarankan ukuran minimal 1920x1080px"
                      previewClassName="h-24 w-auto min-w-[120px] max-w-[300px]"
                    />
                    <ImageUploader
                      value={form.aula_image}
                      onChange={(url) => updateField('aula_image', url)}
                      category="aula"
                      label="Gambar Utama Aula"
                      hint="Gambar utama aula yang ditampilkan di bagian fasilitas. Disarankan ukuran 800x600px"
                      previewClassName="h-24 w-auto min-w-[120px] max-w-[300px]"
                    />
                    <GalleryManager
                      value={form.aula_gallery}
                      onChange={(val) => updateField('aula_gallery', val)}
                      category="aula"
                      label="Galeri Gambar Aula"
                    />
                    <GalleryManager
                      value={form.fasilitas_aula_images}
                      onChange={(val) => updateField('fasilitas_aula_images', val)}
                      category="fasilitas"
                      label="Gambar Fasilitas Aula"
                    />
                  </CardContent>
                </Card>

                {/* Kendaraan Images - managed via kendaraan management */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                        <Truck className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Gambar Kendaraan</CardTitle>
                        <CardDescription>Kelola gambar untuk setiap kendaraan</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <KendaraanImageManager />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Google OAuth */}
            {activeTab === 'oauth' && (
              <div className="space-y-6">
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Lock className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Google OAuth</CardTitle>
                        <CardDescription>Konfigurasi login dengan akun Google</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200/60 bg-white/50 p-4">
                      <div className="flex items-center gap-3">
                        <Shield className="size-5 text-emerald-600" />
                        <div>
                          <Label className="text-sm font-medium">Aktifkan Google OAuth</Label>
                          <p className="text-xs text-muted-foreground">Izinkan pengguna masuk dengan akun Google</p>
                        </div>
                      </div>
                      <Switch
                        checked={form.google_oauth_enabled === 'true'}
                        onCheckedChange={(checked) => updateField('google_oauth_enabled', checked ? 'true' : 'false')}
                      />
                    </div>

                    {/* Google Client ID */}
                    <div className="space-y-2">
                      <Label htmlFor="google_client_id" className="text-sm font-medium flex items-center gap-1.5">
                        <Key className="size-3.5 text-emerald-600" />
                        Google Client ID
                      </Label>
                      <Input
                        id="google_client_id"
                        type="text"
                        value={form.google_client_id}
                        onChange={(e) => updateField('google_client_id', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="xxxxxxxxxxxx.apps.googleusercontent.com"
                      />
                      <p className="text-xs text-muted-foreground">Dari Google Cloud Console → Credentials → OAuth 2.0 Client IDs</p>
                    </div>

                    {/* Google Client Secret */}
                    <div className="space-y-2">
                      <Label htmlFor="google_client_secret" className="text-sm font-medium flex items-center gap-1.5">
                        <Key className="size-3.5 text-emerald-600" />
                        Google Client Secret
                      </Label>
                      <Input
                        id="google_client_secret"
                        type="password"
                        value={form.google_client_secret}
                        onChange={(e) => updateField('google_client_secret', e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
                      />
                    </div>

                    {/* NextAuth Secret */}
                    <div className="space-y-2">
                      <Label htmlFor="nextauth_secret" className="text-sm font-medium flex items-center gap-1.5">
                        <Lock className="size-3.5 text-emerald-600" />
                        NextAuth Secret
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="nextauth_secret"
                          type="password"
                          value={form.nextauth_secret}
                          onChange={(e) => updateField('nextauth_secret', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="Random secret string"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => {
                            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                            let result = ''
                            for (let i = 0; i < 32; i++) {
                              result += chars.charAt(Math.floor(Math.random() * chars.length))
                            }
                            updateField('nextauth_secret', result)
                            toast.success('Secret baru telah digenerate')
                          }}
                        >
                          <Sparkles className="size-4" />
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Secret key untuk enkripsi session JWT. Klik Generate untuk membuat secara otomatis.</p>
                    </div>

                    {/* URL Warning - CRITICAL */}
                    {!form.site_url && (
                      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                          <Globe className="size-5 text-red-600 mt-0.5 shrink-0" />
                          <div className="text-sm text-red-700 space-y-2">
                            <p className="font-bold text-red-800">Wajib: URL Aplikasi belum dikonfigurasi!</p>
                            <p>Google OAuth <strong>tidak akan berfungsi</strong> tanpa URL Aplikasi yang benar. Redirect URI harus menggunakan URL publik (bukan localhost).</p>
                            <p>Caranya: Buka kategori <strong>Umum</strong> → tab <strong>Identitas</strong> → isi <strong>URL Aplikasi</strong> dengan URL publik Anda (contoh: <code className="bg-red-100 px-1 rounded">https://epakar.seruyankab.go.id</code>), lalu simpan.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Redirect URI Preview */}
                    <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/30 p-4">
                      <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1.5 mb-2">
                        <Globe className="size-3.5 text-emerald-600" />
                        Redirect URI (salin ke Google Cloud Console)
                      </Label>
                      <div className="rounded bg-white border border-emerald-200 p-2.5 font-mono text-xs break-all select-all text-emerald-900">
                        {form.site_url
                          ? `${form.site_url.replace(/\/+$/, '')}/api/auth/google-callback-v2`
                          : '⚠️ Isi URL Aplikasi terlebih dahulu di tab Identitas'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">URI ini harus sama persis dengan yang didaftarkan di Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs</p>
                    </div>

                    {/* Info Box */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-2">
                        <Info className="size-4 text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-xs text-amber-700 space-y-2">
                          <p className="font-medium">Langkah Setup Google OAuth:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Isi <strong>URL Aplikasi</strong> di tab Identitas (URL publik, bukan localhost)</li>
                            <li>Buka <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">console.cloud.google.com</a></li>
                            <li>Buat project baru atau pilih project yang ada</li>
                            <li>Aktifkan Google+ API di Library</li>
                            <li>Buat OAuth 2.0 Client ID di Credentials</li>
                            <li>Tambahkan <strong>Authorized redirect URI</strong> sesuai yang ditampilkan di atas</li>
                            <li>Salin Client ID dan Client Secret ke form di atas</li>
                            <li>Aktifkan toggle, lalu <strong>simpan pengaturan</strong></li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Test Connection */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={async () => {
                        if (!form.site_url) {
                          toast.error('Isi URL Aplikasi di tab Identitas terlebih dahulu! Google OAuth tidak berfungsi tanpa URL publik.', { duration: 6000 })
                          return
                        }
                        if (form.site_url.includes('localhost') || form.site_url.includes('127.0.0.1')) {
                          toast.error('URL Aplikasi tidak boleh localhost! Gunakan URL publik (contoh: https://epakar.seruyankab.go.id)', { duration: 6000 })
                          return
                        }
                        if (!form.google_client_id || !form.google_client_secret) {
                          toast.error('Isi Google Client ID dan Client Secret terlebih dahulu')
                          return
                        }
                        if (form.google_oauth_enabled !== 'true') {
                          toast.error('Aktifkan toggle Google OAuth terlebih dahulu')
                          return
                        }
                        if (!form.nextauth_secret) {
                          toast.error('Generate NextAuth Secret terlebih dahulu')
                          return
                        }
                        try {
                          const res = await fetch('/api/auth/oauth-status')
                          const data = await res.json()
                          if (data.configured) {
                            toast.success('Google OAuth terkonfigurasi dengan benar! Tombol "Masuk dengan Google" akan muncul di halaman login setelah pengaturan disimpan.', { duration: 6000 })
                          } else {
                            toast.error('Google OAuth belum terkonfigurasi. Pastikan semua field terisi, toggle aktif, dan pengaturan sudah disimpan.', { duration: 6000 })
                          }
                        } catch {
                          toast.error('Gagal mengecek status OAuth')
                        }
                      }}
                    >
                      <Server className="size-4" />
                      Test Koneksi OAuth
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Notifikasi */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Section: WhatsApp (Fonnte) */}
                <Card className="border-green-200 shadow-md overflow-hidden">
                  <CardHeader className="border-b border-green-100 pb-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                        <MessageCircle className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-green-800">WhatsApp (Fonnte)</CardTitle>
                        <CardDescription className="text-green-600">Kirim notifikasi otomatis via WhatsApp</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50/70 p-4 hover:bg-green-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-green-100">
                          <Sparkles className="size-4 text-green-600" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-green-900">Aktifkan WhatsApp</Label>
                          <p className="text-xs text-green-600">Kirim notifikasi via Fonnte API</p>
                        </div>
                      </div>
                      <Switch
                        checked={form.fonnte_enabled === 'true'}
                        onCheckedChange={(checked) => updateField('fonnte_enabled', checked ? 'true' : 'false')}
                      />
                    </div>

                    {/* Fonnte Token */}
                    <div className="space-y-2">
                      <Label htmlFor="fonnte_token" className="text-sm font-medium flex items-center gap-2">
                        <Key className="size-3.5 text-green-600" />
                        Fonnte API Token
                      </Label>
                      <Input
                        id="fonnte_token"
                        type="password"
                        placeholder="Masukkan token Fonnte Anda"
                        value={form.fonnte_token}
                        onChange={(e) => updateField('fonnte_token', e.target.value)}
                        className="focus-visible:border-green-500 focus-visible:ring-green-500/30"
                      />
                      <p className="text-xs text-muted-foreground">Dapatkan token dari <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">fonnte.com</a></p>
                    </div>

                    <Separator className="bg-green-100" />

                    {/* WhatsApp Templates */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                        <FileText className="size-4 text-green-600" />
                        Template Pesan WhatsApp
                      </h5>

                      <div className="space-y-2">
                        <Label htmlFor="wa_template_new" className="text-xs font-medium text-green-700">🔔 Template Peminjaman Baru (ke Admin)</Label>
                        <Textarea
                          id="wa_template_new"
                          value={form.wa_template_new}
                          onChange={(e) => updateField('wa_template_new', e.target.value)}
                          className="min-h-24 text-xs focus-visible:border-green-500 focus-visible:ring-green-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wa_template_approved" className="text-xs font-medium text-green-700">✅ Template Disetujui (ke Peminjam)</Label>
                        <Textarea
                          id="wa_template_approved"
                          value={form.wa_template_approved}
                          onChange={(e) => updateField('wa_template_approved', e.target.value)}
                          className="min-h-24 text-xs focus-visible:border-green-500 focus-visible:ring-green-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wa_template_rejected" className="text-xs font-medium text-green-700">❌ Template Ditolak (ke Peminjam)</Label>
                        <Textarea
                          id="wa_template_rejected"
                          value={form.wa_template_rejected}
                          onChange={(e) => updateField('wa_template_rejected', e.target.value)}
                          className="min-h-24 text-xs focus-visible:border-green-500 focus-visible:ring-green-500/30"
                        />
                      </div>

                      <Separator className="bg-green-100 my-2" />

                      <div className="space-y-2">
                        <Label htmlFor="wa_template_cancel_requested" className="text-xs font-medium text-orange-700">⚠️ Template Permintaan Pembatalan (ke Admin & Peminjam)</Label>
                        <Textarea
                          id="wa_template_cancel_requested"
                          value={form.wa_template_cancel_requested}
                          onChange={(e) => updateField('wa_template_cancel_requested', e.target.value)}
                          className="min-h-24 text-xs focus-visible:border-orange-500 focus-visible:ring-orange-500/30"
                        />
                        <p className="text-[10px] text-muted-foreground">Dikirim saat user mengajukan pembatalan</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wa_template_cancelled" className="text-xs font-medium text-red-700">🚫 Template Pembatalan Disetujui (ke Peminjam)</Label>
                        <Textarea
                          id="wa_template_cancelled"
                          value={form.wa_template_cancelled}
                          onChange={(e) => updateField('wa_template_cancelled', e.target.value)}
                          className="min-h-24 text-xs focus-visible:border-red-500 focus-visible:ring-red-500/30"
                        />
                        <p className="text-[10px] text-muted-foreground">Dikirim saat admin menyetujui pembatalan</p>
                      </div>
                    </div>

                    {/* Test WhatsApp Button */}
                    <Button
                      onClick={handleTestWhatsApp}
                      disabled={testingWhatsApp || form.fonnte_enabled !== 'true'}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md transition-all hover:shadow-lg"
                    >
                      {testingWhatsApp ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Mengirim Test...
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          Test Notifikasi WhatsApp
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Section: Email (SMTP) */}
                <Card className="border-purple-200 shadow-md overflow-hidden">
                  <CardHeader className="border-b border-purple-100 pb-4" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md">
                        <Mail className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-purple-800">Email (SMTP)</CardTitle>
                        <CardDescription className="text-purple-600">Kirim notifikasi email via server SMTP</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/70 p-4 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100">
                          <Sparkles className="size-4 text-purple-600" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-purple-900">Aktifkan Email</Label>
                          <p className="text-xs text-purple-600">Kirim notifikasi email via SMTP</p>
                        </div>
                      </div>
                      <Switch
                        checked={form.email_enabled === 'true'}
                        onCheckedChange={(checked) => updateField('email_enabled', checked ? 'true' : 'false')}
                      />
                    </div>

                    {/* SMTP Configuration */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                        <Server className="size-4 text-purple-600" />
                        Konfigurasi SMTP
                      </h5>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="smtp_host" className="text-xs font-medium">SMTP Host</Label>
                          <Input
                            id="smtp_host"
                            placeholder="smtp.gmail.com"
                            value={form.smtp_host}
                            onChange={(e) => updateField('smtp_host', e.target.value)}
                            className="focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtp_port" className="text-xs font-medium">Port</Label>
                          <Input
                            id="smtp_port"
                            placeholder="587"
                            value={form.smtp_port}
                            onChange={(e) => updateField('smtp_port', e.target.value)}
                            className="focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="smtp_user" className="text-xs font-medium flex items-center gap-1">
                            <Lock className="size-3 text-purple-500" />
                            Username / Email
                          </Label>
                          <Input
                            id="smtp_user"
                            placeholder="your@gmail.com"
                            value={form.smtp_user}
                            onChange={(e) => updateField('smtp_user', e.target.value)}
                            className="focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtp_pass" className="text-xs font-medium flex items-center gap-1">
                            <Key className="size-3 text-purple-500" />
                            Password / App Password
                          </Label>
                          <Input
                            id="smtp_pass"
                            type="password"
                            placeholder="App password"
                            value={form.smtp_pass}
                            onChange={(e) => updateField('smtp_pass', e.target.value)}
                            className="focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="smtp_from" className="text-xs font-medium">Email Pengirim (From)</Label>
                          <Input
                            id="smtp_from"
                            placeholder="noreply@example.com"
                            value={form.smtp_from}
                            onChange={(e) => updateField('smtp_from', e.target.value)}
                            className="focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Koneksi Aman (TLS)</Label>
                          <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50/50 p-3 h-[38px]">
                            <span className="text-xs text-purple-700">{form.smtp_secure === 'true' ? 'TLS Aktif' : 'TLS Nonaktif'}</span>
                            <Switch
                              checked={form.smtp_secure === 'true'}
                              onCheckedChange={(checked) => updateField('smtp_secure', checked ? 'true' : 'false')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-purple-100" />

                    {/* Email Subjects */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                        <FileText className="size-4 text-purple-600" />
                        Subjek Email
                      </h5>
                      <div className="space-y-2">
                        <Label htmlFor="email_subject_new" className="text-xs font-medium text-purple-700">🔔 Subjek - Peminjaman Baru</Label>
                        <Input
                          id="email_subject_new"
                          value={form.email_subject_new}
                          onChange={(e) => updateField('email_subject_new', e.target.value)}
                          className="focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_subject_approved" className="text-xs font-medium text-purple-700">✅ Subjek - Disetujui</Label>
                        <Input
                          id="email_subject_approved"
                          value={form.email_subject_approved}
                          onChange={(e) => updateField('email_subject_approved', e.target.value)}
                          className="focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_subject_rejected" className="text-xs font-medium text-purple-700">❌ Subjek - Ditolak</Label>
                        <Input
                          id="email_subject_rejected"
                          value={form.email_subject_rejected}
                          onChange={(e) => updateField('email_subject_rejected', e.target.value)}
                          className="focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                        />
                      </div>
                      <Separator className="bg-purple-100 my-1" />
                      <div className="space-y-2">
                        <Label htmlFor="email_subject_cancel_requested" className="text-xs font-medium text-orange-700">⚠️ Subjek - Permintaan Pembatalan</Label>
                        <Input
                          id="email_subject_cancel_requested"
                          value={form.email_subject_cancel_requested}
                          onChange={(e) => updateField('email_subject_cancel_requested', e.target.value)}
                          className="focus-visible:border-orange-500 focus-visible:ring-orange-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_subject_cancelled" className="text-xs font-medium text-red-700">🚫 Subjek - Pembatalan Disetujui</Label>
                        <Input
                          id="email_subject_cancelled"
                          value={form.email_subject_cancelled}
                          onChange={(e) => updateField('email_subject_cancelled', e.target.value)}
                          className="focus-visible:border-red-500 focus-visible:ring-red-500/30"
                        />
                      </div>
                    </div>

                    <Separator className="bg-purple-100" />

                    {/* Email Body Templates */}
                    <div className="space-y-4">
                      <h5 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                        <Mail className="size-4 text-purple-600" />
                        Template Isi Email (HTML)
                      </h5>

                      <div className="space-y-2">
                        <Label htmlFor="email_template_new" className="text-xs font-medium text-purple-700">🔔 Template Peminjaman Baru (ke Admin)</Label>
                        <Textarea
                          id="email_template_new"
                          value={form.email_template_new}
                          onChange={(e) => updateField('email_template_new', e.target.value)}
                          className="min-h-24 text-xs font-mono focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email_template_approved" className="text-xs font-medium text-purple-700">✅ Template Disetujui (ke Peminjam)</Label>
                        <Textarea
                          id="email_template_approved"
                          value={form.email_template_approved}
                          onChange={(e) => updateField('email_template_approved', e.target.value)}
                          className="min-h-24 text-xs font-mono focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email_template_rejected" className="text-xs font-medium text-purple-700">❌ Template Ditolak (ke Peminjam)</Label>
                        <Textarea
                          id="email_template_rejected"
                          value={form.email_template_rejected}
                          onChange={(e) => updateField('email_template_rejected', e.target.value)}
                          className="min-h-24 text-xs font-mono focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
                        />
                      </div>

                      <Separator className="bg-purple-100 my-2" />

                      <div className="space-y-2">
                        <Label htmlFor="email_template_cancel_requested" className="text-xs font-medium text-orange-700">⚠️ Template Permintaan Pembatalan (ke Admin & Peminjam)</Label>
                        <Textarea
                          id="email_template_cancel_requested"
                          value={form.email_template_cancel_requested}
                          onChange={(e) => updateField('email_template_cancel_requested', e.target.value)}
                          className="min-h-24 text-xs font-mono focus-visible:border-orange-500 focus-visible:ring-orange-500/30"
                        />
                        <p className="text-[10px] text-muted-foreground">Dikirim saat user mengajukan pembatalan</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email_template_cancelled" className="text-xs font-medium text-red-700">🚫 Template Pembatalan Disetujui (ke Peminjam)</Label>
                        <Textarea
                          id="email_template_cancelled"
                          value={form.email_template_cancelled}
                          onChange={(e) => updateField('email_template_cancelled', e.target.value)}
                          className="min-h-24 text-xs font-mono focus-visible:border-red-500 focus-visible:ring-red-500/30"
                        />
                        <p className="text-[10px] text-muted-foreground">Dikirim saat admin menyetujui pembatalan</p>
                      </div>
                    </div>

                    {/* Test Email Button */}
                    <Button
                      onClick={handleTestEmail}
                      disabled={testingEmail || form.email_enabled !== 'true'}
                      className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-md transition-all hover:shadow-lg"
                    >
                      {testingEmail ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Mengirim Test...
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          Test Notifikasi Email
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Section: Admin Contact */}
                <Card className="border-amber-200 shadow-md overflow-hidden">
                  <CardHeader className="border-b border-amber-100 pb-4" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                        <Phone className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-amber-800">Kontak Admin</CardTitle>
                        <CardDescription className="text-amber-600">Nomor dan email untuk menerima notifikasi</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="admin_phone" className="text-sm font-medium flex items-center gap-2">
                          <MessageCircle className="size-3.5 text-amber-600" />
                          No. WhatsApp Admin
                        </Label>
                        <Input
                          id="admin_phone"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          value={form.admin_phone}
                          onChange={(e) => updateField('admin_phone', e.target.value)}
                          className="focus-visible:border-amber-500 focus-visible:ring-amber-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Untuk menerima notifikasi WA peminjaman baru (hanya admin)</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin_email" className="text-sm font-medium flex items-center gap-2">
                          <Mail className="size-3.5 text-amber-600" />
                          Email Admin
                        </Label>
                        <Input
                          id="admin_email"
                          type="email"
                          placeholder="admin@example.com"
                          value={form.admin_email}
                          onChange={(e) => updateField('admin_email', e.target.value)}
                          className="focus-visible:border-amber-500 focus-visible:ring-amber-500/30"
                        />
                        <p className="text-xs text-muted-foreground">Untuk menerima email notifikasi peminjaman baru (hanya admin, bukan peminjam)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section: Template Variables Info */}
                <Card className="border-sky-200 shadow-md overflow-hidden">
                  <CardHeader className="border-b border-sky-100 pb-3" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md">
                        <Info className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sky-800">Variabel Template</CardTitle>
                        <CardDescription className="text-sky-600">Variabel yang tersedia untuk template pesan</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        { var: '{nama}', desc: 'Nama peminjam' },
                        { var: '{kegiatan}', desc: 'Nama kegiatan' },
                        { var: '{tipe}', desc: 'Tipe peminjaman (Aula/Kendaraan)' },
                        { var: '{tanggal}', desc: 'Tanggal peminjaman' },
                        { var: '{catatan}', desc: 'Catatan admin (penolakan)' },
                        { var: '{nomor_perjanjian}', desc: 'Nomor perjanjian / SPK' },
                      ].map((item) => (
                        <div key={item.var} className="rounded-lg border border-sky-200 bg-sky-50/70 p-2.5 hover:bg-sky-100/70 transition-colors">
                          <code className="text-xs font-bold text-sky-700">{item.var}</code>
                          <p className="text-[11px] text-sky-600 mt-0.5">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/50 p-3">
                      <p className="text-xs text-sky-700 flex items-start gap-2">
                        <Shield className="size-4 shrink-0 mt-0.5 text-sky-500" />
                        Variabel akan otomatis diganti dengan data peminjaman saat notifikasi dikirim. Gunakan format <code className="bg-sky-100 px-1 rounded text-sky-800">{'{nama_variabel}'}</code> dalam template pesan.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Fasilitas Aula */}
            {activeTab === 'fasilitas' && <FasilitasManager />}

            {/* Tab: Teks Persetujuan */}
            {activeTab === 'agreement' && (
              <Card className="border-emerald-200 shadow-md">
                <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Scale className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-800">Teks Persetujuan Tarif</CardTitle>
                      <CardDescription>Teks yang harus disetujui peminjam sebelum mengajukan peminjaman</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tarif_agreement_text" className="text-sm font-medium">Teks Persetujuan</Label>
                    <Textarea
                      id="tarif_agreement_text"
                      value={form.tarif_agreement_text}
                      onChange={(e) => updateField('tarif_agreement_text', e.target.value)}
                      className="min-h-24 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Teks ini akan muncul sebagai checkbox persetujuan di formulir peminjaman
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs text-amber-600 font-medium mb-1">Preview:</p>
                    <div className="flex items-start gap-2">
                      <div className="size-4 mt-0.5 rounded border border-amber-300 bg-white shrink-0 flex items-center justify-center">
                        <span className="text-[8px]">✓</span>
                      </div>
                      <p className="text-xs text-amber-800">{form.tarif_agreement_text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab: Template Cetak / Print Template */}
            {activeTab === 'template' && (
              <div className="space-y-6">
                {/* Warna & Font */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        <Palette className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Warna & Font</CardTitle>
                        <CardDescription>Kustomisasi warna utama, jenis huruf, dan ukuran untuk cetakan dokumen</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="template_primary_color" className="text-sm font-medium flex items-center gap-1.5">
                          <div className="size-3.5 rounded-full border" style={{ backgroundColor: form.template_primary_color }} />
                          Warna Utama
                        </Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            id="template_primary_color"
                            value={form.template_primary_color}
                            onChange={(e) => updateField('template_primary_color', e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded border border-gray-300 p-0.5"
                          />
                          <Input
                            value={form.template_primary_color}
                            onChange={(e) => updateField('template_primary_color', e.target.value)}
                            className="flex-1 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 font-mono text-sm"
                            placeholder="#065f46"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Warna untuk garis KOP, judul, dan aksen pada dokumen cetak</p>
                        {/* Quick color presets */}
                        <div className="flex gap-1.5 mt-1">
                          {['#065f46', '#1a1a1a', '#1e3a5f', '#7c2d12', '#4a1d96', '#065985', '#166534', '#991b1b'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateField('template_primary_color', c)}
                              className={`size-6 rounded-full border-2 transition-all ${form.template_primary_color === c ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'}`}
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template_font_family" className="text-sm font-medium flex items-center gap-1.5">
                          <Type className="size-3.5 text-violet-600" />
                          Jenis Huruf
                        </Label>
                        <Select value={form.template_font_family} onValueChange={(val) => updateField('template_font_family', val)}>
                          <SelectTrigger className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Garamond">Garamond</SelectItem>
                            <SelectItem value="Calibri">Calibri</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Font untuk semua dokumen cetak (kwitansi, laporan, perjanjian)</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template_font_size" className="text-sm font-medium flex items-center gap-1.5">
                        <Type className="size-3.5 text-violet-600" />
                        Ukuran Huruf (pt)
                      </Label>
                      <Select value={form.template_font_size} onValueChange={(val) => updateField('template_font_size', val)}>
                        <SelectTrigger className="w-32 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10pt</SelectItem>
                          <SelectItem value="11">11pt</SelectItem>
                          <SelectItem value="12">12pt (Standar)</SelectItem>
                          <SelectItem value="13">13pt</SelectItem>
                          <SelectItem value="14">14pt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* KOP Style */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Gaya KOP Surat</CardTitle>
                        <CardDescription>Kustomisasi tampilan header kop surat pada dokumen cetak</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Garis KOP</Label>
                      <Select value={form.template_kop_line_style} onValueChange={(val) => updateField('template_kop_line_style', val)}>
                        <SelectTrigger className="w-64 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="double">Ganda (Double Line)</SelectItem>
                          <SelectItem value="thick">Tebal (Thick Line)</SelectItem>
                          <SelectItem value="triple">Tiga (Triple Line)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tampilkan Logo di KOP</Label>
                      <Select value={form.template_show_kop_logo} onValueChange={(val) => updateField('template_show_kop_logo', val)}>
                        <SelectTrigger className="w-40 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Paper & Margin */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Kertas & Margin</CardTitle>
                        <CardDescription>Ukuran kertas dan batas halaman untuk cetakan dokumen</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Ukuran Kertas</Label>
                      <Select value={form.template_paper_size} onValueChange={(val) => updateField('template_paper_size', val)}>
                        <SelectTrigger className="w-48 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4 (210 × 297mm)</SelectItem>
                          <SelectItem value="Folio">Folio (210 × 330mm)</SelectItem>
                          <SelectItem value="Legal">Legal (216 × 356mm)</SelectItem>
                          <SelectItem value="Letter">Letter (216 × 279mm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Atas (mm)</Label>
                        <Input
                          type="number"
                          value={form.template_margin_top}
                          onChange={(e) => updateField('template_margin_top', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          min="5"
                          max="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Bawah (mm)</Label>
                        <Input
                          type="number"
                          value={form.template_margin_bottom}
                          onChange={(e) => updateField('template_margin_bottom', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          min="5"
                          max="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Kiri (mm)</Label>
                        <Input
                          type="number"
                          value={form.template_margin_left}
                          onChange={(e) => updateField('template_margin_left', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          min="5"
                          max="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Kanan (mm)</Label>
                        <Input
                          type="number"
                          value={form.template_margin_right}
                          onChange={(e) => updateField('template_margin_right', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          min="5"
                          max="50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Footer Settings */}
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 text-white">
                        <Copyright className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Footer Dokumen</CardTitle>
                        <CardDescription>Pengaturan bagian bawah dokumen cetak</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tampilkan Footer</Label>
                      <Select value={form.template_show_footer} onValueChange={(val) => updateField('template_show_footer', val)}>
                        <SelectTrigger className="w-40 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template_footer_text" className="text-sm font-medium">Teks Footer Tambahan</Label>
                      <Textarea
                        id="template_footer_text"
                        value={form.template_footer_text}
                        onChange={(e) => updateField('template_footer_text', e.target.value)}
                        className="min-h-16 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        placeholder="Dokumen ini sah dan berlaku sesuai peraturan yang berlaku"
                      />
                      <p className="text-xs text-muted-foreground">Teks tambahan yang ditampilkan di bagian footer cetakan (opsional)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview */}
                <Card className="border-dashed border-2 border-violet-300 bg-violet-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-violet-600" />
                      <CardTitle className="text-violet-800 text-base">Pratinjau Template Cetak</CardTitle>
                    </div>
                    <CardDescription>Gambaran tampilan dokumen cetak Anda saat ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-gray-300 bg-white p-6 mx-auto max-w-lg" style={{ fontFamily: `'${form.template_font_family}', serif`, fontSize: `${form.template_font_size}px` }}>
                      {/* KOP Preview */}
                      <div className="text-center mb-2">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          {form.template_show_kop_logo === 'true' && form.kop_logo ? (
                            <img src={form.kop_logo} alt="Logo" className="h-14 object-contain" />
                          ) : form.template_show_kop_logo === 'true' ? (
                            <div className="h-14 w-14 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Logo</div>
                          ) : null}
                          <div>
                            <p className="text-xs uppercase tracking-wider" style={{ color: form.template_primary_color }}>Pemerintah {form.kop_kabupaten || 'Kabupaten Seruyan'}</p>
                            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: form.template_primary_color }}>{form.kop_nama_instansi || 'Nama Instansi'}</p>
                            {form.kop_alamat && <p className="text-[9px] text-gray-500">{form.kop_alamat}</p>}
                            <div className="text-[9px] text-gray-500">
                              {[form.kop_telepon && `Telp: ${form.kop_telepon}`, form.kop_email, form.kop_website].filter(Boolean).join(' | ')}
                            </div>
                          </div>
                        </div>
                        {/* KOP Line Preview */}
                        {form.template_kop_line_style === 'double' && (
                          <>
                            <div className="w-full h-[3px]" style={{ backgroundColor: form.template_primary_color }} />
                            <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: form.template_primary_color }} />
                          </>
                        )}
                        {form.template_kop_line_style === 'thick' && (
                          <div className="w-full h-[4px]" style={{ backgroundColor: form.template_primary_color }} />
                        )}
                        {form.template_kop_line_style === 'triple' && (
                          <>
                            <div className="w-full h-[3px]" style={{ backgroundColor: form.template_primary_color }} />
                            <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: form.template_primary_color }} />
                            <div className="w-full h-[1px] mt-0.5" style={{ backgroundColor: form.template_primary_color }} />
                          </>
                        )}
                      </div>

                      {/* Sample Content */}
                      <div className="text-center mt-3 mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: form.template_primary_color }}>KWITANSI PEMBAYARAN</h3>
                        <p className="text-[10px] text-gray-500 mt-1">Tanggal: 1 Januari 2025</p>
                      </div>

                      {/* Sample Table */}
                      <table className="w-full text-[10px] border-collapse mt-2">
                        <thead>
                          <tr style={{ backgroundColor: form.template_primary_color + '15' }}>
                            <th className="border py-1 px-2 text-left font-semibold" style={{ borderColor: form.template_primary_color + '40' }}>Keterangan</th>
                            <th className="border py-1 px-2 text-right font-semibold" style={{ borderColor: form.template_primary_color + '40' }}>Jumlah</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border py-1 px-2" style={{ borderColor: '#e5e7eb' }}>Peminjaman Aula</td>
                            <td className="border py-1 px-2 text-right" style={{ borderColor: '#e5e7eb' }}>Rp 1.000.000</td>
                          </tr>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <td className="border py-1 px-2 font-bold" style={{ borderColor: form.template_primary_color + '40' }}>TOTAL</td>
                            <td className="border py-1 px-2 text-right font-bold" style={{ borderColor: form.template_primary_color + '40' }}>Rp 1.000.000</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Sample Signature */}
                      <div className="flex justify-between mt-4 text-[10px]">
                        <div className="text-center w-[45%]">
                          <p className="font-bold" style={{ color: form.template_primary_color }}>Mengetahui,</p>
                          <div className="h-8" />
                          <div className="border-b border-gray-400 w-3/4 mx-auto" />
                          <p className="mt-1 font-medium">(................)</p>
                        </div>
                        <div className="text-center w-[45%]">
                          <p className="font-bold" style={{ color: form.template_primary_color }}>Penerima,</p>
                          <div className="h-8" />
                          <div className="border-b border-gray-400 w-3/4 mx-auto" />
                          <p className="mt-1 font-medium">(................)</p>
                        </div>
                      </div>

                      {/* Sample Footer */}
                      {form.template_show_footer === 'true' && (
                        <div className="mt-4 pt-2 border-t border-gray-300 text-center text-[8px] text-gray-400">
                          {form.template_footer_text && <p>{form.template_footer_text}</p>}
                          <p>Dicetak dari E-Pakar pada 1 Januari 2025</p>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-white border">
                        <p className="text-[10px] text-muted-foreground">Kertas</p>
                        <p className="text-xs font-bold">{form.template_paper_size}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white border">
                        <p className="text-[10px] text-muted-foreground">Font</p>
                        <p className="text-xs font-bold" style={{ fontFamily: `'${form.template_font_family}'` }}>{form.template_font_family}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white border">
                        <p className="text-[10px] text-muted-foreground">Ukuran</p>
                        <p className="text-xs font-bold">{form.template_font_size}pt</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white border">
                        <p className="text-[10px] text-muted-foreground">Margin</p>
                        <p className="text-xs font-bold">{form.template_margin_top}/{form.template_margin_bottom}/{form.template_margin_left}/{form.template_margin_right}mm</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reset Setup Wizard */}
            <Card className="border-amber-200 shadow-md">
              <CardHeader className="border-b border-amber-100 bg-amber-50/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Rocket className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-800">Setup Wizard</CardTitle>
                    <CardDescription>Jalankan ulang konfigurasi awal aplikasi</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Reset & Jalankan Ulang Setup Wizard</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ini akan menghapus status setup dan menampilkan wizard konfigurasi saat aplikasi dimuat ulang. Data yang sudah ada tidak akan dihapus.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 shrink-0"
                    onClick={async () => {
                      if (confirm('Yakin ingin menjalankan ulang Setup Wizard? Anda akan diarahkan ke halaman setup setelah halaman dimuat ulang.')) {
                        try {
                          await fetch('/api/setup', { method: 'DELETE' })
                          window.location.reload()
                        } catch {
                          toast.error('Gagal mereset setup wizard')
                        }
                      }
                    }}
                  >
                    <Rocket className="size-4 mr-2" />
                    Reset Setup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tab: Template Dokumen */}
            {activeTab === 'template-dokumen' && (
              <Card className="border-emerald-200 shadow-md">
                <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-800">Template Dokumen</CardTitle>
                      <CardDescription>Kelola template surat dan dokumen untuk peminjaman aula & kendaraan</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <TemplateDokumenSummary />
                </CardContent>
              </Card>
            )}

            {/* Tab: Pembayaran / Payment */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CreditCard className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">Pengaturan Pembayaran</CardTitle>
                        <CardDescription>Konfigurasi metode pembayaran, rekening bank, dan QRIS</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-6">
                    {/* Bank Transfer */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                        <Building2 className="size-4" />
                        Transfer Bank
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="payment_bank_name" className="text-sm font-medium flex items-center gap-1.5">
                            <Building2 className="size-3.5 text-emerald-600" />
                            Nama Bank
                          </Label>
                          <Input
                            id="payment_bank_name"
                            value={form.payment_bank_name}
                            onChange={(e) => updateField('payment_bank_name', e.target.value)}
                            className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                            placeholder="Bank BRI"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment_bank_account" className="text-sm font-medium flex items-center gap-1.5">
                            <CreditCard className="size-3.5 text-emerald-600" />
                            Nomor Rekening
                          </Label>
                          <Input
                            id="payment_bank_account"
                            value={form.payment_bank_account}
                            onChange={(e) => updateField('payment_bank_account', e.target.value)}
                            className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                            placeholder="0012 3456 7890"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment_account_holder" className="text-sm font-medium flex items-center gap-1.5">
                          <Users className="size-3.5 text-emerald-600" />
                          Nama Pemilik Rekening
                        </Label>
                        <Input
                          id="payment_account_holder"
                          value={form.payment_account_holder}
                          onChange={(e) => updateField('payment_account_holder', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="BKAD Kab. Seruyan"
                        />
                      </div>
                    </div>

                    <Separator className="bg-emerald-100" />

                    {/* QRIS */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                        <CreditCard className="size-4" />
                        QRIS
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="payment_qris_merchant" className="text-sm font-medium">Merchant ID QRIS</Label>
                        <Input
                          id="payment_qris_merchant"
                          value={form.payment_qris_merchant}
                          onChange={(e) => updateField('payment_qris_merchant', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="Merchant ID QRIS (opsional)"
                        />
                        <p className="text-xs text-muted-foreground">ID merchant untuk pembayaran QRIS. Kosongkan jika tidak menggunakan QRIS.</p>
                      </div>
                    </div>

                    <Separator className="bg-emerald-100" />

                    {/* Payment Settings */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                        <SettingsIcon className="size-4" />
                        Pengaturan Pembayaran
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="payment_instructions" className="text-sm font-medium">Instruksi Pembayaran</Label>
                        <Textarea
                          id="payment_instructions"
                          value={form.payment_instructions}
                          onChange={(e) => updateField('payment_instructions', e.target.value)}
                          className="min-h-20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="Instruksi pembayaran untuk peminjam"
                        />
                        <p className="text-xs text-muted-foreground">Instruksi yang ditampilkan kepada peminjam saat melakukan pembayaran</p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-emerald-200/60 bg-white/50 p-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="size-5 text-emerald-600" />
                          <div>
                            <Label className="text-sm font-medium">Konfirmasi Otomatis</Label>
                            <p className="text-xs text-muted-foreground">Otomatis konfirmasi pembayaran setelah upload bukti</p>
                          </div>
                        </div>
                        <Switch
                          checked={form.payment_auto_confirm === 'true'}
                          onCheckedChange={(checked) => updateField('payment_auto_confirm', checked ? 'true' : 'false')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment_deadline_days" className="text-sm font-medium">Batas Waktu Pembayaran (Hari)</Label>
                        <Input
                          id="payment_deadline_days"
                          type="number"
                          value={form.payment_deadline_days}
                          onChange={(e) => updateField('payment_deadline_days', e.target.value)}
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                          placeholder="3"
                          min="1"
                          max="30"
                        />
                        <p className="text-xs text-muted-foreground">Jumlah hari batas waktu pembayaran sejak peminjaman disetujui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Save Button - Sticky */}
            <div className="sticky bottom-0 z-10 py-4 bg-gradient-to-t from-gray-50/100 via-gray-50/95 to-transparent">
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Simpan Pengaturan
                    </>
                  )}
                </Button>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Fasilitas Aula manager sub-component
const FASILITAS_ICON_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'Users', label: 'Users (Kapasitas)', icon: Users },
  { value: 'Coffee', label: 'Coffee (Coffee Break)', icon: Coffee },
  { value: 'Snowflake', label: 'Snowflake (AC)', icon: Snowflake },
  { value: 'Volume2', label: 'Volume2 (Sound System)', icon: Volume2 },
  { value: 'Monitor', label: 'Monitor (Videotron)', icon: Monitor },
  { value: 'Wifi', label: 'Wifi (WiFi)', icon: Wifi },
  { value: 'Video', label: 'Video (Zoom)', icon: Video },
  { value: 'Mic', label: 'Mic (Mikrofon)', icon: Volume2 },
  { value: 'Projector', label: 'Projector (Proyektor)', icon: Monitor },
  { value: 'Tv', label: 'Tv (Televisi)', icon: Monitor },
  { value: 'Presentation', label: 'Presentation (Presentasi)', icon: Monitor },
  { value: 'Lamp', label: 'Lamp (Lampu)', icon: ImageIcon },
  { value: 'Plug', label: 'Plug (Listrik)', icon: ImageIcon },
  { value: 'Shirt', label: 'Shirt (Seragam)', icon: ImageIcon },
  { value: 'Utensils', label: 'Utensils (Katering)', icon: Coffee },
  { value: 'Car', label: 'Car (Parkir)', icon: Car },
]

interface FasilitasItem {
  id: string
  nama: string
  deskripsi: string
  icon: string
  imageUrl: string | null
  urutan: number
  aktif: boolean
}

function FasilitasManager() {
  const [fasilitas, setFasilitas] = useState<FasilitasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    icon: 'Wifi',
    imageUrl: '',
    urutan: 0,
    aktif: true,
  })

  const fetchFasilitas = async () => {
    try {
      const res = await fetch('/api/fasilitas')
      if (res.ok) {
        const data = await res.json()
        setFasilitas(data.fasilitas || [])
      }
    } catch {
      toast.error('Gagal memuat data fasilitas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFasilitas()
  }, [])

  const openAddDialog = () => {
    setEditingId(null)
    setFormData({ nama: '', deskripsi: '', icon: 'Wifi', imageUrl: '', urutan: fasilitas.length + 1, aktif: true })
    setDialogOpen(true)
  }

  const openEditDialog = (item: FasilitasItem) => {
    setEditingId(item.id)
    setFormData({
      nama: item.nama,
      deskripsi: item.deskripsi,
      icon: item.icon,
      imageUrl: item.imageUrl || '',
      urutan: item.urutan,
      aktif: item.aktif,
    })
    setDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nama.trim() || !formData.deskripsi.trim()) {
      toast.error('Nama dan deskripsi wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        icon: formData.icon,
        imageUrl: formData.imageUrl || null,
        urutan: formData.urutan,
        aktif: formData.aktif,
      }

      const res = await fetch('/api/fasilitas', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editingId ? 'Fasilitas berhasil diperbarui' : 'Fasilitas berhasil ditambahkan')
        setDialogOpen(false)
        fetchFasilitas()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Gagal menyimpan fasilitas')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/fasilitas?id=${deletingId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Fasilitas berhasil dihapus')
        setDeleteDialogOpen(false)
        setDeletingId(null)
        fetchFasilitas()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Gagal menghapus fasilitas')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus')
    } finally {
      setSaving(false)
    }
  }

  const getIconComponent = (iconName: string): LucideIcon => {
    const found = FASILITAS_ICON_OPTIONS.find(o => o.value === iconName)
    return found ? found.icon : Wifi
  }

  const deletingItem = fasilitas.find(f => f.id === deletingId)

  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 shadow-md">
        <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <LayoutGrid className="size-5" />
              </div>
              <div>
                <CardTitle className="text-emerald-800">Fasilitas Aula</CardTitle>
                <CardDescription>Kelola fasilitas yang ditampilkan di halaman utama</CardDescription>
              </div>
            </div>
            <Button
              onClick={openAddDialog}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="size-4" />
              Tambah Fasilitas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-emerald-600" />
              <span className="ml-2 text-sm text-muted-foreground">Memuat data...</span>
            </div>
          ) : fasilitas.length === 0 ? (
            <div className="text-center py-8">
              <LayoutGrid className="size-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada fasilitas. Klik &quot;Tambah Fasilitas&quot; untuk menambahkan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                    <TableHead className="w-16 text-center">Icon</TableHead>
                    <TableHead className="w-16 text-center">Urutan</TableHead>
                    <TableHead className="w-16 text-center">Status</TableHead>
                    <TableHead className="w-24 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fasilitas.map((item, index) => {
                    const IconComp = getIconComponent(item.icon)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-center text-sm text-gray-500">{index + 1}</TableCell>
                        <TableCell className="font-medium text-sm">{item.nama}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600 max-w-xs truncate">{item.deskripsi}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <IconComp className="size-4 text-gray-500" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">{item.urutan}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.aktif ? 'default' : 'secondary'} className={item.aktif ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500'}>
                            {item.aktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(item)}
                              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteDialog(item.id)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">
              {editingId ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Perbarui informasi fasilitas' : 'Tambahkan fasilitas baru untuk Aula BKAD'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nama Fasilitas *</Label>
              <Input
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="contoh: Sound System"
                className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Deskripsi *</Label>
              <Textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                placeholder="Deskripsi singkat fasilitas"
                className="min-h-16 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger className="focus:border-emerald-500">
                  <SelectValue placeholder="Pilih icon" />
                </SelectTrigger>
                <SelectContent>
                  {FASILITAS_ICON_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <OptIcon className="size-4" />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gambar (opsional)</Label>
              <ImageUploader
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                category="fasilitas"
                label=""
                hint="Upload gambar fasilitas (opsional, menggantikan icon)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Urutan</Label>
                <Input
                  type="number"
                  value={formData.urutan}
                  onChange={(e) => setFormData(prev => ({ ...prev, urutan: parseInt(e.target.value) || 0 }))}
                  min={0}
                  className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.aktif}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aktif: checked }))}
                  />
                  <span className="text-sm text-gray-600">{formData.aktif ? 'Aktif' : 'Nonaktif'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-300"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : editingId ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Fasilitas</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus fasilitas &quot;{deletingItem?.nama}&quot;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menghapus...
                </>
              ) : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Kendaraan image manager sub-component
function KendaraanImageManager() {
  const [kendaraanList, setKendaraanList] = useState<Array<{ id: string; nama: string; jenis: string; platNomor: string; imageUrl: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingImageUrl, setEditingImageUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchKendaraan = async () => {
      try {
        const res = await fetch('/api/kendaraan')
        if (res.ok) {
          const data = await res.json()
          setKendaraanList(data.kendaraan || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchKendaraan()
  }, [])

  const handleSaveImage = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/kendaraan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, imageUrl: editingImageUrl || null }),
      })
      if (res.ok) {
        setKendaraanList(prev => prev.map(k => k.id === id ? { ...k, imageUrl: editingImageUrl || null } : k))
        setEditingId(null)
        setEditingImageUrl('')
        toast.success('Gambar kendaraan berhasil diperbarui')
      } else {
        toast.error('Gagal memperbarui gambar kendaraan')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="size-4 animate-spin text-emerald-600" />
        <span className="text-sm text-muted-foreground">Memuat daftar kendaraan...</span>
      </div>
    )
  }

  if (kendaraanList.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Belum ada data kendaraan</p>
  }

  return (
    <div className="space-y-4">
      {kendaraanList.map((k) => (
        <div key={k.id} className="flex items-center gap-4 rounded-lg border border-gray-100 p-3">
          {/* Preview */}
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {k.imageUrl ? (
              <img src={k.imageUrl} alt={k.nama} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Car className="size-6 text-gray-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{k.nama}</p>
            <p className="text-xs text-muted-foreground">{k.platNomor} · {k.jenis === 'medium_bus' ? 'Medium Bus' : 'Mini Bus'}</p>
          </div>

          {/* Edit or Save */}
          {editingId === k.id ? (
            <div className="flex items-center gap-2">
              <ImageUploader
                value={editingImageUrl}
                onChange={setEditingImageUrl}
                category="kendaraan"
                label=""
                hint=""
                previewClassName="h-12 w-12"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSaveImage(k.id)}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                >
                  {saving ? <Loader2 className="size-3 animate-spin" /> : 'Simpan'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setEditingId(null); setEditingImageUrl('') }}
                  className="h-7 text-xs"
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setEditingId(k.id); setEditingImageUrl(k.imageUrl || '') }}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 shrink-0"
            >
              {k.imageUrl ? 'Ganti' : 'Upload'}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
