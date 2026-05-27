import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings - Get all settings or by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const setting = await db.settings.findUnique({
        where: { key },
      });
      if (!setting) {
        return NextResponse.json({ setting: { key, value: '' } });
      }
      return NextResponse.json({ setting: { key: setting.key, value: setting.value } });
    }

    const settings = await db.settings.findMany({
      orderBy: { key: 'asc' },
    });

    // Convert to key-value map for easy access
    const settingsMap: Record<string, string> = {};
    const settingsWithLabels: Record<string, { value: string; label: string | null }> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
      settingsWithLabels[s.key] = { value: s.value, label: s.label };
    }

    return NextResponse.json({
      settings: settingsMap,
      settingsWithLabels,
      raw: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil pengaturan' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body; // { key: value, ... }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Data pengaturan tidak valid' },
        { status: 400 }
      );
    }

    // Validate that settings is a plain object with string keys
    const entries = Object.entries(settings as Record<string, unknown>);
    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada pengaturan untuk diperbarui' },
        { status: 400 }
      );
    }

    // Filter out any entries with non-stringifiable values
    const validEntries = entries.filter(([key, value]) => {
      if (!key || typeof key !== 'string') return false;
      // Allow any value that can be stringified
      try {
        String(value);
        return true;
      } catch {
        return false;
      }
    });

    if (validEntries.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada pengaturan valid untuk diperbarui' },
        { status: 400 }
      );
    }

    // Use transaction for atomic updates
    const result = await db.$transaction(
      validEntries.map(([key, value]) =>
        db.settings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      ),
      {
        maxWait: 10000, // 10s max wait to acquire transaction
        timeout: 30000, // 30s timeout for the transaction
      }
    );

    return NextResponse.json({
      message: 'Pengaturan berhasil diperbarui',
      updated: result.length,
    });
  } catch (error) {
    // Provide more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Update settings error:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
    });

    // Check for common error types
    let userMessage = 'Terjadi kesalahan saat memperbarui pengaturan';

    if (errorMessage.includes('database') || errorMessage.includes('SQLITE_BUSY') || errorMessage.includes('locked')) {
      userMessage = 'Database sedang sibuk. Silakan coba lagi dalam beberapa saat.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      userMessage = 'Waktu penyimpanan habis. Silakan coba lagi.';
    } else if (errorMessage.includes('too large') || errorMessage.includes('size')) {
      userMessage = 'Data pengaturan terlalu besar. Kurangi ukuran template atau gambar.';
    }

    return NextResponse.json(
      { error: userMessage, detail: errorMessage },
      { status: 500 }
    );
  }
}
