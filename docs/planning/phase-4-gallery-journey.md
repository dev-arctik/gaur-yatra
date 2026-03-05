# Feature: Phase 4 — Photo Gallery + Play Journey Animation

**Version:** v2.0
**Status:** Approved
**Type:** Implementation Guide
**Created:** 2026-03-05
**Last Modified:** 2026-03-05
**Parent Plan:** `docs/planning/gaur-yatra-plan.md`
**Tech Stack:** React 19 + Vite

> **Migration note (v1 → v2):** This document replaces the original vanilla-JS implementation spec (v1.0). The project has migrated to React 19 + Vite. The gallery and Play Journey *requirements* are identical to v1. Every implementation detail — file names, state management, event handling, component structure, and build references — has been rewritten for the React component model.

---

## Problem Statement

After Phase 3 delivers a fully synchronized map-verse-panel interaction (driven by React state flowing through `App.jsx`), the two remaining interactive features needed before the site is feature-complete are:

1. **Photo Gallery + Location Info (`GalleryPanel.jsx`)** — the right panel (25% width) renders a static placeholder. It needs a React component with TWO sections: **Section A** — a photo carousel that derives the current location's image list from `locations` data, resets its carousel index when the selected location changes, handles the empty-photos case gracefully, and supports keyboard arrow navigation; **Section B** — location info (name, Devanagari, description, Google Maps link) that was previously in the BottomPanel and has been moved here.
2. **Play Journey Animation (`useJourney` hook)** — devotees want to meditate on Mahaprabhu's journey without manually clicking through all 32 locations. A custom React hook encapsulates `setInterval`-driven auto-advance logic, exposes clean `start / pause / stop` controls, and integrates with the existing `selectedLocationId` state in `App.jsx`.

**Layout redesign context:** The app now uses a dual-state model with `selectedLocationId` AND `selectedVerseId`. The left panel (20% width) shows a condensed verse list grouped by location with `verseType` badges. The bottom panel is now a full verse reader (Sanskrit + translation + prev/next through ALL 229 verses) — when navigating to a verse with a different `locationId`, the map and gallery auto-update. Location info display has moved from the bottom panel to the right panel's GalleryPanel component.

Phase 4 completes the full interactivity contract defined in FR-006 and FR-008 of the master spec. It is the last feature-development phase before Phase 5's polish-and-deploy pass.

---

## Goals & Success Criteria

- `GalleryPanel` renders correctly for **all 32 locations** — shows a styled welcome placeholder when no location is selected, shows a "Photos coming soon" card when a location has `images: []`, and shows the photo carousel when images exist.
- Prev / Next navigation wraps around cleanly with a CSS fade transition (~300 ms). The photo counter ("2 / 5") stays accurate after every navigation.
- Keyboard arrow keys (Left / Right) navigate the gallery when the panel is focused.
- Changing `selectedLocationId` resets the carousel to index 0 via `useEffect`.
- The `useJourney` hook auto-advances through all 32 locations in `journeyOrder` sequence at a configurable interval (default: 3 seconds per location).
- Pause stops playback at the current step; Play / Resume continues from the same step.
- Stop resets to step 0 and re-enables the Play button.
- A user manually clicking a marker or verse during playback auto-pauses the journey.
- No memory leaks: all intervals are cleared on component unmount and hook teardown.
- Zero console errors throughout all 32 locations.
- `GalleryPanel` shows location info (name, Devanagari, description, Google Maps link) below the photo carousel for every selected location. This info was previously in the BottomPanel.
- `BottomPanel` is a full verse reader showing Sanskrit + translation with Prev/Next navigation through ALL 229 verses. Cross-location navigation auto-updates the map and gallery.
- `App.jsx` manages `selectedVerseId` alongside `selectedLocationId`. A `useEffect` syncs `selectedVerseId` to the first verse of the new location whenever `selectedLocationId` changes.
- **Definition of done:** Gallery shows placeholder for empty locations + location info section, adding test photos makes prev/next work, Play Journey advances all 32 in order with verse sync, Pause / Resume / Stop all behave correctly, clicking during playback pauses correctly and syncs verse, journey completion resets the button, verse reader navigates all 229 verses with cross-location map updates.

---

## Requirements

### Functional Requirements

- **FR-P4-001:** `GalleryPanel` accepts a `selectedLocationId` prop and derives the matching location object from the `locations` array via `useMemo`.
- **FR-P4-002:** When `selectedLocationId` is `null` (nothing selected yet), `GalleryPanel` renders a welcome placeholder card.
- **FR-P4-003:** When `selectedLocationId` is set but the location's `images` array is empty, `GalleryPanel` renders a "Photos coming soon — Hare Krishna" placeholder card showing the location name.
- **FR-P4-004:** When `images.length > 0`, `GalleryPanel` renders the current image with Prev / Next arrow buttons and a counter ("1 / 3").
- **FR-P4-005:** Prev / Next wrap using modulo: `(currentIndex + 1) % images.length`.
- **FR-P4-006:** The `<img>` element uses `key={imagePath}` so React unmounts and remounts it on each image change, triggering a CSS fade-in transition.
- **FR-P4-007:** A `useEffect` watching `selectedLocationId` resets `currentIndex` to 0 whenever the selected location changes.
- **FR-P4-008:** `useEffect` in `GalleryPanel` attaches a `keydown` event listener for `ArrowLeft` / `ArrowRight` and removes it on cleanup.
- **FR-P4-009:** The `useJourney` hook sorts `locations` by `journeyOrder` once via `useMemo` and never re-sorts on re-renders.
- **FR-P4-010:** `useJourney` exposes `{ isPlaying, currentStep, totalSteps, start, pause, stop }`.
- **FR-P4-011:** `start()` sets up a `setInterval`; each tick advances `currentStep` and calls `setSelectedLocationId(sortedLocations[step].id)`.
- **FR-P4-012:** When `currentStep` reaches `totalSteps - 1`, the journey auto-stops: interval is cleared, `isPlaying` is set to `false`, `currentStep` is reset to 0.
- **FR-P4-013:** `pause()` clears the interval and sets `isPlaying = false` but preserves `currentStep`.
- **FR-P4-014:** `stop()` clears the interval, sets `isPlaying = false`, and resets `currentStep` to 0.
- **FR-P4-015:** `useJourney`'s `useEffect` cleanup runs `clearInterval(intervalRef.current)` on unmount to prevent memory leaks.
- **FR-P4-016:** `Header` shows a "Play" button when not playing, a "Pause" button when playing, and "Resume" text on the Play button if paused mid-journey (`currentStep > 0 && !isPlaying`).
- **FR-P4-017:** `Header` displays a progress indicator: "Location N / 32" and the current location name.
- **FR-P4-018:** When the user manually clicks a marker or verse (setting `selectedLocationId` from outside the journey interval), the journey auto-pauses.
- **FR-P4-019:** All 32 image folders exist under `public/assets/images/locations/<location-id>/` with a `.gitkeep` file in each. Users add real photos there; the `images` array in `src/data/locations.js` is updated to reference them.
- **FR-P4-020:** `GalleryPanel` renders a **Location Info section** below the photo carousel, showing: location name (English), location name (Devanagari), a 2-3 sentence spiritual significance description, and an "Open in Google Maps" button/link. This info was previously in the BottomPanel and has been moved to the right panel.
- **FR-P4-021:** `App.jsx` manages a `selectedVerseId` state alongside `selectedLocationId`. A `useEffect` watching `selectedLocationId` syncs `selectedVerseId` to the first verse of the new location whenever the location changes.
- **FR-P4-022:** `BottomPanel` is a full verse reader displaying the currently selected verse's Sanskrit text and translation, with Prev/Next buttons that navigate through ALL 229 verses in order (not just verses of the current location).
- **FR-P4-023:** When the verse reader's Prev/Next navigation reaches a verse with a different `locationId` than the current `selectedLocationId`, the `BottomPanel` calls `setSelectedLocationId(newVerse.locationId)` to auto-update the map and gallery.
- **FR-P4-024:** `handleLocationSelect` in App.jsx sets BOTH `selectedLocationId` AND `selectedVerseId` (to the first verse of the clicked location) when a user manually selects a location.
- **FR-P4-025:** Each verse in `src/data/verses.js` has a `verseType` field with one of four values: `"arrival"`, `"event"`, `"glory"`, or `"narrative"`. The `purportExcerpt` field has been removed from the verse model.
- **FR-P4-026:** `VersePanel` displays verses grouped by location with `verseType` badges (condensed list, 20% left panel width).

### Non-Functional Requirements

