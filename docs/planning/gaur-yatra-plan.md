# Feature: Gaur Yatra — Chaitanya Mahaprabhu's Journey Through Vraj Bhumi

**Version:** v2.0
**Status:** Approved
**Type:** Feature Spec
**Created:** 2026-03-05
**Last Modified:** 2026-03-05

---

## Problem Statement

The Caitanya Caritamrita Madhya Lila Chapter 18 contains 229 Sanskrit verses documenting Lord Chaitanya Mahaprabhu's pilgrimage through Vraj Bhumi (the Vrindavan/Mathura region) — visiting over 30 sacred locations in a specific chronological order. This knowledge exists only in textual form; there is no interactive, visual resource that lets devotees and scholars simultaneously read the original verses and see the geographic journey unfold on a map alongside photographs of those places as they exist today.

The Gaur Yatra project bridges that gap: a static website hosted on GitHub Pages that presents the scriptural text, an interactive map of the journey, and a photo gallery of each location — all three synchronized so that interacting with any one panel updates the other two.

---

## Goals & Success Criteria

- Devotees and scholars can read all 229 verses of CC Madhya 18 in the left panel while seeing the associated sacred place highlighted on the map in real time.
- All 32 sacred locations visited during the journey are marked on a React-Leaflet map centered on the Vrindavan/Mathura region, connected by a chronological travel path polyline.
- Clicking any map marker scrolls the left panel to the relevant verse(s) and loads photos of that location in the right gallery.
- Clicking any verse that references a location pans the map to that location and updates the gallery.
- A "Play Journey" animated mode auto-advances through all locations in chronological order.
- The site is fully self-contained — no backend, built with Vite, deployed as a static site on GitHub Pages at `dev-arctik.github.io/gaur-yatra`.
- **Definition of "done":** All 32 locations mapped with coordinates, all 229 verses loaded in the left panel, photo placeholder folder structure in place for each location, Play Journey button functional, and the site deploys successfully to GitHub Pages.

---

## Requirements

### Functional Requirements

- **FR-001:** Display all 229 verses from CC Madhya Lila Chapter 18 in a scrollable left panel, grouped by location. Each verse entry shows its verse number, a verse type badge (arrival/event/glory/narrative), and a truncated one-line translation preview. Verses with `locationId: null` (narrative type) appear in a "General / Narrative" group.
- **FR-002:** Render an interactive React-Leaflet map in the center panel centered on Vrindavan/Mathura (~27.5°N, 77.7°E) at zoom level 12. All 32 sacred locations are marked with custom Chaitanya Mahaprabhu PNG icons.
- **FR-003:** Draw a color-coded `<Polyline>` on the map connecting all 32 locations in the chronological order of the journey (verse order).
- **FR-004:** Clicking a verse that references a location triggers: (a) map pans/flies to that location, (b) that location's marker is highlighted/pulsed, (c) the right gallery loads that location's photos and location info, (d) the bottom verse reader updates to show that verse's full Sanskrit and translation.
- **FR-005:** Clicking a map marker triggers: (a) left panel scrolls to the first verse associated with that location, (b) all associated verses are highlighted in the left panel, (c) right gallery and location info update with that location's photos and details, (d) bottom verse reader updates to show the first verse associated with that location.
- **FR-006:** Right panel displays a photo slideshow/carousel for the currently selected location. Supports forward/back navigation between photos. Shows a placeholder card when no location is selected or no photos exist yet.
- **FR-007:** Bottom panel shows the full verse text (Sanskrit + English translation) of the currently selected verse, with a verse type badge and prev/next navigation through all 229 verses. Location info (name in English + Devanagari, 2-3 sentence description of spiritual significance, "Open in Google Maps" button) is shown in the right panel below the photo gallery.
- **FR-011:** The left panel groups verses by location. Each location group has a divider/header showing the location name, with condensed verse entries underneath showing: verse number, verse type badge (arrival/event/glory/narrative), and a truncated one-line translation preview. Verses with `locationId: null` (narrative type) appear in a "General / Narrative" group.
- **FR-008:** "Play Journey" button in the UI triggers an animated auto-advance: the map flies to each location in chronological order at a configurable interval (default: 3 seconds per location), updating the gallery and bottom panel at each step. A "Pause" button stops playback. Clicking any marker or verse during playback cancels auto-play.
- **FR-009:** All verse data is stored in `src/data/verses.js` as an ES module export. All location data (coordinates, descriptions, image paths, Google Maps URLs) is stored in `src/data/locations.js`. No network requests to a backend at runtime.
- **FR-010:** The site must be deployable as a static site via `npm run build` (Vite outputs to `dist/`), deployed to GitHub Pages using the `gh-pages` npm package or GitHub Actions.

### Non-Functional Requirements

- **Performance:** Page load under 3 seconds on a standard broadband connection. Images are loaded lazily; only the active location's photos are loaded at a time.
- **Accessibility:** All interactive elements have `aria-label` attributes. Map markers have descriptive titles. Keyboard navigation supported for left panel scrolling and gallery controls (v1 best-effort — not a blocking requirement).
- **Browser Support:** Chrome, Firefox, Safari (latest two versions each). No IE11 support required.
- **Hosting:** 100% static — `dist/` output from `vite build` deployed to GitHub Pages with `base: '/gaur-yatra/'` set in `vite.config.js`.
- **No Secrets / API Keys:** No services requiring API keys in v1. All map tiles use OpenStreetMap (free, no key required). Google Maps links are plain `https://maps.google.com/?q=lat,lng` URLs — no Maps API key needed.

### Assumptions

