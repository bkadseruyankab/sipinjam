/**
 * Shared KOP (Letterhead) and Template Utilities
 * Used by all print components: ReceiptViewer, ReportPage, AgreementViewer
 * All KOP rendering is unified here to ensure consistency.
 */

export interface KopSettings {
  namaInstansi: string
  kabupaten: string
  alamat: string
  telepon: string
  email: string
  website: string
  logo: string
}

export interface TemplateSettings {
  primaryColor: string
  fontFamily: string
  fontSize: string
  kopLineStyle: 'double' | 'thick' | 'triple'
  paperSize: 'A4' | 'Folio' | 'Legal' | 'Letter'
  marginTop: string
  marginBottom: string
  marginLeft: string
  marginRight: string
  showKopLogo: string  // 'true' | 'false'
  showFooter: string   // 'true' | 'false'
  footerText: string
}

export const DEFAULT_TEMPLATE: TemplateSettings = {
  primaryColor: '#065f46',
  fontFamily: 'Times New Roman',
  fontSize: '12',
  kopLineStyle: 'double',
  paperSize: 'A4',
  marginTop: '15',
  marginBottom: '15',
  marginLeft: '15',
  marginRight: '15',
  showKopLogo: 'true',
  showFooter: 'true',
  footerText: '',
}

/**
 * Parse template settings from a settings map (key-value pairs from DB)
 */
export function parseTemplateSettings(settingsMap: Record<string, string>): TemplateSettings {
  return {
    primaryColor: settingsMap.template_primary_color || DEFAULT_TEMPLATE.primaryColor,
    fontFamily: settingsMap.template_font_family || DEFAULT_TEMPLATE.fontFamily,
    fontSize: settingsMap.template_font_size || DEFAULT_TEMPLATE.fontSize,
    kopLineStyle: (settingsMap.template_kop_line_style as TemplateSettings['kopLineStyle']) || DEFAULT_TEMPLATE.kopLineStyle,
    paperSize: (settingsMap.template_paper_size as TemplateSettings['paperSize']) || DEFAULT_TEMPLATE.paperSize,
    marginTop: settingsMap.template_margin_top || DEFAULT_TEMPLATE.marginTop,
    marginBottom: settingsMap.template_margin_bottom || DEFAULT_TEMPLATE.marginBottom,
    marginLeft: settingsMap.template_margin_left || DEFAULT_TEMPLATE.marginLeft,
    marginRight: settingsMap.template_margin_right || DEFAULT_TEMPLATE.marginRight,
    showKopLogo: settingsMap.template_show_kop_logo || DEFAULT_TEMPLATE.showKopLogo,
    showFooter: settingsMap.template_show_footer || DEFAULT_TEMPLATE.showFooter,
    footerText: settingsMap.template_footer_text || DEFAULT_TEMPLATE.footerText,
  }
}

/**
 * Generate KOP HTML for print documents
 * This is the single source of truth for KOP rendering across all print outputs.
 */
export function generateKOPHtml(kop: KopSettings, template: TemplateSettings): string {
  const color = template.primaryColor
  const showLogo = template.showKopLogo !== 'false'

  // Build KOP line 1: PEMERINTAH KABUPATEN/KOTA ...
  const line1 = `PEMERINTAH ${kop.kabupaten.toUpperCase()}`
  // Build KOP line 2: NAMA INSTANSI
  const line2 = kop.namaInstansi.toUpperCase()

  // Logo HTML
  const kopLogoHtml = (showLogo && kop.logo)
    ? `<img src="${kop.logo}" alt="Logo" style="height:65px;margin-right:14px;object-fit:contain;" />`
    : ''

  // Contact info
  const kopContactParts: string[] = []
  if (kop.alamat) kopContactParts.push(kop.alamat)
  const contactLine: string[] = []
  if (kop.telepon) contactLine.push(`Telp. ${kop.telepon}`)
  if (kop.email) contactLine.push(`Email: ${kop.email}`)
  if (kop.website) contactLine.push(`Web: ${kop.website}`)
  if (contactLine.length > 0) kopContactParts.push(contactLine.join(' &mdash; '))
  const kopContactHtml = kopContactParts.length > 0
    ? `<p style="margin:2px 0 0;font-size:9px;color:#374151;">${kopContactParts.join('<br/>')}</p>`
    : ''

  // KOP line style
  let kopLineHtml = ''
  switch (template.kopLineStyle) {
    case 'double':
      kopLineHtml = `
        <div style="height:3px;background:${color};margin:10px 0 2px;"></div>
        <div style="height:1px;background:${color};margin:0 0 0;"></div>
      `
      break
    case 'thick':
      kopLineHtml = `
        <div style="height:4px;background:${color};margin:10px 0 0;"></div>
      `
      break
    case 'triple':
      kopLineHtml = `
        <div style="height:3px;background:${color};margin:10px 0 2px;"></div>
        <div style="height:1px;background:${color};margin:0 0 2px;"></div>
        <div style="height:1px;background:${color};margin:0 0 0;"></div>
      `
      break
  }

  return `
    <div style="text-align:center;margin-bottom:0;">
      <div style="display:flex;align-items:center;justify-content:center;">
        ${kopLogoHtml}
        <div>
          <h2 style="margin:0;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:${color};font-weight:bold;">${line1}</h2>
          <h2 style="margin:0;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:${color};font-weight:bold;">${line2}</h2>
          ${kopContactHtml}
        </div>
      </div>
      ${kopLineHtml}
    </div>
  `
}

