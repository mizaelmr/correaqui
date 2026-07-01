'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { Crosshair, Loader2, Plus, Minus } from 'lucide-react'
import { DraggableMarker } from '@/components/map/DraggableMarker'
import 'leaflet/dist/leaflet.css'

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.6 })
  }, [center, map, zoom])
  return null
}

interface MiniMapControlsProps {
  onLocate: (lat: number, lng: number) => void
}

function MiniMapControls({ onLocate }: MiniMapControlsProps) {
  const map = useMap()
  const [loading, setLoading] = useState(false)

  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.flyTo([coords.latitude, coords.longitude], 16, { duration: 1 })
        onLocate(coords.latitude, coords.longitude)
        setLoading(false)
      },
      () => setLoading(false),
      { timeout: 8000 }
    )
  }

  const btn = 'w-8 h-8 bg-white flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-700'

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control mb-2 mr-2 flex flex-col rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <button type="button" onClick={() => map.zoomIn()} title="Aproximar" className={`${btn} border-b border-gray-200`}>
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => map.zoomOut()} title="Afastar" className={`${btn} border-b border-gray-200`}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={handleLocate} title="Minha localização" className={btn}>
          {loading
            ? <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            : <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          }
        </button>
      </div>
    </div>
  )
}

interface MiniMapProps {
  position: [number, number]
  center?: [number, number]
  zoom?: number
  onMarkerMove: (lat: number, lng: number) => void
}

export function MiniMap({ position, center, zoom = 16, onMarkerMove }: MiniMapProps) {
  return (
    <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={position}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={position} onChange={onMarkerMove} />
        <MiniMapControls onLocate={onMarkerMove} />
        {center && <MapRecenter center={center} zoom={zoom} />}
      </MapContainer>
    </div>
  )
}
