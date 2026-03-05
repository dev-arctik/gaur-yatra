# Feature: Phase 3 — State Wiring + Full Panel Synchronization

**Version:** v3.0
**Status:** Approved
**Type:** Implementation Guide
**Created:** 2026-03-05
**Last Modified:** 2026-03-05
**Parent Plan:** `docs/planning/gaur-yatra-plan.md`
**Tech Stack:** React 19 + Vite + React-Leaflet v4

---

## Problem Statement

After Phase 1 (Vite + React scaffold, MapView with markers and polyline, locations data) and Phase 2 (VersePanel with 229 VerseCard components rendered), all four panels exist as isolated, non-communicating units. The user can see verses, can see the map, but clicking anything does nothing. Phase 3 is the phase where the application becomes alive.

In the vanilla JS version of this project, Phase 3 centered on a manual `selectLocation()` event-bus function that imperatively updated every panel in sequence. **React eliminates the need for that pattern entirely.** Two pieces of state — `selectedLocationId` and `selectedVerseId` — live in `App.jsx`. When either changes, React's re-render cycle automatically propagates the new values to every component that receives them as props. There is no event bus. There is no manual DOM manipulation. There is no pub/sub wiring. The declarative model replaces all of it.

Verses now carry a `verseType` field (`"arrival"` | `"event"` | `"glory"` | `"narrative"`) and the `purportExcerpt` field has been removed from the data model. The layout has been redesigned: the left panel shows a condensed verse list grouped by location with type badges, the bottom panel is now the **VerseReader** (Sanskrit + translation + prev/next navigation through all 229 verses), and the right panel combines the gallery with location info (name, Devanagari, description, Google Maps link).

This document specifies every component, every prop, every `useEffect`, and every edge case required to complete Phase 3 in the React + Vite + React-Leaflet stack.

---

## Goals & Success Criteria

- Clicking any of the 32 map markers synchronizes all four panels to that location and selects the first verse associated with it.
- Clicking any verse in the VersePanel sets `selectedVerseId` and, if the verse has a `locationId`, also sets `selectedLocationId`.
- Clicking verses with no `locationId` still sets `selectedVerseId` (the VerseReader updates) but does not change `selectedLocationId` (map and gallery stay on the last selected location).
- Rapid repeated clicks between different locations/verses produce no race conditions, no stale state, no visual artifacts. React's `useState` batching handles this naturally.
- `GalleryPanel` (right panel) receives `selectedLocationId` and shows a stub for the photo carousel — Phase 4 will complete the carousel. Below the gallery stub, it shows location info: name, Devanagari name, description, and a "Open in Google Maps" link.
- `BottomPanel` is now the **VerseReader**: it displays the full Sanskrit text, English translation, verse number, and verse type badge for `selectedVerseId`. It has Prev/Next buttons to navigate through all 229 verses sequentially. When navigation lands on a verse with a different `locationId`, the map auto-pans and gallery auto-updates.
- **Definition of done:** Click each of the 32 markers; click several verses (location-tagged and locationless); use Prev/Next in the VerseReader to navigate across location boundaries; verify all four panels update correctly every time. No console errors or warnings.

---

## The Core Insight: Why React Simplifies This Phase

In the vanilla JS implementation, `selectLocation(locationId)` was a seven-step imperative sequence that manually updated each panel:

```
selectLocation("radha-kunda")
  → panToLocation()       // map.js: call map.flyTo()
  → highlightMarker()     // map.js: swap DivIcon
  → loadGallery()         // gallery.js: re-render carousel
  → updateBottomPanel()   // app.js: write textContent to 4 DOM nodes
  → scrollVersePanel()    // app.js: querySelector + scrollIntoView
  → highlightVerses()     // app.js: querySelectorAll + classList toggle
  → currentLocationId = locationId  // commit state
```

Every one of those steps required the developer to manually find the DOM node, check it existed, write to it, and manage the sequencing of animations. State and DOM were two separate things that had to be kept in sync by hand.

In React, the equivalent is:

```jsx
setSelectedLocationId("radha-kunda");
setSelectedVerseId("cc-madhya-18-5");
```

That is the entire "event bus." React schedules a re-render. Every component that received `selectedLocationId` or `selectedVerseId` as a prop re-renders with the new value and updates itself. The `useEffect` in `MapView.jsx` fires because `selectedLocationId` changed, calling `map.flyTo()`. The `useEffect` in `VersePanel.jsx` fires and scrolls to the matching card. `BottomPanel.jsx` (now the VerseReader) re-renders with the full verse text. `GalleryPanel.jsx` re-renders with location info. `Header.jsx` re-renders with the updated progress count. All of this is automatic.

**The developer's job in Phase 3 is:**
1. Put `selectedLocationId` AND `selectedVerseId` in `App.jsx`
2. Pass them (and their setters) down as props
3. Write the `useEffect` hooks that respond to changes in each component
4. Wire click handlers to call `setSelectedLocationId` and `setSelectedVerseId`

That is it. No event bus. No global mutable state. No imperative DOM coordination.

---

## Requirements

### Functional Requirements

