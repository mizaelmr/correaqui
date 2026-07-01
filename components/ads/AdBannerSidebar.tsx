'use client'

import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { AdContactModal } from './AdContactModal'

interface AdBannerSidebarProps {
  slot?: string
}

export function AdBannerSidebar({ slot = 'sidebar-banner' }: AdBannerSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-ad-slot={slot}
        className="group w-full text-left p-3 rounded-lg border border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-colors"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Megaphone className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-blue-700">Espaço publicitário</span>
        </div>
        <p className="text-xs text-blue-600 leading-snug mb-2">
          Anuncie seu negócio para moradores da região e alcance quem mais importa.
        </p>
        <div className="flex items-center justify-center py-1 px-2 rounded-md bg-blue-600 group-hover:bg-blue-700 transition-colors">
          <span className="text-[11px] font-semibold text-white tracking-wide">Anuncie aqui</span>
        </div>
      </button>

      <AdContactModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
