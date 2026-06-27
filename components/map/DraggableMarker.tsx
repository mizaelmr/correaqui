'use client'

import { useRef, useCallback, useMemo } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import type { Marker as LeafletMarker } from 'leaflet'

interface DraggableMarkerProps {
  position: [number, number]
  onChange: (lat: number, lng: number) => void
}

export function DraggableMarker({ position, onChange }: DraggableMarkerProps) {
  const markerRef = useRef<LeafletMarker>(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker) {
          const { lat, lng } = marker.getLatLng()
          onChange(lat, lng)
        }
      },
    }),
    [onChange]
  )

  const icon = useMemo(
    () =>
      L.divIcon({
        html: `
        <div style="
          width: 40px; height: 40px;
          border-radius: 50% 50% 50% 0;
          background: #3b82f6;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          transform: rotate(-45deg);
          cursor: grab;
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
        </div>
      `,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      }),
    []
  )

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={icon}
    />
  )
}
