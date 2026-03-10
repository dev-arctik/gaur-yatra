import { locations } from '../data/locations.js'

export default function Header({ journey, selectedLocationId }) {
  // Find current location for progress display
  const currentLocation = selectedLocationId
    ? locations.find(l => l.id === selectedLocationId)
    : null
  const currentOrder = currentLocation ? currentLocation.journeyOrder : 0

  return (
    <header className="header-gradient h-14 flex items-center justify-between px-5 text-white shrink-0">
      <h1
        className="font-crimson text-2xl font-semibold tracking-wide"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
      >
        Gaur Yatra
      </h1>

      <div className="flex items-center gap-3">
        {/* Play / Resume button */}
        {!journey.isPlaying && (
          <button
            onClick={journey.start}
            className="px-3 py-1 text-sm font-crimson font-semibold rounded border border-white/40 bg-white/20 hover:bg-white/35 transition-colors"
            aria-label={journey.currentStep > 0 ? 'Resume journey' : 'Play journey'}
          >
            {journey.currentStep > 0 ? 'Resume' : 'Play Journey'}
          </button>
        )}

        {/* Pause button */}
        {journey.isPlaying && (
          <button
            onClick={journey.pause}
            className="px-3 py-1 text-sm font-crimson font-semibold rounded bg-maroon hover:bg-maroon-dark transition-colors"
            aria-label="Pause journey"
          >
            Pause
          </button>
        )}

        {/* Stop button — only visible during playback or when paused mid-journey */}
        {(journey.isPlaying || journey.currentStep > 0) && (
          <button
            onClick={journey.stop}
            className="px-3 py-1 text-sm font-crimson font-semibold rounded border border-white/40 bg-white/15 hover:bg-white/30 transition-colors"
            aria-label="Stop journey"
          >
            Stop
          </button>
        )}

        {/* Progress indicator */}
        <span className="font-crimson text-sm text-white/85 min-w-28 text-right">
          {currentLocation
            ? `Location ${currentOrder} / 32`
            : 'Select a location'
          }
        </span>
      </div>
    </header>
  )
}
