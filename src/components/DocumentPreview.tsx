'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'

interface DocumentPreviewProps {
  html: string
  title: string
}

export default function DocumentPreview({ html, title }: DocumentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handlePrint = () => {
    if (iframeRef.current) {
      const iframeWindow = iframeRef.current.contentWindow
      if (iframeWindow) {
        iframeWindow.focus()
        iframeWindow.print()
      }
    }
  }

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 btn-modern"
        >
          <Printer className="size-4" />
          Cetak
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 btn-modern"
        >
          <Download className="size-4" />
          Unduh HTML
        </Button>
      </div>

      {/* Paper-like preview */}
      <div className="relative flex justify-center bg-gray-100 rounded-lg p-4 overflow-auto max-h-[60vh]">
        <div
          className="bg-white shadow-lg border border-gray-200"
          style={{
            width: '210mm',
            maxWidth: '100%',
            minHeight: '297mm',
            padding: '15mm',
            transformOrigin: 'top center',
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={html}
            className="w-full border-0"
            style={{
              height: '297mm',
              minHeight: '500px',
            }}
            title={title}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  )
}
