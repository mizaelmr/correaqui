'use client'

import { useState } from 'react'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OccurrenceCard } from '@/components/occurrence/OccurrenceCard'
import { useOccurrences } from '@/hooks/useOccurrences'
import { useOccurrencesStore } from '@/store/occurrences'
import { CATEGORY_LABELS, SEVERITY_LABELS, STATUS_LABELS } from '@/lib/constants'
import { AdBannerSidebar } from '@/components/ads/AdBannerSidebar'
import type { Category, Severity, OccurrenceStatus, Occurrence } from '@/types'

export function Sidebar() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { filters, setFilters } = useOccurrencesStore()
  const { data: occurrences = [], isLoading } = useOccurrences(filters)

  const activeOccurrences = occurrences.filter((o: Occurrence) => o.status !== 'RESOLVIDA')

  const clearFilters = () => setFilters({})

  const hasFilters = !!(filters.category || filters.severity || filters.status || filters.neighborhood)

  return (
    <aside className="w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {isLoading ? 'Carregando...' : `${activeOccurrences.length} ocorrências`}
          </span>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
            {hasFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                !
              </span>
            )}
            {filtersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {filtersOpen && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <Select
              value={filters.category || ''}
              onValueChange={(v) =>
                setFilters({ ...filters, category: v === 'all' ? undefined : (v as Category) })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.severity || ''}
              onValueChange={(v) =>
                setFilters({ ...filters, severity: v === 'all' ? undefined : (v as Severity) })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Gravidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as gravidades</SelectItem>
                {(Object.entries(SEVERITY_LABELS) as [Severity, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || ''}
              onValueChange={(v) =>
                setFilters({
                  ...filters,
                  status: v === 'all' ? undefined : (v as OccurrenceStatus),
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {(Object.entries(STATUS_LABELS) as [OccurrenceStatus, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={clearFilters}
              >
                <X className="w-3 h-3 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))
          ) : activeOccurrences.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Nenhuma ocorrência encontrada</p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            activeOccurrences.map((occurrence: Occurrence, index: number) => (
              <div key={occurrence.id}>
                {index > 0 && index % 5 === 0 && <AdBannerSidebar slot={`sidebar-between-${index}`} />}
                <OccurrenceCard occurrence={occurrence} />
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-gray-100">
        <AdBannerSidebar slot="sidebar-bottom" />
      </div>
    </aside>
  )
}
