import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { CATEGORY_LABELS, SEVERITY_LABELS, STATUS_LABELS } from '@/lib/constants'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Calendar, ThumbsUp, ArrowLeft, CheckCircle, TrafficCone } from 'lucide-react'
import { ShareButtons } from './ShareButtons'
import type { Category, Severity, OccurrenceStatus } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

async function getOccurrence(id: string) {
  return prisma.occurrence.findUnique({
    where: { id },
    include: {
      photos: true,
      timeline: { orderBy: { createdAt: 'asc' } },
      user: { select: { name: true } },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const o = await getOccurrence(id)
  if (!o) return { title: 'Ocorrência não encontrada' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const image = o.photos[0]?.url ?? undefined

  return {
    title: `${o.title} — CORRE AQUI PREFEITO`,
    description: o.description,
    openGraph: {
      title: o.title,
      description: `${o.address} · ${CATEGORY_LABELS[o.category as Category]} · ${SEVERITY_LABELS[o.severity as Severity]}`,
      url: appUrl ? `${appUrl}/ocorrencia/${id}` : undefined,
      images: image ? [{ url: image, width: 1200, height: 630, alt: o.title }] : [],
      type: 'article',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: o.title,
      description: o.description,
      images: image ? [image] : [],
    },
  }
}

const severityColors: Record<string, string> = {
  BAIXA: 'bg-green-100 text-green-700',
  MEDIA: 'bg-yellow-100 text-yellow-700',
  ALTA: 'bg-orange-100 text-orange-700',
  CRITICA: 'bg-red-100 text-red-700',
}

const statusColors: Record<string, string> = {
  ABERTA: 'bg-blue-100 text-blue-700',
  EM_ANALISE: 'bg-purple-100 text-purple-700',
  AGUARDANDO_VALIDACAO: 'bg-amber-100 text-amber-700',
  RESOLVIDA: 'bg-green-100 text-green-700',
}

export default async function OcorrenciaPage({ params }: Props) {
  const { id } = await params
  const o = await getOccurrence(id)
  if (!o) notFound()

  const sharePath = `/ocorrencia/${id}`

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrafficCone className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">CORRE AQUI PREFEITO</span>
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-3.5 h-3.5" />
            Ver mapa
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Foto principal */}
        {o.photos.length > 0 && (
          <div className="rounded-xl overflow-hidden aspect-video bg-gray-200">
            <img
              src={o.photos[0].url}
              alt={o.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${severityColors[o.severity]}`}>
              {SEVERITY_LABELS[o.severity as Severity]}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[o.status]}`}>
              {STATUS_LABELS[o.status as OccurrenceStatus]}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {CATEGORY_LABELS[o.category as Category]}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-900">{o.title}</h1>

          <p className="text-gray-600 leading-relaxed">{o.description}</p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Endereço</p>
                <p className="text-sm text-gray-700">{o.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Registrado em</p>
                <p className="text-sm text-gray-700">
                  {format(new Date(o.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ThumbsUp className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Confirmações</p>
                <p className="text-sm font-medium text-gray-700">{o.confirmations}</p>
              </div>
            </div>
            {o.user && o.showReporter && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Reportado por</p>
                  <p className="text-sm text-gray-700">{o.user.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Galeria extra */}
          {o.photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {o.photos.slice(1).map((p) => (
                <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linha do tempo */}
        {o.timeline.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Linha do Tempo</h2>
            <ol className="relative border-l border-gray-200 space-y-4 ml-2">
              {o.timeline.map((event) => (
                <li key={event.id} className="ml-4">
                  <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                  <p className="text-sm text-gray-700">{event.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(event.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Compartilhar */}
        <ShareButtons path={sharePath} title={o.title} address={o.address} />

        {/* CTA */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
          <p className="text-sm text-blue-800 font-medium mb-3">
            Conhece outro problema na sua cidade?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Registrar no mapa
          </Link>
        </div>
      </main>
    </div>
  )
}