- **Performance:** `useMemo` prevents recomputing the sorted locations array or the current location's image list on every render.
- **Memory safety:** Every `setInterval` created by `useJourney` is stored in `intervalRef.current` and cleared before creating a new one. The `useEffect` cleanup in the hook guarantees clearance on unmount.
- **Accessibility:** Prev / Next buttons have `aria-label="Previous photo"` / `aria-label="Next photo"`. The Play / Pause / Stop buttons in `Header` have descriptive `aria-label` values. The gallery container has `tabIndex={0}` so keyboard focus works.
- **No double-start guard bypass:** `start()` checks `isPlaying` at the top and returns early if already playing, preventing interval stacking.
- **React 19 compatibility:** All hooks use the standard React 19 API. No deprecated lifecycle methods. No class components.

### Assumptions

- [ASSUMPTION] `src/data/locations.js` exports a named `locations` array of 32 objects, each with `id`, `name`, `journeyOrder`, `lat`, `lng`, `description`, `nameDevanagari`, `googleMapsUrl`, and `images: string[]`. This shape was established in Phase 1.
- [ASSUMPTION] `src/data/verses.js` exports a named `verses` array of 229 objects, each with `id`, `locationId`, `verseNumber`, `sanskrit`, `translation`, and `verseType` (`"arrival"` | `"event"` | `"glory"` | `"narrative"`). The `purportExcerpt` field has been removed from the verse model.
- [ASSUMPTION] `App.jsx` manages TWO state variables: `selectedLocationId` as `useState<string | null>(null)` and `selectedVerseId` as `useState<string | null>(null)`. Both values and their setters are passed down as props. This dual-state model was introduced in Phase 4.
- [ASSUMPTION] Images are referenced by **relative paths without a leading slash** — e.g., `"assets/images/locations/radha-kunda/photo-1.jpg"`. At render time, `GalleryPanel.jsx` prepends `import.meta.env.BASE_URL` to produce the final `src` URL. This is required because the site is deployed to GitHub Pages under a sub-path (`/gaur-yatra/`), not at the domain root. `import.meta.env.BASE_URL` returns `/gaur-yatra/` in production and `/` in dev, so the same data works in both environments. Storing paths with a leading `/` would break on GitHub Pages — e.g., `/assets/images/...` resolves to `https://dev-arctik.github.io/assets/...` instead of the correct `https://dev-arctik.github.io/gaur-yatra/assets/...`.
- [ASSUMPTION] The journey playback interval is 3000 ms (3 seconds) as the default. This is a named constant `JOURNEY_INTERVAL_MS` in `useJourney.js` for easy adjustment.
- [ASSUMPTION] The `useJourney` hook is called in `App.jsx`, not inside `Header.jsx`, so the journey state lives at the top level and can respond to `selectedLocationId` changes from any source (marker click, verse click, or journey interval).
- [ASSUMPTION] When `useJourney` advances `selectedLocationId`, a `useEffect` in App.jsx automatically syncs `selectedVerseId` to the first verse of the new location. The hook does not need to know about verses.

---

## User Stories

| Priority | Story | Acceptance Criteria |
|----------|-------|---------------------|
| Must | As a devotee, I want to see a photo of the sacred place I selected so I can visualize the pilgrimage. | Selecting any location with photos shows the first photo immediately. |
| Must | As a visitor, I want to browse multiple photos of a location using Prev/Next buttons. | Clicking Next/Prev updates the photo and the counter; wraps at boundaries. |
| Must | As a visitor, I want to navigate the gallery with keyboard arrows so I don't need the mouse. | Left/Right arrow keys navigate the gallery when the panel is focused. |
| Must | As a devotee, I want to press Play and have the journey auto-advance through all 32 places so I can meditate. | Play Journey advances through all 32 in journeyOrder at 3-second intervals. |
| Must | As a user, I want to Pause mid-journey and Resume from the same place. | Pause stops at current step; Play after pause resumes from that step. |
| Must | As a user, I want clicking any marker or verse during playback to pause the journey. | Manual selection during playback pauses the journey immediately. |
| Should | As a user, I want to see which location the journey is currently on ("Location 5 / 32"). | Header shows step counter and current location name during playback. |
| Must | As a developer, I want locations with no photos to show a placeholder card, not an error. | Empty `images: []` renders the placeholder card without any JS error. |
| Must | As a devotee, I want to see the location's name, Devanagari name, and spiritual significance below the photos. | GalleryPanel Section B shows location name (English + Devanagari), description, and Google Maps link for every selected location. |
| Must | As a devotee, I want to read the full verse (Sanskrit + translation) in a dedicated reader at the bottom. | BottomPanel displays the selected verse's Sanskrit text and English translation. |
| Must | As a devotee, I want to navigate through all 229 verses using Prev/Next in the verse reader. | Prev/Next in BottomPanel advances through all verses; when crossing location boundaries, the map and gallery auto-update. |
| Should | As a visitor, I want to open the sacred location in Google Maps so I can see its real-world position. | "Open in Google Maps" button in GalleryPanel opens the correct URL in a new tab. |
| Should | As a devotee, I want to see what type of verse I'm looking at (arrival, event, glory, narrative). | VersePanel shows verseType badges next to each verse in the grouped list. |

---

## Technical Design

### Architecture Overview

```
App.jsx
│
├── state: selectedLocationId (useState)
├── state: selectedVerseId (useState)
├── state: journey = useJourney(locations, setSelectedLocationId)
├── handleLocationSelect = useCallback: if playing → pause, then setSelectedLocationId + set first verse
├── useEffect [selectedLocationId] → sync selectedVerseId to first verse of new location
│
├── <Header journey={journey} />
│     └── Play / Pause / Stop buttons  →  journey.start() / .pause() / .stop()
│         Progress: "Location N / 32 — Radha-kunda"
│
├── <VersePanel selectedLocationId={selectedLocationId}
│              setSelectedLocationId={handleLocationSelect}
│              selectedVerseId={selectedVerseId}
│              setSelectedVerseId={setSelectedVerseId} />
│     └── Condensed verse list GROUPED BY LOCATION with verseType badges (20% width)
│
├── <MapView selectedLocationId={selectedLocationId}
│            setSelectedLocationId={handleLocationSelect} />
│
├── <GalleryPanel selectedLocationId={selectedLocationId} />
│     │
│     ├── Section A — Photo Carousel (top)
│     │   ├── useMemo → derive location object from locations[]
│     │   ├── useMemo → derive images[] from location object
│     │   ├── useState(currentIndex)
│     │   ├── useEffect [selectedLocationId] → reset currentIndex to 0
│     │   └── useEffect [] → keydown listener (ArrowLeft / ArrowRight)
│     │
│     └── Section B — Location Info (below carousel)
│         ├── Location name (English + Devanagari)
│         ├── Spiritual significance description (2-3 sentences)
│         └── "Open in Google Maps" button/link
│         (moved here FROM the old BottomPanel)
│
└── <BottomPanel selectedVerseId={selectedVerseId}
│               setSelectedVerseId={setSelectedVerseId}
│               setSelectedLocationId={setSelectedLocationId} />
│     └── Full verse reader: Sanskrit + translation + prev/next through ALL 229 verses
│         When navigating to a verse with a different locationId, map + gallery auto-update
```

### State Flow: Manual Click vs Journey Interval

```
Case A — User clicks a marker or verse in VersePanel:
  MapView/VersePanel calls setSelectedLocationId(id)
    → This is actually handleLocationSelect (the wrapper passed as prop)
    → handleLocationSelect checks journey.isPlaying:
        if true → journey.pause() (stops the interval)
    → calls the real setSelectedLocationId(id)  [React state update]
    → finds the first verse of that location and calls setSelectedVerseId(firstVerse.id)
    → React re-renders: all panels update to the new location + verse

Case B — Journey interval fires:
  interval callback in useJourney:
    → calls the raw setSelectedLocationId(sortedLocations[step].id)
    → The journey hook holds a direct reference to the raw setter,
      NOT the wrapper — so no pause logic is triggered
    → useEffect in App.jsx watches selectedLocationId:
        sets selectedVerseId to the first verse of the new location
    → React re-renders: all panels update to the next journey location + verse

Case C — User navigates prev/next in BottomPanel verse reader:
  BottomPanel calls setSelectedVerseId(newVerse.id)
    → If newVerse.locationId !== current selectedLocationId:
        calls setSelectedLocationId(newVerse.locationId) [raw setter]
        → map flies to new location, gallery updates
    → React re-renders: verse reader shows new verse, map/gallery update if location changed
```