- [ASSUMPTION] The verse text and translations will be scraped from `https://vedabase.io/en/library/cc/madhya/18/` as part of the implementation. The developer is responsible for creating the `src/data/verses.js` file from this source. Vedabase content is Bhaktivedanta Book Trust material — this is an educational/devotional non-commercial project.
- [ASSUMPTION] Real photographs of each location will be manually sourced by the user and placed into the pre-created folder structure under `public/assets/images/locations/<location-id>/`. The developer creates the folders; the user fills them.
- [ASSUMPTION] A custom Chaitanya Mahaprabhu PNG icon (dancing or standing pose) will be created or sourced by the developer for map markers. A `public/assets/icons/` folder with a placeholder will be created.
- [ASSUMPTION] Mobile responsiveness is explicitly deferred to v2. The v1 layout targets desktop browsers (min-width: 1024px).

---

## User Stories

| Priority | Story | Acceptance Criteria |
|----------|-------|---------------------|
| Must | As a devotee, I want to read the original verses in order so I can follow the pilgrimage textually. | All 229 verses visible in left panel, numbered, scrollable. |
| Must | As a devotee, I want to see which locations Mahaprabhu visited on a map so I can understand the geographic journey. | All 32 markers visible on React-Leaflet map; polyline connects them in order. |
| Must | As a reader, I want clicking a verse to show me where on the map that place is so I can connect text to place. | Click verse → map pans to location, marker highlights, gallery + bottom panel update. |
| Must | As a reader, I want clicking a map location to show me the relevant verses so I can read the scripture for that place. | Click marker → left panel scrolls to verse(s), associated verses highlighted. |
| Must | As a visitor, I want to see photos of how these sacred places look today so I can visualize the pilgrimage. | Right panel shows photo carousel for the selected location. |
| Must | As a visitor, I want to open any location in Google Maps so I can plan a visit. | Right panel "Open in Google Maps" button (below gallery) opens `maps.google.com/?q=lat,lng` in new tab. |
| Must | As a user, I want a "Play Journey" mode that automatically takes me through all locations so I can meditate on the journey. | Play button auto-advances through all 32 locations at 3s intervals; Pause button works. |
| Must | As a developer, I want all location and verse data in plain JS ES module files so the site is easy to update. | `src/data/locations.js` and `src/data/verses.js` are self-contained ES module exports with no external dependencies. |

---

## Technical Design

### Architecture Overview

```
gaur_yatra/                    (project root)
│
├── index.html                 (Vite entry point — minimal shell, mounts #root)
├── vite.config.js             (base: '/gaur-yatra/', React plugin)
├── package.json               (npm — react, react-dom, react-leaflet, leaflet, tailwindcss)
│
├── public/                    (static assets — copied as-is to dist/)
│   └── assets/
│       ├── icons/
│       │   └── chaitanya-marker.png
│       └── images/
│           └── locations/
│               ├── radha-kunda/
│               └── ... (32 folders)
│
└── src/                       (all React source — processed by Vite)
    ├── main.jsx               (React entry — renders <App> into #root)
    ├── App.jsx                (root component — holds selectedLocationId + selectedVerseId state)
    │
    ├── components/
    │   ├── Header.jsx         (title bar + Play/Pause buttons)
    │   ├── VersePanel.jsx     (left panel — condensed verse list grouped by location)
    │   ├── VerseCard.jsx      (individual verse — text, badge, click handler)
    │   ├── MapView.jsx        (React-Leaflet MapContainer with markers + polyline)
    │   ├── GalleryPanel.jsx   (right panel — photo carousel + location info below)
    │   └── BottomPanel.jsx    (VerseReader — full Sanskrit + translation, verse type badge, prev/next)
    │
    ├── hooks/
    │   └── useJourney.js      (Play Journey custom hook — interval, step, play/pause)
    │
    ├── data/
    │   ├── verses.js          (export const verses = [...] — 229 verse objects)
    │   └── locations.js       (export const locations = [...] — 32 location objects)
    │
    └── styles/
        └── index.css          (Tailwind v4 directives + custom CSS overrides)
```

**State flow:** `App.jsx` is the single source of truth. Two pieces of shared state live in `useState` at the `App` level: `selectedLocationId` (string | null) and `selectedVerseId` (string | null). Both are passed as props to all child components. When `selectedVerseId` changes to a verse with a different `locationId`, `selectedLocationId` is updated to match, which triggers map pan + gallery/location info update. React's re-render cycle replaces the manual pub/sub event bus from v1.

