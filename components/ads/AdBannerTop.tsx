'use client'

import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { AdContactModal } from './AdContactModal'

interface AdBannerTopProps {
  slot?: string
}

export function AdBannerTop({ slot = 'top-banner' }: AdBannerTopProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-ad-slot={slot}
        className="group w-full h-10 bg-blue-50 border-b border-blue-100 flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
      >
        <Megaphone className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">
          Anuncie aqui — alcance os moradores da região
        </span>
      </button>

      <AdContactModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
