import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants'
import type { Category } from '@/types'

interface CategoryIconProps {
  category: Category
  showLabel?: boolean
}

export function CategoryIcon({ category, showLabel = false }: CategoryIconProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span role="img" aria-label={CATEGORY_LABELS[category]}>
        {CATEGORY_ICONS[category]}
      </span>
      {showLabel && (
        <span className="text-sm text-gray-600">{CATEGORY_LABELS[category]}</span>
      )}
    </span>
  )
}
