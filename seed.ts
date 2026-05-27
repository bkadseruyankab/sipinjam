import { db } from './src/lib/db'
import { hashPassword } from './src/lib/auth'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const existingAdmin = await db.user.findUnique({ where: { email: 'admin@epakar.id' } })
  if (!existingAdmin) {
    const admin = await db.user.create({
      data: {
        email: 'admin@epakar.id',
        name: 'Administrator',
        password: hashPassword('admin123'),
        role: 'admin',
        phone: '(022) 4235050',
        instansi: 'BKAD Kota Bandung',
      },
    })
    console.log('✅ Admin user created:', admin.email)
  } else {
    console.log('ℹ️ Admin user already exists')
  }

  // Create demo user
  const existingUser = await db.user.findUnique({ where: { email: 'user@demo.id' } })
  if (!existingUser) {
    const user = await db.user.create({
      data: {
        email: 'user@demo.id',
        name: 'Budi Santoso',
        password: hashPassword('user123'),
        role: 'user',
        phone: '081234567890',
        instansi: 'Dinas Pendidikan Kota Bandung',
      },
    })
    console.log('✅ Demo user created:', user.email)
  } else {
    console.log('ℹ️ Demo user already exists')
  }

  // Create vehicles
  const vehicleCount = await db.kendaraan.count()
  if (vehicleCount === 0) {
    const vehicles = await db.kendaraan.createMany({
      data: [
        {
          nama: 'Medium Bus BKAD 1',
          jenis: 'medium_bus',
          platNomor: 'D 1234 AB',
          kapasitas: 40,
          status: 'tersedia',
          imageUrl: '/images/hero-kendaraan.png',
        },
        {
          nama: 'Medium Bus BKAD 2',
          jenis: 'medium_bus',
          platNomor: 'D 5678 CD',
          kapasitas: 40,
          status: 'tersedia',
          imageUrl: '/images/hero-kendaraan.png',
        },
        {
          nama: 'Mini Bus BKAD 1',
          jenis: 'mini_bus',
          platNomor: 'D 9012 EF',
          kapasitas: 16,
          status: 'tersedia',
          imageUrl: '/images/hero-kendaraan.png',
        },
        {
          nama: 'Mini Bus BKAD 2',
          jenis: 'mini_bus',
          platNomor: 'D 3456 GH',
          kapasitas: 16,
          status: 'tersedia',
          imageUrl: '/images/hero-kendaraan.png',
        },
        {
          nama: 'Mini Bus BKAD 3',
          jenis: 'mini_bus',
          platNomor: 'D 7890 IJ',
          kapasitas: 16,
          status: 'tersedia',
          imageUrl: '/images/hero-kendaraan.png',
        },
      ],
    })
    console.log(`✅ ${vehicles.count} vehicles created`)
  } else {
    console.log('ℹ️ Vehicles already exist')
  }

  // Create sample borrowings
  const borrowingCount = await db.borrowing.count()
  if (borrowingCount === 0) {
    const admin = await db.user.findUnique({ where: { email: 'admin@epakar.id' } })
    const demoUser = await db.user.findUnique({ where: { email: 'user@demo.id' } })
    const firstVehicle = await db.kendaraan.findFirst()

    if (demoUser && firstVehicle) {
      await db.borrowing.createMany({
        data: [
          {
            userId: demoUser.id,
            type: 'aula',
            status: 'approved',
            kegiatan: 'Rapat Koordinasi Dinas Pendidikan',
            tanggalPinjam: '2025-07-15',
            tanggalKembali: '2025-07-15',
            waktuMulam: '08:00',
            waktuSelesai: '17:00',
            jenisKegiatan: 'pemerintah',
            waktuPenggunaan: 'siang',
          },
          {
            userId: demoUser.id,
            type: 'aula',
            status: 'pending',
            kegiatan: 'Seminar Pendidikan Nasional',
            tanggalPinjam: '2025-07-20',
            tanggalKembali: '2025-07-20',
            waktuMulam: '08:00',
            waktuSelesai: '17:00',
            jenisKegiatan: 'umum',
            waktuPenggunaan: 'siang',
          },
          {
            userId: demoUser.id,
            type: 'kendaraan',
            status: 'approved',
            kegiatan: 'Kunjungan Kerja ke Jakarta',
            tanggalPinjam: '2025-07-18',
            tanggalKembali: '2025-07-19',
            kendaraanId: firstVehicle.id,
            keperluanKendaraan: 'pelajar',
            tujuan: 'Jakarta',
            jumlahPenumpang: 30,
            sopir: 'Dengan Sopir',
          },
          {
            userId: demoUser.id,
            type: 'kendaraan',
            status: 'pending',
            kegiatan: 'Study Tour Pelajar',
            tanggalPinjam: '2025-07-25',
            tanggalKembali: '2025-07-26',
            keperluanKendaraan: 'pelajar',
            tujuan: 'Bogor',
            jumlahPenumpang: 25,
            sopir: 'Dengan Sopir',
          },
        ],
      })
      console.log('✅ Sample borrowings created')
    }
  } else {
    console.log('ℹ️ Borrowings already exist')
  }

  console.log('🎉 Seeding complete!')
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
