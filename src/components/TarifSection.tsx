'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Car, Scale, ChevronDown, ChevronUp, FileCheck, BookOpen } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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
  tarif_kendaraan_medium_pelajar?: string
  tarif_kendaraan_medium_komersil?: string
  tarif_kendaraan_mini_pelajar?: string
  tarif_kendaraan_mini_komersil?: string
  tarif_agreement_text?: string
}

function formatRupiah(num: number): string {
  return `Rp ${num.toLocaleString('id-ID')}`
}

export default function TarifSection() {
  const [showPeraturanAula, setShowPeraturanAula] = useState(false)
  const [showPeraturanKendaraan, setShowPeraturanKendaraan] = useState(false)
  const [settings, setSettings] = useState<SettingsMap>({})

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

  const perdaTitle = settings.perda_title || 'Perda Kab. Seruyan No. 10 Tahun 2025'
  const perdaDesc = settings.perda_description || 'Tarif resmi berdasarkan Perubahan Perda No. 1 Tahun 2024 tentang Pajak dan Retribusi Daerah'
  const perdaFull = settings.perda_full || 'Peraturan Daerah Kabupaten Seruyan Nomor 10 Tahun 2025 tentang Perubahan Perda No. 1 Tahun 2024 tentang Pajak dan Retribusi Daerah'
  const tarifAulaTitle = settings.tarif_aula_title || 'Aula + Sound System + Videotron'
  const tarifPemerintahLabel = settings.tarif_aula_pemerintah_label || 'Kegiatan Pemerintah & Organisasi'
  const tarifUmumLabel = settings.tarif_aula_umum_label || 'Keperluan Umum & Komersil'
  const tarifNote = settings.tarif_aula_note || 'Jasa & kebersihan ditanggung penyewa'

  const tarifPemerintahSiang = settings.tarif_aula_pemerintah_siang ? formatRupiah(parseInt(settings.tarif_aula_pemerintah_siang)) : 'Rp 1.000.000'
  const tarifPemerintahMalam = settings.tarif_aula_pemerintah_malam ? formatRupiah(parseInt(settings.tarif_aula_pemerintah_malam)) : 'Rp 1.500.000'
  const tarifUmumSiang = settings.tarif_aula_umum_siang ? formatRupiah(parseInt(settings.tarif_aula_umum_siang)) : 'Rp 1.500.000'
  const tarifUmumMalam = settings.tarif_aula_umum_malam ? formatRupiah(parseInt(settings.tarif_aula_umum_malam)) : 'Rp 2.000.000'

  const tarifMediumPelajar = settings.tarif_kendaraan_medium_pelajar ? formatRupiah(parseInt(settings.tarif_kendaraan_medium_pelajar)) : 'Rp 500.000'
  const tarifMediumKomersil = settings.tarif_kendaraan_medium_komersil ? formatRupiah(parseInt(settings.tarif_kendaraan_medium_komersil)) : 'Rp 1.000.000'
  const tarifMiniPelajar = settings.tarif_kendaraan_mini_pelajar ? formatRupiah(parseInt(settings.tarif_kendaraan_mini_pelajar)) : 'Rp 500.000'
  const tarifMiniKomersil = settings.tarif_kendaraan_mini_komersil ? formatRupiah(parseInt(settings.tarif_kendaraan_mini_komersil)) : 'Rp 750.000'

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            Informasi Tarif
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">
            Tarif Retribusi Daerah
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            {perdaDesc}
          </p>
        </motion.div>

        {/* Legal Basis Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8"
        >
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200/50">
                  <Scale className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    Dasar Hukum Penetapan Tarif
                  </h3>
                  <p className="text-sm text-amber-800 mt-1">
                    Tarif retribusi ini ditetapkan berdasarkan {perdaFull}.
                    Setiap peminjaman wajib mematuhi ketentuan yang tercantum dalam peraturan tersebut.
                  </p>
                  <div className="mt-3 flex flex-col gap-1.5">
                    <div className="flex items-start gap-2 text-xs text-amber-800">
                      <Badge variant="outline" className="shrink-0 bg-amber-100 text-amber-800 border-amber-300 text-[10px] px-1.5 py-0">
                        PERDA
                      </Badge>
                      <span>{perdaFull}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-amber-800">
                      <Badge variant="outline" className="shrink-0 bg-amber-100 text-amber-800 border-amber-300 text-[10px] px-1.5 py-0">
                        PERBUP
                      </Badge>
                      <span>Peraturan Bupati tentang Tarif Retribusi atas Pelayanan Peminjaman Aula BKAD dan Kendaraan Bermotor Milik Pemerintah Daerah</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Aula Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-emerald-100 hover:shadow-xl transition-all duration-300 hover:border-emerald-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200/50">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Tarif Sewa Aula BKAD</CardTitle>
                    <CardDescription>{tarifAulaTitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/50">
                      <TableHead className="font-semibold text-emerald-800">Jenis Kegiatan</TableHead>
                      <TableHead className="text-center font-semibold text-emerald-800">Siang</TableHead>
                      <TableHead className="text-center font-semibold text-emerald-800">Malam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-emerald-50/50 transition-colors duration-200">
                      <TableCell className="font-medium text-gray-700">
                        <div>
                          {tarifPemerintahLabel}
                          <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                            Pasal 4 ayat (1)
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-900 font-semibold">{tarifPemerintahSiang}</TableCell>
                      <TableCell className="text-center text-gray-900 font-semibold">{tarifPemerintahMalam}</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-emerald-50/50 transition-colors duration-200">
                      <TableCell className="font-medium text-gray-700">
                        <div>
                          {tarifUmumLabel}
                          <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                            Pasal 4 ayat (2)
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-900 font-semibold">{tarifUmumSiang}</TableCell>
                      <TableCell className="text-center text-gray-900 font-semibold">{tarifUmumMalam}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    * Siang: 07.00 - 17.00 WIB | Malam: 17.00 - 23.00 WIB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    * {tarifNote}
                  </p>
                </div>

                <Separator className="my-4 bg-emerald-100" />

                {/* Peraturan Bupati Aula - Expandable */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPeraturanAula(!showPeraturanAula)}
                    className="w-full justify-between text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <BookOpen className="size-4" />
                      Ketentuan Peraturan Bupati - Aula
                    </span>
                    {showPeraturanAula ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </Button>
                  <AnimatePresence>
                    {showPeraturanAula && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-sm space-y-3">
                          <div>
                            <h4 className="font-semibold text-emerald-800 mb-1">Pasal 1 - Ketentuan Umum</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Aula BKAD merupakan aset milik Pemerintah Daerah yang dikelola oleh Badan Keuangan dan Aset Daerah (BKAD).</li>
                              <li>Peminjaman Aula BKAD diperuntukkan bagi kegiatan pemerintahan, organisasi kemasyarakatan, dan keperluan umum.</li>
                              <li>Setiap peminjaman wajib mengajukan permohonan tertulis disertai surat pengantar dari instansi/lembaga terkait.</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-emerald-800 mb-1">Pasal 2 - Prosedur Peminjaman</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Pemohon mengajukan permohonan peminjaman minimal 7 (tujuh) hari kerja sebelum kegiatan.</li>
                              <li>Permohonan disertai surat permohonan resmi, identitas pemohon, dan keterangan kegiatan.</li>
                              <li>Peminjaman hanya dapat dilakukan setelah mendapat persetujuan dari Kepala BKAD.</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-emerald-800 mb-1">Pasal 3 - Tarif dan Pembayaran</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Tarif retribusi sebagaimana tercantum dalam tabel di atas sesuai Pasal 4 Peraturan Bupati berdasarkan {perdaTitle}.</li>
                              <li>Pembayaran dilakukan sebelum pelaksanaan kegiatan melalui kas daerah.</li>
                              <li>Bukti pembayaran wajib ditunjukkan pada saat penyerahan Aula.</li>
                              <li>Tarif untuk kegiatan pemerintah dapat diberikan pembebasan sesuai ketentuan yang berlaku.</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-emerald-800 mb-1">Pasal 4 - Kewajiban Peminjam</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Menjaga kebersihan dan kerapian Aula selama dan setelah penggunaan.</li>
                              <li>Memulangkan Aula sesuai waktu yang telah disepakati.</li>
                              <li>Bertanggung jawab atas kerusakan yang terjadi akibat kelalaian peminjam.</li>
                              <li>Tidak memindahkan atau mengubah tata letak perabot tanpa izin.</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-emerald-800 mb-1">Pasal 5 - Sanksi</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Peminjam yang melanggar ketentuan Pasal 4 dikenakan denda sesuai tingkat kerusakan.</li>
                              <li>Peminjam yang terlambat memulangkan Aula dikenakan denda sebesar 10% dari tarif per jam keterlambatan.</li>
                              <li>Pelanggaran berulang dapat mengakibatkan pemblokiran peminjaman di masa mendatang.</li>
                            </ol>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-emerald-200">
                            <FileCheck className="size-4 text-emerald-600 shrink-0" />
                            <p className="text-xs text-emerald-700 font-medium">
                              Dengan mengajukan peminjaman, Anda menyetujui seluruh ketentuan dalam Peraturan Bupati ini.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Kendaraan Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-teal-100 hover:shadow-xl transition-all duration-300 hover:border-teal-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-200/50">
                    <Car className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Tarif Pemakaian Kendaraan Bermotor</CardTitle>
                    <CardDescription>Biaya sewa berdasarkan jenis kendaraan dan keperluan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-teal-50/50 hover:bg-teal-50/50">
                      <TableHead className="font-semibold text-teal-800">Jenis Kendaraan</TableHead>
                      <TableHead className="text-center font-semibold text-teal-800">Pelajar</TableHead>
                      <TableHead className="text-center font-semibold text-teal-800">Komersil</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-teal-50/50 transition-colors duration-200">
                      <TableCell className="font-medium text-gray-700">
                        <div>
                          Medium Bus
                          <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 bg-teal-50 text-teal-700 border-teal-200">
                            Pasal 7 ayat (1)
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-900 font-semibold">{tarifMediumPelajar}</TableCell>
                      <TableCell className="text-center text-gray-900 font-semibold">{tarifMediumKomersil}</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-teal-50/50 transition-colors duration-200">
                      <TableCell className="font-medium text-gray-700">
                        <div>
                          Mini Bus
                          <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 bg-teal-50 text-teal-700 border-teal-200">
                            Pasal 7 ayat (2)
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-900 font-semibold">{tarifMiniPelajar}</TableCell>
                      <TableCell className="text-center text-gray-900 font-semibold">{tarifMiniKomersil}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    * Tarif per kali pemakaikan | BBM ditanggung peminjam
                  </p>
                  <p className="text-xs text-muted-foreground">
                    * Tarif pelajar berlaku untuk kegiatan pendidikan dengan surat keterangan
                  </p>
                </div>

                <Separator className="my-4 bg-teal-100" />

                {/* Peraturan Bupati Kendaraan - Expandable */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPeraturanKendaraan(!showPeraturanKendaraan)}
                    className="w-full justify-between text-teal-700 hover:text-teal-800 hover:bg-teal-50 px-2"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <BookOpen className="size-4" />
                      Ketentuan Peraturan Bupati - Kendaraan
                    </span>
                    {showPeraturanKendaraan ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </Button>
                  <AnimatePresence>
                    {showPeraturanKendaraan && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/50 p-4 text-sm space-y-3">
                          <div>
                            <h4 className="font-semibold text-teal-800 mb-1">Pasal 6 - Ketentuan Umum</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Kendaraan Bermotor milik Pemerintah Daerah yang dikelola BKAD dapat dipinjamkan untuk keperluan dinas dan kegiatan masyarakat.</li>
                              <li>Peminjaman kendaraan hanya untuk wilayah dalam daerah kecuali mendapat izin khusus.</li>
                              <li>Jenis kendaraan yang dipinjamkan meliputi Medium Bus dan Mini Bus.</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-teal-800 mb-1">Pasal 7 - Prosedur Peminjaman</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Pemohon wajib mengajukan permohonan tertulis minimal 5 (lima) hari kerja sebelumnya.</li>
                              <li>Permohonan disertai surat permohonan resmi, identitas pemohon, dan keterangan tujuan penggunaan.</li>
                              <li>Penentuan sopir dilakukan oleh BKAD kecuali pemohon menggunakan sopir pribadi dengan izin tertulis.</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-teal-800 mb-1">Pasal 8 - Tarif dan Pembayaran</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Tarif retribusi sebagaimana tercantum dalam tabel di atas sesuai Pasal 7 Peraturan Bupati berdasarkan {perdaTitle}.</li>
                              <li>Tarif pelajar berlaku untuk kegiatan pendidikan formal yang diselenggarakan oleh lembaga pendidikan.</li>
                              <li>Pembayaran retribusi dilakukan sebelum penggunaan kendaraan melalui kas daerah.</li>
                              <li>Biaya bahan bakar ditanggung oleh peminjam.</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-teal-800 mb-1">Pasal 9 - Kewajiban Peminjam</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Menjaga keamanan dan kebersihan kendaraan selama peminjaman.</li>
                              <li>Mengembalikan kendaraan tepat waktu sesuai kesepakatan.</li>
                              <li>Bertanggung jawab atas kerusakan atau kehilangan akibat kelalaian peminjam.</li>
                              <li>Tidak menggunakan kendaraan untuk tujuan di luar yang disepakati.</li>
                              <li>Melaporkan segala kerusakan atau kecelakaan kepada BKAD segera setelah terjadi.</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold text-teal-800 mb-1">Pasal 10 - Sanksi</h4>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                              <li>Keterlambatan pengembalian kendaraan dikenakan denda 10% tarif per hari keterlambatan.</li>
                              <li>Kerusakan akibat kelalaian menjadi tanggung jawab peminjam sepenuhnya.</li>
                              <li>Pelanggaran ketentuan dapat mengakibatkan sanksi pemblokiran peminjaman di masa mendatang.</li>
                            </ol>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-teal-200">
                            <FileCheck className="size-4 text-teal-600 shrink-0" />
                            <p className="text-xs text-teal-700 font-medium">
                              Dengan mengajukan peminjaman, Anda menyetujui seluruh ketentuan dalam Peraturan Bupati ini.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
