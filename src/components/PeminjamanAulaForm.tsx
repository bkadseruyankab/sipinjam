'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { compressFileAsBase64 } from '@/lib/compress'
import {
  ArrowLeft,
  Upload,
  Loader2,
  Building2,
  FileText,
  Clock,
  CalendarDays,
  Users,
  Scale,
  ChevronDown,
  ChevronUp,
  Check,
  User,
  ClipboardList,
  Paperclip,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import MiniCalendar from '@/components/MiniCalendar'

interface SettingsMap {
  perda_title?: string
  perda_description?: string
  perda_full?: string
  tarif_aula_title?: string
  tarif_aula_pemerintah_siang?: string
  tarif_aula_pemerintah_malam?: string
  tarif_aula_umum_siang?: string
  tarif_aula_umum_malam?: string
  tarif_aula_pemerintah_label?: string
  tarif_aula_umum_label?: string
  tarif_aula_note?: string
  tarif_agreement_text?: string
}

function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString('id-ID')} / hari`
}

const STEP_LABELS = ['Data Peminjam', 'Detail Peminjaman', 'Dokumen Pendukung', 'Persetujuan Tarif']
const STEP_ICONS = [User, ClipboardList, Paperclip, ShieldCheck]

export default function PeminjamanAulaForm() {
  const { user, setLoginDialogOpen, setCurrentView } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Current step (0-indexed)
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  // Step 1: Data Peminjam
  const [namaLengkap, setNamaLengkap] = useState('')
  const [instansi, setInstansi] = useState('')
  const [email, setEmail] = useState('')
  const [nip, setNip] = useState('')
  const [nomorKontak, setNomorKontak] = useState('')

  // Step 2: Detail Peminjaman
  const [keperluanPenggunaan, setKeperluanPenggunaan] = useState('')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [waktuMulai, setWaktuMulai] = useState('')
  const [waktuSelesai, setWaktuSelesai] = useState('')
  const [jumlahPeserta, setJumlahPeserta] = useState('')

  // Step 3: Dokumen Pendukung
  const [suratUrl, setSuratUrl] = useState('')
  const [suratFile, setSuratFile] = useState<string>('')
  const [suratFileName, setSuratFileName] = useState('')

  // Step 4: Persetujuan Tarif
  const [jenisKegiatan, setJenisKegiatan] = useState<string>('')
  const [waktuPenggunaan, setWaktuPenggunaan] = useState<string>('')
  const [setujuTarif, setSetujuTarif] = useState(false)
  const [showTarifDetail, setShowTarifDetail] = useState(false)

  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<SettingsMap>({})

  // Validation errors per step
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data.settings || {})
        }
      } catch {
        // Use defaults
      }
    }
    fetchSettings()
  }, [])

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setNamaLengkap(user.name || '')
      setEmail(user.email || '')
      setInstansi(user.instansi || '')
      setNomorKontak(user.phone || '')
    }
  }, [user])

  const [compressing, setCompressing] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }
    setSuratFileName(file.name)
    setCompressing(true)
    try {
      const result = await compressFileAsBase64(file, { maxSizeKB: 300, quality: 0.7 })
      setSuratFile(result.data)
      if (result.wasCompressed) {
        const savedPercent = Math.round((1 - result.compressedSize / result.originalSize) * 100)
        toast.success(`File dikompres (hemat ${savedPercent}% ukuran)`)
      }
    } catch {
      toast.error('Gagal memproses file')
    } finally {
      setCompressing(false)
    }
  }

  // Step validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 0) {
      if (!namaLengkap.trim()) errors.namaLengkap = 'Nama lengkap wajib diisi'
      if (!instansi.trim()) errors.instansi = 'Instansi/Organisasi wajib diisi'
      if (!email.trim()) errors.email = 'Email wajib diisi'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid'
      if (!nomorKontak.trim()) errors.nomorKontak = 'Nomor kontak wajib diisi'
    }

    if (step === 1) {
      if (!keperluanPenggunaan.trim()) errors.keperluanPenggunaan = 'Keperluan penggunaan wajib diisi'
      if (!tanggalMulai) errors.tanggalMulai = 'Tanggal mulai wajib diisi'
      if (!tanggalSelesai) errors.tanggalSelesai = 'Tanggal selesai wajib diisi'
      if (tanggalMulai && tanggalSelesai && new Date(tanggalSelesai) < new Date(tanggalMulai)) {
        errors.tanggalSelesai = 'Tanggal selesai harus setelah tanggal mulai'
      }
      if (!waktuMulai) errors.waktuMulai = 'Waktu mulai wajib diisi'
      if (!waktuSelesai) errors.waktuSelesai = 'Waktu selesai wajib diisi'
    }

    // Step 2 (index 2) - optional, no validation

    if (step === 3) {
      if (!jenisKegiatan) errors.jenisKegiatan = 'Pilih jenis kegiatan'
      if (!waktuPenggunaan) errors.waktuPenggunaan = 'Pilih waktu penggunaan'
      if (!setujuTarif) errors.setujuTarif = 'Anda harus menyetujui ketentuan tarif'
    }

    setStepErrors(errors)

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return false
    }
    return true
  }

  const goNext = () => {
    if (!validateStep(currentStep)) return
    setDirection('forward')
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const goBack = () => {
    setDirection('backward')
    setStepErrors({})
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    if (!user) {
      setLoginDialogOpen(true)
      toast.error('Silakan login terlebih dahulu')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/borrowing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'aula',
          kegiatan: keperluanPenggunaan,
          jenisKegiatan,
          waktuPenggunaan,
          tanggalPinjam: tanggalMulai,
          tanggalKembali: tanggalSelesai,
          waktuMulam: waktuMulai,
          waktuSelesai,
          suratPermohonan: suratFile || suratUrl || undefined,
          nip: nip || undefined,
          jumlahPeserta: jumlahPeserta ? parseInt(jumlahPeserta) : undefined,
          setujuTarif: true,
          phone: nomorKontak || undefined,
          instansi: instansi || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Gagal mengajukan peminjaman')
        return
      }
      toast.success('Pengajuan peminjaman aula berhasil dikirim!')
      setCurrentView('pengajuan-saya')
    } catch {
      toast.error('Terjadi kesalahan saat mengirim pengajuan')
    } finally {
      setLoading(false)
    }
  }

  // Determine tariff based on selection
  const getTarifAmount = () => {
    if (!jenisKegiatan || !waktuPenggunaan) return null
    const key = `tarif_aula_${jenisKegiatan}_${waktuPenggunaan}`
    const val = settings[key]
    if (val) return formatRupiah(parseInt(val))
    // Defaults
    if (jenisKegiatan === 'pemerintah') {
      return waktuPenggunaan === 'siang' ? 'Rp 1.000.000 / hari' : 'Rp 1.500.000 / hari'
    }
    return waktuPenggunaan === 'siang' ? 'Rp 1.500.000 / hari' : 'Rp 2.000.000 / hari'
  }

  const tarifAmount = getTarifAmount()

  const perdaTitle = settings.perda_title || 'Perda Kab. Seruyan No. 10 Tahun 2025'
  const perdaDesc = settings.perda_description || 'Tarif resmi berdasarkan Perubahan Perda No. 1 Tahun 2024 tentang Pajak dan Retribusi Daerah'
  const tarifAulaTitle = settings.tarif_aula_title || 'Aula + Sound System + Videotron'
  const tarifPemerintahLabel = settings.tarif_aula_pemerintah_label || 'Kegiatan Pemerintah & Organisasi'
  const tarifUmumLabel = settings.tarif_aula_umum_label || 'Keperluan Umum & Komersil'
  const tarifNote = settings.tarif_aula_note || 'Jasa & kebersihan ditanggung penyewa'
  const agreementText = settings.tarif_agreement_text || 'Saya telah membaca dan menyetujui ketentuan tarif retribusi berdasarkan Perda Kab. Seruyan No. 10 Tahun 2025 dan bersedia membayar sesuai tarif yang berlaku.'

  const tarifPemerintahSiang = settings.tarif_aula_pemerintah_siang ? formatRupiah(parseInt(settings.tarif_aula_pemerintah_siang)) : 'Rp 1.000.000 / hari'
  const tarifPemerintahMalam = settings.tarif_aula_pemerintah_malam ? formatRupiah(parseInt(settings.tarif_aula_pemerintah_malam)) : 'Rp 1.500.000 / hari'
  const tarifUmumSiang = settings.tarif_aula_umum_siang ? formatRupiah(parseInt(settings.tarif_aula_umum_siang)) : 'Rp 1.500.000 / hari'
  const tarifUmumMalam = settings.tarif_aula_umum_malam ? formatRupiah(parseInt(settings.tarif_aula_umum_malam)) : 'Rp 2.000.000 / hari'

  // Helper for field error styling
  const getFieldError = (fieldName: string) => stepErrors[fieldName]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('home')}
          className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>

        {/* Form Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
            <Building2 className="size-6" />
            Form Data Peminjaman
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Isi formulir berikut untuk mengajukan peminjaman Aula BKAD</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEP_LABELS.map((label, idx) => {
              const Icon = STEP_ICONS[idx]
              const isCompleted = idx < currentStep
              const isActive = idx === currentStep
              return (
                <div key={idx} className="flex items-center flex-1 last:flex-none">
                  {/* Step Circle + Label */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300
                        ${isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isActive
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200'
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="size-5" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </div>
                    <span
                      className={`
                        mt-2 text-xs font-medium text-center leading-tight max-w-[72px] sm:max-w-none transition-colors duration-300
                        ${isCompleted || isActive ? 'text-emerald-700' : 'text-gray-400'}
                      `}
                    >
                      {label}
                    </span>
                  </div>
                  {/* Connector Line */}
                  {idx < STEP_LABELS.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-3 mt-[-20px]">
                      <div
                        className={`
                          h-0.5 rounded-full transition-all duration-500
                          ${idx < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}
                        `}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content with CSS transition */}
        <div className="relative overflow-hidden">
          <div
            key={currentStep}
            className="animate-step-transition"
          >
            {/* Step 1: Data Peminjam */}
            {currentStep === 0 && (
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <User className="size-4" />
                    </div>
                    <h2 className="text-lg font-semibold text-emerald-800">Data Peminjam</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="namaLengkap">Nama Lengkap *</Label>
                      <Input
                        id="namaLengkap"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={namaLengkap}
                        onChange={(e) => { setNamaLengkap(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.namaLengkap; return next }) }}
                        className={`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('namaLengkap') ? 'border-red-400 focus-visible:border-red-500' : ''}`}
                      />
                      {getFieldError('namaLengkap') && <p className="text-xs text-red-500">{getFieldError('namaLengkap')}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instansi">Instansi / Organisasi *</Label>
                      <Input
                        id="instansi"
                        type="text"
                        placeholder="Masukkan nama instansi atau organisasi"
                        value={instansi}
                        onChange={(e) => { setInstansi(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.instansi; return next }) }}
                        className={`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('instansi') ? 'border-red-400 focus-visible:border-red-500' : ''}`}
                      />
                      {getFieldError('instansi') && <p className="text-xs text-red-500">{getFieldError('instansi')}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@contoh.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.email; return next }) }}
                        className={`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('email') ? 'border-red-400 focus-visible:border-red-500' : ''}`}
                      />
                      {getFieldError('email') && <p className="text-xs text-red-500">{getFieldError('email')}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nip">NIP / ID Pegawai</Label>
                      <Input
                        id="nip"
                        type="text"
                        placeholder="Opsional"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="nomorKontak">Nomor Kontak / WhatsApp *</Label>
                      <Input
                        id="nomorKontak"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={nomorKontak}
                        onChange={(e) => { setNomorKontak(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.nomorKontak; return next }) }}
                        className={`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('nomorKontak') ? 'border-red-400 focus-visible:border-red-500' : ''}`}
                      />
                      {getFieldError('nomorKontak') && <p className="text-xs text-red-500">{getFieldError('nomorKontak')}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Detail Peminjaman */}
            {currentStep === 1 && (
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <ClipboardList className="size-4" />
                    </div>
                    <h2 className="text-lg font-semibold text-emerald-800">Detail Peminjaman</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keperluanPenggunaan">Keperluan Penggunaan *</Label>
                      <Textarea
                        id="keperluanPenggunaan"
                        placeholder="Jelaskan keperluan penggunaan aula (contoh: Rapat Koordinasi, Seminar, dll)"
                        value={keperluanPenggunaan}
                        onChange={(e) => { setKeperluanPenggunaan(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.keperluanPenggunaan; return next }) }}
                        className={`min-h-24 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('keperluanPenggunaan') ? 'border-red-400' : ''}`}
                      />
                      {getFieldError('keperluanPenggunaan') && <p className="text-xs text-red-500">{getFieldError('keperluanPenggunaan')}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="tanggalMulai" className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 text-emerald-600" />
                          Tanggal Mulai *
                        </Label>
                        <Input
                          id="tanggalMulai"
                          type="date"
                          value={tanggalMulai}
                          onChange={(e) => { setTanggalMulai(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.tanggalMulai; return next }) }}
                          className={`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('tanggalMulai') ? 'border-red-400' : ''}`}
                        />
                        {getFieldError('tanggalMulai') && <p className="text-xs text-red-500">{getFieldError('tanggalMulai')}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tanggalSelesai" className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 text-emerald-600" />
                          Tanggal Selesai *
                        </Label>
                        <Input
                          id="tanggalSelesai"
                          type="date"
                          value={tanggalSelesai}
                          onChange={(e) => { setTanggalSelesai(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.tanggalSelesai; return next }) }}
                          className={`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('tanggalSelesai') ? 'border-red-400' : ''}`}
                        />
                        {getFieldError('tanggalSelesai') && <p className="text-xs text-red-500">{getFieldError('tanggalSelesai')}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waktuMulai" className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-emerald-600" />
                          Waktu Mulai *
                        </Label>
                        <Input
                          id="waktuMulai"
                          type="time"
                          value={waktuMulai}
                          onChange={(e) => { setWaktuMulai(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.waktuMulai; return next }) }}
                          className={`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('waktuMulai') ? 'border-red-400' : ''}`}
                        />
                        {getFieldError('waktuMulai') && <p className="text-xs text-red-500">{getFieldError('waktuMulai')}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waktuSelesai" className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-emerald-600" />
                          Waktu Selesai *
                        </Label>
                        <Input
                          id="waktuSelesai"
                          type="time"
                          value={waktuSelesai}
                          onChange={(e) => { setWaktuSelesai(e.target.value); setStepErrors((prev) => { const next = {...prev}; delete next.waktuSelesai; return next }) }}
                          className={`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 ${getFieldError('waktuSelesai') ? 'border-red-400' : ''}`}
                        />
                        {getFieldError('waktuSelesai') && <p className="text-xs text-red-500">{getFieldError('waktuSelesai')}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jumlahPeserta" className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-emerald-600" />
                        Jumlah Peserta
                      </Label>
                      <Input
                        id="jumlahPeserta"
                        type="number"
                        placeholder="Perkiraan jumlah peserta"
                        value={jumlahPeserta}
                        onChange={(e) => setJumlahPeserta(e.target.value)}
                        min="1"
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                    </div>

                    {/* Mini Calendar for Date Guidance */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-emerald-600" />
                        Cek Ketersediaan Jadwal Aula
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Klik tanggal pada kalender untuk memilih tanggal peminjaman. Warna menunjukkan status peminjaman yang sudah ada.
                      </p>
                      <div className="flex justify-center">
                        <MiniCalendar
                          type="aula"
                          selectedDate={tanggalMulai}
                          onDateSelect={(date) => {
                            setTanggalMulai(date)
                            if (!tanggalSelesai || tanggalSelesai < date) {
                              setTanggalSelesai(date)
                            }
                            setStepErrors((prev) => { const next = {...prev}; delete next.tanggalMulai; delete next.tanggalSelesai; return next })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Dokumen Pendukung */}
            {currentStep === 2 && (
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Paperclip className="size-4" />
                    </div>
                    <h2 className="text-lg font-semibold text-emerald-800">Dokumen Pendukung</h2>
                  </div>

                  <div className="space-y-3">
                    <Label>Surat Permohonan (PDF) atau URL Dokumen</Label>
                    <Input
                      type="text"
                      placeholder="Masukkan URL dokumen atau upload file PDF (opsional)"
                      value={suratUrl}
                      onChange={(e) => setSuratUrl(e.target.value)}
                      className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">atau</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={compressing}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        {compressing ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Mengompres...
                          </>
                        ) : (
                          <>
                            <Upload className="size-4" />
                            Choose File
                          </>
                        )}
                      </Button>
                      {suratFileName ? (
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {suratFileName}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No file chosen</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dokumen pendukung bersifat opsional. Anda bisa memasukkan URL atau upload file PDF
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Persetujuan Tarif Retribusi */}
            {currentStep === 3 && (
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <ShieldCheck className="size-4" />
                    </div>
                    <h2 className="text-lg font-semibold text-emerald-800">Persetujuan Tarif Retribusi</h2>
                  </div>

                  {/* Perda Banner */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale className="size-4 text-blue-600" />
                      <span className="font-semibold text-blue-800 text-sm">{perdaTitle}</span>
                    </div>
                    <p className="text-xs text-blue-700">{perdaDesc}</p>
                  </div>

                  {/* Tarif Aula - Expandable */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowTarifDetail(!showTarifDetail)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <div>
                        <p className="font-semibold text-emerald-800 text-sm">A. Tarif Sewa Aula BKAD</p>
                        <p className="text-xs text-emerald-600">{tarifAulaTitle}</p>
                      </div>
                      {showTarifDetail ? <ChevronUp className="size-4 text-emerald-600" /> : <ChevronDown className="size-4 text-emerald-600" />}
                    </button>

                    {showTarifDetail && (
                      <div className="px-3 pb-3 space-y-3">
                        {/* Kegiatan Pemerintah */}
                        <div className="rounded-md bg-white border border-emerald-100 p-3">
                          <p className="font-semibold text-emerald-800 text-sm">1. {tarifPemerintahLabel}</p>
                          <p className="text-xs text-muted-foreground mb-2">{tarifNote}</p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="flex items-center justify-between rounded bg-emerald-50 px-3 py-2">
                              <span className="text-xs text-emerald-700 font-medium">Siang Hari (06:00-18:00)</span>
                              <span className="text-sm font-bold text-emerald-900">{tarifPemerintahSiang}</span>
                            </div>
                            <div className="flex items-center justify-between rounded bg-emerald-50 px-3 py-2">
                              <span className="text-xs text-emerald-700 font-medium">Malam Hari (18:00-06:00)</span>
                              <span className="text-sm font-bold text-emerald-900">{tarifPemerintahMalam}</span>
                            </div>
                          </div>
                        </div>

                        {/* Keperluan Umum */}
                        <div className="rounded-md bg-white border border-emerald-100 p-3">
                          <p className="font-semibold text-emerald-800 text-sm">2. {tarifUmumLabel}</p>
                          <p className="text-xs text-muted-foreground mb-2">{tarifNote}</p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="flex items-center justify-between rounded bg-emerald-50 px-3 py-2">
                              <span className="text-xs text-emerald-700 font-medium">Siang Hari (06:00-18:00)</span>
                              <span className="text-sm font-bold text-emerald-900">{tarifUmumSiang}</span>
                            </div>
                            <div className="flex items-center justify-between rounded bg-emerald-50 px-3 py-2">
                              <span className="text-xs text-emerald-700 font-medium">Malam Hari (18:00-06:00)</span>
                              <span className="text-sm font-bold text-emerald-900">{tarifUmumMalam}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Jenis Kegiatan & Waktu Selection */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                    <div className="space-y-2">
                      <Label>Jenis Kegiatan *</Label>
                      <Select
                        value={jenisKegiatan}
                        onValueChange={(val) => { setJenisKegiatan(val); setStepErrors((prev) => { const next = {...prev}; delete next.jenisKegiatan; return next }) }}
                      >
                        <SelectTrigger className={`w-full ${getFieldError('jenisKegiatan') ? 'border-red-400' : ''}`}>
                          <SelectValue placeholder="Pilih jenis kegiatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pemerintah">{tarifPemerintahLabel}</SelectItem>
                          <SelectItem value="umum">{tarifUmumLabel}</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError('jenisKegiatan') && <p className="text-xs text-red-500">{getFieldError('jenisKegiatan')}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Waktu Penggunaan *</Label>
                      <Select
                        value={waktuPenggunaan}
                        onValueChange={(val) => { setWaktuPenggunaan(val); setStepErrors((prev) => { const next = {...prev}; delete next.waktuPenggunaan; return next }) }}
                      >
                        <SelectTrigger className={`w-full ${getFieldError('waktuPenggunaan') ? 'border-red-400' : ''}`}>
                          <SelectValue placeholder="Pilih waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="siang">Siang Hari (06:00 - 18:00)</SelectItem>
                          <SelectItem value="malam">Malam Hari (18:00 - 06:00)</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError('waktuPenggunaan') && <p className="text-xs text-red-500">{getFieldError('waktuPenggunaan')}</p>}
                    </div>
                  </div>

                  {/* Tarif Info Based on Selection */}
                  {tarifAmount && (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 mb-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-medium">Tarif yang berlaku</p>
                        <p className="text-sm text-emerald-800">
                          {jenisKegiatan === 'pemerintah' ? tarifPemerintahLabel : tarifUmumLabel} - {waktuPenggunaan === 'siang' ? 'Siang' : 'Malam'}
                        </p>
                        <p className="text-xl font-bold text-emerald-900">{tarifAmount}</p>
                      </div>
                    </div>
                  )}

                  {/* Checkbox Agreement */}
                  <div className={`flex items-start gap-3 rounded-lg border p-4 ${getFieldError('setujuTarif') ? 'border-red-300 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
                    <Checkbox
                      id="setujuTarif"
                      checked={setujuTarif}
                      onCheckedChange={(checked) => { setSetujuTarif(checked === true); setStepErrors((prev) => { const next = {...prev}; delete next.setujuTarif; return next }) }}
                      className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="setujuTarif" className={`text-sm font-normal leading-relaxed cursor-pointer ${getFieldError('setujuTarif') ? 'text-red-800' : 'text-amber-900'}`}>
                      {agreementText}
                    </Label>
                  </div>
                  {getFieldError('setujuTarif') && <p className="text-xs text-red-500 mt-1">{getFieldError('setujuTarif')}</p>}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 gap-3">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 px-6"
            >
              <ArrowLeft className="size-4 mr-1" />
              Kembali
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={goNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
            >
              Lanjutkan
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !setujuTarif}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 h-12 text-base font-semibold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                'Ajukan Peminjaman Aula'
              )}
            </Button>
          )}
        </div>

        {/* Step indicator text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Langkah {currentStep + 1} dari {STEP_LABELS.length}
        </p>
      </div>

      {/* CSS for step transitions */}
      <style jsx global>{`
        @keyframes step-slide-in {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-step-transition {
          animation: step-slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
