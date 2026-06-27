'use client'

import { MapContainer, TileLayer } from 'react-leaflet'
import { DraggableMarker } from '@/components/map/DraggableMarker'
import 'leaflet/dist/leaflet.css'

interface MiniMapProps {
  position: [number, number]
  onMarkerMove: (lat: number, lng: number) => void
}

export function MiniMap({ position, onMarkerMove }: MiniMapProps) {
  return (
    <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={position}
        zoom={16}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={position} onChange={onMarkerMove} />
      </MapContainer>
    </div>
  )
}
