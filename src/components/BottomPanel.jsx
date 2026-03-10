import { useMemo } from 'react'
import { verses } from '../data/verses.js'

// Badge color map
const BADGE_CLASS = {
  arrival: 'verse-type-badge--arrival',
  event: 'verse-type-badge--event',
  glory: 'verse-type-badge--glory',
  narrative: 'verse-type-badge--narrative',
}

export default function BottomPanel({ selectedVerseId, setSelectedVerseId, setSelectedLocationId }) {
  // Look up the current verse and its index
  const { verse, verseIndex } = useMemo(() => {
    if (!selectedVerseId) return { verse: null, verseIndex: -1 }
    const idx = verses.findIndex(v => v.id === selectedVerseId)
    return { verse: idx >= 0 ? verses[idx] : null, verseIndex: idx }
  }, [selectedVerseId])

  // Navigate to previous/next verse
  const goToVerse = (newIndex) => {
    if (newIndex < 0 || newIndex >= verses.length) return
    const newVerse = verses[newIndex]
    setSelectedVerseId(newVerse.id)

    // If new verse has a different location, update the map/gallery
    if (newVerse.locationId && newVerse.locationId !== verse?.locationId) {
      setSelectedLocationId(newVerse.locationId)
    }
  }

  const goPrev = () => goToVerse(verseIndex - 1)
  const goNext = () => goToVerse(verseIndex + 1)

  // Initial state — no verse selected
  if (!verse) {
    return (
      <div className="verse-reader flex items-center justify-center" aria-live="polite">
        <p className="font-crimson text-brown-text opacity-60">
          Select a verse to begin reading...
        </p>
      </div>
    )
  }

  const badgeClass = BADGE_CLASS[verse.verseType] || BADGE_CLASS.narrative

  return (
    <div className="verse-reader px-6 py-3 flex gap-4 items-start" aria-live="polite">
      {/* Prev button */}
      <button
        onClick={goPrev}
        disabled={verseIndex <= 0}
        className="font-crimson font-semibold text-sm px-3 py-1 rounded bg-saffron/10 text-saffron hover:bg-saffron/20 border border-saffron/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 mt-2"
        aria-label="Previous verse"
      >
        Prev
      </button>

      {/* Verse content */}
      <div className="verse-reader-content flex-1 min-w-0 overflow-y-auto" key={verse.id}>
        {/* Header: verse number + type badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-crimson text-xl font-semibold text-brown-heading">
            CC Madhya {verse.number}
          </span>
          <span className={`verse-type-badge ${badgeClass}`}>
            {verse.verseType}
          </span>
        </div>

        {/* Sanskrit text */}
        {verse.sanskrit && (
          <p className="devanagari text-lg text-brown-heading leading-relaxed mb-1">
            {verse.sanskrit}
          </p>
        )}

        {/* English translation */}
        {verse.translation && (
          <p className="font-crimson text-base text-brown-text leading-relaxed">
            {verse.translation}
          </p>
        )}
      </div>

      {/* Next button */}
      <button
        onClick={goNext}
        disabled={verseIndex >= verses.length - 1}
        className="font-crimson font-semibold text-sm px-3 py-1 rounded bg-saffron/10 text-saffron hover:bg-saffron/20 border border-saffron/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 mt-2"
        aria-label="Next verse"
      >
        Next
      </button>
    </div>
  )
}