> **Why the wrapper approach is cleaner than `isUserClickRef`:** The original design used a `useRef` flag to distinguish user clicks from journey ticks inside a `useEffect`. The wrapper approach is simpler: `handleLocationSelect` is the only function that ever pauses the journey, and it does so synchronously before calling `setSelectedLocationId` and syncing `selectedVerseId` to the first verse of the clicked location. No ref flags, no effects, no timing concerns. MapView and VersePanel do not need to change at all — they still call `setSelectedLocationId(loc.id)` as Phase 3 defined.

### Component Breakdown

| Component / Module | File | Purpose |
|--------------------|------|---------|
| App shell | `src/App.jsx` | Owns `selectedLocationId` + `selectedVerseId` state; calls `useJourney`; passes props to all children; syncs verse selection when location changes |
| Gallery + location info | `src/components/GalleryPanel.jsx` | **Section A:** Photo carousel, placeholder states, keyboard nav. **Section B:** Location info (name, Devanagari, description, Google Maps link) — moved here from old BottomPanel |
| Verse reader | `src/components/BottomPanel.jsx` | Full verse reader: Sanskrit + translation + prev/next through ALL 229 verses. When navigating to a verse with a different locationId, updates `selectedLocationId` to auto-update map + gallery |
| Journey hook | `src/hooks/useJourney.js` | `setInterval` auto-advance logic, play/pause/stop state |
| Header controls | `src/components/Header.jsx` | Play/Pause/Stop buttons; progress indicator |
| Location data | `src/data/locations.js` | Array of 32 location objects including `images[]` |
| Verse data | `src/data/verses.js` | Array of 229 verse objects with `verseType` field (`"arrival"` / `"event"` / `"glory"` / `"narrative"`) |
| CSS transitions | `src/styles/index.css` | Fade-in animation on `<img>` swap |
| Image assets | `public/assets/images/locations/<id>/` | Static photos served at root by Vite |

### Data Shape (Relevant Fields for Phase 4)

These fields are consumed by `GalleryPanel`, `BottomPanel`, and `useJourney`. They are defined in `src/data/locations.js` and `src/data/verses.js`.

**Location data** (consumed by `GalleryPanel` for carousel + location info, and by `useJourney` for ordering):

```js
// src/data/locations.js
export const locations = [
  {
    id: "radha-kunda",
    name: "Radha-kunda",
    nameDevanagari: "राधा कुण्ड",
    journeyOrder: 2,
    lat: 27.5050,
    lng: 77.4640,
    description: "The most sacred lake in Vraja, where Radharani performed her worship...",
    googleMapsUrl: "https://maps.google.com/?q=27.5050,77.4640",
    // Phase 4 reads this array. Empty = placeholder. Populated = carousel.
    // Paths are relative (NO leading slash). GalleryPanel prepends import.meta.env.BASE_URL
    // at render time so they resolve correctly on both localhost and GitHub Pages.
    images: [
      "assets/images/locations/radha-kunda/photo-1.jpg",
      "assets/images/locations/radha-kunda/photo-2.jpg"
    ]
  }
  // ... 32 total
];
```

**Verse data** (consumed by `VersePanel` for grouped list and `BottomPanel` for the verse reader):

```js
// src/data/verses.js
export const verses = [
  {
    id: "verse-001",
    locationId: "radha-kunda",
    verseNumber: "1.17.1",
    sanskrit: "...",
    translation: "...",
    // Categorizes the verse for display badges in the VersePanel grouped list.
    // Valid values: "arrival" | "event" | "glory" | "narrative"
    verseType: "arrival"
  }
  // ... 229 total
];
```

> **Data model note:** The `purportExcerpt` field has been REMOVED from the verse model. Verses now carry a `verseType` field instead, which drives the type badges in the VersePanel's grouped-by-location list. The four types are: `"arrival"` (Mahaprabhu arrives at a place), `"event"` (something happens there), `"glory"` (glorification of the place), and `"narrative"` (connecting narrative between locations).

> **Vite public/ convention + GitHub Pages base path (verified):** Files in `public/` are copied as-is to `dist/` during `vite build`. However, the site is deployed to GitHub Pages at `https://dev-arctik.github.io/gaur-yatra/` — NOT at the domain root. This means root-absolute paths like `/assets/images/...` would resolve to `https://dev-arctik.github.io/assets/...` (WRONG). To handle this, store image paths in `locations.js` **without a leading slash** (e.g., `"assets/images/locations/radha-kunda/photo-1.jpg"`) and prepend `import.meta.env.BASE_URL` at render time. Vite sets `BASE_URL` to the `base` value from `vite.config.js` — `/gaur-yatra/` in production, `/` in dev. This pattern applies to ALL static asset references from `public/` that appear in JS/JSX code. Do NOT import these as ES modules unless you want Vite to hash the filename.

---

## Implementation Plan

### Phase 4 Execution Order

```
Step 1: Image folder scaffold
  → Create all 32 folders under public/assets/images/locations/<id>/
  → Place .gitkeep in each

Step 2: GalleryPanel.jsx
  → Build component with BOTH sections:
      Section A: Photo carousel with all three render states + keyboard listener + fade transition
      Section B: Location info (name, Devanagari, description, Google Maps link) — moved from old BottomPanel
  → Extract LocationInfo as a sub-component within the same file

Step 3: useJourney.js hook
  → Implement start / pause / stop
  → Verify interval cleanup
  → Verify journey completion auto-stop
  → Hook only manages selectedLocationId; verse sync handled by App.jsx useEffect

Step 4: Header.jsx play controls
  → Wire buttons to journey.start / pause / stop
  → Render progress indicator

Step 5: App.jsx integration
  → Add selectedVerseId state alongside selectedLocationId
  → Call useJourney, pass journey to Header
  → Add useEffect [selectedLocationId] → sync selectedVerseId to first verse of new location
  → Add handleLocationSelect wrapper (useCallback): pauses journey + sets location + sets first verse
  → Pass handleLocationSelect as setSelectedLocationId prop to MapView and VersePanel
  → Pass selectedVerseId + setSelectedVerseId to VersePanel and BottomPanel
  → BottomPanel receives: selectedVerseId, setSelectedVerseId, setSelectedLocationId (raw setter)

Step 6: End-to-end testing
  → Run through Phase 4 Completion Checklist (see below)
```

### Phase Details

#### Step 1: Image Folder Scaffold

Create all 32 folders. Each gets a `.gitkeep` so the empty folder is tracked by git.

```
public/
└── assets/
    └── images/
        └── locations/
            ├── arit-grama/             .gitkeep
            ├── radha-kunda/            .gitkeep
            ├── shyama-kunda/           .gitkeep
            ├── sumanas-lake/           .gitkeep
            ├── govardhana-hill/        .gitkeep
            ├── govardhana-village/     .gitkeep
            ├── brahma-kunda/           .gitkeep
            ├── annakuta-grama/         .gitkeep
            ├── ganthuli-grama/         .gitkeep
            ├── manasa-ganga/           .gitkeep
            ├── govinda-kunda/          .gitkeep
            ├── kamyavana/              .gitkeep
            ├── nandishvara/            .gitkeep
            ├── pavana-lake/            .gitkeep
            ├── khadiravana/            .gitkeep
            ├── seshashayi/             .gitkeep
            ├── khela-tirtha/           .gitkeep
            ├── bhandiravana/           .gitkeep
            ├── bhadravana/             .gitkeep
            ├── shrivana/               .gitkeep
            ├── lohavana/               .gitkeep
            ├── mahavana-gokula/        .gitkeep
            ├── mathura/                .gitkeep
            ├── akrura-tirtha/          .gitkeep
            ├── kaliya-daha/            .gitkeep
            ├── praskandana/            .gitkeep
            ├── dvadashaditya/          .gitkeep
            ├── keshi-tirtha/           .gitkeep
            ├── cira-ghata/             .gitkeep
            ├── tentuli-tala/           .gitkeep
            ├── soro-kshetra/           .gitkeep
            └── prayaga/                .gitkeep
```

When a user adds real photos, they:
1. Drop files into the correct folder (e.g., `public/assets/images/locations/radha-kunda/photo-1.jpg`)
2. Add the path string to the `images` array in `src/data/locations.js` — **without a leading slash**: `"assets/images/locations/radha-kunda/photo-1.jpg"` (GalleryPanel prepends `import.meta.env.BASE_URL` at render time)
3. Push to `main` — Vite build picks them up automatically

---

#### Step 2: GalleryPanel.jsx

**File:** `src/components/GalleryPanel.jsx`

