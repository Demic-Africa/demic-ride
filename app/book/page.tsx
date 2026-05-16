'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function BookPage() {
  const [form, setForm] = useState({ passenger: '', phone: '', pickup: '', destination: '', date: '', time: '', notes: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.passenger || !form.phone || !form.pickup || !form.destination || !form.date || !form.time) {
      alert('Please fill all required fields.')
      return
    }
    setStatus('loading')
    const { error } = await supabase.from('rides').insert([{ ...form, status: 'pending' }])
    setStatus(error ? 'error' : 'success')
  }

  if (status === 'success') return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
      </nav>
      <main style={{ maxWidth: '520px', paddingTop: '5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h2 className="display" style={{ fontSize: '2.5rem', color: 'var(--amber)', marginBottom: '1rem' }}>RIDE REQUESTED</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Your request is in the queue. A driver will be assigned shortly.</p>
        <Link href="/book"><button className="btn-primary">Book Another →</button></Link>
      </main>
    </>
  )

  return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
        <div className="nav-links"><a href="/admin">Admin</a><a href="/driver">Driver</a></div>
      </nav>
      <main style={{ maxWidth: '560px', paddingTop: '3rem' }}>
        <h1 className="display" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>BOOK A RIDE</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Fill in your details and we'll dispatch immediately.</p>
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
          <button className="btn-primary" onClick={submit} disabled={status === 'loading'} style={{ width: '100%', fontSize: '1rem', padding: '0.875rem' }}>
            {status === 'loading' ? 'Submitting...' : 'Request Ride →'}
          </button>
          {status === 'error' && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>Submission failed. Check your connection and Supabase env vars.</p>}
        </div>
      </main>
    </>
  )
}
