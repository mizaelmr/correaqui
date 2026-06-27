'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { X, MapPin, Calendar, RefreshCw, CheckCircle, ThumbsUp, Share2, MessageCircle, Copy, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhotoGallery } from './PhotoGallery'
import { OccurrenceTimeline } from './OccurrenceTimeline'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { TimeIndicator } from '@/components/shared/TimeIndicator'
import { ResolutionModal } from './ResolutionModal'
import { useOccurrencesStore } from '@/store/occurrences'
import { useConfirmOccurrence } from '@/hooks/useOccurrences'
import { CATEGORY_LABELS } from '@/lib/constants'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export function OccurrenceModal() {
  const { isOccurrenceModalOpen, selectedOccurrence, closeOccurrenceModal } = useOccurrencesStore()
  const [showResolution, setShowResolution] = useState(false)
  const [copied, setCopied] = useState(false)
  const confirmMutation = useConfirmOccurrence()
  const { data: session } = useSession()
  const router = useRouter()

  if (!selectedOccurrence) return null
  const o = selectedOccurrence
  const isAuthor = session?.user?.id === o.userId
  const isLoggedIn = !!session

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/ocorrencia/${o.id}`
  const waText = encodeURIComponent(`🚨 *${o.title}*\n📍 ${o.address}\n\nVeja no correAquiPrefeito: ${shareUrl}`)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(o.id)
      toast.success('Obrigado! Ocorrência confirmada.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      toast.error(msg.includes('409') ? 'Você já confirmou esta ocorrência.' : 'Erro ao confirmar.')
    }
  }

  return (
    <>
      <Dialog open={isOccurrenceModalOpen} onOpenChange={(open) => !open && closeOccurrenceModal()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-3 border-b">
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryIcon category={o.category} />
                    <span className="text-xs text-gray-500">{CATEGORY_LABELS[o.category]}</span>
                  </div>
                  <DialogTitle className="text-left text-base leading-tight">{o.title}</DialogTitle>
                </div>
                <button onClick={closeOccurrenceModal} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <SeverityBadge severity={o.severity} />
                <StatusBadge status={o.status} />
                {o.userId && (
                  <span className="text-xs text-gray-400">
                    por {isAuthor ? 'você' : 'cidadão'}
                  </span>
                )}
              </div>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6">
            <PhotoGallery photos={o.photos} />

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Endereço</p>
                    <p className="text-gray-700 text-xs">{o.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Criado em</p>
                    <p className="text-gray-700 text-xs">
                      {format(new Date(o.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Atualizado em</p>
                    <p className="text-gray-700 text-xs">
                      {format(new Date(o.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Confirmações</p>
                    <p className="text-gray-700 text-xs font-medium">{o.confirmations}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                📍 {o.latitude.toFixed(6)}, {o.longitude.toFixed(6)}
              </div>

              <TimeIndicator date={o.createdAt} showBar />

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 leading-relaxed">{o.description}</p>
              </div>
            </div>

            <Tabs defaultValue="timeline" className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="timeline" className="flex-1 text-xs">Linha do Tempo</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-3">
                <OccurrenceTimeline events={o.timeline} />
              </TabsContent>
            </Tabs>

            {/* Compartilhar */}
            <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                title="Ver página completa"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex gap-2 mt-3">
              {isLoggedIn ? (
                <>
                  {!isAuthor && (
                    <Button
                      variant="outline"
                      className="flex-1 text-sm"
                      onClick={handleConfirm}
                      disabled={confirmMutation.isPending}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1.5" />
                      Confirmar ({o.confirmations})
                    </Button>
                  )}
                  {o.status !== 'RESOLVIDA' && o.status !== 'AGUARDANDO_VALIDACAO' && (
                    <Button
                      className="flex-1 text-sm bg-green-600 hover:bg-green-700"
                      onClick={() => setShowResolution(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Foi resolvido
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => router.push('/login')}
                >
                  Entrar para interagir
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ResolutionModal
        occurrenceId={o.id}
        open={showResolution}
        onClose={() => setShowResolution(false)}
      />
    </>
  )
}
