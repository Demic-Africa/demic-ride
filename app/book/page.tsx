'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type FormState = {
  passenger: string
  phone: string
  pickup: string
  destination: string
  date: string
  time: string
  notes: string
}

type AssignedDriver = {
  name: string
  vehicle: string
  vehicle_plate: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const INITIAL_FORM: FormState = {
  passenger: '', phone: '', pickup: '',
  destination: '', date: '', time: '', notes: ''
}

export default function BookPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string>('')
  const [assignedDriver, setAssignedDriver] = useState<AssignedDriver | null>(null)

  const set = (k: keyof FormState, v: string) =>
    setForm(f => ({ ...f, [k]: v }))

  const validate = (): string => {
    if (!form.passenger.trim()) return 'Passenger name is required'
    if (!form.phone.trim()) return 'Phone number is required'
    if (!/^\+?[\d\s]{10,15}$/.test(form.phone.trim())) return 'Enter a valid phone number'
    if (!form.pickup.trim()) return 'Pickup location is required'
    if (!form.destination.trim()) return 'Destination is required'
    if (!form.date) return 'Date is required'
    if (!form.time) return 'Time is required'
    return ''
  }

  const submit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setStatus('loading')
    setError('')

    try {
      // 1. Insert booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          passenger_name: form.passenger.trim(),
          passenger_phone: form.phone.trim(),
          pickup_address: form.pickup.trim(),
          destination_address: form.destination.trim(),
          scheduled_date: form.date,
          scheduled_time: form.time,
          notes: form.notes.trim() || null,
          status: 'pending'
        }])
        .select()
        .single()

      if (bookingError || !booking) {
        throw new Error(bookingError?.message || 'Failed to create booking')
      }

      // 2. Auto-dispatch
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          pickupLat: null,
          pickupLng: null
        })
      })

      if (!res.ok) throw new Error('Dispatch service unavailable')

      const dispatch = await res.json()

      if (dispatch.success && dispatch.driver) {
        setAssignedDriver({
          name: dispatch.driver.name,
          vehicle: dispatch.driver.vehicle,
          vehicle_plate: dispatch.driver.vehicle_plate
        })
      }

      setStatus('success')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'success') return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>
            DEMICRIDE
          </span>
        </Link>
      </nav>
      <main style={{ maxWidth: '520px', paddingTop: '5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h2 className="display" style={{ fontSize: '2.5rem', color: 'var(--amber)', marginBottom: '1rem' }}>
          DRIVER ASSIGNED
        </h2>
        {assignedDriver ? (
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{assignedDriver.name}</p>
            <p style={{ color: 'var(--muted)' }}>
              {assignedDriver.vehicle} — {assignedDriver.vehicle_plate}
            </p>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <p style={{ color: 'var(--muted)' }}>
              No drivers available right now. Admin will assign manually.
            </p>
          </div>
        )}
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          Your booking is confirmed. You will be contacted shortly.
        </p>
        <button className="btn-primary" onClick={() => {
          setForm(INITIAL_FORM)
          setAssignedDriver(null)
          setStatus('idle')
        }}>
          Book Another →
        </button>
      </main>
    </>
  )

  return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>
            DEMICRIDE
          </span>
        </Link>
        <div className="nav-links">
          <a href="/admin">Admin</a>
          <a href="/driver">Driver</a>
        </div>
      </nav>
      <main style={{ maxWidth: '560px', paddingTop: '3rem' }}>
        <h1 className="display" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          BOOK A RIDE
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          Fill in your details and we'll dispatch immediately.
        </p>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="grid-2">
            <div>
              <label>Passenger Name *</label>
              <input
                value={form.passenger}
                onChange={e => set('passenger', e.target.value)}
                placeholder="John Doe"
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label>Phone Number *</label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+254 7XX XXX XXX"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <div>
            <label>Pickup Location *</label>
            <input
              value={form.pickup}
              onChange={e => set('pickup', e.target.value)}
              placeholder="e.g. Westlands Mall"
              disabled={status === 'loading'}
            />
          </div>

          <div>
            <label>Destination *</label>
            <input
              value={form.destination}
              onChange={e => set('destination', e.target.value)}
              placeholder="e.g. JKIA Terminal 1A"
              disabled={status === 'loading'}
            />
          </div>

          <div className="grid-2">
            <div>
              <label>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label>Time *</label>
              <input
                type="time"
                value={form.time}
                onChange={e => set('time', e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <div>
            <label>Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any special instructions..."
              disabled={status === 'loading'}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.875rem', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            className="btn-primary"
            onClick={submit}
            disabled={status === 'loading'}
            style={{ width: '100%', fontSize: '1rem', padding: '0.875rem' }}
          >
            {status === 'loading' ? 'Dispatching driver...' : 'Request Ride →'}
          </button>

        </div>
      </main>
    </>
  )
}
