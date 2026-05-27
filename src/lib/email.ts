import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

/**
 * Shared email utility for sending notifications via SMTP.
 * Reads SMTP settings and email templates from the database.
 * Creates Notification records for audit logging.
 */

interface EmailSettings {
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_from: string;
  smtp_secure: string;
  email_enabled: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  borrowingId?: string;
}

/**
 * Get email/SMTP settings from database
 */
export async function getEmailSettings(): Promise<EmailSettings> {
  const keys = [
    'smtp_host',
    'smtp_port',
    'smtp_user',
    'smtp_pass',
    'smtp_from',
    'smtp_secure',
    'email_enabled',
  ];

  const settings = await db.settings.findMany({
    where: { key: { in: keys } },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return {
    smtp_host: map.smtp_host || '',
    smtp_port: map.smtp_port || '587',
    smtp_user: map.smtp_user || '',
    smtp_pass: map.smtp_pass || '',
    smtp_from: map.smtp_from || map.smtp_user || '',
    smtp_secure: map.smtp_secure || 'true',
    email_enabled: map.email_enabled !== 'false' ? 'true' : 'false', // default enabled
  };
}

/**
 * Check if SMTP is properly configured
 */
export function isSmtpConfigured(settings: EmailSettings): boolean {
  return !!(settings.smtp_host && settings.smtp_user && settings.smtp_pass);
}

/**
 * Check current email configuration status
 */
export async function checkEmailConfig() {
  const settings = await getEmailSettings();

  const configured = isSmtpConfigured(settings);

  return {
    configured,
    enabled: settings.email_enabled === 'true',

    smtp: {
      host: settings.smtp_host || '',
      port: settings.smtp_port || '587',
      secure: settings.smtp_secure === 'true',
      from: settings.smtp_from || '',
    },

    fields: {
      host: !!settings.smtp_host,
      port: !!settings.smtp_port,
      user: !!settings.smtp_user,
      pass: !!settings.smtp_pass,
      from: !!settings.smtp_from,
    },

    message: configured
      ? 'SMTP configured successfully'
      : 'SMTP configuration incomplete',
  };
}
/**
 * Send an email via SMTP and create a notification record.
 * Returns { success: boolean, error?: string, notificationId?: string }
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string; notificationId?: string }> {
  const settings = await getEmailSettings();

  // Check if email is enabled
  if (settings.email_enabled === 'false') {
    const notification = await db.notification.create({
      data: {
        type: 'email',
        status: 'failed',
        recipient: options.to,
        subject: options.subject,
        message: options.html,
        borrowingId: options.borrowingId || null,
        error: 'Email notification disabled in settings',
      },
    });
    return { success: false, error: 'Email notification disabled', notificationId: notification.id };
  }

  // Check if SMTP is configured
  if (!isSmtpConfigured(settings)) {
    const notification = await db.notification.create({
      data: {
        type: 'email',
        status: 'pending',
        recipient: options.to,
        subject: options.subject,
        message: options.html,
        borrowingId: options.borrowingId || null,
        error: 'SMTP not configured - email queued',
      },
    });
    return { success: true, notificationId: notification.id }; // Return true since it's queued
  }

  // Send via SMTP
  try {
    const port = parseInt(settings.smtp_port || '587');
    const secure = settings.smtp_secure === 'true' && port === 465;

    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port,
      secure,
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_pass,
      },
      tls: settings.smtp_secure === 'true' ? {
        rejectUnauthorized: false,
      } : undefined,
    });

    await transporter.sendMail({
      from: settings.smtp_from || settings.smtp_user,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    const notification = await db.notification.create({
      data: {
        type: 'email',
        status: 'sent',
        recipient: options.to,
        subject: options.subject,
        message: options.html,
        borrowingId: options.borrowingId || null,
        sentAt: new Date(),
      },
    });

    return { success: true, notificationId: notification.id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'SMTP send failed';

    const notification = await db.notification.create({
      data: {
        type: 'email',
        status: 'failed',
        recipient: options.to,
        subject: options.subject,
        message: options.html,
        borrowingId: options.borrowingId || null,
        error: errorMsg,
      },
    });

    return { success: false, error: errorMsg, notificationId: notification.id };
  }
}

/**
 * Apply template variable substitution.
 * Replaces {variable} placeholders with actual values.
 */
export function applyTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '-');
  }
  return result;
}

