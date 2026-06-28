import { prisma } from '@/lib/prisma'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/constants'
import { differenceInHours } from 'date-fns'
import { AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, Users } from 'lucide-react'

async function getStats() {
  const [occurrences, totalUsers] = await Promise.all([
    prisma.occurrence.findMany({
      include: { _count: { select: { confirmationsList: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ])

  const total = occurrences.length
  const abertas = occurrences.filter((o) => o.status === 'ABERTA').length
  const emAnalise = occurrences.filter((o) => o.status === 'EM_ANALISE').length
  const aguardando = occurrences.filter((o) => o.status === 'AGUARDANDO_VALIDACAO').length
  const resolvidas = occurrences.filter((o) => o.status === 'RESOLVIDA').length
  const criticas = occurrences.filter((o) => o.severity === 'CRITICA' && o.status !== 'RESOLVIDA').length

  const resolvedWithTime = occurrences.filter((o) => o.status === 'RESOLVIDA')
  const avgResolutionHours = resolvedWithTime.length
    ? Math.round(
        resolvedWithTime.reduce((acc, o) => acc + differenceInHours(o.updatedAt, o.createdAt), 0) /
          resolvedWithTime.length
      )
    : null

  const byCategory = Object.entries(
    occurrences.reduce((acc, o) => {
      acc[o.category] = (acc[o.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])

  const byNeighborhood = Object.entries(
    occurrences
      .filter((o) => o.neighborhood)
      .reduce((acc, o) => {
        acc[o.neighborhood!] = (acc[o.neighborhood!] || 0) + 1
        return acc
      }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return { total, abertas, emAnalise, aguardando, resolvidas, criticas, avgResolutionHours, byCategory, byNeighborhood, totalUsers }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const kpis = [
    { label: 'Total', value: stats.total, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Abertas', value: stats.abertas, icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Em Análise', value: stats.emAnalise, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Críticas', value: stats.criticas, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Aguardando', value: stats.aguardando, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Resolvidas', value: stats.resolvidas, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    {
      label: 'Tempo médio resolução',
      value: stats.avgResolutionHours != null ? `${stats.avgResolutionHours}h` : '—',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    { label: 'Cidadãos', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral das ocorrências da cidade</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Por categoria */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Ocorrências por categoria</h2>
          <div className="space-y-2">
            {stats.byCategory.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-base w-5">{CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}</span>
                <span className="text-sm text-gray-600 flex-1">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-5 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por bairro */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Bairros com mais ocorrências</h2>
          {stats.byNeighborhood.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum dado disponível</p>
          ) : (
            <div className="space-y-3">
              {stats.byNeighborhood.map(([neighborhood, count], i) => (
                <div key={neighborhood} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex items-center gap-1.5 flex-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{neighborhood}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
