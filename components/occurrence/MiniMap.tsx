'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { DraggableMarker } from '@/components/map/DraggableMarker'
import 'leaflet/dist/leaflet.css'

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 16, { duration: 0.6 })
  }, [center, map])
  return null
}

interface MiniMapProps {
  position: [number, number]
  center?: [number, number]
  onMarkerMove: (lat: number, lng: number) => void
}

export function MiniMap({ position, center, onMarkerMove }: MiniMapProps) {
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
        {center && <MapRecenter center={center} />}
      </MapContainer>
    </div>
  )
}
