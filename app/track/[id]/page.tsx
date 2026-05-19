import { Suspense } from 'react'
import TrackContent from './TrackContent'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return [{ id: 'demo' }]
}

export default function TrackPage() {
  return (
    <Suspense fallback={<main><p>Loading tracker...</p></main>}>
      <TrackContent />
    </Suspense>
  )
}