### Layout Diagram (Desktop, 3-Column)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER: "Gaur Yatra — Chaitanya Mahaprabhu's Journey Through Vraj Bhumi"   │
│  [Play Journey ▶]  [Pause ‖]                                                │
├─────────────────────┬────────────────────────────┬───────────────────────────┤
│  LEFT PANEL (20%)   │  CENTER PANEL (55%)        │  RIGHT PANEL (25%)        │
│  <VersePanel>       │  <MapView>                 │  <GalleryPanel>           │
│                     │                            │                           │
│  ── Narrative ──    │    [React-Leaflet Map]     │  [Location Photo 1/3]     │
│  18.1 narrative ·   │    with <Marker> ×32 +     │                           │
│  18.2 narrative ·   │    <Polyline>              │  [◀ Prev]   [Next ▶]      │
│                     │                            │                           │
│  ── Radha-kunda ──  │                            │  ─────────────────────    │
│  18.4 arrival  ·    │                            │  Location: Radha-kunda    │
│  18.5 event    ·    │                            │  राधा कुण्ड               │
│  18.6 event    ·    │                            │  Description text...      │
│  18.7 glory    ·    │                            │  [Open in Google Maps ↗]  │
│  ...                │                            │                           │
│  (scrollable)       │                            │                           │
├─────────────────────┴────────────────────────────┴───────────────────────────┤
│  BOTTOM PANEL — <VerseReader>                                                │
│  Verse 18.4  [arrival]                              [◀ Prev]  [Next ▶]      │
│  Sanskrit: रधा-कुण्डरे गेला प्रभु...                                         │
│  Translation: "Sri Caitanya Mahaprabhu went to Radha-kunda..."               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | File | Purpose |
|-----------|------|---------|
| App | `src/App.jsx` | Root — holds `selectedLocationId` + `selectedVerseId` state; passes both as props to all children |
| Header | `src/components/Header.jsx` | Title bar; Play/Pause buttons; receives `isPlaying`, `onPlay`, `onPause` props from `useJourney` |
| VersePanel | `src/components/VersePanel.jsx` | Left panel container — renders a condensed verse list grouped by location; each group has a location divider/header with condensed verse entries (number, type badge, truncated translation); scrolls active verse into view |
| VerseCard | `src/components/VerseCard.jsx` | Single condensed verse row — shows verse number, verse type badge (arrival/event/glory/narrative), truncated translation preview; calls `setSelectedVerseId` on click |
| MapView | `src/components/MapView.jsx` | React-Leaflet `<MapContainer>` with `<TileLayer>`, 32 `<Marker>` components, `<Polyline>`, and a `<MapController>` child that uses `useMap()` to fly to the selected location |
| GalleryPanel | `src/components/GalleryPanel.jsx` | Right panel — derives photos from `selectedLocationId`; local `currentIndex` state for prev/next carousel; also shows location info below the gallery (name in English + Devanagari, description, "Open in Google Maps" button) |
| BottomPanel (VerseReader) | `src/components/BottomPanel.jsx` | Full verse reader — shows Sanskrit + translation of the currently selected verse with verse number, verse type badge, and prev/next navigation through all 229 verses; when prev/next lands on a verse with a different `locationId`, the map auto-pans and gallery auto-updates |

### Data Models

#### `src/data/verses.js` — ES Module Export

```js
// src/data/verses.js
export const verses = [
  {
    id: "cc-madhya-18-1",          // Unique ID: "cc-madhya-18-{verseNumber}"
    number: "18.1",                // Display verse number
    // Verse type: "arrival" | "event" | "glory" | "narrative"
    //   arrival   = verse describes reaching a new location
    //   event     = verse describes something happening at the current location
    //   glory     = verse praises/glorifies the current location
    //   narrative  = general text not tied to a specific location (always locationId: null)
    verseType: "narrative",
    // Sanskrit devanagari text (from Vedabase scrape)
    sanskrit: "prabhu kahe,--vrndavane yata tirtha-grama...",
    // Full English translation (from Vedabase scrape)
    translation: "Sri Caitanya Mahaprabhu said, 'All the holy places...'",
    // locationId links this verse to a location; null if the verse doesn't
    // directly name a visited location
    locationId: null
  },
  {
    id: "cc-madhya-18-4",
    number: "18.4",
    verseType: "arrival",          // Arriving at Radha-kunda
    sanskrit: "radha-kundere gela prabhu maha-anandita...",
    translation: "Sri Caitanya Mahaprabhu went to Radha-kunda, feeling great jubilation...",
    locationId: "radha-kunda"      // Links to a location in locations.js
  }
  // ... 229 total
];
```

#### `src/data/locations.js` — ES Module Export

```js
// src/data/locations.js
export const locations = [
  {
    id: "radha-kunda",                          // Kebab-case unique ID
    name: "Radha-kunda",                        // English display name
    nameDevanagari: "राधा कुण्ड",               // Devanagari name
    // Journey order (1 = first visited, 32 = last in this chapter)
    journeyOrder: 2,
    lat: 27.5050,
    lng: 77.4640,
    // Verse numbers associated with this location
    verses: ["18.4", "18.5", "18.6", "18.7", "18.8", "18.9",
             "18.10", "18.11", "18.12", "18.13", "18.14"],
    // 2-3 sentence spiritual description for right panel (below gallery)
    description: "Radha-kunda is the most sacred lake in all of Vrindavan, personally discovered by Sri Chaitanya Mahaprabhu during this visit. It is the bathing place of Srimati Radharani and is considered non-different from Her. Mahaprabhu bathed here and showed extreme ecstasy upon recognizing this supremely holy site.",
    // Pre-built Google Maps deep link
    googleMapsUrl: "https://maps.google.com/?q=27.5050,77.4640",
    // Relative paths to images inside public/assets/images/locations/radha-kunda/
    // Empty array = placeholder state until user adds real photos
    images: [
      "assets/images/locations/radha-kunda/photo-1.jpg",
      "assets/images/locations/radha-kunda/photo-2.jpg"
    ]
  }
  // ... 32 total
];
```

> **Note on image paths:** Because images live under `public/`, Vite serves them at the root during dev and copies them verbatim to `dist/` at build time. Reference them with a leading `/gaur-yatra/` prefix in production, or use Vite's `import.meta.env.BASE_URL` to prepend the correct base path at runtime.

### All 32 Sacred Locations — Complete Data Table

