'use client'

import { MapPin } from 'lucide-react'
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
  const { selectedOccurrence, setSelectedOccurrence, setMapCenter, openOccurrenceModal } =
    useOccurrencesStore()

  const isSelected = selectedOccurrence?.id === o.id

  const handleClick = () => {
    setSelectedOccurrence(o)
    setMapCenter([o.latitude, o.longitude])
  }

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openOccurrenceModal(o)
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

      <button
        onClick={handleDetailsClick}
        className="mt-2 text-xs text-blue-600 hover:underline"
      >
        Ver detalhes →
      </button>
    </div>
  )
}