- **FR-3-001:** `selectedLocationId` and `selectedVerseId` state both live exclusively in `App.jsx`. No panel holds a copy of either state independently.
- **FR-3-002:** `VerseCard.jsx` receives `onClick` as a prop. When clicked, it always calls `setSelectedVerseId(verse.id)`. If the card also has a non-null `locationId`, it additionally calls `setSelectedLocationId(verse.locationId)`. Clicking a locationless verse updates the VerseReader but does not change the map/gallery.
- **FR-3-003:** `MapView.jsx` contains a `<MapController>` child component (rendered inside `<MapContainer>`) that uses `useMap()` and `useEffect` to call `map.flyTo()` whenever `selectedLocationId` changes.
- **FR-3-004:** Each `<Marker>` in `MapView.jsx` receives an `eventHandlers` click handler that calls both `setSelectedLocationId(loc.id)` and `setSelectedVerseId(firstVerseOfLocation.id)` — where `firstVerseOfLocation` is the first verse in the `verses` array with `locationId === loc.id`.
- **FR-3-005:** Marker highlighting is achieved via a conditional icon: if `loc.id === selectedLocationId`, the marker renders the highlighted `L.divIcon` variant; otherwise it renders the default `L.icon`. This is computed per-render — no imperative icon-swap step needed.
- **FR-3-006:** `VersePanel.jsx` uses a `useEffect` watching `selectedVerseId` to scroll the panel to the matching `VerseCard`. It uses a `useRef` map (or `querySelector` on the panel's DOM node) to find the target element.
- **FR-3-007:** `BottomPanel.jsx` is now the **VerseReader**. It receives `selectedVerseId`, `setSelectedVerseId`, and `setSelectedLocationId`. It uses `selectedVerseId` to look up the current verse from the `verses` array and displays: verse number, verse type badge, full Sanskrit text, and full English translation. It has Prev/Next buttons that navigate sequentially through all 229 verses. When prev/next lands on a verse with a different `locationId` than the previous verse (and the new `locationId` is not null), it also calls `setSelectedLocationId(newVerse.locationId)` to trigger map pan and gallery update.
- **FR-3-008:** `GalleryPanel.jsx` receives `selectedLocationId` and renders a gallery stub for Phase 4. Below the gallery stub, it shows location info: name (English + Devanagari), 2-3 sentence description, and an "Open in Google Maps" button. This location info was previously in the old BottomPanel and has moved here.
- **FR-3-009:** `Header.jsx` receives `selectedLocationId` and displays a progress count (e.g., "Location 5 of 32" based on `journeyOrder`).
- **FR-3-010:** Calling `setSelectedLocationId` or `setSelectedVerseId` with the same value that is already in state causes React to bail out of the re-render (`Object.is` comparison). This means clicking the currently-selected marker or verse twice is a no-op — which is correct behavior.

### Non-Functional Requirements

- **Performance:** `useMemo` is used in `GalleryPanel.jsx` for the location lookup and in `BottomPanel.jsx` (VerseReader) for the verse lookup to avoid recomputing on every unrelated render. All 229 VerseCards should not re-render on every selection — `React.memo` can be applied to `VerseCard.jsx` in Phase 5 if profiling shows it is necessary. In Phase 3, correctness is the goal.
- **Correctness:** If `selectedLocationId` is `null` (initial state), map and gallery panels show their default/welcome state. If `selectedVerseId` is `null`, the VerseReader shows a welcome message. If either is an unrecognized ID (should not happen in practice), `useMemo` lookups return `undefined` — all components guard against this.
- **No direct DOM manipulation:** `document.getElementById`, `document.querySelector`, `innerHTML`, and `textContent` assignments are forbidden in Phase 3. All updates happen through React's render cycle.
- **CSS cursor:** `VerseCard.jsx` applies `cursor-pointer` (Tailwind) to all verse cards — all verses are clickable in the new design (clicking sets `selectedVerseId` even for locationless verses).

### Assumptions

- [ASSUMPTION] Phase 1 is complete: `App.jsx` exists, `MapView.jsx` renders a `<MapContainer>` with all 32 markers and a polyline, `locations` data is imported from `src/data/locations.js`.
- [ASSUMPTION] Phase 2 is complete: `VersePanel.jsx` renders all 229 `<VerseCard>` components. Each `VerseCard` receives `verse.locationId` as a prop.
- [ASSUMPTION] `react-leaflet` v4 is installed as a dependency (alongside `leaflet`). The `useMap()` hook is available.
- [ASSUMPTION] Tailwind CSS is configured in the Vite project. All styling uses Tailwind utility classes unless a custom CSS value (like a specific animation) is needed.
- [ASSUMPTION] The `locations` array is importable from `src/data/locations.js` as an ES module. It is not a global variable — it is imported explicitly wherever needed.
- [ASSUMPTION] Each verse object has a `verseType` field with one of four values: `"arrival"`, `"event"`, `"glory"`, or `"narrative"`. The `purportExcerpt` field has been removed from the verse data model.
- [ASSUMPTION] Verses and locations are exported as **named exports** (`export const verses = [...]` and `export const locations = [...]`), NOT default exports. All imports must use destructured syntax: `import { verses } from` and `import { locations } from`.

---

## User Stories

| Priority | Story | Acceptance Criteria |
|----------|-------|---------------------|
| Must | As a reader, I want clicking a verse to pan the map to its location and show the full verse text in the VerseReader so I can connect text to place. | Map flies to the location (if verse has locationId), marker shows highlighted icon, VerseReader shows full Sanskrit + translation, no error for locationless verses. |
| Must | As a devotee, I want clicking a map marker to scroll the verse panel and load the first verse for that location in the VerseReader so I can read what scripture says about that place. | Left panel scrolls to first associated verse, all associated verses show highlighted styles, VerseReader loads the first verse. |
| Must | As a reader, I want Prev/Next buttons in the VerseReader to navigate through all 229 verses sequentially, with the map auto-panning when I cross location boundaries. | Prev/Next moves through verses in order; when a new verse has a different locationId, map pans and gallery updates automatically. |
| Must | As a visitor, I want the right panel to show the location name, Devanagari name, description, and a Google Maps link below the gallery. | Right panel shows location info on every selection; Google Maps link opens correct coordinates in new tab. |
| Must | As a developer, I want a GalleryPanel stub that receives `selectedLocationId` without crashing so Phase 4 can drop in the carousel. | GalleryPanel renders without errors, shows a gallery placeholder, and displays location info below it. |

---

## Technical Design

### State Architecture in `App.jsx`

```jsx
// src/App.jsx

import { useState } from 'react';
import Header from './components/Header';
import VersePanel from './components/VersePanel';
import MapView from './components/MapView';
import GalleryPanel from './components/GalleryPanel';
import BottomPanel from './components/BottomPanel';

// Note: App.jsx does NOT import { locations } or { verses } directly.
// Those are consumed by child components. Phase 4's App.jsx will import
// locations for the useJourney hook — but in Phase 3, App only holds state.

function App() {
  // Dual source of truth for all four panels.
  // null = nothing selected (initial page load state).
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedVerseId, setSelectedVerseId] = useState(null);

  return (
    <div className="flex flex-col h-screen">
      <Header selectedLocationId={selectedLocationId} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel (20%): condensed verse list grouped by location with type badges */}
        <VersePanel
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
          selectedVerseId={selectedVerseId}
          setSelectedVerseId={setSelectedVerseId}
        />
        {/* Center panel: interactive map */}
        <MapView
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
          setSelectedVerseId={setSelectedVerseId}
        />
        {/* Right panel: gallery stub + location info */}
        <GalleryPanel selectedLocationId={selectedLocationId} />
      </div>
      {/* Bottom panel: VerseReader — full verse text with prev/next navigation */}
      <BottomPanel
        selectedVerseId={selectedVerseId}
        setSelectedVerseId={setSelectedVerseId}
        setSelectedLocationId={setSelectedLocationId}
      />
    </div>
  );
}

export default App;
```

`useState(null)` is used for both state variables. Every panel derives its display from one or both of these values. When `setSelectedLocationId` or `setSelectedVerseId` is called from any child, React re-renders `App` with the new values, and every child that received them as props re-renders too.

### Data Flow Diagram

```
App.jsx
  state: selectedLocationId (string | null)
  state: selectedVerseId (string | null)
  │
  ├── Header.jsx
  │     props: selectedLocationId
  │     purpose: shows "Location N / 32" progress indicator
  │
  ├── VersePanel.jsx (left panel, 20%)
  │     props: selectedLocationId, setSelectedLocationId,
  │            selectedVerseId, setSelectedVerseId
  │     │
  │     ├── useEffect watches selectedVerseId
  │     │   → scrolls to matching VerseCard
  │     │
  │     └── VerseCard.jsx (x229, forwardRef)
  │           props: verse, isActive, isSelected, onClick (callback)
  │           ref: callback ref → verseRefs.current[verse.id] = el
  │           onClick → setSelectedVerseId(verse.id)  — always
  │                   → setSelectedLocationId(verse.locationId)  — only if non-null
  │
  ├── MapView.jsx (center panel)
  │     props: selectedLocationId, setSelectedLocationId, setSelectedVerseId
  │     │
  │     ├── <MapContainer> (react-leaflet)
  │     │     │
  │     │     ├── <MapController> (child component, uses useMap())
  │     │     │     useEffect watches selectedLocationId
  │     │     │     → map.flyTo(coords, zoom, { duration: 1.5 })
  │     │     │
  │     │     ├── <TileLayer> (OpenStreetMap)
  │     │     │
  │     │     ├── <Polyline positions={sortedPositions}>
  │     │     │
  │     │     └── locations.map(loc =>
  │     │           <Marker
  │     │             key={loc.id}
  │     │             position={[loc.lat, loc.lng]}
  │     │             icon={loc.id === selectedLocationId
  │     │               ? activeIcon
  │     │               : defaultIcon}
  │     │             eventHandlers={{
  │     │               click: () => {
  │     │                 setSelectedLocationId(loc.id)
  │     │                 const firstVerse = verses.find(v => v.locationId === loc.id)
  │     │                 if (firstVerse) setSelectedVerseId(firstVerse.id)
  │     │               }
  │     │             }}
  │     │           >
  │     │             <Popup>{loc.name}</Popup>
  │     │           </Marker>
  │     │         )
  │     │
  │     └── (no useMap() at MapView level — only inside MapContainer children)
  │
  ├── GalleryPanel.jsx (right panel)
  │     props: selectedLocationId
  │     purpose: Phase 4 gallery stub + location info below
  │     useMemo: looks up location object from locations array
  │     renders: gallery placeholder, then location name, nameDevanagari,
  │              description, Google Maps link
  │     initial state (null): welcome message
  │
  └── BottomPanel.jsx (VerseReader)
        props: selectedVerseId, setSelectedVerseId, setSelectedLocationId
        useMemo: looks up verse object from verses array
        renders: verse number, verseType badge, Sanskrit text, translation
        navigation: Prev/Next buttons through all 229 verses sequentially
        cross-location: when prev/next lands on a verse with a different
                        locationId (and locationId is not null),
                        calls setSelectedLocationId(newVerse.locationId)
        initial state (null): welcome message
```

### Interaction Flow Examples

```
User clicks VerseCard (verse 18.5, locationId: "radha-kunda")
  → setSelectedVerseId("cc-madhya-18-5")
  → setSelectedLocationId("radha-kunda")
      → React re-renders all:
          → MapView: flyTo radha-kunda
          → VersePanel: highlight verse 18.5, scroll into view
          → GalleryPanel: show radha-kunda photos + location info
          → BottomPanel/VerseReader: show full text of verse 18.5

User clicks Next in VerseReader (moves from 18.5 to 18.6)
  → setSelectedVerseId("cc-madhya-18-6")
  → verse 18.6 has same locationId "radha-kunda" → no map/gallery change
  → BottomPanel updates to show verse 18.6 text

User clicks Next again (moves to verse with different location)
  → setSelectedVerseId changes
  → new verse has locationId "govardhana-hill" → setSelectedLocationId("govardhana-hill")
  → map pans, gallery updates, verse reader shows new verse

User clicks Next on a verse where next verse has locationId: null
  → setSelectedVerseId changes to the new verse
  → locationId is null → setSelectedLocationId is NOT called
  → map stays on the last location, gallery stays, verse reader shows new verse text

User clicks Marker "radha-kunda"
  → setSelectedLocationId("radha-kunda")
  → setSelectedVerseId(firstVerseOfRadhaKunda.id)
  → map flies to radha-kunda, VerseReader shows first verse for radha-kunda
```

### Component Breakdown

| Component | File | Phase 3 Props | Phase 3 Responsibility |
|-----------|------|---------------|------------------------|
| App | `src/App.jsx` | — | Holds `selectedLocationId` + `selectedVerseId` state; passes both and their setters to all children |
| Header | `src/components/Header.jsx` | `selectedLocationId` | Receives `selectedLocationId`; shows journey progress |
| VersePanel | `src/components/VersePanel.jsx` | `selectedLocationId`, `setSelectedLocationId`, `selectedVerseId`, `setSelectedVerseId` | `useEffect` scrolls to verse on `selectedVerseId` change; passes click handler to each VerseCard; uses `verseRefs` map with callback refs for scroll targeting |
| VerseCard | `src/components/VerseCard.jsx` | `verse`, `isActive`, `isSelected`, `onClick` | Wrapped in `forwardRef`; calls `onClick(verse)` on click; applies highlight styles based on `isActive` (location match) and `isSelected` (verse match) |
| MapView | `src/components/MapView.jsx` | `selectedLocationId`, `setSelectedLocationId`, `setSelectedVerseId` | Renders `<MapContainer>`, all markers, polyline; marker click sets both location and first verse |
| MapController | Inside `MapView.jsx` | `selectedLocationId` | `useMap()` + `useEffect` to call `map.flyTo()` on `selectedLocationId` change |
| GalleryPanel | `src/components/GalleryPanel.jsx` | `selectedLocationId` | Phase 4 gallery stub + location info (name, Devanagari, description, Google Maps link) |
| BottomPanel | `src/components/BottomPanel.jsx` | `selectedVerseId`, `setSelectedVerseId`, `setSelectedLocationId` | **VerseReader**: `useMemo` verse lookup; renders full verse text with type badge; Prev/Next navigation through all 229 verses; cross-location auto-pan |

---

## Implementation Plan

### Section 1: `App.jsx` — The State Root

`App.jsx` is the only file that calls `useState`. It holds two pieces of state: `selectedLocationId` and `selectedVerseId`. Every other component is either a receiver of one or both values (read-only) or a receiver of the values plus their setters (read + write). This is a standard React "lifting state up" pattern.

No context provider is needed at Phase 3 scale. With only four panels and two pieces of state, prop drilling to two levels deep is cleaner than introducing `createContext`. If Phase 4 or Phase 5 adds complexity (e.g., play journey state, gallery index), context can be introduced then.

**Why `null` for initial state instead of `""`:**

`useState(null)` makes the "no selection" case explicit and unambiguous. An empty string `""` is falsy but is a valid string, which can cause confusion. `null` signals "intentionally absent" in JavaScript conventions and is what `useState` returns when nothing has been chosen.

**Why App.jsx does NOT import `locations` or `verses`:**

In Phase 3, `locations` and `verses` are consumed directly by child components (MapView, VersePanel, BottomPanel, GalleryPanel, Header). App.jsx only holds and distributes state. Phase 4's App.jsx will import `locations` for the `useJourney` hook, but that is not needed yet.

---

### Section 2: `MapView.jsx` — Full Implementation

This is the most complex component in Phase 3 because it has two distinct responsibilities:
1. Rendering all 32 markers and the polyline declaratively
2. Imperatively calling `map.flyTo()` when `selectedLocationId` changes

The second responsibility requires the `useMap()` hook, which can **only be called inside a component that is a descendant of `<MapContainer>`**. This is a React-Leaflet constraint: `useMap()` uses a React context that `<MapContainer>` provides. Calling it at the `MapView` level (outside `<MapContainer>`) throws an error.

The solution is `<MapController>` — a small child component rendered inside `<MapContainer>` whose sole purpose is to own the `useMap()` call and the `useEffect` that fires `map.flyTo()`.

```jsx
// src/components/MapView.jsx

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locations } from '../data/locations';
import { verses } from '../data/verses';

// ES module import — Vite processes this and adds the `base` prefix automatically.
// The icon PNG lives in src/assets/icons/ (NOT public/assets/icons/) so Vite can
// hash the filename for cache-busting and resolve the correct URL at build time.
// This is critical for GitHub Pages deployment where `base: '/gaur-yatra/'` is set
// in vite.config.js — a hardcoded path like '/assets/icons/...' would 404.
import chaitanyaMarkerIcon from '../assets/icons/chaitanya-marker.png';

// Locations significantly far from the Vrindavan cluster.
// These get a lower zoom level (10) and longer fly duration (2.5s)
// to avoid a disorienting macro zoom-out over blank terrain.
const FAR_LOCATION_IDS = ['soro-kshetra', 'prayaga'];

// Default marker icon — all 32 markers at rest
const defaultIcon = L.icon({
  iconUrl: chaitanyaMarkerIcon,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
});

// Active marker icon — wraps the same PNG in a div with a CSS pulse animation.
// L.divIcon is used (not L.icon) so the animation class can live on the wrapper
// div without distorting the image. className: '' suppresses Leaflet's default
// white-border-box style that L.divIcon adds by default.
//
// Note: L.divIcon.html requires a URL string, not an ES module reference.
// We interpolate the imported `chaitanyaMarkerIcon` variable (which Vite
// resolves to the correct hashed URL at build time) into the template literal.
const activeIcon = L.divIcon({
  className: '',
  html: `<div class="marker-active-wrapper">
           <img src="${chaitanyaMarkerIcon}"
                width="40" height="50"
                alt="selected location marker" />
         </div>`,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
});

// MapController renders nothing to the DOM — it is a "headless" component
// that exists only to access the Leaflet map instance via useMap() and
// trigger map.flyTo() when selectedLocationId changes.
//
// This component MUST be rendered inside <MapContainer> because useMap()
// reads from a React context that MapContainer provides. Calling useMap()
// outside MapContainer throws: "No map instance found. Use inside MapContainer."
function MapController({ selectedLocationId }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocationId) return;

    const loc = locations.find((l) => l.id === selectedLocationId);
    if (!loc) return;

    const isFar = FAR_LOCATION_IDS.includes(selectedLocationId);
    const zoom = isFar ? 10 : 15;
    const duration = isFar ? 2.5 : 1.5;

    map.flyTo([loc.lat, loc.lng], zoom, { duration });
  }, [selectedLocationId, map]);

  // Returns null — this component has no visual output.
  // It is a side-effect controller only.
  return null;
}

function MapView({ selectedLocationId, setSelectedLocationId, setSelectedVerseId }) {
  // Sort locations by journeyOrder once for the polyline.
  // useMemo prevents re-sorting on every render — the locations array never changes.
  const sortedPositions = useMemo(
    () =>
      [...locations]
        .sort((a, b) => a.journeyOrder - b.journeyOrder)
        .map((loc) => [loc.lat, loc.lng]),
    []
  );

  return (
    <MapContainer
      center={[27.5, 77.65]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      {/* MapController must be inside MapContainer to use useMap() */}
      <MapController selectedLocationId={selectedLocationId} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Journey path connecting all 32 locations in chronological order */}
      <Polyline
        positions={sortedPositions}
        pathOptions={{ color: '#FF6B35', weight: 2.5, opacity: 0.7 }}
      />

      {/* One Marker per location. Icon is conditional on selection state —
          React re-renders the marker with the correct icon automatically.
          No imperative setIcon() calls needed. */}
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={loc.id === selectedLocationId ? activeIcon : defaultIcon}
          eventHandlers={{
            // Marker click sets both selectedLocationId AND selectedVerseId.
            // selectedVerseId is set to the first verse associated with this location.
            click: () => {
              setSelectedLocationId(loc.id);
              const firstVerse = verses.find((v) => v.locationId === loc.id);
              if (firstVerse) setSelectedVerseId(firstVerse.id);
            },
          }}
        >
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
```

#### Verified React-Leaflet v4 API (Context7)

The following patterns are confirmed against React-Leaflet v4 documentation:

| Pattern | API | Source |
|---------|-----|--------|
| `useMap()` hook | `import { useMap } from 'react-leaflet'` | react-leaflet.js.org/docs/v4/api-map |
| Marker event handling | `<Marker eventHandlers={{ click: fn }}>` | react-leaflet.js.org/docs/v4/api-components |
| `icon` prop | `<Marker icon={L.icon(...)}>` — mutable prop, updates on re-render | react-leaflet.js.org/docs/v4/api-components |
| `<Polyline positions={...}>` | Accepts `LatLngExpression[]` array | react-leaflet.js.org/docs/api-components |
| `<MapContainer>` props | `center`, `zoom`, `style` — immutable after initial render | react-leaflet.js.org/docs/v4/api-map |

**Important — `<MapContainer>` immutability:** `center` and `zoom` props on `<MapContainer>` are set once and do not respond to prop changes. All subsequent pan/zoom operations must go through the Leaflet map instance (via `useMap()` inside `MapController`). This is why `MapController` exists — `MapContainer` itself cannot be used to fly the map.

#### The Prayaga / Soro-kshetra Zoom Problem

Location #32 (`prayaga`, Allahabad) is at 25.44°N, 81.85°E — roughly 460km southeast of the Vrindavan cluster. Location #31 (`soro-kshetra`) is at 27.89°N, 79.73°E — about 180km east.

Flying to either at `zoom: 15` from Vrindavan would force a massive intermediate zoom-out (down to zoom 5 or 6) over largely featureless terrain. The result looks broken.

The `FAR_LOCATION_IDS` constant sets `zoom: 10` and `duration: 2.5` for these two locations. At zoom 10 the destination area is still geographically legible. Hardcoding two known exceptions is correct here — a dynamic distance calculation would be over-engineering for two outliers in a 32-item dataset.

#### CSS for the Active Marker Pulse

```css
/* src/styles/index.css */

.marker-active-wrapper {
  position: relative;
  display: inline-block;
  /* Pulse from the anchor point (base of the icon), not the center */
  transform-origin: bottom center;
  animation: markerPulse 1.2s ease-in-out infinite;
}

@keyframes markerPulse {
  0%   { transform: scale(1);    filter: drop-shadow(0 0 0px rgba(255, 107, 53, 0)); }
  50%  { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.8)); }
  100% { transform: scale(1);    filter: drop-shadow(0 0 0px rgba(255, 107, 53, 0)); }
}
```

The orange glow (`#FF6B35`) matches the journey polyline color, creating visual consistency between the travel path and the selected marker. When a new marker is selected, React replaces the old active marker's `icon` prop with `defaultIcon` and the new marker's with `activeIcon` — the pulse animation restarts on the new marker automatically.

---

### Section 3: `<MapController>` — The `useMap()` Pattern Explained

```jsx
// Rendered as a child of <MapContainer> inside MapView.jsx

function MapController({ selectedLocationId }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocationId) return;                          // guard: null = no-op

    const loc = locations.find((l) => l.id === selectedLocationId);
    if (!loc) return;                                        // guard: unknown ID = no-op

    const isFar = FAR_LOCATION_IDS.includes(selectedLocationId);
    const zoom = isFar ? 10 : 15;
    const duration = isFar ? 2.5 : 1.5;

    map.flyTo([loc.lat, loc.lng], zoom, { duration });
  }, [selectedLocationId, map]);

  return null;
}
```

**Why this pattern is necessary:**

`useMap()` reads from a React context provided by `<MapContainer>`. React contexts are only accessible to components in the subtree below the `<Provider>` — in this case, below `<MapContainer>`. If `MapView.jsx` itself tried to call `useMap()`, it would throw because `MapView` renders `<MapContainer>`, not inside it.

`MapController` is rendered as a child of `<MapContainer>`, so it is inside the context. It has access to the Leaflet `map` instance. The `useEffect` dependency array includes `[selectedLocationId, map]` — `map` is stable (never changes) but ESLint's exhaustive-deps rule requires it be listed.

`MapController` returns `null`. It has no visual output. It is purely a side-effect controller — a React pattern sometimes called a "headless component" or "controller component." This is idiomatic React-Leaflet and is the documented pattern for all programmatic map control.

---

### Section 4: `VersePanel.jsx` — Scroll-to-Verse on Selection

```jsx
// src/components/VersePanel.jsx

import { useEffect, useRef } from 'react';
import VerseCard from './VerseCard';
import { verses } from '../data/verses';

function VersePanel({ selectedLocationId, setSelectedLocationId, selectedVerseId, setSelectedVerseId }) {
  // A ref map: { [verseId]: HTMLElement } for every VerseCard.
  // Populated via callback refs passed to each VerseCard's forwarded ref.
  const verseRefs = useRef({});

  // Scroll to the selected verse when selectedVerseId changes.
  // This fires both when the user clicks a VerseCard (to ensure it's visible)
  // and when Prev/Next in the VerseReader changes the verse.
  useEffect(() => {
    if (!selectedVerseId) return;

    const targetEl = verseRefs.current[selectedVerseId];
    if (!targetEl) return;

    targetEl.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      // 'nearest' scrolls the minimum amount needed to bring the element
      // into view. 'start' would scroll it to the very top of the panel,
      // which can clip it behind a sticky header if one exists.
    });
  }, [selectedVerseId]);

  // Click handler passed to each VerseCard. Sets both verse and location state.
  const handleVerseClick = (verse) => {
    setSelectedVerseId(verse.id);
    if (verse.locationId) {
      setSelectedLocationId(verse.locationId);
    }
  };

  return (
    <div
      id="verse-panel"
      className="w-1/5 overflow-y-auto h-full border-r border-gray-200"
    >
      {verses.map((verse) => (
        <VerseCard
          key={verse.id}
          ref={(el) => { verseRefs.current[verse.id] = el; }}
          verse={verse}
          isActive={verse.locationId === selectedLocationId && selectedLocationId !== null}
          isSelected={verse.id === selectedVerseId}
          onClick={handleVerseClick}
        />
      ))}
    </div>
  );
}

export default VersePanel;
```

**Why a `verseRefs` map with `forwardRef` instead of `querySelector`:**

`querySelector('.verse-card[data-location-id="..."]')` works in vanilla JS but bypasses React's abstraction. In a React component, using a `useRef` map is the idiomatic way to hold references to DOM nodes — it avoids coupling to CSS class names and `data-*` attribute strings, and the refs are always up to date without any DOM scanning.

Each `VerseCard` is wrapped in `React.forwardRef` (see Section 5 below), so VersePanel can pass a standard `ref` callback: `ref={(el) => { verseRefs.current[verse.id] = el; }}`. This stores every card's DOM node in a flat map keyed by verse ID. When `selectedVerseId` changes, the `useEffect` looks up the DOM element directly from the ref map and calls `scrollIntoView`.

**Dual highlight model — `isActive` vs `isSelected`:**

`isActive` is `true` for all verses belonging to the currently selected location — these show the saffron highlight. `isSelected` is `true` for the single verse currently loaded in the VerseReader — this shows a stronger visual indicator (e.g., a bold border or distinct background). Both can be true simultaneously when the selected verse happens to belong to the selected location.

---

### Section 5: `VerseCard.jsx` — Click Handler, Active/Selected Styles, and Type Badge

```jsx
// src/components/VerseCard.jsx

import { forwardRef } from 'react';

// Verse type badge colors — maps verseType to Tailwind classes
const TYPE_BADGE_STYLES = {
  arrival:   'bg-blue-100 text-blue-700',
  event:     'bg-amber-100 text-amber-700',
  glory:     'bg-purple-100 text-purple-700',
  narrative: 'bg-gray-100 text-gray-600',
};

const VerseCard = forwardRef(function VerseCard({ verse, isActive, isSelected, onClick }, ref) {
  const handleClick = () => {
    // All verses are clickable — clicking always sets selectedVerseId.
    // The parent (VersePanel) handles setting selectedLocationId only if locationId is non-null.
    onClick(verse);
  };

  const badgeStyle = TYPE_BADGE_STYLES[verse.verseType] || TYPE_BADGE_STYLES.narrative;

  return (
    <div
      ref={ref}
      data-verse-id={verse.id}
      data-location-id={verse.locationId || ''}
      onClick={handleClick}
      className={[
        'verse-card px-4 py-3 border-l-4 transition-colors duration-300 cursor-pointer',
        isSelected
          ? 'border-orange-600 bg-orange-100'       // currently loaded in VerseReader
          : isActive
            ? 'border-orange-500 bg-orange-50'      // belongs to selected location
            : 'border-transparent bg-transparent',   // at rest
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs font-semibold text-gray-400">{verse.number}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badgeStyle}`}>
          {verse.verseType}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{verse.translation}</p>

      {verse.locationId && (
        <span className="inline-block mt-1 text-xs text-orange-600 font-medium">
          {verse.locationId}
        </span>
      )}
    </div>
  );
});

