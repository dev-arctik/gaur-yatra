import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { locations } from '../data/locations.js'
import { verses } from '../data/verses.js'

// Marker icon URL — uses public/ asset with BASE_URL prefix for GitHub Pages
const markerIconUrl = `${import.meta.env.BASE_URL}assets/icons/chaitanya-marker.svg`

// Default marker icon
const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
})

// Active marker icon with pulse animation wrapper
const activeIcon = L.divIcon({
  className: '',
  html: `<div class="marker-active-wrapper">
           <img src="${markerIconUrl}" width="32" height="32" alt="selected location" />
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
})

// Locations far from the main Vrindavan cluster get lower zoom
const FAR_LOCATION_IDS = ['soro-kshetra', 'prayaga']

// Headless component that controls map panning via useMap()
function MapController({ selectedLocationId }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedLocationId) return

    const loc = locations.find(l => l.id === selectedLocationId)
    if (!loc) return

    const isFar = FAR_LOCATION_IDS.includes(selectedLocationId)
    const zoom = isFar ? 10 : 15
    const duration = isFar ? 2.5 : 1.5

    map.flyTo([loc.lat, loc.lng], zoom, { duration })
  }, [selectedLocationId, map])

  return null
}

export default function MapView({ selectedLocationId, setSelectedLocationId, setSelectedVerseId }) {
  // Sort locations by journeyOrder for the polyline path
  const sortedPositions = useMemo(
    () => [...locations]
      .sort((a, b) => a.journeyOrder - b.journeyOrder)
      .map(loc => [loc.lat, loc.lng]),
    []
  )

  return (
    <div className="map-panel">
      <MapContainer
        center={[27.5, 77.65]}
        zoom={12}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        <MapController selectedLocationId={selectedLocationId} />

        {/* Journey path polyline */}
        <Polyline
          positions={sortedPositions}
          pathOptions={{
            color: '#E8730C',
            weight: 2.5,
            opacity: 0.7,
            dashArray: '8, 6',
          }}
        />

        {/* 32 location markers */}
        {locations.map(loc => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={loc.id === selectedLocationId ? activeIcon : defaultIcon}
            title={loc.name}
            eventHandlers={{
              click: () => {
                setSelectedLocationId(loc.id)
                // Also set the first verse for this location
                const firstVerse = verses.find(v => v.locationId === loc.id)
                if (firstVerse) setSelectedVerseId(firstVerse.id)
              },
            }}
          >
            <Popup>
              <strong>{loc.name}</strong>
              <br />
              <span className="devanagari text-sm">{loc.nameDevanagari}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