| # | ID | Name | Verses | Lat | Lng |
|---|----|------|--------|-----|-----|
| 1 | `arit-grama` | Arit-grama (Arith) | 18.3 | 27.5050 | 77.5300 |
| 2 | `radha-kunda` | Radha-kunda | 18.4–14 | 27.5050 | 77.4640 |
| 3 | `shyama-kunda` | Shyama-kunda | 18.5–6 | 27.5055 | 77.4630 |
| 4 | `sumanas-lake` | Sumanas Lake | 18.15 | 27.4950 | 77.4580 |
| 5 | `govardhana-hill` | Govardhana Hill | 18.15–45 | 27.4940 | 77.4620 |
| 6 | `govardhana-village` | Govardhana Village (Harideva temple) | 18.17–22 | 27.4970 | 77.4670 |
| 7 | `brahma-kunda` | Brahma-kunda | 18.21 | 27.4940 | 77.4640 |
| 8 | `annakuta-grama` | Annakuta-grama | 18.26–30 | 27.5070 | 77.4530 |
| 9 | `ganthuli-grama` | Ganthuli-grama | 18.29–36 | 27.5100 | 77.4700 |
| 10 | `manasa-ganga` | Manasa-ganga | 18.32 | 27.4960 | 77.4630 |
| 11 | `govinda-kunda` | Govinda-kunda | 18.35 | 27.5000 | 77.4580 |
| 12 | `kamyavana` | Kamyavana | 18.55–57 | 27.5430 | 77.4270 |
| 13 | `nandishvara` | Nandishvara (Nandgaon) | 18.57 | 27.5710 | 77.3780 |
| 14 | `pavana-lake` | Pavana Lake | 18.58 | 27.5700 | 77.3790 |
| 15 | `khadiravana` | Khadiravana | 18.63 | 27.5300 | 77.4100 |
| 16 | `seshashayi` | Seshashayi | 18.64 | 27.5050 | 77.6700 |
| 17 | `khela-tirtha` | Khela-tirtha | 18.66 | 27.5100 | 77.5800 |
| 18 | `bhandiravana` | Bhandiravana | 18.66 | 27.5580 | 77.5200 |
| 19 | `bhadravana` | Bhadravana | 18.66 | 27.5700 | 77.5500 |
| 20 | `shrivana` | Shrivana | 18.67 | 27.5200 | 77.5600 |
| 21 | `lohavana` | Lohavana | 18.67 | 27.5600 | 77.5800 |
| 22 | `mahavana-gokula` | Mahavana / Gokula | 18.67–68 | 27.4550 | 77.7100 |
| 23 | `mathura` | Mathura (birthplace of Krishna) | 18.69 | 27.5020 | 77.6870 |
| 24 | `akrura-tirtha` | Akrura-tirtha | 18.70–78 | 27.5100 | 77.6800 |
| 25 | `kaliya-daha` | Kaliya Lake (Kaliya-daha) | 18.71 | 27.5810 | 77.7000 |
| 26 | `praskandana` | Praskandana | 18.71 | 27.5750 | 77.6950 |
| 27 | `dvadashaditya` | Dvadashaditya | 18.72 | 27.5850 | 77.6950 |
| 28 | `keshi-tirtha` | Keshi-tirtha | 18.72–74 | 27.5830 | 77.7020 |
| 29 | `cira-ghata` | Cira-ghata | 18.75 | 27.5790 | 77.7000 |
| 30 | `tentuli-tala` | Tentuli-tala (Amli-tala) | 18.75–78 | 27.5825 | 77.7010 |
| 31 | `soro-kshetra` | Soro-kshetra | 18.214 | 27.8850 | 79.7300 |
| 32 | `prayaga` | Prayaga (Allahabad) | 18.214–222 | 25.4358 | 81.8463 |

### API Contracts

No backend API. All data contracts are ES module exports:

| Export | File | Consumed By |
|--------|------|-------------|
| `export const verses` | `src/data/verses.js` | `VersePanel.jsx`, `VerseCard.jsx`, `BottomPanel.jsx` (VerseReader) |
| `export const locations` | `src/data/locations.js` | `App.jsx`, `MapView.jsx`, `GalleryPanel.jsx`, `BottomPanel.jsx`, `useJourney.js` |

**Shared State Contract (App.jsx):**

| State | Type | Purpose |
|-------|------|---------|
| `selectedLocationId` | `string \| null` | Currently active location — drives map highlighting, gallery photos, location info |
| `selectedVerseId` | `string \| null` | Currently active verse — drives VerseReader (bottom panel) and left panel highlight |

### React-Leaflet Integration

Verified API pattern (react-leaflet v4.x, leaflet CSS imported in `src/styles/index.css`):

```jsx
// src/components/MapView.jsx
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet'
import L from 'leaflet'
import { locations } from '../data/locations'

// MapController is a child of MapContainer — useMap() only works inside MapContainer
function MapController({ selectedLocationId }) {
  const map = useMap()

  React.useEffect(() => {
    if (!selectedLocationId) return
    const loc = locations.find(l => l.id === selectedLocationId)
    if (loc) map.flyTo([loc.lat, loc.lng], 15, { duration: 1.5 })
  }, [selectedLocationId, map])

  return null
}

// Custom icon — references asset in public/ via BASE_URL
const chaitanyaIcon = L.icon({
  iconUrl: `${import.meta.env.BASE_URL}assets/icons/chaitanya-marker.png`,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50]
})

// Journey polyline positions sorted by journeyOrder
const journeyPath = [...locations]
  .sort((a, b) => a.journeyOrder - b.journeyOrder)
  .map(loc => [loc.lat, loc.lng])

export default function MapView({ selectedLocationId, setSelectedLocationId }) {
  return (
    <MapContainer
      center={[27.5, 77.65]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        positions={journeyPath}
        pathOptions={{ color: '#FF6B35', weight: 2.5, opacity: 0.7 }}
      />
      {locations.map(loc => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={chaitanyaIcon}
          eventHandlers={{ click: () => setSelectedLocationId(loc.id) }}
        >
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
      <MapController selectedLocationId={selectedLocationId} />
    </MapContainer>
  )
}
```

> **Important:** `leaflet/dist/leaflet.css` must be imported before any React-Leaflet components. Add `import 'leaflet/dist/leaflet.css'` in `src/styles/index.css` or `src/main.jsx`.

### Vite Configuration

Verified pattern (Vite `defineConfig` for GitHub Pages deployment):

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Must match the GitHub Pages repository name
  base: '/gaur-yatra/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

> **Note:** `base: '/gaur-yatra/'` ensures all asset URLs are prefixed correctly when served from `dev-arctik.github.io/gaur-yatra/`. During local dev (`npm run dev`), Vite automatically adjusts — `import.meta.env.BASE_URL` evaluates to `'/'` in dev and `'/gaur-yatra/'` in production builds.