export default VerseCard;
```

**`forwardRef` pattern:**

`VerseCard` is wrapped in `React.forwardRef` so that `VersePanel` can pass a standard `ref` callback to each card. The forwarded `ref` is attached to the outermost `<div>`, allowing `VersePanel` to store a reference to every card's DOM node in its `verseRefs` map. This is the idiomatic React pattern for parent components that need DOM access to their children — no custom ref prop names like `firstCardRef` or `cardRef` are needed.

**`isActive` vs `isSelected` — dual highlight model:**

`VerseCard` does not manage any state of its own. Two boolean props control its appearance:
- `isActive`: `true` when the verse's `locationId` matches `selectedLocationId`. All verses for the selected location show a saffron highlight.
- `isSelected`: `true` when this specific verse is loaded in the VerseReader (`verse.id === selectedVerseId`). This shows a stronger highlight (darker border + background).
Both can be true simultaneously. `isSelected` takes visual priority over `isActive`.

**All verses are clickable:**

Unlike the previous design where only location-tagged verses were clickable, ALL verses are now clickable. Clicking any verse sets `selectedVerseId` (the VerseReader updates). If the verse also has a `locationId`, the map and gallery update too. The `cursor-pointer` class is applied to all cards.

**Verse type badge:**

Each card displays a small badge showing the verse's `verseType` (`arrival`, `event`, `glory`, `narrative`) with color-coded styling. This helps readers quickly identify the nature of each verse in the condensed list.

---

### Section 6: `BottomPanel.jsx` — VerseReader (Full Implementation)

The BottomPanel is no longer a location info panel. It is now the **VerseReader** — the primary reading area for the application. Location info has moved to the right panel (GalleryPanel).

```jsx
// src/components/BottomPanel.jsx

