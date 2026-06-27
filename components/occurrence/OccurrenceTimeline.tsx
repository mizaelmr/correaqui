import { formatTimeAgo } from '@/lib/time'
import type { TimelineEvent, TimelineEventType } from '@/types'

const EVENT_ICONS: Record<TimelineEventType, string> = {
  CRIADA: '📍',
  FOTOS_ADICIONADAS: '📷',
  CONFIRMADA: '✅',
  STATUS_ALTERADO: '🔄',
  RESOLUCAO_SOLICITADA: '🔧',
  RESOLUCAO_APROVADA: '🎉',
}

interface OccurrenceTimelineProps {
  events: TimelineEvent[]
}

export function OccurrenceTimeline({ events }: OccurrenceTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
      <div className="space-y-4">
        {sorted.map((event, i) => (
          <div key={event.id} className="relative flex gap-3 pl-10">
            <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm shrink-0">
              {EVENT_ICONS[event.type]}
            </div>
            <div className="pt-1 pb-3">
              <p className="text-sm text-gray-800">{event.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(event.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