The GalleryPanel now contains **two sections**:
- **Section A — Photo Carousel** (top): Derives photos from `selectedLocationId`, prev/next navigation, placeholder for empty images. Same carousel logic as before.
- **Section B — Location Info** (below carousel): Location name (English + Devanagari), 2-3 sentence spiritual significance description, and an "Open in Google Maps" button/link. This info was previously displayed in the BottomPanel — it has been **moved** to the right panel.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedLocationId` | `string \| null` | Yes | The ID of the currently selected location, or `null` if nothing is selected. GalleryPanel derives everything (photos AND location info) from this single prop. |

**State:**

| State | Initial Value | Description |
|-------|---------------|-------------|
| `currentIndex` | `0` | Index into the current location's `images` array |

**Derived values (via `useMemo`):**

| Name | Depends on | Description |
|------|------------|-------------|
| `location` | `selectedLocationId`, `locations` | The full location object from `locations[]`, or `null`. Used by BOTH Section A (images) and Section B (name, nameDevanagari, description, googleMapsUrl). |
| `images` | `location` | `location.images` if location exists, else `[]` |

**Full implementation:**

```jsx
// src/components/GalleryPanel.jsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { locations } from '../data/locations';

function GalleryPanel({ selectedLocationId }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Derive the current location object. Returns null if nothing is selected.
  const location = useMemo(
    () => locations.find((loc) => loc.id === selectedLocationId) ?? null,
    [selectedLocationId]
  );

  // Derive the images array from the location. Empty array when no location.
  const images = useMemo(() => location?.images ?? [], [location]);

  // Reset the carousel to the first photo whenever the selected location changes.
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedLocationId]);

  // Navigate to the next photo, wrapping at the end.
  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Navigate to the previous photo, wrapping at the start.
  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation: ArrowRight → next, ArrowLeft → prev.
  // Only active when images exist and the gallery is in view.
  useEffect(() => {
    if (images.length === 0) return; // No images — no keyboard handler needed.

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Cleanup: remove listener when selectedLocationId changes or component unmounts.
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, nextPhoto, prevPhoto]);

  // --- Render: nothing selected ---
  if (!selectedLocationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <span className="text-5xl mb-4">&#x1F33B;</span> {/* lotus */}
        <p className="text-saffron-600 font-semibold text-lg">
          Gaur Yatra
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Select a location on the map or a verse in the panel to view photographs.
        </p>
      </div>
    );
  }

  // --- Render: location selected but no photos yet ---
  if (images.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Section A: Photo placeholder */}
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
          <span className="text-5xl mb-4">&#x1F33B;</span>
          <p className="text-saffron-700 font-semibold text-lg">{location.name}</p>
          <p className="text-gray-400 text-sm mt-3 italic">
            Photographs coming soon — Hare Krishna
          </p>
        </div>

        {/* Section B: Location info (always shown when a location is selected) */}
        <LocationInfo location={location} />
      </div>
    );
  }

  // --- Render: carousel + location info ---
  // Prepend the Vite base URL so paths resolve correctly on GitHub Pages.
  // In dev, BASE_URL is "/". In production (GitHub Pages), it is "/gaur-yatra/".
  // The image paths in locations.js are stored WITHOUT a leading slash
  // (e.g., "assets/images/locations/radha-kunda/photo-1.jpg") so that
  // concatenation produces "/gaur-yatra/assets/images/..." in production
  // and "/assets/images/..." in dev — both correct.
  const rawPath = images[currentIndex];
  const imagePath = `${import.meta.env.BASE_URL}${rawPath.replace(/^\//, '')}`;

  return (
    <div
      className="flex flex-col h-full"
      tabIndex={0}  // Makes the panel focusable for keyboard events.
      aria-label="Photo gallery and location info"
    >
      {/* Section A: Photo carousel */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {/*
          key={imagePath} forces React to unmount and remount the <img> element
          every time the image changes. The CSS fade-in class then re-triggers
          on each new mount, producing the transition effect.
        */}
        <img
          key={imagePath}
          src={imagePath}
          alt={`${location.name} — photo ${currentIndex + 1}`}
          className="w-full h-full object-cover gallery-fade-in"
        />
      </div>

      {/* Carousel controls bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <button
          onClick={prevPhoto}
          aria-label="Previous photo"
          className="px-3 py-1 rounded bg-saffron-100 hover:bg-saffron-200 text-saffron-800 font-bold transition-colors"
        >
          &#8592; Prev
        </button>

        <span className="text-sm text-gray-600">
          {currentIndex + 1} / {images.length}
        </span>

        <button
          onClick={nextPhoto}
          aria-label="Next photo"
          className="px-3 py-1 rounded bg-saffron-100 hover:bg-saffron-200 text-saffron-800 font-bold transition-colors"
        >
          Next &#8594;
        </button>
      </div>

      {/* Section B: Location info (below carousel) */}
      <LocationInfo location={location} />
    </div>
  );
}