### Inter-Panel Communication Architecture

No event bus. `App.jsx` holds all shared state. Components communicate upward via callbacks and downward via props. Two shared state values drive the UI: `selectedVerseId` (which verse is active in the reader) and `selectedLocationId` (which location is highlighted on map/gallery):

```
App.jsx
  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const [selectedVerseId, setSelectedVerseId] = useState(null)
  │
  │  // When selectedVerseId changes, derive and sync selectedLocationId:
  │  useEffect(() => {
  │    const verse = verses.find(v => v.id === selectedVerseId)
  │    if (verse?.locationId) setSelectedLocationId(verse.locationId)
  │  }, [selectedVerseId])
  │
  ├── <Header>
  │     props: isPlaying, onPlay, onPause (from useJourney hook)
  │
  ├── <VersePanel>
  │     props: selectedLocationId, setSelectedLocationId, selectedVerseId, setSelectedVerseId
  │     → Renders verses grouped by location with divider headers
  │     → VerseCard onClick calls setSelectedVerseId(verse.id)
  │     → VersePanel useEffect scrolls active card into view when selectedVerseId changes
  │
  ├── <MapView>
  │     props: selectedLocationId, setSelectedLocationId
  │     → <MapController> useEffect calls map.flyTo() when selectedLocationId changes
  │     → Marker eventHandlers.click calls setSelectedLocationId(loc.id)
  │       (also sets selectedVerseId to the first verse of that location)
  │
  ├── <GalleryPanel>
  │     props: selectedLocationId
  │     → derives photos from locations.find(l => l.id === selectedLocationId)
  │     → local useState(0) for currentIndex (resets to 0 when selectedLocationId changes)
  │     → also renders location info below gallery: name (English + Devanagari),
  │       description, "Open in Google Maps" button
  │
  └── <BottomPanel> (VerseReader)
        props: selectedVerseId, setSelectedVerseId
        → derives verse object from verses.find(v => v.id === selectedVerseId)
        → renders verse number, verse type badge, full Sanskrit text, full translation
        → prev/next buttons navigate through all 229 verses sequentially
        → when prev/next lands on a verse with a different locationId,
          App's useEffect syncs selectedLocationId → map pans + gallery updates
```

**Data flow for a verse click (dual-state model):**
```
User clicks <VerseCard id="cc-madhya-18-4" locationId="radha-kunda">
  → setSelectedVerseId("cc-madhya-18-4")         [VerseCard → App state]
      → App useEffect: verse.locationId is "radha-kunda"
        → setSelectedLocationId("radha-kunda")    [derived update]
      → React re-renders all components
          → MapView: <MapController> useEffect fires → map.flyTo(radha-kunda coords)
          → MapView: radha-kunda <Marker> can apply active class via prop comparison
          → VersePanel: useEffect scrolls active VerseCard into view
          → GalleryPanel: derives radha-kunda photos; resets currentIndex to 0;
                          renders radha-kunda name, description, Google Maps link
          → BottomPanel (VerseReader): renders verse 18.4 Sanskrit + translation
```

**Data flow for a prev/next click in the VerseReader:**
```
User clicks [Next ▶] in BottomPanel (currently on verse 18.4)
  → setSelectedVerseId("cc-madhya-18-5")         [BottomPanel → App state]
      → If verse 18.5 has same locationId ("radha-kunda"):
          no location change — only VerseReader and VersePanel update
      → If verse 18.5 has a different locationId:
          → App useEffect syncs selectedLocationId → triggers map pan + gallery update
```

### Photo Gallery / Carousel + Location Info

- Local state in `GalleryPanel.jsx`: `const [currentIndex, setCurrentIndex] = useState(0)`
- `useEffect` on `selectedLocationId` — resets `currentIndex` to 0 whenever the location changes
- `photos` derived from `locations.find(l => l.id === selectedLocationId)?.images ?? []`
- If `photos.length === 0`: renders a styled placeholder card ("Photos coming soon — Hare Krishna!")
- Prev/Next buttons update `currentIndex` with bounds clamping
- Only the image at `photos[currentIndex]` is rendered in the DOM (no preloading of all photos)
- Below the gallery, `GalleryPanel` also renders location info: name (English + Devanagari), 2-3 sentence description of spiritual significance, and "Open in Google Maps" button

### `useJourney` Hook — Play Journey Auto-Advance Mode

```js
// src/hooks/useJourney.js
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

export default function useJourney(locations, setSelectedLocationId) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const stepRef = useRef(0)
  const intervalRef = useRef(null)

  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.journeyOrder - b.journeyOrder),
    [locations]
  )

  const start = useCallback(() => {
    if (isPlaying) return
    stepRef.current = 0
    setCurrentStep(0)
    setIsPlaying(true)
  }, [isPlaying])

  const pause = useCallback(() => {
    clearInterval(intervalRef.current)
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    stepRef.current = 0
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    setSelectedLocationId(sortedLocations[stepRef.current].id)

    intervalRef.current = setInterval(() => {
      stepRef.current += 1
      if (stepRef.current >= sortedLocations.length) {
        clearInterval(intervalRef.current)
        setIsPlaying(false)
        return
      }
      setCurrentStep(stepRef.current)
      setSelectedLocationId(sortedLocations[stepRef.current].id)
    }, 3000)

    return () => clearInterval(intervalRef.current)
  }, [isPlaying, setSelectedLocationId, sortedLocations])

  return {
    isPlaying,
    currentStep,
    totalSteps: sortedLocations.length,
    currentLocationName: sortedLocations[stepRef.current]?.name ?? '',
    start,
    pause,
    stop
  }
}
```

