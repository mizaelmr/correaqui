import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TIME_BANDS } from './constants'

export function formatTimeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
    .replace('cerca de ', '')
}

export function getDaysSince(date: string | Date): number {
  return differenceInDays(new Date(), new Date(date))
}

export function getTimeBand(date: string | Date) {
  const days = getDaysSince(date)
  return TIME_BANDS.find((band) => days <= band.max) ?? TIME_BANDS[TIME_BANDS.length - 1]
}

export function getTimeBarProgress(date: string | Date): number {
  const days = getDaysSince(date)
  // Max at 365 days = 100%
  return Math.min((days / 365) * 100, 100)
}