// LocationInfo — renders location name, Devanagari, description, and Google Maps link.
// Previously this info lived in BottomPanel. It has been moved here to the right panel
// because BottomPanel is now a full verse reader.
function LocationInfo({ location }) {
  return (
    <div className="px-4 py-4 bg-white border-t border-gray-200">
      {/* Location name: English + Devanagari */}
      <h3 className="text-lg font-bold text-saffron-800">{location.name}</h3>
      {location.nameDevanagari && (
        <p className="text-base text-saffron-600 font-medium mt-0.5">
          {location.nameDevanagari}
        </p>
      )}

      {/* Spiritual significance description */}
      {location.description && (
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {location.description}
        </p>
      )}

      {/* Google Maps link */}
      {location.googleMapsUrl && (
        <a
          href={location.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-sm font-medium text-white bg-saffron-700 rounded hover:bg-saffron-600 transition-colors"
          aria-label={`Open ${location.name} in Google Maps`}
        >
          Open in Google Maps
        </a>
      )}
    </div>
  );
}

export default GalleryPanel;
```

**CSS fade-in animation** — add to `src/styles/index.css`:

```css
/* Triggered on every new <img> mount (key forces unmount/remount). */
@keyframes galleryFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.gallery-fade-in {
  animation: galleryFadeIn 300ms ease-in;
}
```

> **Why `key={imagePath}` instead of CSS transition on `src` change:** React does not re-mount a DOM element when only its props change — it patches them in place. Setting `key` to the image path forces a full unmount + remount on each image swap, which restarts the CSS animation from `opacity: 0`. This is the correct React idiom for triggering enter animations on content swaps. Verified against React 19 documentation on `key` as a component identity signal.

---

#### Step 3: useJourney Custom Hook

**File:** `src/hooks/useJourney.js`

> **Verse sync pattern:** `useJourney` only updates `selectedLocationId`. It does NOT need to know about verses or `selectedVerseId`. When the journey advances to a new location, a `useEffect` in `App.jsx` watches `selectedLocationId` and automatically sets `selectedVerseId` to the first verse of that location. This keeps the hook simple and single-purpose.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `locations` | `Location[]` | The full array of 32 location objects (from `src/data/locations.js`) |
| `setSelectedLocationId` | `(id: string) => void` | The state setter from `App.jsx`; called by the interval to advance the map. Verse sync is handled separately by App.jsx's `useEffect`. |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `isPlaying` | `boolean` | `true` while the interval is running |
| `currentStep` | `number` | 0-based index into `sortedLocations` (which location is currently being shown) |
| `totalSteps` | `number` | Always 32 (`sortedLocations.length`) |
| `currentLocationName` | `string \| null` | Name of the current journey location (for the Header progress display) |
| `start` | `() => void` | Starts or resumes the journey interval |
| `pause` | `() => void` | Pauses the interval; preserves `currentStep` |
| `stop` | `() => void` | Stops and resets `currentStep` to 0 |

**Full implementation:**

```js
// src/hooks/useJourney.js
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';

// Default interval between location advances (milliseconds).
const JOURNEY_INTERVAL_MS = 3000;

export default function useJourney(locations, setSelectedLocationId) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // intervalRef holds the active setInterval ID.
  // A ref (not state) because changing it must not trigger a re-render.
  const intervalRef = useRef(null);

  // stepRef mirrors currentStep so the interval callback can read the latest
  // value without being stale. The interval closure captures stepRef.current
  // at execution time, not at the time the interval was created.
  const stepRef = useRef(0);

  // Sort locations by journeyOrder once. useMemo ensures this only recomputes
  // if the locations array reference changes (it never does at runtime).
  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.journeyOrder - b.journeyOrder),
    [locations]
  );

  const totalSteps = sortedLocations.length;

  // Derive the name of the current location for display in the Header.
  const currentLocationName = sortedLocations[currentStep]?.name ?? null;

  // --- clearCurrentInterval ---
  // Internal helper. Always clear before setting a new interval to prevent stacking.
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // --- start ---
  // Starts the journey from the current step (or from 0 if at the beginning).
  // Guard: if already playing, returns immediately — prevents double-start.
  const start = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);

    // Immediately select the location at the current step so the UI updates
    // without waiting for the first interval tick.
    setSelectedLocationId(sortedLocations[stepRef.current].id);

    intervalRef.current = setInterval(() => {
      // Read the latest step from the ref, not from the closure.
      const nextStep = stepRef.current + 1;

      if (nextStep >= totalSteps) {
        // Journey complete: stop cleanly and reset.
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        stepRef.current = 0;
        setCurrentStep(0);
        setIsPlaying(false);
        return;
      }

      // Advance to the next location.
      stepRef.current = nextStep;
      setCurrentStep(nextStep);
      setSelectedLocationId(sortedLocations[nextStep].id);
    }, JOURNEY_INTERVAL_MS);
  }, [isPlaying, sortedLocations, totalSteps, setSelectedLocationId]);

  // --- pause ---
  // Clears the interval but keeps currentStep so Resume works from the same position.
  const pause = useCallback(() => {
    clearCurrentInterval();
    setIsPlaying(false);
    // stepRef and currentStep are deliberately NOT reset here.
  }, [clearCurrentInterval]);

  // --- stop ---
  // Clears the interval and fully resets the journey to the beginning.
  const stop = useCallback(() => {
    clearCurrentInterval();
    stepRef.current = 0;
    setCurrentStep(0);
    setIsPlaying(false);
  }, [clearCurrentInterval]);

  // Cleanup: clear any active interval when the component using this hook unmounts.
  // Without this, the interval would keep firing after the component is gone —
  // calling setSelectedLocationId on an unmounted component (memory leak + React warning).
  useEffect(() => {
    return () => {
      clearCurrentInterval();
    };
  }, [clearCurrentInterval]);

  return {
    isPlaying,
    currentStep,
    totalSteps,
    currentLocationName,
    start,
    pause,
    stop,
  };
}
```

**Anatomy of the hook — explained section by section:**

| Section | What it does | Why it matters |
|---------|-------------|----------------|
| `JOURNEY_INTERVAL_MS = 3000` | Named constant at module scope | Single place to change the interval — no magic numbers scattered through the hook |
| `useState(isPlaying)` | Tracks whether the interval is active | Drives button label rendering in `Header.jsx` |
| `useState(currentStep)` | Tracks the 0-based position in the journey | Drives the progress display ("Location 5 / 32") and is exposed for `Header` |
| `intervalRef = useRef(null)` | Holds the `setInterval` return value | A ref rather than state because we never want a re-render when the interval ID changes |
| `stepRef = useRef(0)` | Mirrors `currentStep` for use inside the interval callback | The interval callback is a closure created at `start()` call time. If it read `currentStep` from state, it would forever see the stale value from when `start()` ran. `stepRef.current` is always up-to-date. |
| `sortedLocations = useMemo(...)` | Sorts locations by `journeyOrder` once | Prevents re-sorting on every render. The `locations` prop never changes at runtime so this runs exactly once. |
| `start()` | Begins the interval, immediately shows step 0 | The first `setSelectedLocationId` call before `setInterval` fires means there is no blank period at journey start. |
| `start()` auto-stop guard | `if (nextStep >= totalSteps)` inside the tick | Clears the interval when the last location is reached, resets state, prevents the callback from running off the end of the array. |
| `pause()` | `clearInterval` + `setIsPlaying(false)` | Deliberately does NOT touch `stepRef` or `currentStep`. Resume from the same position is just calling `start()` again with `stepRef.current` already at the paused position. |
| `stop()` | `clearInterval` + resets both `stepRef` and `currentStep` | Full reset. Next `start()` begins from location 1 again. |
| `useEffect` cleanup | `return () => clearCurrentInterval()` | Runs when the hook's host component unmounts. Guarantees no orphaned intervals. Pattern verified against React 19 docs on `useEffect` cleanup. |

---

#### Step 4: Header.jsx — Play Controls

**File:** `src/components/Header.jsx`

> **BREAKING CHANGE: Phase 4 REPLACES the Phase 3 Header component.** Phase 3's `Header.jsx` accepted `{ selectedLocationId }` as its only prop and displayed a static progress count ("Location 5 of 32"). Phase 4 completely replaces this component with a new version that accepts `{ journey }` instead. The `journey` object (returned by `useJourney`) contains `isPlaying`, `currentStep`, `totalSteps`, `currentLocationName`, `start`, `pause`, and `stop`. The Phase 3 Header is deleted — its progress-display functionality is subsumed by the journey progress indicator in the new Header. The import in `App.jsx` changes from `<Header selectedLocationId={selectedLocationId} />` to `<Header journey={journey} />`.

> **Dual-state compatibility:** Header does NOT need `selectedVerseId` — it only shows journey progress (location-level). The Play/Pause/Stop controls drive `useJourney`, which only manages `selectedLocationId`. Verse sync is handled by the `useEffect` in App.jsx, completely transparent to Header.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `journey` | `object` | Yes | The object returned by `useJourney` (`isPlaying`, `currentStep`, `totalSteps`, `currentLocationName`, `start`, `pause`, `stop`). Replaces Phase 3's `selectedLocationId` prop. |

**Button state logic:**

| Condition | Play button shows | Pause button shows | Stop shown |
|-----------|------------------|-------------------|------------|
| `!isPlaying && currentStep === 0` | "Play Journey" | hidden | hidden |
| `isPlaying` | hidden | "Pause" | "Stop" |
| `!isPlaying && currentStep > 0` | "Resume" | hidden | "Stop" |

```jsx
// src/components/Header.jsx
function Header({ journey }) {
  const {
    isPlaying,
    currentStep,
    totalSteps,
    currentLocationName,
    start,
    pause,
    stop,
  } = journey;

  // isPaused = user has started but paused mid-journey.
  const isPaused = !isPlaying && currentStep > 0;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-saffron-800 text-white shadow-md">
      {/* Site title */}
      <div>
        <h1 className="text-xl font-bold tracking-wide">Gaur Yatra</h1>
        <p className="text-xs text-saffron-200">
          Chaitanya Mahaprabhu's Journey Through Vraj Bhumi
        </p>
      </div>

      {/* Journey controls */}
      <div className="flex items-center gap-3">
        {/* Progress indicator — only visible while playing or paused mid-journey */}
        {(isPlaying || isPaused) && (
          <span className="text-sm text-saffron-100">
            Location {currentStep + 1} / {totalSteps}
            {currentLocationName && (
              <span className="ml-2 font-medium">&mdash; {currentLocationName}</span>
            )}
          </span>
        )}

        {/* Play button: shows "Play Journey" at start, "Resume" after a pause */}
        {!isPlaying && (
          <button
            onClick={start}
            aria-label={isPaused ? 'Resume journey' : 'Play journey'}
            className="px-4 py-1.5 bg-white text-saffron-800 rounded font-semibold text-sm hover:bg-saffron-100 transition-colors"
          >
            {isPaused ? 'Resume ▶' : 'Play Journey ▶'}
          </button>
        )}

        {/* Pause button: only visible while actively playing */}
        {isPlaying && (
          <button
            onClick={pause}
            aria-label="Pause journey"
            className="px-4 py-1.5 bg-saffron-600 text-white rounded font-semibold text-sm hover:bg-saffron-500 transition-colors"
          >
            Pause ‖
          </button>
        )}

        {/* Stop button: visible when playing or paused mid-journey */}
        {(isPlaying || isPaused) && (
          <button
            onClick={stop}
            aria-label="Stop journey and reset"
            className="px-3 py-1.5 bg-saffron-900 text-saffron-200 rounded text-sm hover:bg-saffron-700 transition-colors"
          >
            &#9632; Stop
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
```

---

#### Step 5: App.jsx Integration

**File:** `src/App.jsx`

This is the orchestration layer. It owns TWO pieces of state — `selectedLocationId` AND `selectedVerseId` — calls `useJourney`, and implements the logic that distinguishes a user-initiated location change from a journey-driven one.

**Dual-state model:**

App.jsx manages two independent pieces of state:
- `selectedLocationId` — which location is active (drives map, gallery, location info)
- `selectedVerseId` — which verse is active (drives the bottom panel verse reader)

These are kept in sync via a `useEffect`: when `selectedLocationId` changes (from any source — user click, journey tick), the effect finds the first verse of that location and sets `selectedVerseId`. This means `useJourney` only needs to update `selectedLocationId`; the verse sync happens automatically.

**The user-click vs journey-tick problem:**

Both a user clicking a marker and the journey interval ultimately call `setSelectedLocationId`. When a user clicks during playback, the journey must pause. The solution is a `useCallback` wrapper (`handleLocationSelect`) that checks `journey.isPlaying` and calls `journey.pause()` before updating the location. This wrapper is passed to `MapView` and `VersePanel` as their `setSelectedLocationId` prop — so those components call the same prop name as Phase 3 defined, but the wrapper transparently adds the pause-on-click behavior. The journey hook itself holds a direct reference to the raw `setSelectedLocationId` setter (received as a parameter), so journey ticks never trigger the pause logic.

The wrapper also sets `selectedVerseId` to the first verse of the clicked location, so clicking a location immediately syncs the verse reader.

```jsx
// src/App.jsx
import { useState, useCallback, useEffect } from 'react';
import { locations } from './data/locations';
import { verses } from './data/verses';
import useJourney from './hooks/useJourney';
import Header from './components/Header';
import VersePanel from './components/VersePanel';
import MapView from './components/MapView';
import GalleryPanel from './components/GalleryPanel';
import BottomPanel from './components/BottomPanel';

export default function App() {
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedVerseId, setSelectedVerseId] = useState(null);

  // Instantiate the journey hook at the top level so its state survives
  // across all child renders and is accessible from both Header and the wrapper below.
  const journey = useJourney(locations, setSelectedLocationId);

  // Sync selectedVerseId when selectedLocationId changes (from ANY source:
  // user click, journey tick, or verse-reader cross-location navigation).
  // Sets selectedVerseId to the first verse of the new location.
  // This is the simpler approach vs having useJourney manage verses directly —
  // the hook only needs to know about locations; verse sync is handled here.
  useEffect(() => {
    if (!selectedLocationId) {
      setSelectedVerseId(null);
      return;
    }
    const firstVerse = verses.find((v) => v.locationId === selectedLocationId);
    if (firstVerse) setSelectedVerseId(firstVerse.id);
  }, [selectedLocationId]);

  // handleLocationSelect: wraps setSelectedLocationId with journey-pause logic.
  // Called by VersePanel and MapView when the user manually selects a location.
  // If the journey is playing, it pauses first so manual navigation takes over.
  // Also syncs selectedVerseId to the first verse of the clicked location.
  //
  // IMPORTANT: This wrapper is passed to MapView as `setSelectedLocationId` —
  // MapView's internal code still calls `setSelectedLocationId(loc.id)` exactly
  // as Phase 3 defined it. The wrapper transparently adds the pause behavior
  // without requiring any changes inside MapView.jsx or VersePanel.jsx.
  const handleLocationSelect = useCallback((locationId) => {
    if (journey.isPlaying) journey.pause();
    setSelectedLocationId(locationId);
    // Find and select the first verse of this location
    const firstVerse = verses.find((v) => v.locationId === locationId);
    if (firstVerse) setSelectedVerseId(firstVerse.id);
  }, [journey]);

  return (
    <div className="flex flex-col h-screen">
      <Header journey={journey} />

      <main className="flex flex-1 overflow-hidden">
        {/* Left (20%): condensed verse list grouped by location with type badges */}
        <VersePanel
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={handleLocationSelect}
          selectedVerseId={selectedVerseId}
          setSelectedVerseId={setSelectedVerseId}
        />

        {/* Center: map */}
        <MapView
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={handleLocationSelect}
        />

        {/* Right (25%): photo gallery + location info */}
        <GalleryPanel selectedLocationId={selectedLocationId} />
      </main>

      {/* Bottom: full verse reader (Sanskrit + translation + prev/next through ALL 229 verses) */}
      <BottomPanel
        selectedVerseId={selectedVerseId}
        setSelectedVerseId={setSelectedVerseId}
        setSelectedLocationId={setSelectedLocationId}
      />
    </div>
  );
}
```

**Why `useJourney` is called in `App.jsx` (not `Header.jsx`):**

The journey hook calls `setSelectedLocationId` on every tick. That setter must come from the same `useState` call that `MapView`, `VersePanel`, and `GalleryPanel` all read from. If `useJourney` lived in `Header.jsx`, it would have no access to `App.jsx`'s setter without prop-drilling the setter back up — which is illegal in React (data flows downward). The correct pattern is: hook at the top level, controls in a child.

**Why verse sync uses a `useEffect` (not direct hook integration):**

The `useJourney` hook only manages `selectedLocationId`. When it advances to a new location, the `useEffect` in App.jsx watching `selectedLocationId` fires and sets `selectedVerseId` to the first verse of that location. This keeps `useJourney` simple (it does not need to know about verses at all) and ensures verse sync works regardless of what changes `selectedLocationId` — user click, journey tick, or verse-reader cross-location navigation all trigger the same effect.

**BottomPanel prop contract:**

The BottomPanel (verse reader) receives three props:
- `selectedVerseId` — which verse to display
- `setSelectedVerseId` — to advance prev/next through all 229 verses
- `setSelectedLocationId` — the RAW setter (not the wrapper), so that when the verse reader navigates to a verse with a different `locationId`, it can update the map/gallery without triggering journey pause logic. The `useEffect` sync handles updating `selectedVerseId` when the location changes, but in this case the verse reader is the SOURCE of the change, so it sets `selectedLocationId` directly.

---

## Edge Cases (React-Specific)

| Scenario | What happens | How it is handled |
|----------|-------------|-------------------|
| Double-click on Play | `start()` is called twice in rapid succession | Guard at top of `start()`: `if (isPlaying) return`. First call sets `isPlaying = true`; second call exits immediately. No second interval is created. |
| Component unmounts while interval is active | Orphaned interval fires after unmount; tries to update state of unmounted component | `useEffect` cleanup in `useJourney` calls `clearCurrentInterval()`. React 19 still warns on unmounted state updates — this prevents it. |
| `setSelectedLocationId` called in rapid succession by journey ticks | React may batch multiple state updates | React 19 batches all state updates by default (including inside timeouts and intervals). This means `currentStep` and `selectedLocationId` updates within a single tick are batched into one render. This is safe — no partial render state. |
| Journey reaches the last location (step 31) | The interval fires one more time, `nextStep = 32 >= totalSteps = 32` | The auto-stop guard inside the interval clears `intervalRef.current`, resets `currentStep` to 0, and sets `isPlaying = false`. The Play button reappears without "Resume" text. |
| User clicks during playback | MapView/VersePanel calls `setSelectedLocationId(id)` which is actually `handleLocationSelect` | `handleLocationSelect` checks `journey.isPlaying`, calls `journey.pause()` synchronously, then calls the real `setSelectedLocationId`. The journey stops cleanly at the step it was on. |
| Keyboard arrows fire before a location is selected | `GalleryPanel` has `images.length === 0` — the `useEffect` for keyboard returns early | Guard: `if (images.length === 0) return;` at the top of the keyboard `useEffect`. No listener is attached, so no error. |
| User presses ArrowLeft on the first photo (`currentIndex === 0`) | `prevPhoto` computes `(0 - 1 + images.length) % images.length` | Result is `images.length - 1` — wraps to the last photo cleanly. |
| `selectedLocationId` changes to the same value it already has | `useEffect [selectedLocationId]` fires only when the value actually changes | React compares the new and old values with `Object.is`. Same string → effect does not fire. No spurious index reset. |
| Location with exactly one image | Next and Prev both compute `(0 + 1) % 1 = 0` | Index stays at 0. Buttons still render (they are not hidden for single-image sets) but produce no visible change — acceptable behavior. Consider hiding buttons if `images.length <= 1` as a future polish item. |
| Verse reader navigates to a verse with a different locationId | BottomPanel's Prev/Next reaches a verse belonging to a different location | BottomPanel calls `setSelectedLocationId(newVerse.locationId)` — map flies to the new location, gallery updates. The `useEffect` in App.jsx then syncs `selectedVerseId`, but since the verse reader already set it, the effect is a no-op (same value). |
| Verse reader reaches first or last verse (index 0 or 228) | User clicks Prev on verse 0 or Next on verse 228 | Button should be disabled or wrap — implementation choice. Recommended: disable Prev at index 0 and Next at index 228 (no wrapping for verses, unlike the photo carousel). |
| `useEffect` verse sync fires during journey playback | Journey advances `selectedLocationId`, triggering the sync effect | Effect finds the first verse of the new location and sets `selectedVerseId`. This is the intended behavior — the verse reader updates to show the first verse of each location as the journey plays. |

---

## Keyboard Support

`GalleryPanel` attaches a `keydown` listener to `window` via `useEffect`. This means the listener is active as long as the component is mounted and images exist.

**Why `window` and not the container `div`:**
Attaching to the container `div` (via `onKeyDown` in JSX) requires the element to have focus (`tabIndex={0}` and the user to have clicked it). Attaching to `window` means arrow keys always work once a location with photos is selected — no focus requirement. This is a deliberate accessibility trade-off for v1. The gallery container still carries `tabIndex={0}` for screen-reader discoverability.

**Cleanup discipline:**
The `useEffect` returns `() => window.removeEventListener('keydown', handleKeyDown)`. This is critical: because `nextPhoto` and `prevPhoto` are declared with `useCallback`, their references are stable between renders. But the effect re-runs if `images.length` changes (when a new location is selected). On each re-run, the old listener is removed before the new one is attached. No listener accumulation.

```jsx
// Inside GalleryPanel.jsx — keyboard effect (repeated here for clarity):
useEffect(() => {
  if (images.length === 0) return;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [images.length, nextPhoto, prevPhoto]);
```

---

## Dependencies from Phases 1, 2, and 3

| Dependency | Produced by | What Phase 4 needs |
|------------|-------------|-------------------|
| `src/data/locations.js` — named export `locations`, 32 objects, each with `id`, `name`, `nameDevanagari`, `journeyOrder`, `lat`, `lng`, `description`, `googleMapsUrl`, `images: []` | Phase 1 | `GalleryPanel` reads `images[]` + location info fields (name, nameDevanagari, description, googleMapsUrl); `useJourney` reads `id` and `journeyOrder` |
| `src/data/verses.js` — named export `verses`, 229 objects, each with `id`, `locationId`, `verseNumber`, `sanskrit`, `translation`, `verseType` | Phase 2 (updated) | `BottomPanel` reads verses for the reader; `App.jsx` uses `verses.find()` to sync `selectedVerseId` when location changes; `VersePanel` groups verses by location with `verseType` badges |
| `App.jsx` with `useState(selectedLocationId)` and a working `setSelectedLocationId` | Phase 3 | `useJourney` accepts `setSelectedLocationId` as a parameter; `GalleryPanel` accepts `selectedLocationId` as a prop. Phase 4 adds `useState(selectedVerseId)` alongside it. |
| `setSelectedLocationId` prop wiring in `App.jsx` — passed to `VersePanel` and `MapView` for click handling | Phase 3 | Phase 4 wraps the raw `setSelectedLocationId` setter in a `handleLocationSelect` callback that pauses the journey on user clicks AND syncs `selectedVerseId`, then passes this wrapper as the `setSelectedLocationId` prop — MapView and VersePanel call the same prop name as before, no internal changes needed |
| `MapView` `flyTo` behavior — Phase 3 established that `MapView` listens to `selectedLocationId` and calls Leaflet's `flyTo` | Phase 3 | Journey playback calls `setSelectedLocationId` → `MapView` reacts → map flies to each location automatically. No new wiring needed. |
| Verse scroll behavior — Phase 2/3 established that `VersePanel` scrolls to and highlights the relevant verses when `selectedLocationId` changes | Phase 2 + 3 | Journey playback drives this for free: `setSelectedLocationId` change → `VersePanel` scrolls/highlights |

> **Icon path note (Phase 3 → Phase 5 concern):** Phase 3's `MapView.jsx` uses hardcoded string paths for the marker icon: `iconUrl: '/assets/icons/chaitanya-marker.png'` and an inline `<img src="/assets/icons/chaitanya-marker.png">` inside the active `L.divIcon`. These reference a file in `public/assets/icons/`. **These leading-slash paths will break on GitHub Pages** for the same reason as image paths (see NEW-006 fix above) — `/assets/icons/...` resolves to `https://dev-arctik.github.io/assets/icons/...` instead of `https://dev-arctik.github.io/gaur-yatra/assets/icons/...`. Phase 4 does NOT modify `MapView.jsx`, but Phase 5 MUST fix these paths using one of two approaches: (a) use ES module imports (`import chaitanyaMarkerIcon from '../assets/icons/chaitanya-marker.png'`) which lets Vite resolve the base path automatically, or (b) prepend `import.meta.env.BASE_URL` to the path strings, the same pattern `GalleryPanel` uses for image paths. Option (a) is preferred because Vite also hashes the filename for cache-busting.

---

## What Phase 4 Outputs for Phase 5

| Output | Description |
|--------|-------------|
| `src/components/GalleryPanel.jsx` | Complete photo carousel (Section A) + location info display (Section B) with all three render states and keyboard support |
| `src/components/BottomPanel.jsx` | Full verse reader: Sanskrit + translation + prev/next through ALL 229 verses, with cross-location navigation that auto-updates map + gallery |
| `src/hooks/useJourney.js` | Complete journey hook — tested, interval-safe, with cleanup. Only manages `selectedLocationId`; verse sync handled by App.jsx. |
| `src/components/Header.jsx` | Play / Pause / Stop / Resume controls with progress display |
| Updated `src/App.jsx` | Dual state (`selectedLocationId` + `selectedVerseId`); `useJourney` integrated; `useEffect` verse sync; `handleLocationSelect` wrapper passes journey-pause-aware callback to MapView and VersePanel; BottomPanel wired as verse reader |
| `public/assets/images/locations/<32 folders>/` | All 32 image folders with `.gitkeep`, ready for real photos |
| All interactive features working end-to-end | A devotee can open the site, press Play, and watch the map fly through all 32 sacred locations while the verse panel scrolls, the gallery updates, and the verse reader shows each location's first verse at each step |

Phase 5 takes this complete, interactive application and applies the visual polish, accessibility audit, final custom marker icon, and the GitHub Pages deployment.

---

## Testing Strategy

### Manual Test Matrix

| Test | Steps | Expected Result |
|------|-------|----------------|
| No location selected | Open site; observe right panel | Welcome placeholder card renders; no error |
| Location with no photos | Click a location with `images: []` | "Photographs coming soon" card renders with the location name |
| Location with photos | Add 2 test photos to one folder; update `images[]`; open site; click that location | First photo renders; counter shows "1 / 2" |
| Next button | Click Next on a 2-photo gallery | Second photo renders; counter shows "2 / 2"; fade animation triggers |
| Next wrap | Click Next again on last photo | Wraps to first photo; counter shows "1 / 2" |
| Prev wrap | Click Prev on first photo | Wraps to last photo |
| Index reset | Browse to photo 2; click a different location | Gallery resets to "1 / N" of the new location |
| Keyboard right | Focus window; press ArrowRight | Advances gallery by 1 |
| Keyboard left | Press ArrowLeft on first photo | Wraps to last photo |
| Play Journey | Click Play; observe map, verse panel, gallery, verse reader | All 32 locations advance in `journeyOrder` at 3-second intervals; verse reader syncs to first verse of each location |
| Pause mid-journey | Click Pause at step 7 | Interval stops; progress shows "Location 7 / 32"; Play button shows "Resume" |
| Resume | Click Resume | Journey continues from step 7; not from step 1 |
| Stop | Click Stop during playback | Interval stops; `currentStep` resets to 0; Play button shows "Play Journey" |
| Click during play | Press Play; at step 5, click a different marker | Journey pauses; clicked location loads correctly; verse reader shows first verse of clicked location |
| Journey completion | Let all 32 locations play through to the end | At step 32, interval clears, isPlaying becomes false, Play button resets to "Play Journey" |
| No memory leak | Open DevTools Performance tab; Play Journey; let it finish; inspect for orphaned intervals | No active intervals remain after journey completion or stop |
| Verse reader prev/next | Click Next/Prev in the bottom panel verse reader | Navigates through all 229 verses; shows Sanskrit + translation |
| Verse cross-location nav | Navigate verses until reaching a verse with a different locationId | Map flies to new location; gallery updates; GalleryPanel location info section updates |
| Location info in GalleryPanel | Select a location; observe right panel below carousel | Shows location name (English + Devanagari), description, and "Open in Google Maps" link |
| Google Maps link | Click "Open in Google Maps" in the right panel | Opens Google Maps in a new tab at the correct coordinates |
| Verse type badges | Observe left panel verse list | Each verse shows a badge for its verseType (arrival / event / glory / narrative) |
| Verse sync on location click | Click a marker on the map | selectedVerseId updates to the first verse of that location; verse reader shows it |

### React-Specific Checks

- [ ] Open React DevTools; confirm `GalleryPanel` does not re-render when unrelated state changes in `App.jsx` (e.g., only `selectedVerseId` changes should NOT cause `GalleryPanel` to re-render since it only depends on `selectedLocationId`)
- [ ] In React DevTools, confirm the `useJourney` hook is visible under `App` with correct `isPlaying`, `currentStep` values
- [ ] In React DevTools, confirm both `selectedLocationId` and `selectedVerseId` state values are visible under `App`
- [ ] Confirm no "Warning: Cannot update a component while rendering a different component" in console
- [ ] Confirm no "Warning: Can't perform a React state update on an unmounted component" when navigating away during playback
- [ ] `images.length` changes after `selectedLocationId` changes — confirm the keyboard `useEffect` re-runs correctly (old listener removed, new one attached)
- [ ] Confirm `useEffect` verse sync fires correctly: changing `selectedLocationId` sets `selectedVerseId` to the first verse of the new location
- [ ] Confirm verse reader cross-location navigation does NOT trigger infinite loop: BottomPanel sets `selectedLocationId` → `useEffect` sets `selectedVerseId` back to first verse → but BottomPanel already set the correct verse, so this is either a no-op or an acceptable reset to first verse

### Edge Case Checks

- [ ] Rapidly toggle Play / Pause 5 times — no console errors, no duplicate intervals
- [ ] Click 10 different markers quickly — `currentIndex` always resets to 0 for each new location
- [ ] Add exactly 1 image to a folder — Prev and Next buttons both render but navigation is a no-op (stays on the only photo)
- [ ] Remove all images from a folder mid-session (reload) — gallery correctly shows the placeholder

---

## File Structure (Phase 4 Additions and Changes)

```
gaur_yatra/
├── public/
│   └── assets/
│       └── images/
│           └── locations/
│               ├── arit-grama/         .gitkeep  (new in Phase 4)
│               ├── radha-kunda/        .gitkeep
│               └── ... (all 32 folders)
│
├── src/
│   ├── App.jsx                          MODIFIED: dual state (selectedLocationId + selectedVerseId), useJourney, handleLocationSelect wrapper, useEffect verse sync, BottomPanel wired as verse reader
│   │
│   ├── components/
│   │   ├── GalleryPanel.jsx             NEW: photo carousel (Section A) + location info (Section B, moved from BottomPanel). Includes LocationInfo sub-component.
│   │   ├── BottomPanel.jsx              MODIFIED: now a full verse reader (Sanskrit + translation + prev/next through ALL 229 verses). Props changed from { selectedLocationId } to { selectedVerseId, setSelectedVerseId, setSelectedLocationId }. Location info display REMOVED (moved to GalleryPanel).
│   │   ├── Header.jsx                   REPLACED: Phase 3 Header deleted; new Header with Play/Pause/Stop/Resume controls + progress (prop changes from { selectedLocationId } to { journey })
│   │   ├── MapView.jsx                  unchanged (Phase 3 output)
│   │   └── VersePanel.jsx               MODIFIED: now receives selectedVerseId + setSelectedVerseId props; displays verses grouped by location with verseType badges (condensed list, 20% width)
│   │
│   ├── hooks/
│   │   └── useJourney.js                NEW: custom hook for journey auto-advance (manages selectedLocationId only; verse sync handled by App.jsx useEffect)
│   │
│   ├── data/
│   │   ├── locations.js                 MODIFIED: images[] paths updated when real photos added
│   │   └── verses.js                    MODIFIED: verseType field added ("arrival" | "event" | "glory" | "narrative"); purportExcerpt field REMOVED
│   │
│   └── index.css                        MODIFIED: add .gallery-fade-in keyframe animation
│
├── vite.config.js                       unchanged (Phase 1 output)
└── package.json                         unchanged
```

---

## Rollout & Deployment

No new build configuration is needed for Phase 4. The Vite setup from Phase 1 handles everything:

- `public/` assets are served at `/` during `vite dev` and copied as-is to `dist/` during `vite build`
- Image paths in `locations.js` are stored WITHOUT a leading slash (e.g., `"assets/images/locations/radha-kunda/photo-1.jpg"`). `GalleryPanel` prepends `import.meta.env.BASE_URL` at render time, producing `/assets/...` in dev and `/gaur-yatra/assets/...` on GitHub Pages — correct in both environments
- No CDN link changes; no new npm packages

**Local dev:**
```bash
npm run dev
# Open http://localhost:5173
```

**Production build:**
```bash
npm run build
# Output in dist/ — deploy dist/ to GitHub Pages via the workflow set up in Phase 5
```

**Adding real photos (user workflow):**

1. Source a photograph (personal photo, Wikimedia Commons CC-licensed, ISKCON media)
2. Resize/compress to max 1 MB; JPEG or WebP recommended
3. Name the file: `photo-1.jpg`, `photo-2.jpg`, etc.
4. Place in: `public/assets/images/locations/<location-id>/`
5. Add the path (WITHOUT a leading slash) to the `images` array in `src/data/locations.js`:
   ```js
   images: ["assets/images/locations/radha-kunda/photo-1.jpg"]
   ```
   > `GalleryPanel` prepends `import.meta.env.BASE_URL` at render time — do NOT add a leading `/`.
6. Run `npm run dev` locally to verify the gallery renders
7. Commit and push — GitHub Actions (Phase 5) builds and deploys automatically

---

## Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Stale closure in `setInterval` callback reading `currentStep` | High | High if not handled | Mitigated by `stepRef` — the interval callback reads `stepRef.current`, which is always up-to-date, never stale |
| Interval not cleared on unmount causes memory leak and React warning | High | High if not handled | Mitigated by `useEffect` cleanup in `useJourney` calling `clearCurrentInterval()` |
| Double interval from double-click on Play | Medium | Medium | Mitigated by `if (isPlaying) return` guard in `start()` |
| CSS fade animation not triggering on image swap | Medium | Low | Mitigated by `key={imagePath}` on `<img>` — forces React to unmount/remount the element on every image change, reliably restarting the animation |
| Keyboard listener accumulation across location changes | Medium | Medium | Mitigated by including `images.length` (and the stable `nextPhoto`, `prevPhoto` callbacks) in the `useEffect` dependency array — old listener is removed before a new one is attached |
| Journey and user click racing to update `selectedLocationId` | Medium | Medium | Mitigated by the `handleLocationSelect` wrapper — `journey.pause()` is called synchronously before `setSelectedLocationId`, so the interval is cleared before React processes the state update. No ref flags or effects needed. |
| `useMemo` dependency causing unexpected recomputes | Low | Low | `sortedLocations` depends only on `[locations]` — the `locations` array is imported as a module-level constant and never changes reference at runtime, so this `useMemo` computes exactly once |

---

## Open Questions

- [ ] **Journey interval duration** — 3 seconds (`JOURNEY_INTERVAL_MS = 3000`) is the default. Should there be a UI slider for devotees to slow it down (e.g., 5s or 10s for meditation)? This would be an additive change to `useJourney` and the `Header`. Flag for Phase 5 polish or v2.
- [ ] **Single-image button behavior** — When `images.length === 1`, Prev and Next render but are visual no-ops. Should they be hidden (`{images.length > 1 && <button>}`)? Phase 4 leaves them visible; Phase 5 can refine.
- [ ] **Keyboard scope** — The gallery `keydown` listener attaches to `window`. If other panels (VersePanel) also need arrow key support, there could be conflicts. Evaluate during Phase 5 accessibility pass.
- [ ] **Journey step display during stop** — When `stop()` is called, `currentStep` resets to 0 and `isPlaying = false`. The progress indicator disappears. Should it briefly show "Journey complete"? Phase 5 question.

---

## References

- React 19 `useState`, `useMemo`, `useEffect`, `useCallback`, `useRef` — https://react.dev/reference/react
- React custom hooks and `setInterval` cleanup pattern — https://react.dev/learn/reusing-logic-with-custom-hooks
- Vite static assets / `public/` directory — https://vitejs.dev/guide/assets.html#the-public-directory
- `key` prop as identity signal for animations — https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key
- Stale closure problem in `useEffect` with intervals — https://react.dev/learn/synchronizing-with-effects#each-render-has-its-own-effects
- Master plan: `docs/planning/gaur-yatra-plan.md`
- Phase 3 state + interactivity: `docs/planning/phase-3-interactivity.md`
- Phase 5 polish + deploy: `docs/planning/phase-5-polish-deploy.md`
