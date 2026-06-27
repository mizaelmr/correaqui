'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { Crosshair, Loader2, Plus, Minus } from 'lucide-react'
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

function MapBoundsTracker() {
  const setMapBounds = useOccurrencesStore((s) => s.setMapBounds)
  const map = useMapEvents({
    moveend() {
      const b = map.getBounds()
      setMapBounds({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() })
    },
    zoomend() {
      const b = map.getBounds()
      setMapBounds({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() })
    },
  })
  useEffect(() => {
    const b = map.getBounds()
    setMapBounds({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() })
  }, [map, setMapBounds])
  return null
}

function MapControls() {
  const map = useMap()
  const [loading, setLoading] = useState(false)

  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.flyTo([coords.latitude, coords.longitude], 16, { duration: 1 })
        setLoading(false)
      },
      () => setLoading(false),
      { timeout: 8000 }
    )
  }

  const btnClass = "w-10 h-10 bg-white flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-700"

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control mb-20 mr-3 flex flex-col rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <button onClick={() => map.zoomIn()} title="Aproximar" className={`${btnClass} border-b border-gray-200`}>
          <Plus className="w-4 h-4" />
        </button>
        <button onClick={() => map.zoomOut()} title="Afastar" className={`${btnClass} border-b border-gray-200`}>
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={handleLocate} title="Minha localização" className={btnClass}>
          {loading
            ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            : <Crosshair className="w-4 h-4 text-blue-600" />
          }
        </button>
      </div>
    </div>
  )
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
      <MapBoundsTracker />
      <MapControls />
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
