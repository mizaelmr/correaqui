import { prisma } from '@/lib/prisma'
import { CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS, STATUS_COLORS, SEVERITY_LABELS, SEVERITY_BADGE_VARIANTS } from '@/lib/constants'
import { formatTimeAgo } from '@/lib/time'
import { MapPin } from 'lucide-react'
import { StatusSelector } from '@/components/admin/StatusSelector'

export default async function AdminOcorrenciasPage() {
  const occurrences = await prisma.occurrence.findMany({
    include: { photos: { take: 1 }, _count: { select: { confirmationsList: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Ocorrências</h1>
        <p className="text-sm text-gray-500 mt-1">{occurrences.length} ocorrências registradas</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ocorrência</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Severidade</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {occurrences.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {o.photos[0] ? (
                      <img src={o.photos[0].url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 hidden sm:block" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-[180px]">{o.title}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[160px]">{o.neighborhood || o.address}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span>{CATEGORY_ICONS[o.category as keyof typeof CATEGORY_ICONS]}</span>
                    <span className="text-xs">{CATEGORY_LABELS[o.category as keyof typeof CATEGORY_LABELS]}</span>
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_BADGE_VARIANTS[o.severity as keyof typeof SEVERITY_BADGE_VARIANTS]}`}>
                    {SEVERITY_LABELS[o.severity as keyof typeof SEVERITY_LABELS]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusSelector occurrenceId={o.id} currentStatus={o.status} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                  {formatTimeAgo(o.createdAt.toISOString())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
