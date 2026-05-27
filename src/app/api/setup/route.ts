import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// GET /api/setup — Check if setup wizard has been completed
export async function GET() {
  try {
    const setting = await db.settings.findUnique({
      where: { key: 'setup_completed' },
    });

    if (setting && setting.value === 'true') {
      // Get setup summary
      const siteName = await db.settings.findUnique({ where: { key: 'site_name' } });
      const adminCount = await db.user.count({ where: { role: 'admin' } });

      return NextResponse.json({
        completed: true,
        completedAt: setting.label || null,
        siteName: siteName?.value || 'E-Pakar',
        adminCount,
      });
    }

    // Backward compatibility: if no setup_completed setting but admin users exist,
    // consider setup already done (e.g. from seed data)
    const adminCount = await db.user.count({ where: { role: 'admin' } });
    if (adminCount > 0) {
      // Auto-mark as completed for existing deployments
      await db.settings.upsert({
        where: { key: 'setup_completed' },
        update: { value: 'true', label: new Date().toISOString() },
        create: { key: 'setup_completed', value: 'true', label: new Date().toISOString() },
      });
      const siteName = await db.settings.findUnique({ where: { key: 'site_name' } });
      return NextResponse.json({
        completed: true,
        completedAt: 'Migrated from existing data',
        siteName: siteName?.value || 'E-Pakar',
        adminCount,
      });
    }

    return NextResponse.json({
      completed: false,
      completedAt: null,
      siteName: null,
      adminCount: 0,
    });
  } catch (error) {
    console.error('Check setup status error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek status setup' },
      { status: 500 }
    );
  }
}

// POST /api/setup — Complete the setup wizard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Step 2: Branding
      siteName,
      siteLogo,
      siteFavicon,
      siteDescription,
      // Step 3: Admin account
      adminName,
      adminEmail,
      adminPassword,
      adminPhone,
      adminInstansi,
      // Step 4: Notifications
      fonnteApiKey,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFrom,
      // Step 5: Tariffs
      tarifAulaPemerintahSiang,
      tarifAulaPemerintahMalam,
      tarifAulaUmumSiang,
      tarifAulaUmumMalam,
      tarifMediumBusPelajar,
      tarifMediumBusKomersil,
      tarifMiniBusPelajar,
      tarifMiniBusKomersil,
      // Step 6: Regulation text
      peraturanText,
      peraturanPerdaText,
    } = body;

    // Check if already setup
    const existing = await db.settings.findUnique({
      where: { key: 'setup_completed' },
    });
    if (existing && existing.value === 'true') {
      return NextResponse.json(
        { error: 'Setup sudah pernah dilakukan. Reset melalui pengaturan.' },
        { status: 400 }
      );
    }

    // Create admin account if credentials provided
    if (adminEmail && adminName && adminPassword) {
      const existingAdmin = await db.user.findUnique({
        where: { email: adminEmail },
      });
      if (!existingAdmin) {
        await db.user.create({
          data: {
            email: adminEmail,
            name: adminName,
            password: hashPassword(adminPassword),
            role: 'admin',
            phone: adminPhone || null,
            instansi: adminInstansi || null,
          },
        });
      }
    }

    // Build settings to save
    const settingsToSave: Record<string, { value: string; label?: string }> = {};

    if (siteName) settingsToSave['site_name'] = { value: siteName, label: 'Nama Aplikasi' };
    if (siteLogo) settingsToSave['site_logo'] = { value: siteLogo, label: 'Logo Aplikasi' };
    if (siteFavicon) settingsToSave['site_favicon'] = { value: siteFavicon, label: 'Favicon' };
    if (siteDescription) settingsToSave['site_description'] = { value: siteDescription, label: 'Deskripsi Aplikasi' };

    if (fonnteApiKey) settingsToSave['fonnte_api_key'] = { value: fonnteApiKey, label: 'Fonnte API Key' };
    if (smtpHost) settingsToSave['smtp_host'] = { value: smtpHost, label: 'SMTP Host' };
    if (smtpPort) settingsToSave['smtp_port'] = { value: String(smtpPort), label: 'SMTP Port' };
    if (smtpUser) settingsToSave['smtp_user'] = { value: smtpUser, label: 'SMTP User' };
    if (smtpPass) settingsToSave['smtp_pass'] = { value: smtpPass, label: 'SMTP Password' };
    if (smtpFrom) settingsToSave['smtp_from'] = { value: smtpFrom, label: 'SMTP From Email' };

    if (tarifAulaPemerintahSiang) settingsToSave['tarif_aula_pemerintah_siang'] = { value: String(tarifAulaPemerintahSiang), label: 'Tarif Aula Pemerintah Siang' };
    if (tarifAulaPemerintahMalam) settingsToSave['tarif_aula_pemerintah_malam'] = { value: String(tarifAulaPemerintahMalam), label: 'Tarif Aula Pemerintah Malam' };
    if (tarifAulaUmumSiang) settingsToSave['tarif_aula_umum_siang'] = { value: String(tarifAulaUmumSiang), label: 'Tarif Aula Umum Siang' };
    if (tarifAulaUmumMalam) settingsToSave['tarif_aula_umum_malam'] = { value: String(tarifAulaUmumMalam), label: 'Tarif Aula Umum Malam' };
    if (tarifMediumBusPelajar) settingsToSave['tarif_medium_bus_pelajar'] = { value: String(tarifMediumBusPelajar), label: 'Tarif Medium Bus Pelajar' };
    if (tarifMediumBusKomersil) settingsToSave['tarif_medium_bus_komersil'] = { value: String(tarifMediumBusKomersil), label: 'Tarif Medium Bus Komersil' };
    if (tarifMiniBusPelajar) settingsToSave['tarif_mini_bus_pelajar'] = { value: String(tarifMiniBusPelajar), label: 'Tarif Mini Bus Pelajar' };
    if (tarifMiniBusKomersil) settingsToSave['tarif_mini_bus_komersil'] = { value: String(tarifMiniBusKomersil), label: 'Tarif Mini Bus Komersil' };

    if (peraturanText) settingsToSave['peraturan_text'] = { value: peraturanText, label: 'Teks Peraturan' };
    if (peraturanPerdaText) settingsToSave['peraturan_perda'] = { value: peraturanPerdaText, label: 'Peraturan Daerah' };

    // Mark setup as completed
    settingsToSave['setup_completed'] = {
      value: 'true',
      label: new Date().toISOString(),
    };

    // Save all settings
    for (const [key, data] of Object.entries(settingsToSave)) {
      await db.settings.upsert({
        where: { key },
        update: { value: data.value, label: data.label },
        create: { key, value: data.value, label: data.label },
      });
    }

    return NextResponse.json({
      message: 'Setup berhasil diselesaikan!',
      savedSettings: Object.keys(settingsToSave).length,
    });
  } catch (error) {
    console.error('Complete setup error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyelesaikan setup' },
      { status: 500 }
    );
  }
}

// DELETE /api/setup — Reset setup (allow re-running wizard)
export async function DELETE() {
  try {
    await db.settings.upsert({
      where: { key: 'setup_completed' },
      update: { value: 'false', label: null },
      create: { key: 'setup_completed', value: 'false' },
    });

    return NextResponse.json({
      message: 'Setup berhasil direset. Silakan jalankan setup wizard kembali.',
    });
  } catch (error) {
    console.error('Reset setup error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mereset setup' },
      { status: 500 }
    );
  }
}
