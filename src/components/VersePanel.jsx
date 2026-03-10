import { useEffect, useRef, useMemo, useCallback } from 'react'
import { verses } from '../data/verses.js'
import { locations } from '../data/locations.js'
import VerseCard from './VerseCard.jsx'

// Build a map of locationId -> location name for group headers
const locationNameMap = Object.fromEntries(
  locations.map(l => [l.id, l.name])
)

export default function VersePanel({
  selectedLocationId,
  setSelectedLocationId,
  selectedVerseId,
  setSelectedVerseId,
}) {
  const verseRefs = useRef({})
  const panelRef = useRef(null)

  // Group verses by locationId for the grouped list display
  const groupedVerses = useMemo(() => {
    const groups = []
    let currentGroup = null

    verses.forEach(verse => {
      const groupKey = verse.locationId || '__narrative__'

      if (!currentGroup || currentGroup.key !== groupKey) {
        currentGroup = {
          key: groupKey,
          locationId: verse.locationId,
          label: verse.locationId
            ? locationNameMap[verse.locationId] || verse.locationId
            : 'Narrative',
          verses: [],
        }
        groups.push(currentGroup)
      }
      currentGroup.verses.push(verse)
    })

    return groups
  }, [])

  // Scroll to the selected verse when it changes
  useEffect(() => {
    if (!selectedVerseId) return
    const el = verseRefs.current[selectedVerseId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedVerseId])

  // Click handler for verse cards
  const handleVerseClick = useCallback((verse) => {
    setSelectedVerseId(verse.id)
    if (verse.locationId) {
      setSelectedLocationId(verse.locationId)
    }
  }, [setSelectedVerseId, setSelectedLocationId])

  return (
    <div id="verse-panel" ref={panelRef}>
      {groupedVerses.map((group) => (
        <div key={group.key + '-' + group.verses[0].id}>
          {/* Location group header */}
          <div
            className="location-group-header"
            onClick={() => {
              if (group.locationId) {
                setSelectedLocationId(group.locationId)
              }
            }}
          >
            {group.label}
          </div>

          {/* Verse cards in this group */}
          {group.verses.map(verse => (
            <VerseCard
              key={verse.id}
              ref={(el) => { verseRefs.current[verse.id] = el }}
              verse={verse}
              isActive={verse.locationId === selectedLocationId}
              isSelected={verse.id === selectedVerseId}
              onClick={handleVerseClick}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
