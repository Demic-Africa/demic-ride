'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const DriverMap = dynamic(() => import('@/components/DriverMap'), { ssr: false })

export default function TrackContent() {
  const { id } = useParams()
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    const loadBooking = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, drivers(*)')
        .eq('id', id)
        .single()
      setBooking(data)
    }

    loadBooking()

    const channel = supabase
      .channel(`booking-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${id}` }, payload => {
        setBooking((prev: any) => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  if (!booking) return <main><p>Loading...</p></main>

  const statusSteps = [
    { key: 'dispatched', label: 'Driver Assigned', icon: '🚖' },
    { key: 'picked_up', label: 'Trip Started', icon: '🟢' },
    { key: 'completed', label: 'Completed', icon: '✅' },
  ]

  const currentStep = statusSteps.findIndex(s => s.key === booking.status)

  return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
      </nav>
      <main style={{ maxWidth: '600px', paddingTop: '3rem' }}>
        <h1 className="display" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>TRACKING YOUR RIDE</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '3px', background: 'var(--border)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '20px', left: '10%', width: `${currentStep * 40}%`, height: '3px', background: 'var(--amber)', zIndex: 1, transition: 'width 0.5s' }} />
          {statusSteps.map((s, i) => (
            <div key={s.key} style={{ textAlign: 'center', zIndex: 2 }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: i <= currentStep ? 'var(--amber)' : 'var(--surface)',
                border: `2px solid ${i <= currentStep ? 'var(--amber)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.5rem', fontSize: '1.2rem'
              }}>
                {s.icon}
              </div>
              <p style={{ fontSize: '0.75rem', color: i <= currentStep ? 'var(--white)' : 'var(--muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {booking.drivers && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <p style={{ fontWeight: 600 }}>{booking.drivers.name}</p>
            <p style={{ color: 'var(--muted)' }}>{booking.drivers.vehicle} — {booking.drivers.vehicle_plate}</p>
          </div>
        )}

        {booking.driver_id && booking.status !== 'completed' && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>📍 Live Tracking</h3>
            <DriverMap 
              driverId={booking.driver_id}
              pickupLat={booking.pickup_lat}
              pickupLng={booking.pickup_lng}
            />
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--muted)' }}>Pickup</span>
            <span>{booking.pickup_address}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Destination</span>
            <span>{booking.destination_address}</span>
          </div>
        </div>
      </main>
    </>
  )
}
