'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'
import LocationInput from '@/components/LocationInput'

const DriverMap = dynamic(() => import('@/components/DriverMap'), { ssr: false })

export default function BookPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [form, setForm] = useState({
    passenger: '', phone: '', pickup: '', destination: '',
    pickup_lat: undefined as number | undefined, pickup_lng: undefined as number | undefined,
    destination_lat: undefined as number | undefined, destination_lng: undefined as number | undefined,
    date: '', time: '', notes: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('Submission failed. Check your connection or try again.')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [assignedDriver, setAssignedDriver] = useState<{ id: string; name: string; vehicle: string; vehicle_plate: string } | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submitBooking = async () => {
    if (!form.passenger || !form.phone || !form.pickup || !form.destination || !form.date || !form.time) {
      setStatus('error')
      setErrorMsg('Please fill all required fields, including date and time.')
      return
    }
    setStatus('loading')

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        passenger_name: form.passenger,
        passenger_phone: form.phone,
        pickup_address: form.pickup,
        destination_address: form.destination,
        pickup_lat: form.pickup_lat || null,
        pickup_lng: form.pickup_lng || null,
        destination_lat: form.destination_lat || null,
        destination_lng: form.destination_lng || null,
        scheduled_date: form.date,
        scheduled_time: form.time,
        notes: form.notes || null,
        status: 'pending'
      }])
      .select()
      .single()

    if (error || !booking) {
      setStatus('error')
      setErrorMsg('Submission failed. Check your connection or try again.')
      return
    }

    setBookingId(booking.id)

    // Auto-dispatch — failure here must not show a fake success screen.
    try {
      const dispatchRes = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          pickupLat: form.pickup_lat || null,
          pickupLng: form.pickup_lng || null
        })
      })
      if (!dispatchRes.ok) throw new Error('Dispatch request failed')
      const dispatch = await dispatchRes.json()
      if (dispatch.success && dispatch.driver) {
        setAssignedDriver({
          id: dispatch.driver.id,
          name: dispatch.driver.name,
          vehicle: dispatch.driver.vehicle,
          vehicle_plate: dispatch.driver.vehicle_plate
        })
      }
      // No driver assigned is still a valid booking — success screen handles null driver.
    } catch {
      // Booking saved, dispatch failed: send them to the success screen but
      // without a driver. The ride is queued; admin can assign manually.
    }

    setStep('success')
    setStatus('idle')
  }

  if (step === 'success') return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
      </nav>
      <main style={{ maxWidth: '520px', paddingTop: '5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h2 className="display" style={{ fontSize: '2.5rem', color: 'var(--amber)', marginBottom: '1rem' }}>
          {assignedDriver ? 'DRIVER ON THE WAY' : 'RIDE REQUESTED'}
        </h2>
        {assignedDriver ? (
          <>
            <div className="card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{assignedDriver.name}</p>
              <p style={{ color: 'var(--muted)' }}>{assignedDriver.vehicle} — {assignedDriver.vehicle_plate}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                🟡 {form.pickup} → 🟢 {form.destination}
              </p>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>📍 Live Driver Location</h3>
              <DriverMap driverId={assignedDriver.id} pickupLat={form.pickup_lat} pickupLng={form.pickup_lng} />
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Your request is in the queue. A driver will be assigned shortly.
          </p>
        )}
        <div className="card" style={{ marginBottom: '2rem', background: 'rgba(255,215,0,0.08)', textAlign: 'left' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>💰 Payment</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            You'll pay after your trip is complete. No upfront payment required.
          </p>
        </div>
        {bookingId && (
          <Link href={`/track/${bookingId}`}>
            <button className="btn-primary" style={{ marginBottom: '1rem', width: '100%' }}>Track Your Ride →</button>
          </Link>
        )}
        {!user && (
          <div className="card" style={{ marginBottom: '2rem', background: 'rgba(255,215,0,0.05)' }}>
            <p style={{ marginBottom: '0.75rem' }}>Want to track your ride history?</p>
            <Link href="/auth"><button className="btn-primary">Create Account in 10s →</button></Link>
          </div>
        )}
        <Link href="/book"><button className="btn-ghost">Book Another →</button></Link>
      </main>
    </>
  )

  return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
        <div className="nav-links">
          {user ? <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>👤 {user.phone}</span> : <a href="/auth">Sign In</a>}
          <a href="/admin">Admin</a>
          <a href="/driver">Driver</a>
        </div>
      </nav>
      <main style={{ maxWidth: '560px', paddingTop: '3rem' }}>
        <h1 className="display" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>BOOK A RIDE</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Fill in your details and we'll dispatch immediately. Pay after your trip.</p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-2">
            <div><label>Passenger Name *</label><input value={form.passenger} onChange={e => set('passenger', e.target.value)} placeholder="John Doe" /></div>
            <div><label>Phone Number *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 7XX XXX XXX" /></div>
          </div>

          <LocationInput
            value={form.pickup}
            onChange={(v, lat, lng) => setForm(f => ({ ...f, pickup: v, pickup_lat: lat, pickup_lng: lng }))}
            placeholder="e.g. Westlands Mall"
            label="Pickup Location *"
          />

          <LocationInput
            value={form.destination}
            onChange={(v, lat, lng) => setForm(f => ({ ...f, destination: v, destination_lat: lat, destination_lng: lng }))}
            placeholder="e.g. JKIA Terminal 1A"
            label="Destination *"
          />

          <div className="grid-2">
            <div><label>Date *</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            <div><label>Time *</label><input type="time" value={form.time} onChange={e => set('time', e.target.value)} /></div>
          </div>
          <div><label>Notes</label><textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special instructions..." /></div>
          <button className="btn-primary" onClick={submitBooking} disabled={status === 'loading'} style={{ width: '100%', fontSize: '1rem', padding: '0.875rem' }}>
            {status === 'loading' ? 'Dispatching driver...' : 'Request Ride →'}
          </button>
          {status === 'error' && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{errorMsg}</p>}
        </div>
      </main>
    </>
  )
}
