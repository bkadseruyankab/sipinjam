'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { compressFileAsBase64 } from '@/lib/compress'
import {
  ArrowLeft,
  Upload,
  Loader2,
  Car,
  FileText,
  Scale,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  User,
  ClipboardList,
  Paperclip,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import MiniCalendar from '@/components/MiniCalendar'

interface Kendaraan {
  id: string
  nama: string
  jenis: string
  platNomor: string
  kapasitas: number
  status: string
  imageUrl?: string | null
  bookedDates?: Array<{ id: string; from: string; to: string; status: string; kegiatan: string }>
  isAvailable?: boolean
}

interface SettingsMap {
  perda_title?: string
  perda_description?: string
  perda_full?: string
  tarif_kendaraan_medium_pelajar?: string
  tarif_kendaraan_medium_komersil?: string
  tarif_kendaraan_mini_pelajar?: string
  tarif_kendaraan_mini_komersil?: string
  tarif_kendaraan_sopir?: string
  tarif_agreement_text?: string
}

function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString('id-ID')}`
}

const STEPS = [
  { id: 1, label: 'Data Peminjam', icon: User },
  { id: 2, label: 'Detail Peminjaman', icon: ClipboardList },
  { id: 3, label: 'Dokumen Pendukung', icon: Paperclip },
  { id: 4, label: 'Persetujuan Tarif', icon: ShieldCheck },
]

export default function PeminjamanKendaraanForm() {
  const { user, setLoginDialogOpen, setCurrentView } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Current step
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  // Step 1: Data Peminjam
  const [namaLengkap, setNamaLengkap] = useState('')
  const [instansi, setInstansi] = useState('')
  const [email, setEmail] = useState('')
  const [nip, setNip] = useState('')
  const [nomorKontak, setNomorKontak] = useState('')

  // Step 2: Detail Peminjaman
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([])
  const [fetchingKendaraan, setFetchingKendaraan] = useState(true)
  const [kendaraanId, setKendaraanId] = useState('')
  const [kegiatan, setKegiatan] = useState('')
  const [keperluan, setKeperluan] = useState('')
  const [tanggalPinjam, setTanggalPinjam] = useState('')
  const [tanggalKembali, setTanggalKembali] = useState('')
  const [tujuan, setTujuan] = useState('')
  const [jumlahPenumpang, setJumlahPenumpang] = useState('')
  const [sopir, setSopir] = useState('')

  // Step 3: Dokumen Pendukung
  const [suratUrl, setSuratUrl] = useState('')
  const [suratFile, setSuratFile] = useState<string>('')
  const [suratFileName, setSuratFileName] = useState('')

  // Step 4: Persetujuan Tarif
  const [setujuTarif, setSetujuTarif] = useState(false)
  const [showTarifDetail, setShowTarifDetail] = useState(false)

  // General
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<SettingsMap>({})

  // Fetch settings
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

  // Fetch kendaraan
  useEffect(() => {
    const fetchKendaraan = async () => {
      try {
        let url = '/api/kendaraan'
        if (tanggalPinjam && tanggalKembali) {
          url += `?tanggalPinjam=${tanggalPinjam}&tanggalKembali=${tanggalKembali}`
        }
        const res = await fetch(url)
        const data = await res.json()
        if (res.ok) {
          const list = data.kendaraan || data
          const arr = Array.isArray(list) ? list : []
          setKendaraanList(arr)
          // Auto-deselect unavailable vehicle
          if (kendaraanId) {
            const selected = arr.find((k: Kendaraan) => k.id === kendaraanId)
            if (selected && tanggalPinjam && tanggalKembali && !selected.isAvailable) {
              setKendaraanId('')
            }
          }
        }
      } catch {
        toast.error('Gagal memuat daftar kendaraan')
      } finally {
        setFetchingKendaraan(false)
      }
    }
    fetchKendaraan()
  }, [tanggalPinjam, tanggalKembali])

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setNamaLengkap(user.name || '')
      setEmail(user.email || '')
      setInstansi(user.instansi || '')
      setNomorKontak(user.phone || '')
    }
  }, [user])

  const selectedKendaraan = kendaraanList.find((k) => k.id === kendaraanId)

  // Settings derived values
  const perdaTitle = settings.perda_title || 'Perda Kab. Seruyan No. 10 Tahun 2025'
  const perdaDesc = settings.perda_description || 'Tarif resmi berdasarkan Perubahan Perda No. 1 Tahun 2024 tentang Pajak dan Retribusi Daerah'
  const agreementText = settings.tarif_agreement_text || 'Saya telah membaca dan menyetujui ketentuan tarif retribusi berdasarkan Perda Kab. Seruyan No. 10 Tahun 2025 dan bersedia membayar sesuai tarif yang berlaku.'

  const tarifMediumPelajar = settings.tarif_kendaraan_medium_pelajar ? parseInt(settings.tarif_kendaraan_medium_pelajar) : 500000
  const tarifMediumKomersil = settings.tarif_kendaraan_medium_komersil ? parseInt(settings.tarif_kendaraan_medium_komersil) : 1000000
  const tarifMiniPelajar = settings.tarif_kendaraan_mini_pelajar ? parseInt(settings.tarif_kendaraan_mini_pelajar) : 500000
  const tarifMiniKomersil = settings.tarif_kendaraan_mini_komersil ? parseInt(settings.tarif_kendaraan_mini_komersil) : 750000
  const tarifSopir = settings.tarif_kendaraan_sopir ? parseInt(settings.tarif_kendaraan_sopir) : 200000

  // Calculate tariff for the selected vehicle + keperluan
  const getSelectedTarif = (): number | null => {
    if (!selectedKendaraan || !keperluan) return null
    const jenis = selectedKendaraan.jenis
    if (keperluan === 'umum') {
      // Umum uses same rate as komersil
      if (jenis === 'medium_bus') return tarifMediumKomersil
      if (jenis === 'mini_bus') return tarifMiniKomersil
    }
    if (keperluan === 'pelajar') {
      if (jenis === 'medium_bus') return tarifMediumPelajar
      if (jenis === 'mini_bus') return tarifMiniPelajar
    }
    if (keperluan === 'komersil') {
      if (jenis === 'medium_bus') return tarifMediumKomersil
      if (jenis === 'mini_bus') return tarifMiniKomersil
    }
    return null
  }

  const selectedTarif = getSelectedTarif()

  const [compressing, setCompressing] = useState(false)

  // File upload handler
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
    switch (step) {
      case 1:
        if (!namaLengkap || !instansi || !email || !nomorKontak) {
          toast.error('Harap isi semua field wajib pada Data Peminjam')
          return false
        }
        return true
      case 2:
        if (!kendaraanId || !kegiatan || !keperluan || !tanggalPinjam || !tanggalKembali || !tujuan || !jumlahPenumpang || !sopir) {
          toast.error('Harap isi semua field wajib pada Detail Peminjaman')
          return false
        }
        if (new Date(tanggalKembali) < new Date(tanggalPinjam)) {
          toast.error('Tanggal kembali harus setelah tanggal pinjam')
          return false
        }
        if (selectedKendaraan && parseInt(jumlahPenumpang) > selectedKendaraan.kapasitas) {
          toast.error(`Jumlah penumpang melebihi kapasitas kendaraan (${selectedKendaraan.kapasitas} orang)`)
          return false
        }
        return true
      case 3:
        // Dokumen is optional, always valid
        return true
      case 4:
        if (!setujuTarif) {
          toast.error('Harap setujui ketentuan tarif retribusi')
          return false
        }
        return true
      default:
        return true
    }
  }

  const goNext = () => {
    if (validateStep(currentStep)) {
      setDirection('forward')
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const goBack = () => {
    setDirection('backward')
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!user) {
      setLoginDialogOpen(true)
      toast.error('Silakan login terlebih dahulu')
      return
    }
    if (!validateStep(4)) return

    setLoading(true)
    try {
      const res = await fetch('/api/borrowing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'kendaraan',
          kendaraanId,
          kegiatan,
          keperluanKendaraan: keperluan,
          tanggalPinjam,
          tanggalKembali,
          tujuan,
          jumlahPenumpang: parseInt(jumlahPenumpang),
          sopir,
          suratPermohonan: suratFile || suratUrl || undefined,
          nip: nip || undefined,
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
      toast.success('Pengajuan peminjaman kendaraan berhasil dikirim!')
      setCurrentView('pengajuan-saya')
    } catch {
      toast.error('Terjadi kesalahan saat mengirim pengajuan')
    } finally {
      setLoading(false)
    }
  }

  // Determine if a step row in the tariff table should be highlighted
  const isRowHighlighted = (jenis: string, keperluanType: string): boolean => {
    if (!selectedKendaraan || !keperluan) return false
    const isSelectedJenis = selectedKendaraan.jenis === jenis
    const isSelectedKeperluan = keperluan === keperluanType || (keperluan === 'umum' && keperluanType === 'komersil')
    return isSelectedJenis && isSelectedKeperluan
  }

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
            <Car className="size-6" />
            Form Peminjaman Kendaraan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Isi formulir berikut untuk mengajukan peminjaman kendaraan dinas</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200'
                          : isCompleted
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-emerald-200 bg-white text-emerald-300'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="size-5" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium text-center transition-colors duration-300 hidden sm:block ${
                        isActive
                          ? 'text-emerald-700'
                          : isCompleted
                          ? 'text-emerald-600'
                          : 'text-emerald-300'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 mt-[-1.25rem] sm:mt-[-0.5rem]">
                      <div
                        className={`h-0.5 rounded-full transition-colors duration-300 ${
                          currentStep > step.id ? 'bg-emerald-600' : 'bg-emerald-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {/* Mobile step labels */}
          <div className="sm:hidden mt-2 text-center">
            <span className="text-xs font-medium text-emerald-700">
              Langkah {currentStep} dari 4 — {STEPS[currentStep - 1].label}
            </span>
          </div>
        </div>

        {/* Step Content with Animation */}
        <div className="relative overflow-hidden">
          <div
            className="transition-all duration-300 ease-in-out"
            style={{
              transform: direction === 'forward' ? 'translateX(0)' : 'translateX(0)',
              opacity: 1,
            }}
          >
            {/* Step 1: Data Peminjam */}
            {currentStep === 1 && (
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">1</div>
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
                        onChange={(e) => setNamaLengkap(e.target.value)}
                        required
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instansi">Instansi / Organisasi *</Label>
                      <Input
                        id="instansi"
                        type="text"
                        placeholder="Masukkan nama instansi atau organisasi"
                        value={instansi}
                        onChange={(e) => setInstansi(e.target.value)}
                        required
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@contoh.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
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
                        onChange={(e) => setNomorKontak(e.target.value)}
                        required
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Detail Peminjaman */}
            {currentStep === 2 && (
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">2</div>
                    <h2 className="text-lg font-semibold text-emerald-800">Detail Peminjaman</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Pilih Kendaraan */}
                    <div className="space-y-2">
                      <Label htmlFor="kendaraan">Pilih Kendaraan *</Label>
                      {fetchingKendaraan ? (
                        <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          Memuat daftar kendaraan...
                        </div>
                      ) : kendaraanList.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-3">Tidak ada kendaraan tersedia</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {kendaraanList.map((k) => (
                            <button
                              key={k.id}
                              type="button"
                              onClick={() => setKendaraanId(k.id)}
                              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                                kendaraanId === k.id
                                  ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/30'
                                  : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50'
                              } ${tanggalPinjam && tanggalKembali && !k.isAvailable ? 'opacity-70' : ''}`}
                            >
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                {k.imageUrl ? (
                                  <img src={k.imageUrl} alt={k.nama} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Car className="size-5 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{k.nama}</p>
                                <p className="text-xs text-muted-foreground">{k.platNomor} · Kapasitas: {k.kapasitas} orang</p>
                                {k.status === 'digunakan' && !tanggalPinjam && !tanggalKembali && (
                                  <p className="text-[10px] text-amber-600 font-medium mt-0.5">⚠ Sedang digunakan — pastikan tanggal tidak bentrok</p>
                                )}
                                {kendaraanId === k.id && tanggalPinjam && tanggalKembali && !k.isAvailable && (
                                  <p className="text-[10px] text-red-600 font-medium mt-0.5">✗ Tidak tersedia pada tanggal yang dipilih</p>
                                )}
                              </div>
                              <div className={`size-4 shrink-0 rounded-full border-2 ${
                                kendaraanId === k.id
                                  ? 'border-emerald-600 bg-emerald-600'
                                  : 'border-gray-300'
                              }`}>
                                {kendaraanId === k.id && (
                                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M20 6L9 17l-5-5" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Nama Kegiatan */}
                    <div className="space-y-2">
                      <Label htmlFor="kegiatan">Nama Kegiatan *</Label>
                      <Input
                        id="kegiatan"
                        type="text"
                        placeholder="Masukkan nama kegiatan"
                        value={kegiatan}
                        onChange={(e) => setKegiatan(e.target.value)}
                        required
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                    </div>

                    {/* Keperluan */}
                    <div className="space-y-2">
                      <Label htmlFor="keperluan">Keperluan *</Label>
                      <Select value={keperluan} onValueChange={setKeperluan}>
                        <SelectTrigger className="w-full focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                          <SelectValue placeholder="Pilih keperluan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pelajar">Pelajar & Mahasiswa</SelectItem>
                          <SelectItem value="komersil">Komersil</SelectItem>
                          <SelectItem value="umum">Umum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tanggal Pinjam & Kembali */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="tanggalPinjam">Tanggal Pinjam *</Label>
                        <Input
                          id="tanggalPinjam"
                          type="date"
                          value={tanggalPinjam}
                          onChange={(e) => setTanggalPinjam(e.target.value)}
                          required
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tanggalKembali">Tanggal Kembali *</Label>
                        <Input
                          id="tanggalKembali"
                          type="date"
                          value={tanggalKembali}
                          onChange={(e) => setTanggalKembali(e.target.value)}
                          required
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                      </div>
                    </div>

                    {/* Tujuan */}
                    <div className="space-y-2">
                      <Label htmlFor="tujuan">Tujuan Perjalanan *</Label>
                      <Input
                        id="tujuan"
                        type="text"
                        placeholder="Masukkan tujuan perjalanan"
                        value={tujuan}
                        onChange={(e) => setTujuan(e.target.value)}
                        required
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                    </div>

                    {/* Jumlah Penumpang & Sopir */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="penumpang">Jumlah Penumpang *</Label>
                        <Input
                          id="penumpang"
                          type="number"
                          min="1"
                          placeholder="Jumlah penumpang"
                          value={jumlahPenumpang}
                          onChange={(e) => setJumlahPenumpang(e.target.value)}
                          required
                          className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                        />
                        {selectedKendaraan && (
                          <p className={`text-xs ${parseInt(jumlahPenumpang) > selectedKendaraan.kapasitas ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                            Kapasitas: {selectedKendaraan.kapasitas} orang
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sopir">Sopir *</Label>
                        <Select value={sopir} onValueChange={setSopir}>
                          <SelectTrigger className="w-full focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                            <SelectValue placeholder="Pilih opsi sopir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dengan_sopir">Dengan Sopir</SelectItem>
                            <SelectItem value="tanpa_sopir">Tanpa Sopir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Mini Calendar for Date Guidance */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-emerald-600" />
                        Cek Ketersediaan Jadwal Kendaraan
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Klik tanggal pada kalender untuk memilih tanggal peminjaman. Warna menunjukkan status peminjaman yang sudah ada.
                      </p>
                      <div className="flex justify-center">
                        <MiniCalendar
                          type="kendaraan"
                          selectedDate={tanggalPinjam}
                          onDateSelect={(date) => {
                            setTanggalPinjam(date)
                            if (!tanggalKembali || tanggalKembali < date) {
                              setTanggalKembali(date)
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Dokumen Pendukung */}
            {currentStep === 3 && (
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">3</div>
                    <h2 className="text-lg font-semibold text-emerald-800">Dokumen Pendukung</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs text-amber-800">
                        Dokumen pendukung bersifat opsional namun disarankan untuk melampirkan surat permohonan untuk mempercepat proses verifikasi.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>Surat Permohonan</Label>
                      <Input
                        type="text"
                        placeholder="Masukkan URL dokumen (opsional)"
                        value={suratUrl}
                        onChange={(e) => setSuratUrl(e.target.value)}
                        className="focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">atau upload file</span>
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
                              Pilih File
                            </>
                          )}
                        </Button>
                        {suratFileName ? (
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {suratFileName}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Belum ada file</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, PNG. Maksimal 5MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Persetujuan Tarif Retribusi */}
            {currentStep === 4 && (
              <Card className="border-emerald-200 shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">4</div>
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

                  {/* Tarif Table - Expandable */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowTarifDetail(!showTarifDetail)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <div>
                        <p className="font-semibold text-emerald-800 text-sm">Tarif Retribusi Kendaraan Bermotor</p>
                        <p className="text-xs text-emerald-600">Klik untuk melihat tabel tarif lengkap</p>
                      </div>
                      {showTarifDetail ? <ChevronUp className="size-4 text-emerald-600" /> : <ChevronDown className="size-4 text-emerald-600" />}
                    </button>

                    {showTarifDetail && (
                      <div className="px-3 pb-3">
                        <div className="overflow-x-auto rounded-md border border-emerald-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-emerald-100">
                                <th className="px-4 py-2.5 text-left font-semibold text-emerald-800 border-b border-emerald-200">
                                  Jenis Kendaraan
                                </th>
                                <th className="px-4 py-2.5 text-right font-semibold text-emerald-800 border-b border-emerald-200">
                                  Pelajar & Mahasiswa
                                </th>
                                <th className="px-4 py-2.5 text-right font-semibold text-emerald-800 border-b border-emerald-200">
                                  Komersil / Umum
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Medium Bus Row */}
                              <tr className={isRowHighlighted('medium_bus', 'pelajar') || isRowHighlighted('medium_bus', 'komersil') ? 'bg-emerald-100' : 'bg-white'}>
                                <td className={`px-4 py-2.5 border-b border-emerald-100 font-medium ${isRowHighlighted('medium_bus', 'pelajar') || isRowHighlighted('medium_bus', 'komersil') ? 'text-emerald-900' : 'text-foreground'}`}>
                                  Medium Bus
                                </td>
                                <td className={`px-4 py-2.5 text-right border-b border-emerald-100 ${isRowHighlighted('medium_bus', 'pelajar') ? 'font-bold text-emerald-800' : 'text-muted-foreground'}`}>
                                  {formatRupiah(tarifMediumPelajar)}
                                </td>
                                <td className={`px-4 py-2.5 text-right border-b border-emerald-100 ${isRowHighlighted('medium_bus', 'komersil') ? 'font-bold text-emerald-800' : 'text-muted-foreground'}`}>
                                  {formatRupiah(tarifMediumKomersil)}
                                </td>
                              </tr>
                              {/* Mini Bus Row */}
                              <tr className={isRowHighlighted('mini_bus', 'pelajar') || isRowHighlighted('mini_bus', 'komersil') ? 'bg-emerald-100' : 'bg-white'}>
                                <td className={`px-4 py-2.5 font-medium ${isRowHighlighted('mini_bus', 'pelajar') || isRowHighlighted('mini_bus', 'komersil') ? 'text-emerald-900' : 'text-foreground'}`}>
                                  Mini Bus
                                </td>
                                <td className={`px-4 py-2.5 text-right ${isRowHighlighted('mini_bus', 'pelajar') ? 'font-bold text-emerald-800' : 'text-muted-foreground'}`}>
                                  {formatRupiah(tarifMiniPelajar)}
                                </td>
                                <td className={`px-4 py-2.5 text-right ${isRowHighlighted('mini_bus', 'komersil') ? 'font-bold text-emerald-800' : 'text-muted-foreground'}`}>
                                  {formatRupiah(tarifMiniKomersil)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Sopir Fee Info */}
                        <div className="mt-3 rounded-md bg-white border border-emerald-100 p-3">
                          <p className="font-semibold text-emerald-800 text-sm">Biaya Sopir</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-emerald-700">Dengan Sopir</span>
                            <span className="text-sm font-bold text-emerald-900">{formatRupiah(tarifSopir)} / hari</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-emerald-700">Tanpa Sopir</span>
                            <span className="text-sm text-muted-foreground">Tanpa biaya sopir</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tarif Preview Based on Selection */}
                  {selectedTarif !== null && selectedKendaraan && (
                    <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                          <FileText className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-emerald-600 font-medium">Tarif yang berlaku untuk pengajuan Anda</p>
                          <p className="text-sm text-emerald-800 mt-0.5">
                            {selectedKendaraan.nama} — {keperluan === 'pelajar' ? 'Pelajar & Mahasiswa' : keperluan === 'komersil' ? 'Komersil' : 'Umum'}
                          </p>
                          <p className="text-xl font-bold text-emerald-900 mt-1">{formatRupiah(selectedTarif)} / hari</p>

                          {sopir && (
                            <div className="mt-2 pt-2 border-t border-emerald-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-emerald-700">Biaya kendaraan</span>
                                <span className="text-sm text-emerald-800">{formatRupiah(selectedTarif)} / hari</span>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-emerald-700">
                                  {sopir === 'dengan_sopir' ? 'Biaya sopir' : 'Sopir'}
                                </span>
                                <span className="text-sm text-emerald-800">
                                  {sopir === 'dengan_sopir' ? `${formatRupiah(tarifSopir)} / hari` : 'Tanpa biaya'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-200">
                                <span className="text-xs font-semibold text-emerald-800">Total per hari</span>
                                <span className="text-sm font-bold text-emerald-900">
                                  {formatRupiah(selectedTarif + (sopir === 'dengan_sopir' ? tarifSopir : 0))}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkbox Agreement */}
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <Checkbox
                      id="setujuTarif"
                      checked={setujuTarif}
                      onCheckedChange={(checked) => setSetujuTarif(checked === true)}
                      className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="setujuTarif" className="text-sm text-amber-900 font-normal leading-relaxed cursor-pointer">
                      {agreementText}
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 min-w-[100px]"
            >
              <ArrowLeft className="size-4" />
              Kembali
            </Button>
          ) : (
            <div className="min-w-[100px]" />
          )}

          <div className="text-xs text-muted-foreground">
            Langkah {currentStep} dari 4
          </div>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={goNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
            >
              Lanjutkan
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !setujuTarif}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Car className="size-4" />
                  Ajukan Peminjaman
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
