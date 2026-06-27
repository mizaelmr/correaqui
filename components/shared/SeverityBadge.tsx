import { SEVERITY_BADGE_VARIANTS, SEVERITY_LABELS } from '@/lib/constants'
import type { Severity } from '@/types'

interface SeverityBadgeProps {
  severity: Severity
  size?: 'sm' | 'md'
}

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const variants = SEVERITY_BADGE_VARIANTS[severity]
  const label = SEVERITY_LABELS[severity]
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${variants} ${sizeClass}`}>
      {label}
    </span>
  )
}
