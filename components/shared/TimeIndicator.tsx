import { formatTimeAgo, getTimeBand, getTimeBarProgress } from '@/lib/time'

interface TimeIndicatorProps {
  date: string
  showBar?: boolean
}

export function TimeIndicator({ date, showBar = false }: TimeIndicatorProps) {
  const band = getTimeBand(date)
  const progress = getTimeBarProgress(date)
  const timeAgo = formatTimeAgo(date)

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>{band.emoji}</span>
        <span>Registrada {timeAgo}</span>
      </div>
      {showBar && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: band.color }}
          />
        </div>
      )}
    </div>
  )
}
