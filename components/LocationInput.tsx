'use client'
import { useState, useRef, useEffect } from 'react'

interface LocationInputProps {
  value: string
  onChange: (value: string, lat?: number, lng?: number) => void
  placeholder: string
  label: string
}

export default function LocationInput({ value, onChange, placeholder, label }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    // Free Mapbox token for geocoding
    setAccessToken('pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw')
  }, [])

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&country=KE&types=place,address&limit=5`
      )
      const data = await res.json()
      setSuggestions(data.features || [])
      setIsOpen(true)
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleSelect = (place: any) => {
    onChange(place.place_name, place.center[1], place.center[0])
    setIsOpen(false)
  }

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <label>{label}</label>
      <input
        ref={inputRef}
        value={value}
        onChange={e => {
          onChange(e.target.value)
          fetchSuggestions(e.target.value)
        }}
        onFocus={() => value.length >= 3 && setIsOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '6px', zIndex: 1000, maxHeight: '200px', overflowY: 'auto'
        }}>
          {suggestions.map((place: any) => (
            <div
              key={place.id}
              onClick={() => handleSelect(place)}
              style={{
                padding: '0.75rem', cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.875rem'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              📍 {place.place_name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
