'use client'

import { useState } from 'react'
import { MapPin, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { TimeIndicator } from '@/components/shared/TimeIndicator'
import { useOccurrencesStore } from '@/store/occurrences'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Occurrence } from '@/types'
import { cn } from '@/lib/utils'

interface OccurrenceCardProps {
  occurrence: Occurrence
}

export function OccurrenceCard({ occurrence: o }: OccurrenceCardProps) {
  const { selectedOccurrence, setSelectedOccurrence, setMapCenter, openOccurrenceModal, closeSidebar } =
    useOccurrencesStore()
  const [copied, setCopied] = useState(false)

  const isSelected = selectedOccurrence?.id === o.id
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const shareUrl = `${appUrl}/ocorrencia/${o.id}`
  const waText = encodeURIComponent(`🚨 *${o.title}*\n📍 ${o.address}\n\nVeja no correAquiPrefeito: ${shareUrl}`)

  const handleClick = () => {
    setSelectedOccurrence(o)
    setMapCenter([o.latitude, o.longitude])
    closeSidebar()
  }

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openOccurrenceModal(o)
    closeSidebar()
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
        isSelected
          ? 'border-blue-400 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <CategoryIcon category={o.category} />
          <span className="text-xs text-gray-500 truncate">{CATEGORY_LABELS[o.category]}</span>
        </div>
        <SeverityBadge severity={o.severity} size="sm" />
      </div>

      <h3 className="text-sm font-medium text-gray-900 leading-tight mb-1.5 line-clamp-2">
        {o.title}
      </h3>

      <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">{o.address}</span>
      </div>

      <TimeIndicator date={o.createdAt} />

      {o.photos.length > 0 && (
        <div className="mt-2 flex gap-1">
          {o.photos.slice(0, 3).map((p) => (
            <img
              key={p.id}
              src={p.url}
              alt=""
              className="w-10 h-10 object-cover rounded"
            />
          ))}
        </div>
      )}

      <div className="mt-2.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <button
          id="btn-ver-detalhe"
          onClick={handleDetailsClick}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-md py-1.5 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Ver detalhe
        </button>
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Compartilhar no WhatsApp"
          className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-green-500" />
        </a>
        <button
          onClick={handleCopy}
          title="Copiar link"
          className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {copied
            ? <Check className="w-3.5 h-3.5 text-green-500" />
            : <Copy className="w-3.5 h-3.5 text-gray-400" />
          }
        </button>
      </div>
    </div>
  )
}