/**
 * Generate common print CSS styles based on template settings
 */
export function generatePrintCSS(template: TemplateSettings, extraCSS?: string): string {
  const paperSize = template.paperSize === 'Folio' ? '210mm 330mm'
    : template.paperSize === 'Legal' ? '216mm 356mm'
    : template.paperSize === 'Letter' ? '216mm 279mm'
    : 'A4'

  return `
    @page {
      margin: ${template.marginTop}mm ${template.marginRight}mm ${template.marginBottom}mm ${template.marginLeft}mm;
      size: ${paperSize};
    }
    body {
      font-family: '${template.fontFamily}', Georgia, serif;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      line-height: 1.6;
      font-size: ${template.fontSize}px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    ${extraCSS || ''}
  `
}

/**
 * Generate signature HTML block for print documents
 */
export function generateSignatureHtml(options: {
  leftTitle: string
  leftSubtitle: string
  leftName: string
  leftNip?: string
  leftSignImg?: string
  rightTitle: string
  rightSubtitle: string
  rightName: string
  rightExtra?: string
  rightSignImg?: string
  color?: string
}): string {
  const color = options.color || '#065f46'

  return `
    <div style="margin-top:40px;font-size:12px;">
      <div style="display:flex;justify-content:space-between;">
        <div style="text-align:center;width:45%;">
          <p style="font-weight:bold;margin-bottom:2px;">${options.leftTitle}</p>
          <p style="color:#4b5563;">${options.leftSubtitle}</p>
          <div style="height:65px;display:flex;align-items:flex-end;justify-content:center;">
            ${options.leftSignImg ? `<img src="${options.leftSignImg}" alt="Tanda Tangan" style="max-height:60px;object-fit:contain;" />` : ''}
          </div>
          <div style="border-bottom:1px solid #1a1a1a;width:75%;margin:0 auto;"></div>
          <p style="font-weight:600;margin-top:4px;">(${options.leftName || '............................'})</p>
          ${options.leftNip ? `<p style="font-size:11px;color:#4b5563;">NIP. ${options.leftNip}</p>` : ''}
        </div>
        <div style="text-align:center;width:45%;">
          <p style="font-weight:bold;margin-bottom:2px;">${options.rightTitle}</p>
          <p style="color:#4b5563;">${options.rightSubtitle}</p>
          <div style="height:65px;display:flex;align-items:flex-end;justify-content:center;">
            ${options.rightSignImg ? `<img src="${options.rightSignImg}" alt="Tanda Tangan" style="max-height:60px;object-fit:contain;" />` : ''}
          </div>
          <div style="border-bottom:1px solid #1a1a1a;width:75%;margin:0 auto;"></div>
          <p style="font-weight:600;margin-top:4px;">(${options.rightName || '............................'})</p>
          ${options.rightExtra ? `<p style="font-size:11px;color:#4b5563;">${options.rightExtra}</p>` : ''}
        </div>
      </div>
    </div>
  `
}

/**
 * Generate footer HTML for print documents
 */
export function generateFooterHtml(options: {
  siteName: string
  perdaTitle: string
  generatedDate: string
  generatedTime: string
  customText?: string
  showFooter: boolean
}): string {
  if (!options.showFooter) return ''

  return `
    <div style="margin-top:50px;border-top:1px solid #d1d5db;padding-top:8px;text-align:center;">
      ${options.customText ? `<p style="font-size:9px;color:#6b7280;margin:0;">${options.customText}</p>` : ''}
      <p style="font-size:9px;color:#6b7280;margin:2px 0 0;">Dokumen ini dicetak dari ${options.siteName} pada ${options.generatedDate} ${options.generatedTime}</p>
      <p style="font-size:9px;color:#6b7280;margin:2px 0 0;">Berdasarkan ${options.perdaTitle}</p>
      <p style="font-size:8px;color:#9ca3af;margin:2px 0 0;">Laporan ini bersifat resmi dan dicetak secara otomatis oleh sistem komputer</p>
    </div>
  `
}

/**
 * Convert template settings to a flat settings map for storage
 */
export function templateSettingsToMap(template: TemplateSettings): Record<string, string> {
  return {
    template_primary_color: template.primaryColor,
    template_font_family: template.fontFamily,
    template_font_size: template.fontSize,
    template_kop_line_style: template.kopLineStyle,
    template_paper_size: template.paperSize,
    template_margin_top: template.marginTop,
    template_margin_bottom: template.marginBottom,
    template_margin_left: template.marginLeft,
    template_margin_right: template.marginRight,
    template_show_kop_logo: template.showKopLogo,
    template_show_footer: template.showFooter,
    template_footer_text: template.footerText,
  }
}
