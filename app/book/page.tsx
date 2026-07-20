'use client'

import { useState, useEffect } from 'react'

export default function BookPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [userLanguage, setUserLanguage] = useState('en')
  const [formData, setFormData] = useState({
    customerName: '',
    pickup: '',
    destination: '',
    phone: '',
    email: '',
    notes: '',
    amount: 0
  })

  // Auto-detect user's language
  useEffect(() => {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en'
    const supportedLangs = ['en', 'sw', 'ki', 'lu']
    let detectedLang = 'en'
    
    if (browserLang.startsWith('sw')) detectedLang = 'sw'
    else if (browserLang.startsWith('ki')) detectedLang = 'ki'
    else if (browserLang.startsWith('lu')) detectedLang = 'lu'
    
    setUserLanguage(detectedLang)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language: userLanguage  // Auto-detected language
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Booking confirmed!')
        setFormData({
          customerName: '',
          pickup: '',
          destination: '',
          phone: '',
          email: '',
          notes: '',
          amount: 0
        })
      } else {
        setMessage('❌ Error: ' + data.error)
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Restore your original design here
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book a Ride</h1>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name *</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            placeholder="Your name"
            value={formData.customerName}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Pickup Location *</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            placeholder="Where are you?"
            value={formData.pickup}
            onChange={(e) => setFormData({...formData, pickup: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Destination *</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            placeholder="Where are you going?"
            value={formData.destination}
            onChange={(e) => setFormData({...formData, destination: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone *</label>
          <input
            type="tel"
            required
            className="w-full p-2 border rounded"
            placeholder="+254XXXXXXXXX"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Notes (Optional)</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Special requests..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Book Ride'}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Language auto-detected: {userLanguage === 'sw' ? 'Swahili' : 
                                 userLanguage === 'ki' ? 'Kikuyu' : 
                                 userLanguage === 'lu' ? 'Luo' : 'English'}
      </p>
    </div>
  )
}