/**
 * Get email template and subject from settings for a specific notification type.
 * Falls back to default templates if not configured.
 */
export async function getEmailTemplate(
  templateType: 'new' | 'approved' | 'rejected' | 'cancelled' | 'cancel_requested',
  variables: Record<string, string>
): Promise<{ subject: string; html: string }> {
  const templateKey = `email_template_${templateType}`;
  const subjectKey = `email_subject_${templateType}`;

  const settings = await db.settings.findMany({
    where: { key: { in: [templateKey, subjectKey] } },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  // Default templates (same as in SettingsPage.tsx)
  const defaults: Record<string, { template: string; subject: string }> = {
    new: {
      template:
        '<h2>🔔 Peminjaman Baru</h2><p><strong>Nama:</strong> {nama}</p><p><strong>Kegiatan:</strong> {kegiatan}</p><p><strong>Tipe:</strong> {tipe}</p><p><strong>Tanggal:</strong> {tanggal}</p><p>Silakan cek dashboard admin untuk memproses.</p>',
      subject: 'Peminjaman Baru - {kegiatan}',
    },
    approved: {
      template:
        '<h2>✅ Peminjaman Disetujui</h2><p>Halo <strong>{nama}</strong>,</p><p>Peminjaman Anda untuk kegiatan <strong>"{kegiatan}"</strong> pada {tanggal} telah <strong>DISSETUJUI</strong>.</p><p>Nomor Perjanjian: {nomor_perjanjian}</p><p>Silakan cek email untuk detail perjanjian.</p>',
      subject: 'Peminjaman Disetujui - {kegiatan}',
    },
    rejected: {
      template:
        '<h2>❌ Peminjaman Ditolak</h2><p>Halo <strong>{nama}</strong>,</p><p>Peminjaman Anda untuk kegiatan <strong>"{kegiatan}"</strong> pada {tanggal} telah <strong>DITOLAK</strong>.</p><p>Catatan: {catatan}</p>',
      subject: 'Peminjaman Ditolak - {kegiatan}',
    },
    cancel_requested: {
      template:
        '<h2>⚠️ Permintaan Pembatalan</h2><p>Halo <strong>{nama}</strong>,</p><p>Permintaan pembatalan Anda untuk kegiatan <strong>"{kegiatan}"</strong> pada {tanggal} telah <strong>DIAJUKAN</strong>.</p><p>Alasan: {catatan}</p><p>Menunggu persetujuan admin.</p>',
      subject: 'Permintaan Pembatalan - {kegiatan}',
    },
    cancelled: {
      template:
        '<h2>🚫 Peminjaman Dibatalkan</h2><p>Halo <strong>{nama}</strong>,</p><p>Peminjaman Anda untuk kegiatan <strong>"{kegiatan}"</strong> pada {tanggal} telah <strong>DIBATALKAN</strong>.</p><p>Catatan: {catatan}</p>',
      subject: 'Peminjaman Dibatalkan - {kegiatan}',
    },
  };

  const defaultVal = defaults[templateType];
  const rawTemplate = map[templateKey] || defaultVal.template;
  const rawSubject = map[subjectKey] || defaultVal.subject;

  return {
    html: applyTemplate(rawTemplate, variables),
    subject: applyTemplate(rawSubject, variables),
  };
}

/**
 * Get WhatsApp template from settings for a specific notification type.
 * Falls back to default template if not configured.
 */
export async function getWhatsappTemplate(
  templateType: 'new' | 'approved' | 'rejected' | 'cancelled' | 'cancel_requested',
  variables: Record<string, string>
): Promise<string> {
  const templateKey = `wa_template_${templateType}`;

  const setting = await db.settings.findUnique({
    where: { key: templateKey },
  });

  const defaults: Record<string, string> = {
    new: '🔔 *Peminjaman Baru*\n\nNama: {nama}\nKegiatan: {kegiatan}\nTipe: {tipe}\nTanggal: {tanggal}\n\nSilakan cek dashboard admin untuk memproses.',
    approved:
      '✅ *Peminjaman Disetujui*\n\nHalo {nama}, peminjaman Anda untuk kegiatan "{kegiatan}" pada {tanggal} telah *DISSETUJUI*. Silakan cek email untuk detail perjanjian.',
    rejected:
      '❌ *Peminjaman Ditolak*\n\nHalo {nama}, peminjaman Anda untuk kegiatan "{kegiatan}" pada {tanggal} telah *DITOLAK*. {catatan}',
    cancel_requested:
      '⚠️ *Permintaan Pembatalan*\n\nHalo {nama}, permintaan pembatalan Anda untuk kegiatan "{kegiatan}" pada {tanggal} telah *DIAJUKAN*. Alasan: {catatan}\n\nMenunggu persetujuan admin.',
    cancelled:
      '🚫 *Peminjaman Dibatalkan*\n\nHalo {nama}, peminjaman Anda untuk kegiatan "{kegiatan}" pada {tanggal} telah *DIBATALKAN*. {catatan}',
  };

  const rawTemplate = setting?.value || defaults[templateType];
  return applyTemplate(rawTemplate, variables);
}

/**
 * Send WhatsApp notification via Fonnte API.
 * Creates a notification record for audit logging.
 */
export async function sendWhatsApp(
  to: string,
  message: string,
  borrowingId?: string
): Promise<{ success: boolean; error?: string }> {
  // Get Fonnte settings
  const keys = ['fonnte_token', 'fonnte_enabled'];
  const settings = await db.settings.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  const fonnteEnabled = map.fonnte_enabled === 'true';
  const fonnteToken = map.fonnte_token;

  if (!fonnteEnabled || !fonnteToken) {
    await db.notification.create({
      data: {
        type: 'whatsapp',
        status: 'failed',
        recipient: to,
        message,
        borrowingId: borrowingId || null,
        error: !fonnteEnabled
          ? 'WhatsApp notification disabled in settings'
          : 'Fonnte token not configured',
      },
    });
    return { success: false, error: !fonnteEnabled ? 'WhatsApp disabled' : 'No Fonnte token' };
  }

  // Format phone number
  let phone = to.replace(/[\s\-()]/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }
  if (!phone.startsWith('62') && !phone.startsWith('+')) {
    phone = '62' + phone;
  }

  try {
    const fonnteResponse = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': fonnteToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: phone,
        message: message,
      }),
    });

    const fonnteData = await fonnteResponse.json();

    if (fonnteResponse.ok && fonnteData.status === true) {
      await db.notification.create({
        data: {
          type: 'whatsapp',
          status: 'sent',
          recipient: to,
          message,
          borrowingId: borrowingId || null,
          sentAt: new Date(),
        },
      });
      return { success: true };
    } else {
      const errorMsg = fonnteData.reason || fonnteData.message || 'Fonnte API error';
      await db.notification.create({
        data: {
          type: 'whatsapp',
          status: 'failed',
          recipient: to,
          message,
          borrowingId: borrowingId || null,
          error: errorMsg,
        },
      });
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to call Fonnte API';
    await db.notification.create({
      data: {
        type: 'whatsapp',
        status: 'failed',
        recipient: to,
        message,
        borrowingId: borrowingId || null,
        error: errorMsg,
      },
    });
    return { success: false, error: errorMsg };
  }
}