In `App.jsx`, a `handleLocationSelect` wrapper calls `journey.pause()` before `setSelectedLocationId()` on any manual click — this is passed to `MapView` and `VersePanel` as their `setSelectedLocationId` prop so they need zero internal changes.

---

## Implementation Plan

### Phase 1: Vite + React Setup + Map (Days 1–2)

| Task | Description |
|------|-------------|
| Scaffold project | `npm create vite@latest gaur-yatra -- --template react`, install dependencies: `react-leaflet`, `leaflet`, `tailwindcss`, `gh-pages` |
| `vite.config.js` | Set `base: '/gaur-yatra/'`, add `@vitejs/plugin-react` |
| Tailwind v4 setup | Configure `src/styles/index.css` with Tailwind directives; import `leaflet/dist/leaflet.css` here too |
| `src/data/locations.js` | Hardcode all 32 location objects with coordinates, names, descriptions, empty `images: []` |
| `src/components/MapView.jsx` | `<MapContainer>` centered on Vrindavan, OpenStreetMap tiles, 32 `<Marker>` components, `<Polyline>`, placeholder `chaitanyaIcon` |
| `public/assets/icons/` | Add temporary colored circle PNG as `chaitanya-marker.png` placeholder |
| `App.jsx` skeleton | Basic layout structure; `selectedLocationId` + `selectedVerseId` state; all panels rendered but unconnected |

**Milestone 1 deliverable:** `npm run dev` shows map in browser with all 32 markers visible, polyline drawn, no interaction yet.

### Phase 2: Verse Data — Scrape + Populate (Days 3–4)

| Task | Description |
|------|-------------|
| Scrape Vedabase | Parse `https://vedabase.io/en/library/cc/madhya/18/` — extract verse numbers, Sanskrit text, and translations for all 229 verses |
| Manually map `locationId` + `verseType` | For each verse that names a location, assign the correct `locationId` from the 32-location list. Also assign `verseType` ("arrival", "event", "glory", or "narrative") to every verse |
| `src/data/verses.js` | Populate the 229-verse ES module export with scraped data |
| `VersePanel.jsx` + `VerseCard.jsx` | Render all verses in the left panel grouped by location; each verse shows verse number, verse type badge (arrival/event/glory/narrative), and truncated translation preview |

**Scraping Strategy for Vedabase:**

The Vedabase page at `https://vedabase.io/en/library/cc/madhya/18/` renders verses as structured HTML. The recommended approach:

1. Open the page in a browser (or use a headless browser like Puppeteer/Playwright)
2. Each verse block has: a verse number heading, the Sanskrit text, and the English translation
3. Use a browser console script or a Node.js scraping script (not committed to the repo) to extract all 229 verses into a JSON array
4. Paste the resulting array into `src/data/verses.js` as `export const verses = [...]`
5. Then manually go through the array and assign `locationId` values for the ~80-100 verses that directly reference a named location — cross-referencing with the 32-location table above. Also assign `verseType` ("arrival", "event", "glory", or "narrative") to every verse

> **Note:** This scraping step produces a one-time data extraction — the scraper script does NOT need to be part of the final project. Only the output (`verses.js`) is committed.

**Milestone 2 deliverable:** All 229 verses appear in the left panel; location-tagged verses are visually marked.

### Phase 3: State Wiring — Click Binding + Panel Sync (Days 5–6)

| Task | Description |
|------|-------------|
| Connect `setSelectedVerseId` to `VerseCard` | `onClick` in `VerseCard.jsx` calls `setSelectedVerseId(verse.id)` — App's `useEffect` derives `selectedLocationId` from the verse's `locationId` |
| Connect `setSelectedLocationId` to `<Marker>` | `eventHandlers={{ click: () => setSelectedLocationId(loc.id) }}` in `MapView.jsx` |
| `<MapController>` component | `useMap()` hook inside `MapContainer`; `useEffect` on `selectedLocationId` calls `map.flyTo()` |
| `VersePanel` auto-scroll | `useEffect` on `selectedVerseId`; uses `element.scrollIntoView({ behavior: 'smooth' })` |
| Active verse highlight | `VerseCard` applies an active CSS class when `verse.id === selectedVerseId`; location group highlight when `verse.locationId === selectedLocationId` |
| `BottomPanel.jsx` (VerseReader) | Derives verse from `selectedVerseId`; renders verse number, verse type badge, full Sanskrit text, full translation; prev/next navigation through all 229 verses |

**Milestone 3 deliverable:** Clicking any verse or marker fully syncs all 4 panels.

### Phase 4: GalleryPanel + Play Journey (Days 7–8)

| Task | Description |
|------|-------------|
| `GalleryPanel.jsx` | Carousel with local `currentIndex` state; prev/next buttons; placeholder card for empty `images[]` |
| Create 32 image folders | `public/assets/images/locations/<id>/` — one per location; each with a `README.md`: "Place photos here" |
| `useJourney.js` hook | `start()` / `pause()` / `stop()` using `setInterval` at 3000ms; returns `{ isPlaying, currentStep, totalSteps, currentLocationName, start, pause, stop }` |
| `Header.jsx` Play/Pause UI | Buttons wired to `useJourney` callbacks; progress indicator ("Location 5 / 32") |
| Manual action cancels play | `handleLocationSelect` wrapper in `App.jsx` calls `journey.pause()` before `setSelectedLocationId()` |

**Milestone 4 deliverable:** Gallery works (placeholder state), Play Journey auto-advances through all 32 locations.

### Phase 5: Polish + GitHub Pages Deploy (Days 9–10)

