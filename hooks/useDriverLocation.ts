'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Location {
  lat: number
  lng: number
}

export function useDriverLocation(driverId: string | null) {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)

  const updateLocation = useCallback(async (position: GeolocationPosition) => {
    if (!driverId) return
    const { lat, lng } = { lat: position.coords.latitude, lng: position.coords.longitude }
    setLocation({ lat, lng })
    
    await supabase
      .from('drivers')
      .update({ 
        current_lat: lat, 
        current_lng: lng, 
        last_location_update: new Date().toISOString() 
      })
      .eq('id', driverId)
  }, [driverId])

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    
    setIsSharing(true)
    const watchId = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
    )
    
    return () => navigator.geolocation.clearWatch(watchId)
  }, [updateLocation])

  const stopSharing = useCallback(() => {
    setIsSharing(false)
    setLocation(null)
  }, [])

  return { location, error, isSharing, startSharing, stopSharing }
}
