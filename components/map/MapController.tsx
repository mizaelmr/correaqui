'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useOccurrencesStore } from '@/store/occurrences'

export function MapController() {
  const map = useMap()
  const mapCenter = useOccurrencesStore((s) => s.mapCenter)
  const mapZoom = useOccurrencesStore((s) => s.mapZoom)

  useEffect(() => {
    if (mapCenter) {
      map.flyTo(mapCenter, mapZoom ?? map.getZoom(), { duration: 0.8 })
    }
  }, [map, mapCenter, mapZoom])

  return null
}
