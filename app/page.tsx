import Link from 'next/link'

export default function Home() {
  return (
    <>
      <nav>
        <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        <div className="nav-links">
          <a href="/book">Book a Ride</a>
          <a href="/admin">Admin</a>
          <a href="/driver">Driver</a>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section style={{ padding: '5rem 0 4rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--amber)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Professional Taxi Dispatch
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', lineHeight: 1, marginBottom: '1.5rem' }}>
            YOUR RIDE,<br />ON DEMAND
          </h1>
          <p style={{ color: 'var(--muted)', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Fast, reliable taxi service with real-time dispatch and professional drivers. Book in seconds, ride in minutes.
          </p>
          <Link href="/book">
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
              Request a Ride →
            </button>
          </Link>
        </section>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '4rem' }}>
          {[
            { n: '< 5 min', label: 'Average dispatch time' },
            { n: '24 / 7', label: 'Service availability' },
            { n: '100%', label: 'Dispatches tracked' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div className="display" style={{ fontSize: '2.5rem', color: 'var(--amber)' }}>{s.n}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.4rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '4rem' }}>
          {[
            { title: 'Instant Booking', body: 'Submit ride requests in under a minute. No app download required.' },
            { title: 'Live Dispatch', body: 'Admin assigns drivers the moment a request lands in the queue.' },
            { title: 'Driver Updates', body: 'Drivers mark pickup and completion — full trip visibility.' },
            { title: 'Full Audit Trail', body: 'Every ride timestamped, every status change logged.' },
          ].map(f => (
            <div key={f.title} className="card">
              <div style={{ color: 'var(--amber)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>●</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card" style={{ textAlign: 'center', padding: '3rem', borderColor: '#2a2a2a', background: 'linear-gradient(135deg, #111 0%, #1c1c1e 100%)' }}>
          <h2 className="display" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>READY TO RIDE?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Fill out the form and we dispatch your driver immediately.</p>
          <Link href="/book">
            <button className="btn-primary">Book Now →</button>
          </Link>
        </div>
      </main>
    </>
  )
}