import { useMemo, useCallback } from 'react';
import { verses } from '../data/verses';

// Verse type badge colors — same palette as VerseCard for consistency
const TYPE_BADGE_STYLES = {
  arrival:   'bg-blue-100 text-blue-700',
  event:     'bg-amber-100 text-amber-700',
  glory:     'bg-purple-100 text-purple-700',
  narrative: 'bg-gray-100 text-gray-600',
};

function BottomPanel({ selectedVerseId, setSelectedVerseId, setSelectedLocationId }) {
  // Look up the current verse and its index in the full 229-verse array.
  const currentIndex = useMemo(
    () => verses.findIndex((v) => v.id === selectedVerseId),
    [selectedVerseId]
  );

  const currentVerse = currentIndex >= 0 ? verses[currentIndex] : null;

  // Navigate to prev/next verse. When the new verse has a different locationId
  // (and it's not null), also update the selected location — this triggers
  // map pan and gallery update automatically.
  const navigateTo = useCallback(
    (newIndex) => {
      if (newIndex < 0 || newIndex >= verses.length) return;

      const newVerse = verses[newIndex];
      setSelectedVerseId(newVerse.id);

      // Only update location if the new verse has a locationId and it differs
      // from the current verse's locationId. If locationId is null, the map
      // and gallery stay on the last selected location.
      if (newVerse.locationId) {
        setSelectedLocationId(newVerse.locationId);
      }
    },
    [setSelectedVerseId, setSelectedLocationId]
  );

  const handlePrev = () => navigateTo(currentIndex - 1);
  const handleNext = () => navigateTo(currentIndex + 1);

  // Initial state: nothing selected
  if (!currentVerse) {
    return (
      <div className="h-40 border-t border-gray-200 flex items-center justify-center">
        <p className="text-gray-400 text-sm">
          Click any verse or location to begin reading.
        </p>
      </div>
    );
  }

  const badgeStyle = TYPE_BADGE_STYLES[currentVerse.verseType] || TYPE_BADGE_STYLES.narrative;

  // Verse selected: render full text with prev/next navigation
  return (
    <div
      // key forces React to unmount and remount this div on verse change,
      // which restarts the CSS fade-in animation cleanly on every navigation.
      key={selectedVerseId}
      className="h-40 border-t border-gray-200 px-6 py-4 animate-fadeInUp overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-3">
        {/* Prev button */}
        <button
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {/* Verse number + type badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{currentVerse.number}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${badgeStyle}`}>
            {currentVerse.verseType}
          </span>
          <span className="text-xs text-gray-400">
            ({currentIndex + 1} / {verses.length})
          </span>
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentIndex >= verses.length - 1}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Full Sanskrit text */}
      {currentVerse.sanskrit && (
        <p className="text-sm text-gray-600 italic mb-2 leading-relaxed">
          {currentVerse.sanskrit}
        </p>
      )}

      {/* Full English translation */}
      <p className="text-sm text-gray-800 leading-relaxed">
        {currentVerse.translation}
      </p>
    </div>
  );
}

