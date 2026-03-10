import { memo, forwardRef } from 'react'

// Badge color map for verse types
const BADGE_CLASS = {
  arrival: 'verse-type-badge--arrival',
  event: 'verse-type-badge--event',
  glory: 'verse-type-badge--glory',
  narrative: 'verse-type-badge--narrative',
}

const VerseCard = memo(forwardRef(function VerseCard({ verse, isActive, isSelected, onClick }, ref) {
  const badgeClass = BADGE_CLASS[verse.verseType] || BADGE_CLASS.narrative

  // Truncate translation to ~60 chars for the condensed list
  const preview = verse.translation
    ? verse.translation.length > 60
      ? verse.translation.slice(0, 60) + '...'
      : verse.translation
    : ''

  let cardClass = 'verse-card'
  if (isSelected) cardClass += ' verse-card--selected'
  else if (isActive) cardClass += ' verse-card--active'

  return (
    <div
      ref={ref}
      className={cardClass}
      onClick={() => onClick(verse)}
      role="button"
      tabIndex={0}
      aria-label={`Verse ${verse.number}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(verse)
        }
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-crimson font-semibold text-brown-heading text-xs">
          {verse.number}
        </span>
        <span className={`verse-type-badge ${badgeClass}`}>
          {verse.verseType}
        </span>
      </div>
      {preview && (
        <p className="font-crimson text-brown-text text-xs mt-0.5 opacity-70 leading-snug truncate">
          {preview}
        </p>
      )}
    </div>
  )
}))

export default VerseCard
