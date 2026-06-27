import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import type { OccurrenceStatus } from '@/types'

interface StatusBadgeProps {
  status: OccurrenceStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border text-xs px-2 py-1 font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
