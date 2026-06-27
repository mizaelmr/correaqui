'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useOccurrencesStore } from '@/store/occurrences'
import { useOccurrences } from '@/hooks/useOccurrences'
import type { Occurrence } from '@/types'

const MapCore = dynamic(() => import('./MapCore').then((m) => m.MapCore), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Carregando mapa...</div>
    </div>
  ),
})

async function geocodeSearch(query: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=pt-BR`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    )
    const data = await res.json()
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
  } catch {}
  return null
}

export function MapView() {
  const filters = useOccurrencesStore((s) => s.filters)
  const { data: occurrences = [], isFetched } = useOccurrences(filters)
  const selectedOccurrence = useOccurrencesStore((s) => s.selectedOccurrence)
  const setMapCenter = useOccurrencesStore((s) => s.setMapCenter)
  const setMapZoom = useOccurrencesStore((s) => s.setMapZoom)

  const prevSearch = useRef<string | undefined>(undefined)

  const activeOccurrences = occurrences.filter((o: Occurrence) => o.status !== 'RESOLVIDA')

  useEffect(() => {
    const currentSearch = filters.search?.trim()
    if (!isFetched) return
    if (currentSearch === prevSearch.current) return
    prevSearch.current = currentSearch

    if (!currentSearch) return

    if (activeOccurrences.length > 0) {
      // Tem ocorrências: centraliza no bounding box delas
      if (activeOccurrences.length === 1) {
        setMapCenter([activeOccurrences[0].latitude, activeOccurrences[0].longitude])
        setMapZoom(16)
      } else {
        const lats = activeOccurrences.map((o) => o.latitude)
        const lngs = activeOccurrences.map((o) => o.longitude)
        setMapCenter([(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2])
        setMapZoom(13)
      }
    } else {
      // Sem ocorrências: geocoda o termo e voa para a localização
      geocodeSearch(currentSearch).then((coords) => {
        if (coords) {
          setMapCenter(coords)
          setMapZoom(13)
        }
      })
    }
  }, [filters.search, isFetched, activeOccurrences, setMapCenter, setMapZoom])

  return (
    <div className="w-full h-full">
      <MapCore
        occurrences={activeOccurrences}
        selectedId={selectedOccurrence?.id ?? null}
      />
    </div>
  )
}
