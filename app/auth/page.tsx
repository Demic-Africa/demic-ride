'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function AuthPage() {
  const { user, signInWithOTP, verifyOTP, signOut } = useAuth()
  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [message, setMessage] = useState('')

  const handleSendOTP = async () => {
    const { success, error } = await signInWithOTP(phone)
    if (success) {
      setStep('otp')
      setMessage('OTP sent to your phone.')
    } else {
      setMessage(error || 'Failed to send OTP.')
    }
  }

  const handleVerifyOTP = async () => {
    const { success, error } = await verifyOTP(phone, token)
    setMessage(success ? 'Logged in successfully!' : (error || 'Invalid OTP.'))
  }

  if (user) return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
      </nav>
      <main style={{ maxWidth: '480px', textAlign: 'center', paddingTop: '4rem' }}>
        <h2 className="display" style={{ fontSize: '2rem', marginBottom: '1rem' }}>WELCOME BACK</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>You're logged in. Your ride history and saved addresses are now available.</p>
        <Link href="/book"><button className="btn-primary" style={{ marginRight: '1rem' }}>Book a Ride →</button></Link>
        <button className="btn-ghost" onClick={signOut}>Sign Out</button>
      </main>
    </>
  )

  return (
    <>
      <nav>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="display" style={{ fontSize: '1.4rem', color: 'var(--amber)' }}>DEMICRIDE</span>
        </Link>
      </nav>
      <main style={{ maxWidth: '480px', paddingTop: '4rem' }}>
        <h1 className="display" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>SIGN IN</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Sign in with your phone number to track your rides.</p>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {step === 'phone' ? (
            <>
              <div>
                <label>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254712345678" />
              </div>
              <button className="btn-primary" onClick={handleSendOTP}>Send OTP →</button>
            </>
          ) : (
            <>
              <div>
                <label>Enter OTP</label>
                <input value={token} onChange={e => setToken(e.target.value)} placeholder="123456" />
              </div>
              <button className="btn-primary" onClick={handleVerifyOTP}>Verify →</button>
              <button className="btn-ghost" onClick={() => setStep('phone')}>← Back</button>
            </>
          )}
          {message && <p style={{ color: message.includes('success') ? 'var(--success)' : 'var(--danger)', fontSize: '0.875rem' }}>{message}</p>}
        </div>
      </main>
    </>
  )
}
