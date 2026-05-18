'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useDriverLocation } from '@/hooks/useDriverLocation'
import { useRideAlerts } from '@/hooks/useRideAlerts'

const NEXT_STATUS: Record<string, string> = { 
  dispatched: 'picked_up', 
  picked_up: 'completed' 
}
const ACTION_LABEL: Record<string, string> = { 
  dispatched: '→ Mark Picked Up', 
  picked_up: '→ Mark Completed' 
}

export default function DriverPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [driverId, setDriverId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('available')
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { location, error: locationError, isSharing, startSharing, stopSharing } = useDriverLocation(driverId)
  const { alert, dismissed, setDismissed } = useRideAlerts(driverId)

  // Load drivers from Supabase
  const loadDrivers = async () => {
    const { data } = await supabase.from('drivers').select('*').order('name')
    setDrivers(data || [])
    if (data?.length && !driverId) {
      setSelectedDriver(data[0])
      setDriverId(data[0].id)
      setStatus(data[0].status)
    }
    setLoading(false)
  }

  // Load bookings for selected driver
  const loadBookings = useCallback(async () => {
    if (!driverId) return
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })
    setBookings(data || [])
  }, [driverId])

  useEffect(() => { loadDrivers() }, [])
  useEffect(() => { loadBookings() }, [driverId])

  // Handle driver selection
  const handleDriverChange = (driver: any) => {
    setSelectedDriver(driver)
    setDriverId(driver.id)
    setStatus(driver.status)
    stopSharing()
  }

  // Toggle driver status (available/busy/offline)
  const toggleStatus = async (newStatus: string) => {
    if (!driverId) return
    setStatus(newStatus)
    await supabase.from('drivers').update({ status: newStatus }).eq('id', driverId)
    
    if (newStatus === 'offline') stopSharing()
    if (newStatus === 'available') startSharing()
  }

  // Advance booking status (dispatched → picked_up → completed)
  const advance = async (booking: any) => {
    const next = NEXT_STATUS[booking.status]
    if (!next || !driverId) return
    
    await supabase.from('bookings').update({ 
      status: next, 
      updated_at: new Date().toISOString() 
    }).eq('id', booking.id)
    
    await supabase.from('status_logs').insert({
      booking_id: booking.id,
      status: next
    })

    if (next === 'completed') {
      await supabase.from('drivers').update({ status: 'available' }).eq('id', driverId)
      setStatus('available')
    }
    
    loadBookings()
  }

  if (loading) return <main><p>Loading drivers...</p></main>

  return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
        <div className="nav-links"><a href="/book">Book</a><a href="/admin">Admin</a></div>
      </nav>
      <main>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="display" style={{ fontSize: '2.5rem' }}>DRIVER PANEL</h1>
          <button className="btn-ghost" onClick={loadBookings}>↻ Refresh</button>
        </div>

        {/* Driver Selection + Status */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label>Driver</label>
              <select 
                value={driverId || ''} 
                onChange={e => {
                  const d = drivers.find(d => d.id === e.target.value)
                  if (d) handleDriverChange(d)
                }}
              >
                {drivers.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.vehicle_plate}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Status</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['available', 'busy', 'offline'].map(s => (
                  <button 
                    key={s}
                    onClick={() => toggleStatus(s)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: status === s ? '2px solid var(--amber)' : '1px solid var(--border)',
                      background: status === s ? 'var(--amber)' : 'transparent',
                      color: status === s ? 'var(--black)' : 'var(--white)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location Sharing */}
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem' }}>
                📍 {isSharing && location 
                  ? `Sharing: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` 
                  : isSharing 
                    ? 'Acquiring location...' 
                    : 'Location sharing off'}
              </span>
              <button 
                onClick={() => isSharing ? stopSharing() : startSharing()}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: isSharing ? 'var(--danger)' : 'var(--success)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {isSharing ? 'Stop Sharing' : 'Start Sharing'}
              </button>
            </div>
            {locationError && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{locationError}</p>}
          </div>
        </div>

        {/* Ride Alert */}
        {alert && !dismissed && (
          <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--amber)', background: 'rgba(255,215,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ color: 'var(--amber)', marginBottom: '0.5rem' }}>🔔 New Ride Assigned!</h3>
                <p style={{ fontWeight: 600 }}>{alert.passengerName}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                  <strong>Pickup:</strong> {alert.pickupAddress}<br />
                  <strong>Dropoff:</strong> {alert.destinationAddress}
                </p>
              </div>
              <button 
                onClick={() => { setDismissed(true); loadBookings() }}
                style={{ background: 'var(--amber)', color: 'var(--black)', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>No rides assigned to you yet.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bookings.map((booking: any) => (
            <div key={booking.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{booking.passenger_name}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: '0.75rem', fontSize: '0.875rem' }}>{booking.passenger_phone}</span>
                </div>
                <span className={`badge badge-${booking.status}`}>{booking.status.replace('_', ' ')}</span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--white)' }}>{booking.pickup_address}</strong> → <strong style={{ color: 'var(--white)' }}>{booking.destination_address}</strong>
              </div>
              {NEXT_STATUS[booking.status] && (
                <button className="btn-primary" onClick={() => advance(booking)}>
                  {ACTION_LABEL[booking.status]}
                </button>
              )}
              {booking.status === 'completed' && (
                <p style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Trip Completed</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
