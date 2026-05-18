'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function BookPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [form, setForm] = useState({ passenger: '', phone: '', pickup: '', destination: '', date: '', time: '', notes: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [assignedDriver, setAssignedDriver] = useState<{ name: string; vehicle: string; vehicle_plate: string } | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending')
  const [amount] = useState(500) // Base fare in KES

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Step 1: Submit booking
  const submitBooking = async () => {
    if (!form.passenger || !form.phone || !form.pickup || !form.destination) {
      alert('Please fill all required fields.')
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
        passenger_id: user?.id || null,
        status: 'pending'
      }])
      .select()
      .single()

    if (error || !booking) {
      setStatus('error')
      return
    }

    setBookingId(booking.id)
    setStep('payment')
    setStatus('idle')
  }

  // Step 2: Process payment
  const processPayment = async () => {
    if (!bookingId) return
    setStatus('loading')

    const res = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'charge',
        bookingId: bookingId,
        amount: amount,
        phone: form.phone,
        passengerName: form.passenger
      })
    })
    
    const payment = await res.json()
    
    if (payment.success) {
      setPaymentStatus('paid')
      // Dispatch driver after payment
      const dispatchRes = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, pickupLat: null, pickupLng: null })
      })
      
      const dispatch = await dispatchRes.json()
      if (dispatch.success) {
        setAssignedDriver({
          name: dispatch.driver.name,
          vehicle: dispatch.driver.vehicle,
          vehicle_plate: dispatch.driver.vehicle_plate
        })
      }
      setStep('success')
    } else {
      setPaymentStatus('failed')
    }
    setStatus('idle')
  }

  // Success screen
  if (step === 'success') return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
      </nav>
      <main style={{ maxWidth: '520px', paddingTop: '5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h2 className="display" style={{ fontSize: '2.5rem', color: 'var(--amber)', marginBottom: '1rem' }}>DRIVER ASSIGNED</h2>
        {assignedDriver && (
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{assignedDriver.name}</p>
            <p style={{ color: 'var(--muted)' }}>{assignedDriver.vehicle} — {assignedDriver.vehicle_plate}</p>
            <p style={{ color: 'var(--success)', marginTop: '0.5rem' }}>KES {amount} paid via M-Pesa ✓</p>
          </div>
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

  // Main booking form + payment
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
        <h1 className="display" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          {step === 'form' ? 'BOOK A RIDE' : 'PAY WITH M-PESA'}
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          {step === 'form' ? "Fill in your details and we'll dispatch immediately." : `KES ${amount} — pay via M-Pesa to confirm your ride.`}
        </p>

        {step === 'form' ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2">
              <div><label>Passenger Name *</label><input value={form.passenger} onChange={e => set('passenger', e.target.value)} placeholder="John Doe" /></div>
              <div><label>Phone Number *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 7XX XXX XXX" /></div>
            </div>
            <div><label>Pickup Location *</label><input value={form.pickup} onChange={e => set('pickup', e.target.value)} placeholder="e.g. Westlands Mall" /></div>
            <div><label>Destination *</label><input value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="e.g. JKIA Terminal 1A" /></div>
            <div className="grid-2">
              <div><label>Date *</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
              <div><label>Time *</label><input type="time" value={form.time} onChange={e => set('time', e.target.value)} /></div>
            </div>
            <div><label>Notes</label><textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special instructions..." /></div>
            <button className="btn-primary" onClick={submitBooking} disabled={status === 'loading'} style={{ width: '100%', fontSize: '1rem', padding: '0.875rem' }}>
              {status === 'loading' ? 'Submitting...' : 'Continue to Payment →'}
            </button>
            {status === 'error' && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>Submission failed. Check your connection.</p>}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ fontSize: '2rem' }}>📱</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>KES {amount}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>M-Pesa payment to DemicRide</p>
            </div>
            <button className="btn-primary" onClick={processPayment} disabled={status === 'loading'} style={{ width: '100%', fontSize: '1rem', padding: '0.875rem' }}>
              {status === 'loading' ? 'Processing...' : 'Pay with M-Pesa →'}
            </button>
            <button className="btn-ghost" onClick={() => setStep('form')}>← Back</button>
            {paymentStatus === 'failed' && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>Payment failed. Try again.</p>}
          </div>
        )}
      </main>
    </>
  )
}
