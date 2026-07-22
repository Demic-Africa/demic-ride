'use client'
import { useEffect, useState } from 'react'
import { supabase, type Ride } from '@/lib/supabase'
import Link from 'next/link'

const DRIVERS = ['Driver A', 'Driver B', 'Driver C', 'Driver D']
const STATUSES = ['pending', 'assigned', 'picked_up', 'completed', 'cancelled'] as const

function exportCSV(rides: any[]) {
  const headers = ['ID', 'Passenger', 'Phone', 'Pickup', 'Destination', 'Date', 'Time', 'Status', 'Driver', 'Fare (KES)', 'Notes', 'Requested At', 'Updated At']
  const rows = rides.map(r => [
    r.id,
    r.passenger_name,
    r.passenger_phone,
    r.pickup_address,
    r.destination_address,
    r.scheduled_date,
    r.scheduled_time,
    r.status,
    r.driver || '',
    r.amount?.toString() || '',
    r.notes || '',
    new Date(r.created_at).toLocaleString('en-KE'),
    r.updated_at ? new Date(r.updated_at).toLocaleString('en-KE') : '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `demicride-bookings-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [rides, setRides] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
    setRides(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!authed) return
    load()
    const channel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [authed])

  const update = async (id: string, patch: any) => {
    await supabase.from('bookings').update(patch).eq('id', id)
    load()
  }

  const filtered = filter === 'all' ? rides : rides.filter(r => r.status === filter)

  const today = new Date().toISOString().slice(0, 10)
  const stats = {
    total: rides.length,
    pending: rides.filter(r => r.status === 'pending').length,
    active: rides.filter(r => ['assigned', 'picked_up'].includes(r.status)).length,
    done: rides.filter(r => r.status === 'completed').length,
    today: rides.filter(r => r.status === 'completed' && r.updated_at?.slice(0, 10) === today).length,
    revenue: rides.filter(r => r.status === 'completed' && r.amount)
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
  }

  if (!authed) return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
      </nav>
      <main style={{ maxWidth: '360px', paddingTop: '4rem' }}>
        <h1 className="display" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ADMIN ACCESS</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Operations Control Center — restricted access.</p>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Admin PIN</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { if (pin === '2521') setAuthed(true); else alert('Incorrect PIN') }}}
              placeholder="Enter PIN"
            />
          </div>
          <button className="btn-primary" onClick={() => { if (pin === '2521') setAuthed(true); else alert('Incorrect PIN') }}>
            Enter →
          </button>
        </div>
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
          <a href="/book">Book</a>
          <a href="/driver">Driver</a>
          <button
            onClick={() => exportCSV(filtered)}
            style={{ background: 'none', border: '1px solid #333', color: 'var(--muted)', padding: '0.3rem 0.8rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ↓ Export CSV
          </button>
          <span onClick={() => setAuthed(false)} style={{ color: 'var(--muted)', fontSize: '0.875rem', cursor: 'pointer' }}>
            Sign out
          </span>
        </div>
      </nav>

      <main>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="display" style={{ fontSize: '2.5rem' }}>OPERATIONS CONTROL</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Live dispatch queue · {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="btn-ghost" onClick={load}>↻ Refresh</button>
        </div>

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: '0.75rem' }}>
          {[
            ['Total Bookings', stats.total, 'var(--white)'],
            ['Pending', stats.pending, 'var(--amber)'],
            ['Active', stats.active, '#60a5fa'],
            ['Completed', stats.done, 'var(--success)'],
          ].map(([l, v, c]) => (
            <div key={l as string} className="card" style={{ textAlign: 'center' }}>
              <div className="display" style={{ fontSize: '2rem', color: c as string }}>{v as number}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{l as string}</div>
            </div>
          ))}
        </div>

        {/* Today's summary */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="display" style={{ fontSize: '1.75rem', color: 'var(--success)' }}>{stats.today}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Completed Today</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="display" style={{ fontSize: '1.75rem', color: 'var(--amber)' }}>
              KES {stats.revenue.toLocaleString()}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Revenue Logged</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.4rem 1rem', borderRadius: '3px', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              background: filter === s ? 'var(--amber)' : '#1c1c1e',
              color: filter === s ? 'var(--black)' : 'var(--muted)',
            }}>{s.replace('_', ' ')}</button>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading bookings...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.length === 0 && <p style={{ color: 'var(--muted)' }}>No bookings in this category.</p>}
            {filtered.map(ride => (
              <div key={ride.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{ride.passenger_name}</span>
                    <span style={{ color: 'var(--muted)', marginLeft: '0.75rem', fontSize: '0.875rem' }}>{ride.passenger_phone}</span>
                  </div>
                  <span className={`badge badge-${ride.status}`}>{ride.status.replace('_', ' ')}</span>
                </div>

                <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                  <strong style={{ color: 'var(--white)' }}>From:</strong> {ride.pickup_address}
                  &nbsp;→&nbsp;
                  <strong style={{ color: 'var(--white)' }}>To:</strong> {ride.destination_address}
                </div>

                <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                  Scheduled: {ride.scheduled_date} at {ride.scheduled_time}
                  &nbsp;·&nbsp;
                  Requested: {new Date(ride.created_at).toLocaleString('en-KE')}
                  {ride.updated_at && ride.updated_at !== ride.created_at && (
                    <span> · Updated: {new Date(ride.updated_at).toLocaleString('en-KE')}</span>
                  )}
                  {ride.driver && <span style={{ color: '#60a5fa', marginLeft: '0.5rem' }}>· {ride.driver}</span>}
                  {ride.amount && ride.amount > 0 && <span style={{ color: 'var(--amber)', marginLeft: '0.5rem' }}>· KES {ride.amount}</span>}
                </div>

                {ride.notes && (
                  <div style={{ color: 'var(--muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>"{ride.notes}"</div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={ride.driver || ''}
                    onChange={e => update(ride.id, { driver: e.target.value, status: 'assigned' })}
                    style={{ width: 'auto', minWidth: '140px' }}
                  >
                    <option value="">Assign driver...</option>
                    {DRIVERS.map(d => <option key={d}>{d}</option>)}
                  </select>

                  <input
                    placeholder="Fare (KES)"
                    defaultValue={ride.amount || ''}
                    style={{ width: '130px' }}
                    onBlur={e => { if (e.target.value) update(ride.id, { amount: parseFloat(e.target.value) }) }}
                  />

                  {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                    <button
                      className="btn-ghost"
                      onClick={() => update(ride.id, { status: 'completed' })}
                      style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                      ✓ Complete
                    </button>
                  )}

                  {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                    <button
                      className="btn-ghost"
                      onClick={() => update(ride.id, { status: 'cancelled' })}
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      ✕ Cancel
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
