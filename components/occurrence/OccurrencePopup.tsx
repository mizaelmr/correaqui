'use client'

import { MapPin, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { TimeIndicator } from '@/components/shared/TimeIndicator'
import { useOccurrencesStore } from '@/store/occurrences'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Occurrence } from '@/types'

interface OccurrencePopupProps {
  occurrence: Occurrence
}

export function OccurrencePopup({ occurrence }: OccurrencePopupProps) {
  const openOccurrenceModal = useOccurrencesStore((s) => s.openOccurrenceModal)

  return (
    <div className="p-3 pr-7 min-w-[260px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <CategoryIcon category={occurrence.category} />
          <span className="text-xs font-medium text-gray-600">
            {CATEGORY_LABELS[occurrence.category]}
          </span>
        </div>
        <SeverityBadge severity={occurrence.severity} size="sm" />
      </div>

      <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">
        {occurrence.title}
      </h3>

      <div className="flex items-start gap-1 text-xs text-gray-500 mb-2">
        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
        <span className="line-clamp-2">{occurrence.address}</span>
      </div>

      <TimeIndicator date={occurrence.createdAt} />

      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>{occurrence.confirmations} confirmações</span>
        </div>
        {occurrence.photos.length > 0 && (
          <div className="flex -space-x-1">
            {occurrence.photos.slice(0, 3).map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className="w-6 h-6 rounded object-cover border border-white"
              />
            ))}
          </div>
        )}
      </div>

      <Button
        id="btn-ver-detalhe"
        size="sm"
        className="w-full mt-2 h-7 text-xs"
        onClick={() => openOccurrenceModal(occurrence)}
      >
        Ver detalhes
      </Button>
    </div>
  )
}
