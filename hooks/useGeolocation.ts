'use client'

import { useState, useCallback } from 'react'
import type { GeoLocation } from '@/types'

interface GeolocationState {
  location: GeoLocation | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
  })

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocalização não suportada' }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
        })
      },
      (err) => {
        setState({ location: null, error: err.message, loading: false })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return { ...state, getLocation }
}
