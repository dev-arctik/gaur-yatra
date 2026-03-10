import { useState, useRef, useMemo, useEffect, useCallback } from 'react'

const JOURNEY_INTERVAL_MS = 3000

export default function useJourney(locations, setSelectedLocationId) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const intervalRef = useRef(null)

  // Sort locations by journeyOrder once
  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.journeyOrder - b.journeyOrder),
    [locations]
  )

  const totalSteps = sortedLocations.length

  // Current location name for display
  const currentLocationName = sortedLocations[currentStep]?.name || ''

  // Clear any existing interval
  const clearJourneyInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (isPlaying) return

    // If starting from the beginning, set the first location
    if (currentStep === 0) {
      setSelectedLocationId(sortedLocations[0].id)
    }

    setIsPlaying(true)

    clearJourneyInterval()
    let step = currentStep

    intervalRef.current = setInterval(() => {
      step += 1

      // Journey complete
      if (step >= totalSteps) {
        clearJourneyInterval()
        setIsPlaying(false)
        setCurrentStep(0)
        return
      }

      setCurrentStep(step)
      setSelectedLocationId(sortedLocations[step].id)
    }, JOURNEY_INTERVAL_MS)
  }, [isPlaying, currentStep, totalSteps, sortedLocations, setSelectedLocationId, clearJourneyInterval])

  const pause = useCallback(() => {
    clearJourneyInterval()
    setIsPlaying(false)
  }, [clearJourneyInterval])

  const stop = useCallback(() => {
    clearJourneyInterval()
    setIsPlaying(false)
    setCurrentStep(0)
  }, [clearJourneyInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearJourneyInterval()
  }, [clearJourneyInterval])

  return {
    isPlaying,
    currentStep,
    totalSteps,
    currentLocationName,
    start,
    pause,
    stop,
  }
}
