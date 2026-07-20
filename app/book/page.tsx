'use client'

import { useState } from 'react'

export default function BookPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    customerName: '',
    pickup: '',
    destination: '',
    phone: '',
    email: '',
    notes: '',
    amount: 0,
    language: 'en'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Booking confirmed! Check your Telegram for confirmation.')
        // Reset form
        setFormData({
          customerName: '',
          pickup: '',
          destination: '',
          phone: '',
          email: '',
          notes: '',
          amount: 0,
          language: 'en'
        })
      } else {
        setMessage('❌ Error: ' + (data.error || 'Something went wrong'))
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            placeholder="John Doe"
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
            placeholder="e.g., Nairobi CBD"
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
            placeholder="e.g., Jomo Kenyatta Airport"
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
            placeholder="+254700000000"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Language</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.language}
            onChange={(e) => setFormData({...formData, language: e.target.value})}
          >
            <option value="en">English</option>
            <option value="sw">Swahili</option>
            <option value="ki">Kikuyu</option>
            <option value="lu">Luo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Amount (KES)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Any special requests..."
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
    </div>
  )
}
