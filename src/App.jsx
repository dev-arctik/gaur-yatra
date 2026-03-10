import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header.jsx'
import VersePanel from './components/VersePanel.jsx'
import MapView from './components/MapView.jsx'
import GalleryPanel from './components/GalleryPanel.jsx'
import BottomPanel from './components/BottomPanel.jsx'
import useJourney from './hooks/useJourney.js'
import { locations } from './data/locations.js'
import { verses } from './data/verses.js'

export default function App() {
  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const [selectedVerseId, setSelectedVerseId] = useState(null)

  // Play Journey hook — auto-advances through locations in journeyOrder
  const journey = useJourney(locations, setSelectedLocationId)

  // When location changes, sync verse to the first verse of that location
  useEffect(() => {
    if (!selectedLocationId) return
    const firstVerse = verses.find(v => v.locationId === selectedLocationId)
    if (firstVerse) {
      setSelectedVerseId(firstVerse.id)
    }
  }, [selectedLocationId])

  // Wrapper that pauses journey on manual user clicks + syncs verse
  const handleLocationSelect = useCallback((locationId) => {
    if (journey.isPlaying) {
      journey.pause()
    }
    setSelectedLocationId(locationId)
  }, [journey])

  return (
    <>
      {/* Mobile fallback message */}
      <div className="mobile-message fixed inset-0 bg-cream flex items-center justify-center p-8 z-50">
        <div className="text-center max-w-md">
          <p className="font-crimson text-xl text-brown-heading mb-4">Gaur Yatra</p>
          <p className="font-crimson text-brown-text">
            This experience is designed for desktop browsers. Please visit on a screen at least 1024px wide.
          </p>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="desktop-only flex flex-col h-screen overflow-hidden bg-cream text-brown-text">
        <Header
          journey={journey}
          selectedLocationId={selectedLocationId}
        />

        <main className="flex flex-1 overflow-hidden">
          <VersePanel
            selectedLocationId={selectedLocationId}
            setSelectedLocationId={handleLocationSelect}
            selectedVerseId={selectedVerseId}
            setSelectedVerseId={setSelectedVerseId}
          />

          <MapView
            selectedLocationId={selectedLocationId}
            setSelectedLocationId={handleLocationSelect}
            setSelectedVerseId={setSelectedVerseId}
          />

          <GalleryPanel selectedLocationId={selectedLocationId} />
        </main>

        <BottomPanel
          selectedVerseId={selectedVerseId}
          setSelectedVerseId={setSelectedVerseId}
          setSelectedLocationId={setSelectedLocationId}
        />
      </div>
    </>
  )
}
