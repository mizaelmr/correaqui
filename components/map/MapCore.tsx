'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MapMarker } from './MapMarker'
import { MapController } from './MapController'
import { useOccurrencesStore } from '@/store/occurrences'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants'
import type { Occurrence } from '@/types'

interface MapCoreProps {
  occurrences: Occurrence[]
  selectedId: string | null
}

function MapClickHandler() {
  useMapEvents({
    click() {
      useOccurrencesStore.getState().setSelectedOccurrence(null)
    },
  })
  return null
}

export function MapCore({ occurrences, selectedId }: MapCoreProps) {
  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController />
      <MapClickHandler />
      {occurrences.map((occurrence) => (
        <MapMarker
          key={occurrence.id}
          occurrence={occurrence}
          isSelected={occurrence.id === selectedId}
        />
      ))}
    </MapContainer>
  )
}