| Task | Description |
|------|-------------|
| Tailwind styling pass | Header, panel borders, scrollbars, active states, location badge colors, verse highlight styles |
| Final marker icon | Chaitanya Mahaprabhu PNG placed at `public/assets/icons/chaitanya-marker.png` |
| Marker popup styling | React-Leaflet `<Popup>` styled to show location name + verse range |
| `README.md` | Project description, how to contribute photos, `npm run dev` and `npm run deploy` instructions |
| GitHub repo setup | Create `gaur-yatra` repo under `dev-arctik`, push all files |
| Deploy to GitHub Pages | `npm run build && npm run deploy` using `gh-pages` package (or GitHub Actions workflow) |
| Smoke test | Verify all 32 markers load, polyline visible, verse click works, gallery placeholder shows, Play Journey runs end-to-end |

**Milestone 5 deliverable:** Site live at `https://dev-arctik.github.io/gaur-yatra`.

### Suggested Build Order Summary

```
Phase 1 (Vite + React setup + Map)
  → Phase 2 (Verse Data — ES module)
      → Phase 3 (State wiring — requires both MapView markers AND VersePanel)
          → Phase 4 (GalleryPanel + useJourney — requires selectLocation state from Phase 3)
              → Phase 5 (Polish + Deploy)
```

---

## File Structure

```
gaur_yatra/
├── index.html                          (Vite entry — minimal HTML shell, mounts #root)
├── package.json                        (npm; scripts: dev, build, deploy)
├── vite.config.js                      (base: '/gaur-yatra/', React plugin, outDir: dist)
├── public/
│   └── assets/
│       ├── icons/
│       │   └── chaitanya-marker.png    (Custom PNG icon for React-Leaflet markers)
│       └── images/
│           └── locations/
│               ├── arit-grama/         (User places photos here)
│               ├── radha-kunda/
│               ├── shyama-kunda/
│               ├── sumanas-lake/
│               ├── govardhana-hill/
│               ├── govardhana-village/
│               ├── brahma-kunda/
│               ├── annakuta-grama/
│               ├── ganthuli-grama/
│               ├── manasa-ganga/
│               ├── govinda-kunda/
│               ├── kamyavana/
│               ├── nandishvara/
│               ├── pavana-lake/
│               ├── khadiravana/
│               ├── seshashayi/
│               ├── khela-tirtha/
│               ├── bhandiravana/
│               ├── bhadravana/
│               ├── shrivana/
│               ├── lohavana/
│               ├── mahavana-gokula/
│               ├── mathura/
│               ├── akrura-tirtha/
│               ├── kaliya-daha/
│               ├── praskandana/
│               ├── dvadashaditya/
│               ├── keshi-tirtha/
│               ├── cira-ghata/
│               ├── tentuli-tala/
│               ├── soro-kshetra/
│               └── prayaga/
├── src/
│   ├── main.jsx                        (React entry — ReactDOM.createRoot → <App>)
│   ├── App.jsx                         (Root — selectedLocationId + selectedVerseId state + useJourney hook)
│   ├── components/
│   │   ├── Header.jsx                  (Title + Play/Pause buttons)
│   │   ├── VersePanel.jsx              (Left panel — condensed verse list grouped by location, auto-scrolls)
│   │   ├── VerseCard.jsx               (Single verse row — text, badge, click handler)
│   │   ├── MapView.jsx                 (MapContainer + TileLayer + Markers + Polyline + MapController)
│   │   ├── GalleryPanel.jsx            (Right panel — carousel, prev/next, placeholder + location info)
│   │   └── BottomPanel.jsx             (VerseReader — full Sanskrit + translation, prev/next navigation)
│   ├── hooks/
│   │   └── useJourney.js               (Play Journey: isPlaying, start, pause, stop)
│   ├── data/
│   │   ├── verses.js                   (export const verses = [...] — 229 verse objects)
│   │   └── locations.js                (export const locations = [...] — 32 location objects)
│   └── styles/
│       └── index.css                   (Tailwind directives + leaflet.css import + custom overrides)
├── dist/                               (Vite build output — deployed to GitHub Pages)
├── docs/
│   └── planning/
│       └── gaur-yatra-plan.md          (This document)
└── README.md                           (Setup, photo contribution guide, deploy steps)
```

---

## Testing Strategy

- [ ] **Manual smoke test (Phase 1):** Run `npm run dev` — map loads in browser, all 32 markers visible, polyline drawn, no console errors.
- [ ] **Data integrity check (Phase 2):** In browser console: `import { verses } from './src/data/verses.js'` — verify `verses.length === 229`; `locations.length === 32`; every location has a unique `journeyOrder` 1–32; every `locationId` referenced in a verse exists in the `locations` array.
- [ ] **Interaction test (Phase 3):** Click each of the 32 markers — verify left panel scrolls, correct verses are highlighted, bottom panel populates, gallery shows placeholder. Click a location-tagged verse — verify map flies to the correct location.
- [ ] **Gallery test (Phase 4):** Add 2 test photos to one location folder; verify prev/next navigation works, counter updates ("1 / 2"), placeholder shows for a location with no photos.
- [ ] **Play Journey test (Phase 4):** Press Play — verify all 32 locations advance in chronological (`journeyOrder`) order at ~3s intervals. Press Pause mid-journey — verify it stops. Click a marker during play — verify play stops and that location is selected.
- [ ] **Edge cases:**
  - Verses with `locationId: null` — clicking them should update the bottom verse reader but NOT trigger a map pan or gallery change (no error).
  - Last location in Play Journey — verify `setInterval` clears, Play button re-enables.
  - Location with 0 images — verify placeholder card renders without JS error.
  - Rapid clicking between markers — verify `currentIndex` resets to 0 on each location change (no stale gallery state).
- [ ] **Production build test:** Run `npm run build` — inspect `dist/` to confirm all asset paths include `/gaur-yatra/` prefix. Load `https://dev-arctik.github.io/gaur-yatra` on Chrome, Firefox, Safari — all assets load, no 404s, map tiles load from OpenStreetMap CDN.

---

## Rollout & Deployment

