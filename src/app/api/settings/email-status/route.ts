import { NextResponse } from 'next/server';
import { checkEmailConfig } from '@/lib/email';

/**
 * GET /api/settings/email-status
 * Check email configuration status with detailed information
 */
export async function GET() {
  try {
    const status = await checkEmailConfig();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Email status check error:', error);
    return NextResponse.json(
      { configured: false, enabled: false, missingFields: ['Gagal memeriksa konfigurasi'] },
      { status: 500 }
    );
  }
}
