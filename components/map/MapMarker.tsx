'use client'

import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { CATEGORY_ICONS, SEVERITY_COLORS } from '@/lib/constants'
import type { Occurrence } from '@/types'
import { OccurrencePopup } from '@/components/occurrence/OccurrencePopup'

interface MapMarkerProps {
  occurrence: Occurrence
  isSelected: boolean
}

export function MapMarker({ occurrence, isSelected }: MapMarkerProps) {
  const icon = useMemo(() => {
    const emoji = CATEGORY_ICONS[occurrence.category]
    const color = SEVERITY_COLORS[occurrence.severity]
    const size = isSelected ? 44 : 36

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-45deg);
          transition: all 0.2s ease;
          ${isSelected ? 'box-shadow: 0 4px 16px rgba(0,0,0,0.4);' : ''}
        ">
          <span style="transform: rotate(45deg); font-size: ${isSelected ? '18px' : '14px'};">${emoji}</span>
        </div>
      `,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    })
  }, [occurrence.category, occurrence.severity, isSelected])

  return (
    <Marker position={[occurrence.latitude, occurrence.longitude]} icon={icon}>
      <Popup minWidth={280} maxWidth={320} className="occurrence-popup">
        <OccurrencePopup occurrence={occurrence} />
      </Popup>
    </Marker>
  )
}
