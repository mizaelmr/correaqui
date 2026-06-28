import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CATEGORY_LABELS, CATEGORY_ICONS, SEVERITY_BADGE_VARIANTS, SEVERITY_LABELS, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { formatTimeAgo, getTimeBand } from '@/lib/time'
import { MapPin, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default async function MinhasOcorrenciasPage() {
  const session = await auth()

  const occurrences = await prisma.occurrence.findMany({
    where: { userId: session!.user.id },
    include: { photos: { take: 1 }, _count: { select: { confirmationsList: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const total = occurrences.length
  const resolvidas = occurrences.filter((o) => o.status === 'RESOLVIDA').length
  const aguardando = occurrences.filter((o) => o.status === 'AGUARDANDO_VALIDACAO').length
  const abertas = occurrences.filter((o) => o.status === 'ABERTA' || o.status === 'EM_ANALISE').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Minhas Ocorrências</h1>
        <p className="text-sm text-gray-500">Acompanhe todas as ocorrências que você registrou</p>
      </div>

      {/* Dashboard resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Abertas', value: abertas, color: 'bg-gray-50 text-gray-700' },
          { label: 'Resolvidas', value: resolvidas, color: 'bg-green-50 text-green-700' },
          { label: 'Aguardando', value: aguardando, color: 'bg-amber-50 text-amber-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {occurrences.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma ocorrência registrada</p>
          <p className="text-sm text-gray-400 mt-1">
            Volte ao mapa e registre o primeiro problema da sua cidade.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            Ir para o mapa →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {occurrences.map((o) => {
            const band = getTimeBand(o.createdAt)
            return (
              <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
                {o.photos[0] ? (
                  <img src={o.photos[0].url} alt="" className="w-20 h-20 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{CATEGORY_ICONS[o.category]}</span>
                      <span className="text-xs text-gray-500">{CATEGORY_LABELS[o.category]}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_BADGE_VARIANTS[o.severity]}`}>
                        {SEVERITY_LABELS[o.severity]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-gray-900 mt-1 truncate">{o.title}</p>

                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{o.address}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {band.emoji} {formatTimeAgo(o.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                      {o._count.confirmationsList} confirmações
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
