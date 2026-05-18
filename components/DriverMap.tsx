'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { supabase } from '@/lib/supabase'
import L from 'leaflet'

// Fix Leaflet default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface DriverMapProps {
  driverId: string
  pickupLat?: number
  pickupLng?: number
  destinationLat?: number
  destinationLng?: number
}

export default function DriverMap({ driverId, pickupLat, pickupLng }: DriverMapProps) {
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null)
  const defaultCenter: [number, number] = [-1.2921, 36.8219] // Nairobi

  useEffect(() => {
    if (!driverId) return

    // Get initial driver position
    supabase
      .from('drivers')
      .select('current_lat, current_lng')
      .eq('id', driverId)
      .single()
      .then(({ data }) => {
        if (data?.current_lat && data?.current_lng) {
          setDriverPos({ lat: data.current_lat, lng: data.current_lng })
        }
      })

    // Subscribe to real-time driver location updates
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
          filter: `id=eq.${driverId}`
        },
        (payload) => {
          if (payload.new.current_lat && payload.new.current_lng) {
            setDriverPos({ lat: payload.new.current_lat, lng: payload.new.current_lng })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [driverId])

  const center: [number, number] = driverPos 
    ? [driverPos.lat, driverPos.lng] 
    : pickupLat && pickupLng 
      ? [pickupLat, pickupLng] 
      : defaultCenter

  return (
    <MapContainer center={center} zoom={14} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {driverPos && (
        <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon}>
          <Popup>Your driver is here</Popup>
        </Marker>
      )}
      {pickupLat && pickupLng && (
        <Marker position={[pickupLat, pickupLng]}>
          <Popup>Pickup location</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
