'use client'
import { useEffect, useState } from 'react'
import { supabase, type Ride } from '@/lib/supabase'
import Link from 'next/link'

const DRIVERS = ['Driver A', 'Driver B', 'Driver C', 'Driver D']
const NEXT_STATUS: Record<string, string> = { assigned: 'picked_up', picked_up: 'completed' }
const ACTION_LABEL: Record<string, string> = { assigned: '→ Mark Picked Up', picked_up: '→ Mark Completed' }

export default function DriverPage() {
  const [driver, setDriver] = useState(DRIVERS[0])
  const [rides, setRides] = useState<Ride[]>([])

  const load = async () => {
    const { data } = await supabase.from('rides').select('*').eq('driver', driver).order('created_at', { ascending: false })
    setRides(data || [])
  }

  useEffect(() => { load() }, [driver])

  const advance = async (ride: Ride) => {
    const next = NEXT_STATUS[ride.status]
    if (!next) return
    await supabase.from('rides').update({ status: next }).eq('id', ride.id)
    load()
  }

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
          <button className="btn-ghost" onClick={load}>↻ Refresh</button>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '320px' }}>
          <label>I am</label>
          <select value={driver} onChange={e => setDriver(e.target.value)}>
            {DRIVERS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {rides.length === 0 && <p style={{ color: 'var(--muted)' }}>No rides assigned to you yet.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rides.map(ride => (
            <div key={ride.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{ride.passenger}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: '0.75rem', fontSize: '0.875rem' }}>{ride.phone}</span>
                </div>
                <span className={`badge badge-${ride.status}`}>{ride.status.replace('_', ' ')}</span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--white)' }}>{ride.pickup}</strong> → <strong style={{ color: 'var(--white)' }}>{ride.destination}</strong>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>{ride.date} at {ride.time}</div>
              {ride.fare && <div style={{ color: 'var(--amber)', fontWeight: 600, marginBottom: '1rem' }}>Fare: KES {ride.fare}</div>}
              {NEXT_STATUS[ride.status] && (
                <button className="btn-primary" onClick={() => advance(ride)}>{ACTION_LABEL[ride.status]}</button>
              )}
              {ride.status === 'completed' && <p style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Trip Completed</p>}
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