### GitHub Pages Setup with `gh-pages` Package

1. Install: `npm install --save-dev gh-pages`
2. Add to `package.json` scripts:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "deploy": "gh-pages -d dist"
     }
   }
   ```
3. Confirm `vite.config.js` has `base: '/gaur-yatra/'`
4. Run: `npm run build && npm run deploy`
5. `gh-pages` pushes `dist/` contents to the `gh-pages` branch of the repo
6. In GitHub repo Settings → Pages → Source: set to "Deploy from a branch", select `gh-pages` branch, folder `/ (root)`
7. Site publishes at: `https://dev-arctik.github.io/gaur-yatra`

### Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server (hot module replacement enabled)
npm run dev
# Open: http://localhost:5173

# Production build preview
npm run build
npm run preview
# Open: http://localhost:4173/gaur-yatra/
```

### Adding Photos (User Workflow)

1. Source real photographs of a sacred location (personal photos, Wikimedia Commons CC-licensed images, or ISKCON media).
2. Name files descriptively: `photo-1.jpg`, `photo-2.jpg`, etc. (JPEG or WebP recommended, max 1MB per photo for performance).
3. Place files in the corresponding folder: `public/assets/images/locations/<location-id>/`.
4. Update the `images` array in that location's object in `src/data/locations.js` to include the paths (e.g., `"assets/images/locations/radha-kunda/photo-1.jpg"`).
5. Run `npm run build && npm run deploy` — GitHub Pages deploys automatically.

### No Feature Flags / No Migration Steps

This is a v1 greenfield build. No flags, no migrations, no breaking changes from a previous version.

---

## Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Vedabase scrape fails or content structure changes | Medium | Medium | Inspect page DOM manually; scrape is a one-time extraction. If structure changed, adjust selectors. Alternatively, input verses manually for the ~80 location-tagged ones as a minimum viable dataset. |
| Coordinate inaccuracies for lesser-known locations | Medium | High | Coordinates are approximate and sourced from academic/pilgrimage guides. Plan a v2 refinement pass using Google Earth to pin exact locations. |
| React-Leaflet CSS not imported — map renders broken | High | Medium | `import 'leaflet/dist/leaflet.css'` must be in `src/styles/index.css` or `src/main.jsx` before any React-Leaflet component mounts. Missing this is the most common React-Leaflet setup error. |
| `useMap()` called outside `<MapContainer>` | High | Low | `<MapController>` must be rendered as a child of `<MapContainer>`, never alongside it. Enforced by React-Leaflet's context — will throw a clear error if violated. |
| Leaflet default icon broken in Vite (missing marker images) | Medium | High | Leaflet's default icon references `marker-icon.png` via a path that Vite's bundler breaks. Fix by always using a custom `L.icon({ iconUrl: ... })` with explicit `import.meta.env.BASE_URL` prefix, which this project already does. |
| `base` mismatch between `vite.config.js` and GitHub Pages URL | High | Medium | If `base` is wrong, all assets 404. Always verify the deployed URL matches the `base` value. For `dev-arctik.github.io/gaur-yatra`, `base` must be exactly `'/gaur-yatra/'`. |
| Missing photos for many locations | Low | High | Handled by design — gallery shows a placeholder card for locations with no photos. Not a blocking issue for launch. |
| Large number of verses (229) causing left panel render lag | Low | Low | 229 plain `<VerseCard>` components are negligible DOM cost. No virtualization needed for v1. |
| Copyright concern for Vedabase content | Medium | Low | CC Madhya 18 translations by Srila Prabhupada are published by Bhaktivedanta Book Trust. This is a non-commercial, devotional educational project. Attribute Vedabase clearly in the footer and README. Consult ISKCON/BBT if commercializing. |

---

## Open Questions

- [ ] **Custom marker icon** — Is there a specific Chaitanya Mahaprabhu PNG image already identified for the map markers? If not, who will source or create it? This should be resolved before Phase 1 completes, as the placeholder icon affects visual quality from the start.
- [ ] **Verse-to-location mapping + verseType completeness** — Not all 229 verses name a location. The developer needs to do a full read-through of Chapter 18 to assign `locationId` values and `verseType` tags ("arrival", "event", "glory", or "narrative") to every verse. Estimated: ~80–100 verses have explicit location references. This mapping is the most labor-intensive part of Phase 2.
- [ ] **Coordinate accuracy** — The 32 coordinates provided are approximate. For a devotional reference tool, should these be validated against known GPS coordinates (e.g., from ISKCON pilgrimage materials or Google Earth pinning of actual temples/kunds)? Flag for v2 or do in Phase 5.
- [ ] **Tailwind v4 configuration** — Tailwind v4 changes the config model significantly (no `tailwind.config.js` by default; uses CSS-first config via `@theme` in `index.css`). Confirm whether a `tailwind.config.js` is needed or if the CSS-first approach is preferred before Phase 1 starts.

---

## References

- Source text: https://vedabase.io/en/library/cc/madhya/18/ (Caitanya Caritamrita Madhya Lila, Chapter 18)
- React-Leaflet documentation: https://react-leaflet.js.org/docs/v4/api-components
- React-Leaflet `useMap` hook: https://react-leaflet.js.org/docs/v4/api-hooks
- Leaflet.js documentation: https://leafletjs.com/reference.html
- OpenStreetMap tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Vite React template: https://vitejs.dev/guide/
- Vite GitHub Pages deployment: https://vitejs.dev/guide/static-deploy.html#github-pages
- Tailwind CSS v4 docs: https://tailwindcss.com/docs/installation
- `gh-pages` npm package: https://github.com/tschaub/gh-pages
- Target deployment URL: `https://dev-arctik.github.io/gaur-yatra`
- ISKCON Vrindavan pilgrimage resources: https://www.iskcon.com/vrindavan/
