/**
 * Print utility with multiple fallback approaches.
 * Primary: popup window approach (most reliable across environments)
 * Fallback 1: iframe-based approach
 * Fallback 2: open in new tab for manual print
 */

interface PrintOptions {
  title?: string
  content: string
  styles?: string
}

const PRINT_STYLES = `
  @page {
    margin: 15mm;
    size: A4;
  }
  body {
    font-family: 'Times New Roman', Georgia, serif;
    margin: 0;
    padding: 20px;
    color: #1a1a1a;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @media print {
    body { margin: 0; padding: 0; }
    .no-print { display: none !important; }
  }
`

/**
 * Build full HTML document string for printing
 */
function buildPrintHTML(options: PrintOptions): string {
  const { title = 'Dokumen', content, styles } = options
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          ${PRINT_STYLES}
          ${styles || ''}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `
}

/**
 * Print HTML content using a popup window approach.
 * This is the most reliable method across different environments including sandboxed iframes.
 */
export function printHTML(options: PrintOptions): void {
  const { title = 'Dokumen' } = options
  const html = buildPrintHTML(options)

  // Try popup window approach first (most reliable)
  try {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      
      // Wait for content to render then print
      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.print()
          } catch {
            // Print dialog may have already been shown
          }
        }, 300)
      }
      
      // Fallback: try to print after a short delay even if onload doesn't fire
      setTimeout(() => {
        try {
          printWindow.print()
        } catch {
          // Already printing or closed
        }
      }, 1500)
      return
    }
  } catch {
    // Popup blocked, try iframe approach
  }

  // Fallback: iframe approach
  try {
    printWithIframe(options)
    return
  } catch {
    // Iframe approach failed
  }

  // Last resort: create a blob URL and open in new tab
  try {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const newTab = window.open(url, '_blank')
    if (newTab) {
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    }
  } catch {
    console.error('All print methods failed')
  }
}

/**
 * Iframe-based print (fallback method)
 */
function printWithIframe(options: PrintOptions): void {
  const { title = 'Dokumen' } = options
  const html = buildPrintHTML(options)

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.overflow = 'hidden'
  iframe.title = title

  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    return
  }

  iframeDoc.open()
  iframeDoc.write(html)
  iframeDoc.close()

  const printInterval = setInterval(() => {
    if (iframeDoc.readyState === 'complete' || iframeDoc.readyState === 'interactive') {
      clearInterval(printInterval)
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch {
        // Iframe print failed
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe)
        } catch {
          // Already removed
        }
      }, 5000)
    }
  }, 100)
}

/**
 * Print the content of a specific DOM element by ID.
 */
export function printElement(elementId: string, title?: string): void {
  const element = document.getElementById(elementId)
  if (!element) {
    console.warn(`Element #${elementId} not found for printing`)
    return
  }

  printHTML({
    title: title || 'Dokumen',
    content: element.innerHTML,
  })
}

/**
 * Generate a receipt HTML for printing from receipt data.
 * Now includes KOP header and signature settings.
 */