export default BottomPanel;
```

**The VerseReader replaces the old location-info BottomPanel:**

The old BottomPanel showed location name, Devanagari, description, and Google Maps link. That information has moved to the right panel (GalleryPanel). The BottomPanel is now entirely focused on verse reading — it is the primary text display area.

**Prev/Next navigates ALL 229 verses sequentially:**

The navigation is not scoped to a single location's verses. Prev/Next moves through the entire `verses` array in order. When the user navigates from a verse at one location to a verse at a different location, the `navigateTo` callback detects the `locationId` change and calls `setSelectedLocationId(newVerse.locationId)`. This triggers React to re-render MapView (which flies to the new location) and GalleryPanel (which shows the new location's info). If the new verse has `locationId: null`, the map and gallery stay put.

**The `key` trick for re-triggering animations:**

Using `key={selectedVerseId}` on the main `<div>` forces React to unmount and remount it on every verse change, restarting the `animate-fadeInUp` CSS animation. This gives a subtle fade-in on each navigation step.

**`useMemo` for the verse lookup:**

`verses.findIndex()` scans up to 229 items. `useMemo` with `[selectedVerseId]` ensures this only runs when the selected verse actually changes, not on every unrelated re-render.

**Tailwind `animate-fadeInUp`:**

This project uses **Tailwind v4**, which does not use `tailwind.config.js` for theme extension. Custom animations are defined using the `@theme` directive in CSS.

Add the following to `src/styles/index.css` (or wherever the main Tailwind CSS file lives):

```css
/* src/styles/index.css */

