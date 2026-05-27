'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import TemplateManager from '@/components/TemplateManager'

export default function TemplateManagerOverlay() {
  const templateManagerOpen = useAppStore((s) => s.templateManagerOpen)
  const setTemplateManagerOpen = useAppStore((s) => s.setTemplateManagerOpen)

  if (!templateManagerOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-auto">
      <div className="sticky top-4 z-10 flex justify-end px-4">
        <Button
          variant="outline"
          onClick={() => setTemplateManagerOpen(false)}
          className="btn-modern border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
      </div>
      <TemplateManager />
    </div>
  )
}
