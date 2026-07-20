'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  todayBookings: number
  pendingBookings: number
  assignedBookings: number
  completedBookings: number
  totalDrivers: number
  weeklyBookings: number
}

export default function AdminAnalyticsPanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      // Today's bookings
      const { count: todayBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)

      // Bookings by status
      const { data: statusData } = await supabase
        .from('bookings')
        .select('status')

      const pending = statusData?.filter(b => b.status === 'pending').length || 0
      const assigned = statusData?.filter(b => b.status === 'assigned').length || 0
      const completed = statusData?.filter(b => b.status === 'completed').length || 0

      // Total drivers (matches dispatch logic which fetches all drivers)
      const { count: totalDrivers } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })

      // Weekly bookings
      const { count: weeklyBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      setStats({
        todayBookings: todayBookings || 0,
        pendingBookings: pending,
        assignedBookings: assigned,
        completedBookings: completed,
        totalDrivers: totalDrivers || 0,
        weeklyBookings: weeklyBookings || 0
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return <div className="p-6">Loading dashboard...</div>
  }

  return (
    <div className="p-6">
      <h1 className="display" style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--amber)' }}>
        Fleet Analytics
      </h1>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>Today's Bookings</h3>
          <p className="display" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.todayBookings}</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>Total Drivers</h3>
          <p className="display" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalDrivers}</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>Weekly Bookings</h3>
          <p className="display" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.weeklyBookings}</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Bookings by Status</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--amber)' }}>{stats.pendingBookings}</p>
            <p style={{ color: 'var(--muted)' }}>Pending</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.assignedBookings}</p>
            <p style={{ color: 'var(--muted)' }}>Assigned</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completedBookings}</p>
            <p style={{ color: 'var(--muted)' }}>Completed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