export function generateReceiptHTML(receipt: {
  nomor: string
  tanggal: string
  peminjam: { nama: string; instansi: string; email: string; phone: string }
  kegiatan: string
  tipe: string
  tanggalPinjam: string
  tanggalKembali: string
  jumlahHari: number
  detail: {
    jenisKegiatan: string | null
    waktuPenggunaan: string | null
    keperluanKendaraan: string | null
    tujuan: string | null
    jumlahPenumpang: number | null
    sopir: string | null
  }
  tarif: string
  tarifAmount: number
  jumlahHariLabel: string
  totalBiaya: string
  totalBiayaAmount: number
  calculationBreakdown: string
  nomorPerjanjian: string
  approvedBy: string | null
  approvedAt: string | null
  perdaTitle: string
  kendaraan: {
    nama: string
    jenis: string
    platNomor: string
    kapasitas: number
  } | null
  catatanAdmin: string | null
  kop?: {
    logo: string
    line1: string
    line2: string
    alamat: string
    telepon: string
    email: string
    website: string
  }
  ttd?: {
    nama: string
    jabatan: string
    nip: string
    alamat: string
    foto: string
  }
}): string {
  const formatCurrency = (num: number) => `Rp ${num.toLocaleString('id-ID')}`
  const formatDateLong = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return dateStr }
  }
  const formatDateShort = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return dateStr }
  }

  // KOP settings
  const kop = receipt.kop || {
    logo: '',
    line1: 'PEMERINTAH KABUPATEN SERUYAN',
    line2: 'BADAN KEUANGAN DAN ASET DAERAH',
    alamat: '',
    telepon: '',
    email: '',
    website: '',
  }
  const ttd = receipt.ttd || {
    nama: '',
    jabatan: 'Kepala BKAD',
    nip: '',
    alamat: 'Kantor BKAD Kabupaten',
    foto: '',
  }

  // KOP Logo
  const kopLogoHtml = kop.logo
    ? `<img src="${kop.logo}" alt="Logo" style="height:55px;margin-right:10px;object-fit:contain;" />`
    : ''

  // KOP contact info
  const kopContactParts: string[] = []
  if (kop.alamat) kopContactParts.push(kop.alamat)
  const contactLine: string[] = []
  if (kop.telepon) contactLine.push(`Telp. ${kop.telepon}`)
  if (kop.email) contactLine.push(`Email: ${kop.email}`)
  if (kop.website) contactLine.push(`Web: ${kop.website}`)
  if (contactLine.length > 0) kopContactParts.push(contactLine.join(' | '))
  const kopContactHtml = kopContactParts.length > 0
    ? `<p style="margin:2px 0 0;font-size:9px;color:#374151;">${kopContactParts.join('<br/>')}</p>`
    : ''

  // Signature
  const pihakPertamaNama = ttd.nama || 'Administrator'
  const pihakPertamaJabatan = ttd.jabatan || 'Kepala BKAD'
  const pihakPertamaNip = ttd.nip ? `NIP. ${ttd.nip}` : ''

  const descriptionLines: string[] = []
  descriptionLines.push(receipt.kegiatan)
  descriptionLines.push(receipt.tipe === 'aula' ? 'Peminjaman Aula' : 'Peminjaman Kendaraan')
  if (receipt.detail.waktuPenggunaan) {
    descriptionLines.push(`Waktu: ${receipt.detail.waktuPenggunaan === 'siang' ? 'Siang' : 'Malam'}`)
  }
  if (receipt.kendaraan) {
    descriptionLines.push(`${receipt.kendaraan.nama} (${receipt.kendaraan.platNomor})`)
  }
  if (receipt.detail.tujuan) {
    descriptionLines.push(`Tujuan: ${receipt.detail.tujuan}`)
  }
  descriptionLines.push(`${formatDateShort(receipt.tanggalPinjam)} s/d ${formatDateShort(receipt.tanggalKembali)}`)

  const jumlahHari = receipt.jumlahHari || 1

  return `
    <div style="max-width:700px;margin:0 auto;padding:30px;font-family:'Times New Roman',serif;color:#1a1a1a;">
      <!-- KOP Header -->
      <div style="text-align:center;margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:center;">
          ${kopLogoHtml}
          <div>
            <h2 style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#065f46;">${kop.line1}</h2>
            <h2 style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#065f46;">${kop.line2}</h2>
            ${kopContactHtml}
          </div>
        </div>
        <div style="height:3px;background:#065f46;margin:10px 0;"></div>
      </div>

      <!-- Title -->
      <div style="text-align:center;margin:20px 0;">
        <h1 style="margin:0;font-size:18px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;">KWITANSI PEMBAYARAN</h1>
        <p style="margin:6px 0 0;font-size:12px;color:#6b7280;">Tanggal: ${formatDateLong(receipt.tanggal)}</p>
        <div style="margin-top:8px;font-size:11px;color:#6b7280;">No. Kwitansi: <strong>${receipt.nomor}</strong></div>
      </div>

      <div style="height:1px;background:#d1d5db;margin:16px 0;"></div>

      <!-- Peminjam Info -->
      <div style="margin:16px 0;">
        <h3 style="font-size:13px;font-weight:bold;color:#374151;margin-bottom:8px;">Penerima / Peminjam</h3>
        <table style="border:none;font-size:13px;">
          <tr><td style="padding:2px 12px;color:#6b7280;width:100px;">Nama</td><td style="padding:2px 0;font-weight:600;">${receipt.peminjam.nama}</td></tr>
          <tr><td style="padding:2px 12px;color:#6b7280;">Instansi</td><td style="padding:2px 0;">${receipt.peminjam.instansi}</td></tr>
          <tr><td style="padding:2px 12px;color:#6b7280;">Email</td><td style="padding:2px 0;">${receipt.peminjam.email}</td></tr>
          ${receipt.peminjam.phone && receipt.peminjam.phone !== '-' ? `<tr><td style="padding:2px 12px;color:#6b7280;">Telepon</td><td style="padding:2px 0;">${receipt.peminjam.phone}</td></tr>` : ''}
        </table>
      </div>

      <div style="height:1px;background:#d1d5db;margin:16px 0;"></div>

      <!-- Item Table -->
      <div style="margin:16px 0;">
        <h3 style="font-size:13px;font-weight:bold;color:#374151;margin-bottom:8px;">Rincian Peminjaman</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;color:#374151;border-bottom:2px solid #d1d5db;">Keterangan</th>
              <th style="text-align:right;padding:8px 12px;font-size:11px;text-transform:uppercase;color:#374151;border-bottom:2px solid #d1d5db;width:150px;">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
                ${descriptionLines.map((line, i) => `<p style="margin:${i === 0 ? '0' : '2px 0 0'};${i === 0 ? 'font-weight:600;' : 'font-size:11px;color:#6b7280;'}">${line}</p>`).join('')}
              </td>
              <td style="padding:10px 12px;text-align:right;vertical-align:top;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0;font-size:11px;color:#6b7280;">Tarif per hari</p>
                <p style="margin:2px 0 0;font-weight:600;">${receipt.tarif}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;">
                Jumlah hari peminjaman
              </td>
              <td style="padding:8px 12px;text-align:right;border-bottom:1px solid #e5e7eb;font-weight:600;">
                ${jumlahHari} hari
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background:#f9fafb;">
              <td style="padding:10px 12px;font-weight:bold;border-top:2px solid #374151;">TOTAL BIAYA</td>
              <td style="padding:10px 12px;text-align:right;font-weight:bold;font-size:15px;border-top:2px solid #374151;">${receipt.totalBiaya}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:4px 12px 8px;text-align:right;font-size:11px;color:#065f46;font-weight:600;">
                ${formatCurrency(receipt.tarifAmount)} × ${jumlahHari} hari = ${receipt.totalBiaya}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Perjanjian Reference -->
      ${receipt.nomorPerjanjian ? `
      <div style="margin:12px 0;font-size:11px;color:#6b7280;">
        Ref: ${receipt.nomorPerjanjian}
        ${receipt.approvedBy ? ` | Disetujui oleh: ${receipt.approvedBy}` : ''}
      </div>
      ` : ''}

      <!-- Catatan Admin -->
      ${receipt.catatanAdmin ? `
      <div style="margin:12px 0;font-size:11px;color:#6b7280;border:1px solid #e5e7eb;border-radius:4px;padding:8px;">
        <strong>Catatan:</strong> ${receipt.catatanAdmin}
      </div>
      ` : ''}

      <div style="height:1px;background:#d1d5db;margin:20px 0;"></div>

      <!-- Signature Area -->
      <div style="display:flex;justify-content:space-between;margin-top:30px;font-size:12px;">
        <div style="text-align:center;width:45%;">
          <p style="font-weight:bold;margin-bottom:4px;">PIHAK PERTAMA,</p>
          <p style="color:#6b7280;">${pihakPertamaJabatan}</p>
          <div style="height:60px;display:flex;align-items:flex-end;justify-content:center;">
            ${ttd.foto ? `<img src="${ttd.foto}" alt="Tanda Tangan" style="max-height:55px;object-fit:contain;" />` : ''}
          </div>
          <div style="border-bottom:1px solid #374151;width:70%;margin:0 auto;"></div>
          <p style="font-weight:600;margin-top:6px;">(${pihakPertamaNama})</p>
          ${pihakPertamaNip ? `<p style="font-size:11px;color:#6b7280;">${pihakPertamaNip}</p>` : ''}
        </div>
        <div style="text-align:center;width:45%;">
          <p style="font-weight:bold;margin-bottom:4px;">PIHAK KEDUA,</p>
          <p style="color:#6b7280;">Peminjam</p>
          <div style="height:60px;"></div>
          <div style="border-bottom:1px solid #374151;width:70%;margin:0 auto;"></div>
          <p style="font-weight:600;margin-top:6px;">(${receipt.peminjam.nama})</p>
          ${receipt.peminjam.instansi && receipt.peminjam.instansi !== '-' ? `<p style="font-size:11px;color:#6b7280;">${receipt.peminjam.instansi}</p>` : ''}
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top:40px;text-align:center;border-top:1px solid #d1d5db;padding-top:12px;">
        <p style="font-size:10px;color:#9ca3af;margin:0;">Dokumen ini sah berdasarkan ${receipt.perdaTitle}</p>
        <p style="font-size:10px;color:#9ca3af;margin:4px 0 0;">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  `
}
