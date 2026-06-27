'use client'

import { useState, useCallback } from 'react'

interface AddressInfo {
  address: string
  neighborhood?: string
  city?: string
  state?: string
}

export function useReverseGeocode() {
  const [loading, setLoading] = useState(false)
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null)

  const geocode = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`
      )
      const data = await res.json()
      const a = data.address || {}

      const street = a.road || a.pedestrian || a.footway || ''
      const houseNumber = a.house_number ? `, ${a.house_number}` : ''
      const neighborhood = a.suburb || a.neighbourhood || a.quarter || ''
      const city = a.city || a.town || a.village || ''
      const state = a.state || ''

      setAddressInfo({
        address: `${street}${houseNumber}${neighborhood ? `, ${neighborhood}` : ''}, ${city} - ${state}`,
        neighborhood,
        city,
        state,
      })
    } catch {
      setAddressInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { geocode, addressInfo, loading }
}