/* Custom animation for Tailwind v4: registers animate-fadeInUp as a utility class.
   The @theme block defines the animation token; the @keyframes block defines the
   animation itself. Tailwind v4 picks up @theme values and generates the
   corresponding utility classes automatically. */
@theme {
  --animate-fadeInUp: fadeInUp 0.3s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

With this in place, `className="animate-fadeInUp"` in `BottomPanel.jsx` works as a standard Tailwind utility class.

---

### Section 7: `GalleryPanel.jsx` — Gallery Stub + Location Info

The right panel now has two responsibilities:
1. **Gallery stub** (top) — placeholder for the Phase 4 photo carousel
2. **Location info** (bottom) — name, Devanagari, description, Google Maps link (moved here from the old BottomPanel)

```jsx
// src/components/GalleryPanel.jsx

import { useMemo } from 'react';
import { locations } from '../data/locations';

function GalleryPanel({ selectedLocationId }) {
  // useMemo: only recompute when selectedLocationId changes.
  const location = useMemo(
    () => locations.find((l) => l.id === selectedLocationId) ?? null,
    [selectedLocationId]
  );

  // Initial state: nothing selected
  if (!location) {
    return (
      <div className="w-1/4 h-full border-l border-gray-200 flex flex-col items-center justify-center p-4">
        <p className="text-gray-400 text-sm">No location selected</p>
      </div>
    );
  }

  return (
    <div className="w-1/4 h-full border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Gallery stub — Phase 4 replaces this with the photo carousel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 min-h-[200px]">
        <div className="text-center">
          <p className="text-gray-500 text-sm font-medium mb-1">
            Gallery coming in Phase 4
          </p>
          <p className="text-gray-400 text-xs">{selectedLocationId}</p>
        </div>
      </div>

      {/* Location info — moved here from the old BottomPanel */}
      <div
        key={selectedLocationId}
        className="p-4 border-t border-gray-200 animate-fadeInUp"
      >
        <h2 className="text-base font-bold text-gray-900">{location.name}</h2>
        <p className="text-sm text-gray-500 mb-2">{location.nameDevanagari}</p>

        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {location.description}
        </p>

        <a
          href={location.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-blue-600 underline hover:text-blue-800"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}

export default GalleryPanel;
```

**Location info moved from BottomPanel to GalleryPanel:**

In the redesigned layout, the BottomPanel is now the VerseReader (focused on verse text and navigation). Location info (name, Devanagari, description, Google Maps link) has moved to the right panel, displayed below the gallery. This keeps all location-related visuals (photos + info + maps link) in one column.

Phase 4 will replace the gallery stub section with the full photo carousel. The component signature — `({ selectedLocationId })` — will not change. Phase 4 only swaps the gallery internals; the location info section below stays as-is.

**`useMemo` for the location lookup:**

Same pattern as was previously in BottomPanel. `useMemo` with `[selectedLocationId]` ensures `locations.find()` only runs when the selection changes.

**`?? null` instead of `|| null`:**

`?? null` (nullish coalescing) only substitutes `null` when `find()` returns `undefined`. `|| null` would also substitute `null` for a falsy location object, which should never happen but is a subtle footgun.

---

### Section 8: `Header.jsx` — Progress Display

```jsx
// src/components/Header.jsx
// Note: named import — locations is a named export from locations.js

import { useMemo } from 'react';
import { locations } from '../data/locations';

function Header({ selectedLocationId }) {
  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId) ?? null,
    [selectedLocationId]
  );

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <h1 className="text-lg font-bold text-gray-900">
        Gaur Yatra — Chaitanya Mahaprabhu's Journey Through Vraj Bhumi
      </h1>

      <div className="flex items-center gap-4">
        {/* Play Journey buttons — disabled in Phase 3, wired in Phase 4 */}
        <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
          Play Journey
        </button>
        <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
          Pause
        </button>

        {/* Progress indicator: only shown when a location is selected */}
        {selectedLocation && (
          <span className="text-sm text-gray-500">
            Location {selectedLocation.journeyOrder} / {locations.length}
          </span>
        )}
      </div>
    </header>
  );
}

export default Header;
```

---

### Section 9: State Management — Why React's Model Eliminates the Event Bus

The vanilla JS Phase 3 required careful imperative orchestration:

```
// Vanilla JS: seven explicit steps, manually sequenced
function selectLocation(locationId) {
  const location = locations.find(loc => loc.id === locationId);
  if (!location) return;
  panToLocation(locationId);       // 1
  highlightMarker(locationId);     // 2
  loadGallery(locationId);         // 3
  updateBottomPanel(location);     // 4
  scrollVersePanel(locationId);    // 5
  highlightVerses(locationId);     // 6
  currentLocationId = locationId;  // 7
}
```

Every step was a separate DOM operation. The developer had to reason about the order (why does pan come before scroll? why does highlight come before update?), manage a module-level `currentLocationId` variable, and ensure that partial failures left consistent state.

React eliminates the need for all of this orchestration:

```jsx
// React: two calls. Everything else is automatic.
setSelectedVerseId("cc-madhya-18-5");
setSelectedLocationId("radha-kunda");
```

After these calls:
- React schedules a re-render of `App.jsx`
- `Header.jsx` re-renders with `selectedLocationId = "radha-kunda"` and shows "Location 2 / 32"
- `VersePanel.jsx` re-renders; the `useEffect` fires because `selectedVerseId` changed; `scrollIntoView` is called on the matching card; the card receives `isSelected={true}`; all `VerseCard` components with `verse.locationId === "radha-kunda"` receive `isActive={true}` and render with the saffron highlight styles
- `MapView.jsx` re-renders; `<Marker>` for `"radha-kunda"` now receives `icon={activeIcon}` and all other markers receive `icon={defaultIcon}`; inside `<MapContainer>`, the `MapController` `useEffect` fires and calls `map.flyTo([27.505, 77.464], 15, { duration: 1.5 })`
- `GalleryPanel.jsx` re-renders with the new `selectedLocationId`; shows location name, Devanagari, description, and Google Maps link below the gallery stub
- `BottomPanel.jsx` (VerseReader) re-renders; `useMemo` recomputes the verse lookup; the verse's full Sanskrit text, translation, type badge, and number display with the fade-in animation

**State transitions:**

```
App mounts
  selectedLocationId = null
  selectedVerseId = null
  All panels: default/welcome state

User clicks marker "radha-kunda":
  setSelectedLocationId("radha-kunda")
  setSelectedVerseId(firstVerseOfRadhaKunda.id)
  → Re-render: selectedLocationId = "radha-kunda", selectedVerseId = "cc-madhya-18-..."
  → MapController useEffect: map.flyTo([27.505, 77.464], 15, { duration: 1.5 })
  → Markers: "radha-kunda" gets activeIcon, all others get defaultIcon
  → VersePanel useEffect: scrollIntoView on the selected verse card
  → VerseCards: isActive={true} for radha-kunda cards, isSelected={true} for the specific verse
  → GalleryPanel: location lookup returns radha-kunda object, renders gallery stub + location info
  → BottomPanel (VerseReader): verse lookup returns the verse, renders full text + type badge

User clicks verse with locationId "govardhana-hill":
  setSelectedVerseId(clickedVerse.id)
  setSelectedLocationId("govardhana-hill")
  → Re-render: both states updated
  → Previous: "radha-kunda" marker reverts to defaultIcon (React re-renders with new icon)
  → Previous: "radha-kunda" VerseCards receive isActive={false} automatically
  → New: "govardhana-hill" activates across all panels, VerseReader shows the clicked verse

User clicks locationless verse:
  setSelectedVerseId(clickedVerse.id)
  → setSelectedLocationId is NOT called (locationId is null)
  → Re-render: selectedVerseId updates, selectedLocationId unchanged
  → VerseReader updates to show the new verse text
  → Map, gallery, and location info stay on the previously selected location
  → The clicked verse card gets isSelected={true} but isActive={false}

User clicks Next in VerseReader (crosses location boundary):
  navigateTo(currentIndex + 1) called
  → new verse has locationId "nandagrama"
  → setSelectedVerseId(newVerse.id)
  → setSelectedLocationId("nandagrama")
  → Map pans to nandagrama, gallery updates, VerseReader shows new verse

User clicks Next in VerseReader (same location):
  navigateTo(currentIndex + 1) called
  → new verse has same locationId "nandagrama"
  → setSelectedVerseId(newVerse.id)
  → setSelectedLocationId("nandagrama") — React bails out (same value)
  → Only VerseReader and VersePanel update

User clicks Next in VerseReader (next verse has locationId: null):
  navigateTo(currentIndex + 1) called
  → new verse has locationId null
  → setSelectedVerseId(newVerse.id)
  → setSelectedLocationId NOT called
  → VerseReader updates, map stays on last location
```

---

### Section 10: Edge Cases

| Scenario | Behavior | Why |
|----------|----------|-----|
| `selectedLocationId = null` AND `selectedVerseId = null` (initial state) | All panels show default/welcome state | Each component guards `if (!selectedLocationId)` or `if (!selectedVerseId)` at the top of its effect/render |
| `selectedLocationId = "not-a-real-place"` | `useMemo` lookups return `undefined`; GalleryPanel and Header guard and render nothing/welcome | Should never occur in practice — only `setSelectedLocationId(loc.id)` with real IDs is called |
| `selectedVerseId = "not-a-real-verse"` | `useMemo` lookup returns index -1; BottomPanel renders welcome state | Should never occur in practice |
| Rapid clicking between 5 markers | React batches state updates (React 18+ automatic batching); only the final state values trigger a re-render in each batch | Automatic — no special handling needed |
| Same location clicked twice | `Object.is` comparison in `useState` catches the identical `selectedLocationId`; React bails out for that state. `selectedVerseId` also gets the same first verse ID — bails out too | Automatic — `useState` identity check |
| Verse with `locationId: null` clicked | `setSelectedVerseId` is called (VerseReader updates); `setSelectedLocationId` is NOT called (map/gallery stay on last location) | VersePanel's `handleVerseClick` conditionally calls `setSelectedLocationId` only if `verse.locationId` is truthy |
| Prev/Next at array boundary | Prev disabled at index 0; Next disabled at index 228 | `navigateTo` guards `newIndex < 0` and `newIndex >= verses.length`; buttons have `disabled` prop |
| Prev/Next crosses location boundary | `setSelectedLocationId(newVerse.locationId)` is called, triggering map pan and gallery update | `navigateTo` checks `newVerse.locationId` and calls setter if non-null |
| Prev/Next to verse with `locationId: null` | `setSelectedVerseId` updates; `setSelectedLocationId` NOT called; map/gallery stay put | `navigateTo` only calls `setSelectedLocationId` when `newVerse.locationId` is truthy |
| `MapController` `useEffect` fires for `selectedLocationId = null` | First line: `if (!selectedLocationId) return;` — no-op | Explicit guard |
| `locations.find()` returns `undefined` for an unrecognized ID | `GalleryPanel` renders welcome state; `MapController` returns early; `Header` shows no progress | `?? null` and early-return guards throughout |
| Map not yet initialized when `MapController` effect fires | Cannot happen — `useMap()` is only accessible after `MapContainer` mounts, and `MapController` is rendered inside it | React-Leaflet guarantees the map instance exists when `useMap()` returns |

---

### Section 11: Phase 3 Completion Checklist

#### Functional Verification

- [ ] Click each of the 32 markers: map flies to location, marker shows pulse animation, left panel scrolls to first verse for that location, all verses for that location show saffron highlight, VerseReader loads the first verse, right panel shows location info.
- [ ] Click a location-tagged verse: map flies to the location, correct marker shows pulse animation, VerseReader shows the clicked verse's full text, right panel shows location info.
- [ ] Click a non-location verse: VerseReader updates to show the verse text, map and gallery stay on the last selected location, no error in browser console.
- [ ] The right panel (GalleryPanel) shows the correct Devanagari name for all 32 locations.
- [ ] The Google Maps link for each location opens `maps.google.com/?q=lat,lng` with correct coordinates in a new tab.
- [ ] After clicking a location, click a different location: previous marker reverts to default icon immediately, previous verse highlights clear, new set highlights appear, VerseReader and gallery update.
- [ ] Rapidly click 5 different markers in sequence: no stale marker highlights, no stale verse highlights, VerseReader and gallery always reflect the last clicked location.
- [ ] Click `prayaga` (Allahabad): map flies to approximately 25.44°N, 81.85°E at zoom level 10.
- [ ] Click `soro-kshetra`: map flies to approximately 27.89°N, 79.73°E at zoom level 10.
- [ ] All other 30 locations: map flies to correct coordinates at zoom level 15.
- [ ] Page load state: welcome message visible in VerseReader and GalleryPanel, no verse highlighted, all markers show default icon, header shows no progress indicator.
- [ ] GalleryPanel shows gallery placeholder + location info for every location selection.
- [ ] Prev/Next in VerseReader navigates through all 229 verses sequentially.
- [ ] Prev button is disabled on the first verse (index 0); Next button is disabled on the last verse (index 228).
- [ ] When Prev/Next crosses a location boundary: map auto-pans, gallery auto-updates, marker changes.
- [ ] When Prev/Next lands on a verse with `locationId: null`: map and gallery stay on the last location.
- [ ] Verse type badges display correctly in both VerseCard and VerseReader (`arrival`, `event`, `glory`, `narrative`).

#### Edge Case Verification

- [ ] No JS errors or React warnings in the browser console during any normal interaction.
- [ ] Clicking a locationless verse: `selectedVerseId` updates (VerseReader shows verse), `selectedLocationId` unchanged, no console error.
- [ ] Clicking the same marker twice: second click is a no-op (React identity bail-out); no doubled animations.
- [ ] GalleryPanel renders without errors when `selectedLocationId` is null.
- [ ] GalleryPanel renders without errors when `selectedLocationId` is any of the 32 valid IDs.
- [ ] BottomPanel (VerseReader) renders without errors when `selectedVerseId` is null.
- [ ] BottomPanel (VerseReader) renders without errors when `selectedVerseId` is any of the 229 valid IDs.

#### Visual Verification

- [ ] Active verse cards (location match) show saffron-orange left border (`border-orange-500`) and subtle orange background (`bg-orange-50`).
- [ ] Selected verse card (currently in VerseReader) shows stronger highlight (`border-orange-600 bg-orange-100`).
- [ ] Inactive verse cards revert to plain styling immediately upon new selection.
- [ ] All verse cards show `cursor: pointer` on hover (all verses are clickable in the new design).
- [ ] Verse type badges show correct color coding: blue (arrival), amber (event), purple (glory), gray (narrative).
- [ ] Active marker pulses visibly (scale + glow animation runs continuously while selected).
- [ ] When a new marker is selected, the previous marker immediately reverts to the static default icon.
- [ ] VerseReader content fades in smoothly when a new verse is selected or navigated to.
- [ ] VerseReader re-fades in (fresh animation via `key` prop) when switching rapidly between verses.
- [ ] GalleryPanel location info fades in on location change.
- [ ] Header progress indicator updates correctly on every location selection.

---

## Dependencies from Previous Phases

### From Phase 1

| Dependency | Where It Lives | What Phase 3 Needs From It |
|------------|---------------|----------------------------|
| `src/data/locations.js` | Named ES module export (`export const locations`) | Must have all 32 location objects with `id`, `name`, `nameDevanagari`, `journeyOrder`, `lat`, `lng`, `description`, `googleMapsUrl` |
| `MapView.jsx` | `src/components/MapView.jsx` | `<MapContainer>` exists; all 32 markers created; polyline rendered |
| `App.jsx` | `src/App.jsx` | Component tree exists; ready to receive `selectedLocationId` and `selectedVerseId` state |
| Marker icon assets | `src/assets/icons/chaitanya-marker.png` | ES module imported in `MapView.jsx`; used by both `defaultIcon` and `activeIcon`. Vite resolves the import to a hashed URL with the correct `base` prefix at build time. |
| Tailwind CSS v4 theme | `src/styles/index.css` | `animate-fadeInUp` custom animation defined via `@theme` directive and `@keyframes` in the main CSS file (Tailwind v4 pattern — no `tailwind.config.js` needed) |

### From Phase 2

| Dependency | Where It Lives | What Phase 3 Needs From It |
|------------|---------------|----------------------------|
| `VersePanel.jsx` | `src/components/VersePanel.jsx` | Renders all 229 VerseCard components; ready to receive `setSelectedLocationId` and `setSelectedVerseId` |
| `VerseCard.jsx` | `src/components/VerseCard.jsx` | Wrapped in `forwardRef`; accepts `locationId` from verse data; ready to call `onClick` prop |
| `src/data/verses.js` | Named ES module export (`export const verses`) | All 229 verse objects with `id`, `number`, `sanskrit`, `translation`, `locationId`, `verseType` (the `purportExcerpt` field has been removed) |

---

## What Phase 3 Outputs for Phase 4

Phase 4 (Gallery + Play Journey) can be dropped in cleanly because Phase 3 establishes:

- **Fully wired dual-state management.** `selectedLocationId` and `selectedVerseId` in `App.jsx` drive every panel. Phase 4 adds `isPlaying` and `currentStep` state alongside them — they coexist without conflict.
- **`GalleryPanel.jsx` with location info.** Phase 4 replaces the gallery stub section with the full photo carousel. The prop interface (`{ selectedLocationId }`) is already correct. The location info section below the gallery stays as-is.
- **`BottomPanel.jsx` (VerseReader) with Prev/Next.** Phase 4 can optionally wire the Play Journey feature to auto-advance `selectedVerseId` through the array, reusing the same `navigateTo` logic that Phase 3's Prev/Next buttons use.
- **`Header.jsx` Play/Pause buttons.** They are rendered but disabled in Phase 3. Phase 4 replaces Header with a fully wired version using `useJourney` hook's `start()` / `pause()` / `stop()` controls.
- **`setSelectedLocationId` and `setSelectedVerseId` are already threaded everywhere.** Phase 4's `useJourney` hook simply calls these setters — the same mechanism that Phase 3 wires through user clicks and Prev/Next navigation.

---

## Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|------------|
| `useMap()` called outside `<MapContainer>` | High | Medium | `MapController` is always rendered as a direct child inside `<MapContainer>`. Lint rule or runtime error catches misplacement immediately. |
| `<MapContainer>` `center`/`zoom` props treated as mutable | Medium | Medium | Document clearly: these are immutable after first render. All navigation goes through `MapController` + `useMap()`. |
| `activeIcon` and `defaultIcon` defined inside component body causing re-creation on every render | Medium | High | Both icons are defined at module level (outside the component function), so they are created exactly once. This is essential — creating a new `L.icon` object on every render would cause Leaflet to re-initialize the marker's DOM on every re-render. |
| `selectedLocationId` not flowing to `GalleryPanel` correctly | Low | Low | `GalleryPanel` renders location info directly from the lookup — easy to verify. |
| `selectedVerseId` not flowing to `BottomPanel` correctly | Low | Low | `BottomPanel` (VerseReader) renders verse text directly from the lookup — easy to verify. |
| Prev/Next navigation calling `setSelectedLocationId` when it should not | Medium | Medium | `navigateTo` only calls `setSelectedLocationId` when `newVerse.locationId` is truthy. If `locationId` is null, only `setSelectedVerseId` is called. |
| Default imports used for named exports (BLOCKER) | High | High | All data imports must use destructured syntax: `import { locations } from` and `import { verses } from`. Using `import locations from` will import `undefined` and silently break all lookups. Fixed in all code blocks in this document. |
| Tailwind `animate-fadeInUp` missing from `@theme` | Low | Medium | The `@theme` block and `@keyframes` must be added to `src/styles/index.css` (see Section 6). Without it, the `animate-fadeInUp` class silently does nothing — no error, just no animation. The `key` prop still triggers remount correctly regardless. |
| React `useState` bail-out on same-value call felt as "broken" by user | Low | Low | Document it as correct behavior. Re-clicking a selected location or verse does nothing — this is by design, not a bug. |

---

## Open Questions

- [ ] **`React.memo` on `VerseCard`** — With 229 cards, each re-render of `VersePanel` re-renders all VerseCards. Phase 3 does not require `React.memo`, but if profiling in Phase 5 shows render lag, wrapping `VerseCard` in `React.memo` is the fix. Should this be pre-emptively added in Phase 3, or deferred to Phase 5 if profiling shows it is needed?
- [ ] **Leaflet CSS import location** — `import 'leaflet/dist/leaflet.css'` must be imported somewhere before `MapContainer` renders. Convention is to import it in `MapView.jsx` or in `src/main.jsx`. Confirm with Phase 1 setup which file owns this import to avoid duplicate or missing CSS.
- [x] **~~`public/` vs `src/assets/` for marker icons~~** — **Resolved: `src/assets/icons/` with ES module imports.** Vite resolves `import chaitanyaMarkerIcon from '../assets/icons/chaitanya-marker.png'` to a hashed URL string at build time (e.g., `/gaur-yatra/assets/chaitanya-marker-abc123.png`), which works directly with `L.icon({ iconUrl: chaitanyaMarkerIcon })`. This is strictly better than `public/` because: (1) Vite automatically prepends the `base` path — no manual `/gaur-yatra/` prefix needed for GitHub Pages; (2) filenames are content-hashed for long-term caching; (3) missing imports cause build-time errors instead of silent 404s at runtime.
- [x] **~~Default vs named imports for data modules~~** — **Resolved: named imports required.** `locations.js` and `verses.js` use `export const`, not `export default`. All imports must use `import { locations } from` and `import { verses } from`. This was a known blocker from the sync review and is now fixed in all code blocks in this document.

---

## References

- Source text: https://vedabase.io/en/library/cc/madhya/18/ (Caitanya Caritamrita Madhya Lila, Chapter 18)
- React-Leaflet v4 API (MapContainer, Marker, useMap, Polyline): https://react-leaflet.js.org/docs/v4/api-map and https://react-leaflet.js.org/docs/v4/api-components
- React-Leaflet `useMap` hook pattern (verified via Context7): https://react-leaflet.js.org/docs/v4/api-map
- React-Leaflet Marker `eventHandlers` prop (verified via Context7): https://react-leaflet.js.org/docs/v4/api-components
- React `useState` bail-out on same value: https://react.dev/reference/react/useState#setstate
- React `useMemo`: https://react.dev/reference/react/useMemo
- Vite project setup: https://vitejs.dev/guide/
- OpenStreetMap tile URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Target deployment: `https://dev-arctik.github.io/gaur-yatra`
- Phase 1 doc: `docs/planning/phase-1-foundation.md`
- Phase 2 doc: `docs/planning/phase-2-verse-data.md`
- Phase 4 doc: `docs/planning/phase-4-gallery-journey.md`
