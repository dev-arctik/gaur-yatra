import { useState, useMemo, useEffect, useCallback } from 'react'
import { locations } from '../data/locations.js'

export default function GalleryPanel({ selectedLocationId }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Derive the current location object
  const location = useMemo(
    () => locations.find(loc => loc.id === selectedLocationId) ?? null,
    [selectedLocationId]
  )

  // Derive images array
  const images = useMemo(() => location?.images ?? [], [location])

  // Reset carousel index when location changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [selectedLocationId])

  // Keyboard navigation for gallery
  const handleKeyDown = useCallback((e) => {
    if (images.length === 0) return
    if (e.key === 'ArrowLeft') {
      setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
    } else if (e.key === 'ArrowRight') {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }
  }, [images.length])

  const goNext = () => setCurrentIndex(prev => (prev + 1) % images.length)
  const goPrev = () => setCurrentIndex(prev => (prev - 1 + images.length) % images.length)

  // State: nothing selected
  if (!location) {
    return (
      <div className="gallery-panel flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-crimson text-lg text-brown-heading mb-2">Welcome to Gaur Yatra</p>
          <p className="font-crimson text-sm text-brown-text opacity-70">
            Select a location on the map or a verse in the left panel to begin exploring
            Lord Chaitanya's sacred journey through Vraj Bhumi.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="gallery-panel flex flex-col" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Section A: Photo Carousel */}
      <div className="p-3">
        {images.length === 0 ? (
          // No photos placeholder
          <div className="aspect-[4/3] rounded-lg border-2 border-dashed border-lotus-pink bg-saffron-pale flex items-center justify-center">
            <div className="text-center p-4">
              <p className="font-crimson text-sm text-brown-heading font-semibold">
                Photos coming soon
              </p>
              <p className="font-crimson text-xs text-brown-text opacity-60 mt-1">
                Hare Krishna
              </p>
            </div>
          </div>
        ) : (
          // Photo carousel
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-cream-dark">
              <img
                key={images[currentIndex]}
                src={`${import.meta.env.BASE_URL}${images[currentIndex]}`}
                alt={`${location.name} - photo ${currentIndex + 1}`}
                className="gallery-image-enter w-full h-full object-cover"
              />
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-brown-heading transition-colors"
                  aria-label="Previous photo"
                >
                  &lsaquo;
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-brown-heading transition-colors"
                  aria-label="Next photo"
                >
                  &rsaquo;
                </button>
              </>
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div className="text-center mt-1">
                <span className="font-crimson text-xs text-maroon">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section B: Location Info */}
      <div className="px-4 pb-4 flex-1">
        <div className="border-t border-border-warm pt-3">
          <h2 className="font-crimson text-lg font-semibold text-brown-heading">
            {location.name}
          </h2>
          <p className="devanagari text-base text-brown-heading opacity-80 mt-0.5">
            {location.nameDevanagari}
          </p>
          <p className="font-crimson text-sm text-brown-text mt-2 leading-relaxed">
            {location.description}
          </p>
          <a
            href={location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-3 py-1.5 text-xs font-semibold rounded bg-saffron/10 text-saffron hover:bg-saffron/20 border border-saffron/30 transition-colors"
            aria-label={`Open ${location.name} in Google Maps`}
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
