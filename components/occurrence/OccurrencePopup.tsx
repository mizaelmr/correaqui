'use client'

import { MapPin, CheckCircle, ThumbsUp, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { TimeIndicator } from '@/components/shared/TimeIndicator'
import { useOccurrencesStore } from '@/store/occurrences'
import { useConfirmOccurrence } from '@/hooks/useOccurrences'
import { CATEGORY_LABELS } from '@/lib/constants'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Occurrence } from '@/types'

interface OccurrencePopupProps {
  occurrence: Occurrence
}

export function OccurrencePopup({ occurrence }: OccurrencePopupProps) {
  const openOccurrenceModal = useOccurrencesStore((s) => s.openOccurrenceModal)
  const { data: session } = useSession()
  const isOwner = !!session && session.user?.id === occurrence.userId
  const router = useRouter()
  const confirmMutation = useConfirmOccurrence()

  const handleConfirm = async () => {
    if (!session) {
      router.push('/login')
      return
    }
    try {
      await confirmMutation.mutateAsync(occurrence.id)
      toast.success('Obrigado! Ocorrência confirmada.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      toast.error(msg.includes('409') ? 'Você já confirmou esta ocorrência.' : 'Erro ao confirmar.')
    }
  }

  const handleResolved = () => {
    if (!session) {
      router.push('/login')
      return
    }
    openOccurrenceModal(occurrence)
  }

  return (
    <div className="p-3 pt-8 min-w-[260px]">
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

      <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>{occurrence.confirmations} confirmações</span>
        </div>
        {occurrence.photos.length > 0 && (
          <div className="flex gap-1.5">
            {occurrence.photos.slice(0, 3).map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-gray-200"
                onError={(e) => { e.currentTarget.src = ''; e.currentTarget.className = 'w-16 h-16 rounded-lg border border-gray-200 bg-gray-200' }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        <Button
          id="btn-ver-detalhe"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={() => openOccurrenceModal(occurrence)}
        >
          Ver detalhes
        </Button>

        {occurrence.status !== 'RESOLVIDA' && occurrence.status !== 'AGUARDANDO_VALIDACAO' && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || isOwner}
              title={isOwner ? 'Você registrou esta ocorrência' : undefined}
            >
              {confirmMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <ThumbsUp className="w-3.5 h-3.5 mr-1" />
              )}
              Confirmar
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleResolved}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Já resolvido
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
