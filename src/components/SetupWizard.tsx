'use client'

import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket,
  Building2,
  UserCog,
  Bell,
  Receipt,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  MessageSquare,
  Mail,
  Sparkles,
  Shield,
  Globe,
  Image as ImageIcon,
  Loader2,
  PartyPopper,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'

const TOTAL_STEPS = 6

const stepMeta = [
  { icon: Rocket, title: 'Selamat Datang', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', ring: 'ring-violet-200 dark:ring-violet-800' },
  { icon: Building2, title: 'Identitas Aplikasi', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  { icon: UserCog, title: 'Akun Administrator', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/30', ring: 'ring-amber-200 dark:ring-amber-800' },
  { icon: Bell, title: 'Notifikasi', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-950/30', ring: 'ring-rose-200 dark:ring-rose-800' },
  { icon: Receipt, title: 'Tarif & Peraturan', color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30', ring: 'ring-cyan-200 dark:ring-cyan-800' },
  { icon: CheckCircle2, title: 'Selesai', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-950/30', ring: 'ring-green-200 dark:ring-green-800' },
]

interface FormData {
  siteName: string
  siteDescription: string
  siteLogo: string
  siteFavicon: string
  adminName: string
  adminEmail: string
  adminPassword: string
  adminPhone: string
  adminInstansi: string
  enableWhatsapp: boolean
  fonnteApiKey: string
  enableEmail: boolean
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPass: string
  smtpFrom: string
  tarifAulaPemerintahSiang: string
  tarifAulaPemerintahMalam: string
  tarifAulaUmumSiang: string
  tarifAulaUmumMalam: string
  tarifMediumBusPelajar: string
  tarifMediumBusKomersil: string
  tarifMiniBusPelajar: string
  tarifMiniBusKomersil: string
  peraturanText: string
  peraturanPerdaText: string
}

function formatCurrency(val: string) {
  const num = Number(val)
  if (isNaN(num)) return val
  return 'Rp ' + num.toLocaleString('id-ID')
}

// ─── Step Components (defined OUTSIDE the parent to prevent re-creation on every render) ───

function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
          <Rocket className="h-14 w-14 text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
        >
          <Sparkles className="h-4 w-4 text-white" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl sm:text-4xl font-bold gradient-text mb-4"
      >
        Selamat Datang!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground text-lg max-w-md mb-8"
      >
        Mari konfigurasi aplikasi E-Pakar Anda dalam beberapa langkah mudah. Setup wizard ini akan membantu Anda mengatur semuanya dengan cepat.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg"
      >
        {[
          { icon: Shield, label: 'Keamanan', desc: 'Akun admin terlindungi', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' },
          { icon: Globe, label: 'Branding', desc: 'Logo & identitas kustom', color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/50' },
          { icon: Bell, label: 'Notifikasi', desc: 'WhatsApp & Email otomatis', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur"
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm">{item.label}</span>
            <span className="text-xs text-muted-foreground text-center">{item.desc}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function BrandingStep({ formData, updateForm, logoPreview, faviconPreview, onLogoUpload, onFaviconUpload }: {
  formData: FormData
  updateForm: (key: string, value: string | boolean) => void
  logoPreview: string
  faviconPreview: string
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFaviconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Identitas Aplikasi</h2>
          <p className="text-sm text-muted-foreground">Atur nama, logo, dan favicon aplikasi</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="siteName" className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            Nama Aplikasi *
          </Label>
          <Input
            id="siteName"
            value={formData.siteName}
            onChange={(e) => updateForm('siteName', e.target.value)}
            placeholder="E-Pakar"
            className="border-emerald-200 focus:border-emerald-500 dark:border-emerald-800"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteDesc" className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            Deskripsi Aplikasi
          </Label>
          <Input
            id="siteDesc"
            value={formData.siteDescription}
            onChange={(e) => updateForm('siteDescription', e.target.value)}
            placeholder="Sistem Peminjaman Aula & Kendaraan"
            className="border-emerald-200 focus:border-emerald-500 dark:border-emerald-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
              Logo Aplikasi
            </Label>
            <div className="relative">
              {logoPreview ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
                  <Image src={logoPreview} alt="Logo" width={48} height={48} className="rounded-lg object-contain" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Logo terupload</p>
                    <p className="text-xs text-muted-foreground">Klik untuk ganti</p>
                  </div>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 cursor-pointer hover:border-emerald-500 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-all">
                  <Upload className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Upload Logo</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, SVG (max 5MB)</p>
                  </div>
                  <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
                </label>
              )}
              {logoPreview && (
                <input type="file" accept="image/*" onChange={onLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              )}
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
              Favicon
            </Label>
            <div className="relative">
              {faviconPreview ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
                  <Image src={faviconPreview} alt="Favicon" width={32} height={32} className="rounded object-contain" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Favicon terupload</p>
                    <p className="text-xs text-muted-foreground">Klik untuk ganti</p>
                  </div>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 cursor-pointer hover:border-emerald-500 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-all">
                  <Upload className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Upload Favicon</p>
                    <p className="text-xs text-muted-foreground">ICO, PNG (max 5MB)</p>
                  </div>
                  <input type="file" accept="image/*" onChange={onFaviconUpload} className="hidden" />
                </label>
              )}
              {faviconPreview && (
                <input type="file" accept="image/*" onChange={onFaviconUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminStep({ formData, updateForm, showPassword, onTogglePassword }: {
  formData: FormData
  updateForm: (key: string, value: string | boolean) => void
  showPassword: boolean
  onTogglePassword: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <UserCog className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Akun Administrator</h2>
          <p className="text-sm text-muted-foreground">Buat akun admin utama untuk mengelola aplikasi</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adminName" className="flex items-center gap-2">
              <UserCog className="h-3.5 w-3.5 text-amber-600" />
              Nama Lengkap *
            </Label>
            <Input
              id="adminName"
              value={formData.adminName}
              onChange={(e) => updateForm('adminName', e.target.value)}
              placeholder="Nama Administrator"
              className="border-amber-200 focus:border-amber-500 dark:border-amber-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail" className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-amber-600" />
              Email *
            </Label>
            <Input
              id="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => updateForm('adminEmail', e.target.value)}
              placeholder="admin@example.com"
              className="border-amber-200 focus:border-amber-500 dark:border-amber-800"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="adminPassword" className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            Password *
          </Label>
          <div className="relative">
            <Input
              id="adminPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.adminPassword}
              onChange={(e) => updateForm('adminPassword', e.target.value)}
              placeholder="Minimal 6 karakter"
              className="border-amber-200 focus:border-amber-500 dark:border-amber-800 pr-10"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adminPhone">Nomor Telepon</Label>
            <Input
              id="adminPhone"
              value={formData.adminPhone}
              onChange={(e) => updateForm('adminPhone', e.target.value)}
              placeholder="081234567890"
              className="border-amber-200 focus:border-amber-500 dark:border-amber-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminInstansi">Instansi / SKPD</Label>
            <Input
              id="adminInstansi"
              value={formData.adminInstansi}
              onChange={(e) => updateForm('adminInstansi', e.target.value)}
              placeholder="BKAD Kabupaten Seruyan"
              className="border-amber-200 focus:border-amber-500 dark:border-amber-800"
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Akun ini akan memiliki akses penuh ke dashboard admin, pengaturan, dan manajemen peminjaman. Pastikan password yang kuat.
        </p>
      </div>
    </div>
  )
}

function NotificationStep({ formData, updateForm }: {
  formData: FormData
  updateForm: (key: string, value: string | boolean) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
          <Bell className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Notifikasi</h2>
          <p className="text-sm text-muted-foreground">Konfigurasi WhatsApp & Email untuk notifikasi otomatis</p>
        </div>
      </div>

      {/* WhatsApp Section */}
      <Card className="p-4 border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm">WhatsApp (Fonnte)</span>
              <p className="text-xs text-muted-foreground">Kirim notifikasi via WhatsApp</p>
            </div>
          </div>
          <Switch
            checked={formData.enableWhatsapp}
            onCheckedChange={(v) => updateForm('enableWhatsapp', v)}
          />
        </div>
        <AnimatePresence>
          {formData.enableWhatsapp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">Fonnte API Key</Label>
                  <Input
                    value={formData.fonnteApiKey}
                    onChange={(e) => updateForm('fonnteApiKey', e.target.value)}
                    placeholder="Masukkan API key dari fonnte.co.id"
                    className="border-rose-200 focus:border-rose-500 dark:border-rose-800 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dapatkan API key gratis di{' '}
                    <a href="https://fonnte.co.id" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline">
                      fonnte.co.id
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Email Section */}
      <Card className="p-4 border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm">Email (SMTP)</span>
              <p className="text-xs text-muted-foreground">Kirim notifikasi via email</p>
            </div>
          </div>
          <Switch
            checked={formData.enableEmail}
            onCheckedChange={(v) => updateForm('enableEmail', v)}
          />
        </div>
        <AnimatePresence>
          {formData.enableEmail && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">SMTP Host</Label>
                    <Input
                      value={formData.smtpHost}
                      onChange={(e) => updateForm('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="border-rose-200 focus:border-rose-500 dark:border-rose-800 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Port</Label>
                    <Input
                      value={formData.smtpPort}
                      onChange={(e) => updateForm('smtpPort', e.target.value)}
                      placeholder="587"
                      className="border-rose-200 focus:border-rose-500 dark:border-rose-800 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">SMTP User</Label>
                    <Input
                      value={formData.smtpUser}
                      onChange={(e) => updateForm('smtpUser', e.target.value)}
                      placeholder="email@gmail.com"
                      className="border-rose-200 focus:border-rose-500 dark:border-rose-800 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">SMTP Password</Label>
                    <Input
                      type="password"
                      value={formData.smtpPass}
                      onChange={(e) => updateForm('smtpPass', e.target.value)}
                      placeholder="app-password"
                      className="border-rose-200 focus:border-rose-500 dark:border-rose-800 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">From Email</Label>
                  <Input
                    value={formData.smtpFrom}
                    onChange={(e) => updateForm('smtpFrom', e.target.value)}
                    placeholder="noreply@example.com"
                    className="border-rose-200 focus:border-rose-500 dark:border-rose-800 text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
        <Sparkles className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
        <p className="text-xs text-rose-700 dark:text-rose-400">
          Notifikasi dapat dikonfigurasi nanti di halaman Pengaturan. Langkah ini opsional.
        </p>
      </div>
    </div>
  )
}

function TariffStep({ formData, updateForm }: {
  formData: FormData
  updateForm: (key: string, value: string | boolean) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Receipt className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Tarif & Peraturan</h2>
          <p className="text-sm text-muted-foreground">Atur tarif retribusi dan dasar peraturan</p>
        </div>
      </div>

      {/* Aula Tariffs */}
      <Card className="p-4 border-cyan-200 dark:border-cyan-800 bg-cyan-50/30 dark:bg-cyan-950/20">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-cyan-600" />
          <span className="font-semibold text-sm">Tarif Aula BKAD</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'tarifAulaPemerintahSiang', label: 'Pemerintah Siang' },
            { key: 'tarifAulaPemerintahMalam', label: 'Pemerintah Malam' },
            { key: 'tarifAulaUmumSiang', label: 'Umum Siang' },
            { key: 'tarifAulaUmumMalam', label: 'Umum Malam' },
          ].map(item => (
            <div key={item.key} className="space-y-1.5">
              <Label className="text-xs">{item.label}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                <Input
                  type="number"
                  value={formData[item.key as keyof FormData] as string}
                  onChange={(e) => updateForm(item.key, e.target.value)}
                  className="pl-9 border-cyan-200 focus:border-cyan-500 dark:border-cyan-800 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Kendaraan Tariffs */}
      <Card className="p-4 border-cyan-200 dark:border-cyan-800 bg-cyan-50/30 dark:bg-cyan-950/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🚌</span>
          <span className="font-semibold text-sm">Tarif Kendaraan Bermotor</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'tarifMediumBusPelajar', label: 'Medium Bus Pelajar' },
            { key: 'tarifMediumBusKomersil', label: 'Medium Bus Komersil' },
            { key: 'tarifMiniBusPelajar', label: 'Mini Bus Pelajar' },
            { key: 'tarifMiniBusKomersil', label: 'Mini Bus Komersil' },
          ].map(item => (
            <div key={item.key} className="space-y-1.5">
              <Label className="text-xs">{item.label}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                <Input
                  type="number"
                  value={formData[item.key as keyof FormData] as string}
                  onChange={(e) => updateForm(item.key, e.target.value)}
                  className="pl-9 border-cyan-200 focus:border-cyan-500 dark:border-cyan-800 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Regulation */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-cyan-600" />
          Dasar Peraturan
        </Label>
        <Input
          value={formData.peraturanText}
          onChange={(e) => updateForm('peraturanText', e.target.value)}
          placeholder="Berdasarkan Peraturan Bupati..."
          className="border-cyan-200 focus:border-cyan-500 dark:border-cyan-800"
        />
        <Input
          value={formData.peraturanPerdaText}
          onChange={(e) => updateForm('peraturanPerdaText', e.target.value)}
          placeholder="Peraturan Daerah..."
          className="border-cyan-200 focus:border-cyan-500 dark:border-cyan-800"
        />
      </div>
    </div>
  )
}

function CompleteStep({ formData }: { formData: FormData }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
          <PartyPopper className="h-12 w-12 text-white" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold gradient-text mb-2"
      >
        Siap Diluncurkan! 🎉
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-6"
      >
        Semua konfigurasi telah diatur. Klik &ldquo;Mulai Aplikasi&rdquo; untuk menyimpan dan meluncurkan aplikasi Anda.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-2"
      >
        {[
          { label: 'Nama Aplikasi', value: formData.siteName },
          { label: 'Admin', value: formData.adminName || formData.adminEmail },
          { label: 'WhatsApp', value: formData.enableWhatsapp ? (formData.fonnteApiKey ? '✓ Terkonfigurasi' : '⊙ Belum diatur') : '✗ Dinonaktifkan' },
          { label: 'Email', value: formData.enableEmail ? (formData.smtpHost ? '✓ Terkonfigurasi' : '⊙ Belum diatur') : '✗ Dinonaktifkan' },
          { label: 'Tarif Aula', value: `${formatCurrency(formData.tarifAulaPemerintahSiang)} - ${formatCurrency(formData.tarifAulaUmumMalam)}` },
          { label: 'Tarif Kendaraan', value: `${formatCurrency(formData.tarifMiniBusPelajar)} - ${formatCurrency(formData.tarifMediumBusKomersil)}` },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.05 }}
            className="flex items-center justify-between px-4 py-2 rounded-xl bg-card border border-border/50"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium truncate max-w-[200px]">{item.value}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Main SetupWizard Component ───

interface SetupWizardProps {
  onComplete: () => void
}

export default memo(function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [logoPreview, setLogoPreview] = useState('')
  const [faviconPreview, setFaviconPreview] = useState('')

  // Form data
  const [formData, setFormData] = useState<FormData>({
    // Branding
    siteName: 'E-Pakar',
    siteDescription: 'Sistem Peminjaman Aula & Kendaraan BKAD',
    siteLogo: '',
    siteFavicon: '',
    // Admin
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
    adminInstansi: '',
    // Notifications
    enableWhatsapp: true,
    fonnteApiKey: '',
    enableEmail: true,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    // Tariffs
    tarifAulaPemerintahSiang: '150000',
    tarifAulaPemerintahMalam: '250000',
    tarifAulaUmumSiang: '300000',
    tarifAulaUmumMalam: '500000',
    tarifMediumBusPelajar: '350000',
    tarifMediumBusKomersil: '700000',
    tarifMiniBusPelajar: '250000',
    tarifMiniBusKomersil: '500000',
    // Regulation
    peraturanText: 'Berdasarkan Peraturan Bupati Seruyan Nomor 32 Tahun 2024 tentang Tarif Retribusi Pelayanan Sewa Aula dan Pemakaian Kendaraan Bermotor Milik Daerah',
    peraturanPerdaText: 'Peraturan Daerah Kabupaten Seruyan Nomor 1 Tahun 2024 tentang Retribusi Daerah',
  })

  const updateForm = useCallback((key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  // Handle logo upload
  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('category', 'logo')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      if (res.ok) {
        const data = await res.json()
        updateForm('siteLogo', data.url)
        setLogoPreview(data.url)
      }
    } catch {
      // ignore
    }
  }, [updateForm])

  const handleFaviconUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('category', 'favicon')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      if (res.ok) {
        const data = await res.json()
        updateForm('siteFavicon', data.url)
        setFaviconPreview(data.url)
      }
    } catch {
      // ignore
    }
  }, [updateForm])

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const canGoNext = () => {
    switch (step) {
      case 0: return true
      case 1: return formData.siteName.trim().length > 0
      case 2: return formData.adminName.trim().length > 0 && formData.adminEmail.trim().length > 0 && formData.adminPassword.trim().length > 0
      case 3: return true // Notifications are optional
      case 4: return true // Tariffs have defaults
      case 5: return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload: Record<string, string> = {
        siteName: formData.siteName,
        siteDescription: formData.siteDescription,
        siteLogo: formData.siteLogo,
        siteFavicon: formData.siteFavicon,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminPhone: formData.adminPhone,
        adminInstansi: formData.adminInstansi,
        tarifAulaPemerintahSiang: formData.tarifAulaPemerintahSiang,
        tarifAulaPemerintahMalam: formData.tarifAulaPemerintahMalam,
        tarifAulaUmumSiang: formData.tarifAulaUmumSiang,
        tarifAulaUmumMalam: formData.tarifAulaUmumMalam,
        tarifMediumBusPelajar: formData.tarifMediumBusPelajar,
        tarifMediumBusKomersil: formData.tarifMediumBusKomersil,
        tarifMiniBusPelajar: formData.tarifMiniBusPelajar,
        tarifMiniBusKomersil: formData.tarifMiniBusKomersil,
        peraturanText: formData.peraturanText,
        peraturanPerdaText: formData.peraturanPerdaText,
      }

      if (formData.enableWhatsapp && formData.fonnteApiKey) {
        payload.fonnteApiKey = formData.fonnteApiKey
      }
      if (formData.enableEmail && formData.smtpHost) {
        payload.smtpHost = formData.smtpHost
        payload.smtpPort = formData.smtpPort
        payload.smtpUser = formData.smtpUser
        payload.smtpPass = formData.smtpPass
        payload.smtpFrom = formData.smtpFrom
      }

      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onComplete()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan setup')
      }
    } catch {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />
      case 1:
        return (
          <BrandingStep
            formData={formData}
            updateForm={updateForm}
            logoPreview={logoPreview}
            faviconPreview={faviconPreview}
            onLogoUpload={handleLogoUpload}
            onFaviconUpload={handleFaviconUpload}
          />
        )
      case 2:
        return (
          <AdminStep
            formData={formData}
            updateForm={updateForm}
            showPassword={showPassword}
            onTogglePassword={handleTogglePassword}
          />
        )
      case 3:
        return (
          <NotificationStep
            formData={formData}
            updateForm={updateForm}
          />
        )
      case 4:
        return (
          <TariffStep
            formData={formData}
            updateForm={updateForm}
          />
        )
      case 5:
        return <CompleteStep formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {stepMeta.map((s, i) => {
              const Icon = s.icon
              const isActive = i === step
              const isCompleted = i < step
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      backgroundColor: isCompleted
                        ? '#10b981'
                        : isActive
                          ? undefined
                          : undefined,
                    }}
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : isActive
                          ? `bg-gradient-to-br ${s.color} text-white shadow-lg`
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </motion.div>
                  <span className={`text-[10px] font-medium hidden sm:block ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 via-emerald-500 to-teal-500 rounded-full"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-6 sm:p-8"
          >
            {renderStep()}
          </motion.div>

          {/* Navigation */}
          <div className="px-6 sm:px-8 py-4 border-t border-border/50 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <span className="text-xs text-muted-foreground">
              {step + 1} / {TOTAL_STEPS}
            </span>

            {step < TOTAL_STEPS - 1 ? (
              <Button
                onClick={() => setStep(Math.min(TOTAL_STEPS - 1, step + 1))}
                disabled={!canGoNext()}
                className={`gap-2 bg-gradient-to-r ${stepMeta[step].color} text-white shadow-lg hover:opacity-90 transition-opacity`}
              >
                Lanjut
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Mulai Aplikasi
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
