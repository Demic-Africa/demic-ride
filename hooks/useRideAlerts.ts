'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface RideAlert {
  bookingId: string
  passengerName: string
  pickupAddress: string
  destinationAddress: string
  timestamp: string
}

export function useRideAlerts(driverId: string | null) {
  const [alert, setAlert] = useState<RideAlert | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!driverId) return

    const channel = supabase
      .channel(`driver-alerts-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `driver_id=eq.${driverId}`
        },
        (payload) => {
          if (payload.new.status === 'dispatched') {
            setAlert({
              bookingId: payload.new.id,
              passengerName: payload.new.passenger_name,
              pickupAddress: payload.new.pickup_address,
              destinationAddress: payload.new.destination_address,
              timestamp: payload.new.updated_at
            })
            setDismissed(false)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [driverId])

  return { alert, dismissed, setDismissed }
}
