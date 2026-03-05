# Feature: Phase 1 — Foundation (Vite + React Scaffold + React-Leaflet Map)

**Version:** v2.0
**Status:** Approved
**Type:** Implementation Guide
**Created:** 2026-03-05
**Last Modified:** 2026-03-05
**Parent Plan:** `docs/planning/gaur-yatra-plan.md`

---

## Problem Statement

Phase 1 establishes the structural foundation that every subsequent phase depends on. Without a correct Vite + React scaffold, a working React-Leaflet map, all 32 location data objects as ES modules, and a valid Tailwind CSS v4 + custom CSS layout, Phases 2–5 cannot be built. This document specifies every file, every line of configuration, and every decision made during Phase 1 so a developer can execute it from scratch without asking any questions.

**Phase 1 Milestone:** Run `npm run dev` — the Vite dev server starts, the browser opens at `http://localhost:5173`, the map loads centered on Vrindavan/Mathura, all 32 markers are visible, the polyline journey path is drawn, the 3-column layout is intact, and the browser console shows zero errors.

---

## Goals & Success Criteria

- Vite + React 19 project initialized with TypeScript-free JSX setup.
- Tailwind CSS v4 installed via `@tailwindcss/vite` plugin (not the legacy PostCSS approach).
- All folder scaffolding created including all 32 location image subfolders.
- `src/App.jsx` renders a valid 3-column layout (header + 3 panels + bottom panel) using Tailwind utility classes.
- React-Leaflet map initializes inside `<MapView>` centered on `[27.5, 77.65]` at zoom 12.
- All 32 markers appear on the map from data in `src/data/locations.js`.
- A `<Polyline>` connects all 32 markers in `journeyOrder` sequence.
- `src/styles/index.css` provides Tailwind v4 imports, panel height, scrollbar, and animation foundations.
- `npm run build` produces a working `dist/` folder with the correct `base: '/gaur-yatra/'` prefix.
- Zero console errors on fresh `npm run dev`.
- Play/Pause buttons exist in the header but are disabled (placeholder for Phase 4).

---

## Requirements

### Functional Requirements

- **FR-P1-001:** Project folder structure created with all directories and `.gitkeep` placeholder files.
- **FR-P1-002:** `vite.config.js` sets `base: '/gaur-yatra/'` for GitHub Pages subdirectory deployment.
- **FR-P1-003:** `src/App.jsx` defines `<Header>`, `<VersePanel>` (20% left, grouped verse list), `<MapView>` (55% center), `<GalleryPanel>` (25% right, gallery + location info), and `<BottomPanel>` (verse reader placeholder) as distinct, correctly-sized layout regions.
- **FR-P1-004:** `src/data/locations.js` contains all 32 location objects as a named ES module export.
- **FR-P1-005:** `src/components/MapView.jsx` renders `<MapContainer>`, `<TileLayer>`, 32 `<Marker>` components, and a `<Polyline>` connecting all locations in journey order.
- **FR-P1-006:** `src/styles/index.css` uses Tailwind v4 `@import "tailwindcss"` syntax and defines panel heights, scrollbar styles, verse card base styles, marker pulse animation keyframes, and Leaflet overrides.
- **FR-P1-007:** A placeholder SVG marker icon exists at `public/assets/icons/chaitanya-marker.svg`.
- **FR-P1-008:** `src/App.jsx` maintains `selectedLocationId` and `selectedVerseId` state and passes them plus their setters to child components via props.

### Non-Functional Requirements

- Uses Vite + React 19 + Tailwind CSS v4 + React-Leaflet. No CDN scripts. All dependencies via npm.
- `npm run dev` starts instantly with hot module replacement (HMR).
- `npm run build` produces a complete `dist/` folder with all asset paths prefixed with `/gaur-yatra/`.
- Leaflet CSS is imported directly in the component file (not via CDN), ensuring it is bundled by Vite.
- All `src/` files use ES module `import`/`export` syntax — no globals.

### Assumptions

- [ASSUMPTION] The final custom Chaitanya Mahaprabhu PNG icon (`public/assets/icons/chaitanya-marker.png`) will be sourced in Phase 5. Phase 1 uses a generated SVG circle as a temporary icon.
- [ASSUMPTION] `src/hooks/useJourney.js` is created as an empty stub in Phase 1 so the import path is established. Wired in Phase 4.
- [ASSUMPTION] `src/data/verses.js` is created as an empty stub (`export const verses = [];`) in Phase 1 to avoid import errors. Each verse object will have: `id`, `number`, `verseType` (`"arrival"` | `"event"` | `"glory"` | `"narrative"`), `sanskrit`, `translation`, `locationId`.

---

## User Stories

| Priority | Story | Acceptance Criteria |
|----------|-------|---------------------|
| Must | As a developer, I want the folder structure created so I can place assets in the right locations immediately. | All 32 `public/assets/images/locations/<id>/` folders exist with `.gitkeep` files. |
| Must | As a developer, I want the map to render with all 32 markers so I can verify coordinate accuracy before adding data. | Browser shows Leaflet map, 32 markers visible, polyline connecting them. |
| Must | As a developer, I want the 3-column layout in place so Phase 2 can inject verse components without touching the shell again. | Three columns visible with correct widths (20/55/25); panels fill viewport height. |
| Must | As a developer, I want `npm run build` to work so I can verify the GitHub Pages base path is correctly configured. | `dist/` folder generated; all asset URLs start with `/gaur-yatra/`. |

---

## Technical Design

### Architecture Diagram (Phase 1 Files Only)

```
gaur_yatra/
├── index.html                        ← Vite entry point (minimal boilerplate)
├── vite.config.js                    ← base: '/gaur-yatra/', React plugin (Phase 1)
├── package.json                      ← Dependencies: react, react-dom, react-leaflet,
│                                        leaflet, @tailwindcss/vite (Phase 1)
├── src/
│   ├── main.jsx                      ← React 19 root: createRoot().render(<App />) (Phase 1)
│   ├── App.jsx                       ← Root component: layout + selectedLocationId/selectedVerseId state (Phase 1)
│   ├── components/
│   │   ├── Header.jsx                ← Title + Play/Pause buttons (disabled) (Phase 1)
│   │   ├── MapView.jsx               ← MapContainer + 32 Markers + Polyline (Phase 1)
│   │   ├── VersePanel.jsx            ← STUB — placeholder div (Phase 1)
│   │   ├── GalleryPanel.jsx          ← STUB — placeholder div (Phase 1)
│   │   └── BottomPanel.jsx           ← STUB — placeholder div (Phase 1)
│   ├── data/
│   │   ├── locations.js              ← export const locations = [...] (Phase 1)
│   │   └── verses.js                 ← STUB: export const verses = [] (Phase 1)
│   ├── hooks/
│   │   └── useJourney.js             ← STUB — wired in Phase 4 (Phase 1)
│   └── styles/
│       └── index.css                 ← Tailwind v4 import + custom CSS (Phase 1)
├── public/
│   └── assets/
│       ├── icons/
│       │   └── chaitanya-marker.svg  ← Placeholder circle SVG (Phase 1)
│       └── images/
│           └── locations/
│               ├── arit-grama/       ← .gitkeep
│               ├── radha-kunda/      ← .gitkeep
│               ├── shyama-kunda/     ← .gitkeep
│               ... (all 32 folders)
│               └── prayaga/          ← .gitkeep
└── docs/
    └── planning/
        ├── gaur-yatra-plan.md
        └── phase-1-foundation.md     ← This document
```

### Layout Diagram (3-Column Desktop Grid)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  <Header>  (h-14 = 56px fixed height)                                        │
│  "Gaur Yatra — Chaitanya Mahaprabhu's Journey Through Vraj Bhumi"            │
│  [Play Journey ▶] (disabled)   [Pause ‖] (disabled)                          │
├───────────────────┬──────────────────────────────────┬──────────────────────────┤
│  <VersePanel>     │  <MapView>                       │  <GalleryPanel>          │
│  w-1/5 (20%)      │  55%                             │  w-1/4 (25%)             │
│  height: calc(    │  height: calc(                   │  height: calc(           │
│    100vh - 56px   │    100vh - 56px - 120px)         │    100vh - 56px - 120px) │
│    - 120px)       │  (React-Leaflet renders          │                          │
│  overflow-y:      │   MapContainer here)             │                          │
│  scroll           │                                  │                          │
│  "Verses grouped  │                                  │  "Gallery coming..."     │
│   by location..." │                                  │                          │
├───────────────────┴──────────────────────────────────┴──────────────────────────┤
│  <BottomPanel>  (h-[120px] fixed height)                                       │
│  "Select a verse to read..."                                                   │
│  (populated in Phase 3 as a verse reader)                                      │
└──────────────────────────────────────────────────────────────────────────────┘

Total viewport = header (56px) + three-column row + bottom panel (120px)
Column row height = 100vh - 56px - 120px = calc(100vh - 176px)
```

### Component Breakdown

| Component | File | Phase | Purpose |
|-----------|------|-------|---------|
| Root entry | `src/main.jsx` | 1 | React 19 `createRoot`, mounts `<App>` |
| App shell | `src/App.jsx` | 1 | `selectedLocationId` + `selectedVerseId` state, layout grid, renders all children |
| Header | `src/components/Header.jsx` | 1 | Title, disabled Play/Pause buttons |
| Map | `src/components/MapView.jsx` | 1 | React-Leaflet MapContainer, 32 Markers, Polyline |
| Verse panel | `src/components/VersePanel.jsx` | 1 (stub) | Placeholder — grouped verse list wired in Phase 2 |
| Gallery panel | `src/components/GalleryPanel.jsx` | 1 (stub) | Placeholder — gallery + location info wired in Phase 4 |
| Bottom panel | `src/components/BottomPanel.jsx` | 1 (stub) | Placeholder — verse reader wired in Phase 3 |
| Location data | `src/data/locations.js` | 1 | All 32 location objects — named ES module export |
| Verse data | `src/data/verses.js` | 1 (stub) | Empty array — filled in Phase 2 |
| Journey hook | `src/hooks/useJourney.js` | 1 (stub) | Custom hook stub — wired in Phase 4 |
| Global styles | `src/styles/index.css` | 1 | Tailwind v4 import, panel heights, Leaflet overrides |
| Placeholder icon | `public/assets/icons/chaitanya-marker.svg` | 1 | SVG circle for markers until final PNG is ready |

---

## Implementation Plan

### Section 1: Vite + React Project Initialization

**Run from the existing `gaur_yatra/` project root directory.**

#### Step 1.1 — Scaffold the Vite React Project

```bash
# Run from gaur_yatra/ — the dot (.) installs into the current directory.
# --template react gives us JSX without TypeScript.
npm create vite@latest . -- --template react
```

Vite will ask: "Current directory is not empty. What would you like to do?" — select **"Ignore files and continue"**. This preserves the existing `docs/` folder while adding the Vite scaffold.

**After scaffolding, these files will exist:**
```
index.html
vite.config.js
package.json
src/
  main.jsx
  App.jsx
  App.css           ← DELETE this
  index.css         ← MOVE to src/styles/index.css (see Section 1.3)
  assets/
    react.svg       ← DELETE this
public/
  vite.svg          ← DELETE this
```

#### Step 1.2 — Install All Dependencies

```bash
# Core React-Leaflet stack
npm install react-leaflet leaflet

# Tailwind CSS v4 uses @tailwindcss/vite — NOT the legacy postcss plugin
npm install -D @tailwindcss/vite
```

**Why `@tailwindcss/vite` instead of `tailwindcss` + postcss?** Tailwind CSS v4 ships a native Vite plugin that replaces the PostCSS pipeline. There is no `tailwind.config.js` in v4 — configuration lives in CSS. The `@tailwindcss/vite` plugin handles everything: content scanning, JIT compilation, and HMR. Do NOT run `npx tailwindcss init` — it is not needed for v4.

#### Step 1.3 — Configure `vite.config.js`

**File path:** `vite.config.js` (project root)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // base sets the public URL root for all asset paths in the built output.
  // GitHub Pages hosts this project at: https://dev-arctik.github.io/gaur-yatra/
  // Without this, the built index.html references /assets/... which 404s on GH Pages
  // because the actual path is /gaur-yatra/assets/...
  // With base set, Vite prefixes all asset URLs: /gaur-yatra/assets/main.js etc.
  base: '/gaur-yatra/',
})
```

**Why `base` is required for GitHub Pages:** GitHub Pages serves user repositories at `https://<username>.github.io/<repo-name>/`. When Vite builds the project, it generates asset references like `<script src="/assets/main.js">`. On GitHub Pages, this resolves to `https://dev-arctik.github.io/assets/main.js` — which does not exist. The correct path is `https://dev-arctik.github.io/gaur-yatra/assets/main.js`. Setting `base: '/gaur-yatra/'` in `vite.config.js` makes Vite output `<script src="/gaur-yatra/assets/main.js">`, which resolves correctly. **This must be set before the first build, not after.**

#### Step 1.4 — Clean Up Vite Boilerplate

Delete the files that Vite scaffolds but this project does not need:

```bash
# Delete boilerplate files
rm src/App.css
rm src/assets/react.svg
rm public/vite.svg

# Create the styles directory and move the CSS there
mkdir -p src/styles
mv src/index.css src/styles/index.css

# Create the remaining project directories
mkdir -p src/components
mkdir -p src/data
mkdir -p src/hooks
```

Then update `src/main.jsx` to import from the new CSS path (see Section 3).

---

### Section 2: Project Structure Creation

**Run these commands from the project root (`gaur_yatra/`):**

```bash
# Create all 32 location image folders in one command
mkdir -p \
  public/assets/images/locations/arit-grama \
  public/assets/images/locations/radha-kunda \
  public/assets/images/locations/shyama-kunda \
  public/assets/images/locations/sumanas-lake \
  public/assets/images/locations/govardhana-hill \
  public/assets/images/locations/govardhana-village \
  public/assets/images/locations/brahma-kunda \
  public/assets/images/locations/annakuta-grama \
  public/assets/images/locations/ganthuli-grama \
  public/assets/images/locations/manasa-ganga \
  public/assets/images/locations/govinda-kunda \
  public/assets/images/locations/kamyavana \
  public/assets/images/locations/nandishvara \
  public/assets/images/locations/pavana-lake \
  public/assets/images/locations/khadiravana \
  public/assets/images/locations/seshashayi \
  public/assets/images/locations/khela-tirtha \
  public/assets/images/locations/bhandiravana \
  public/assets/images/locations/bhadravana \
  public/assets/images/locations/shrivana \
  public/assets/images/locations/lohavana \
  public/assets/images/locations/mahavana-gokula \
  public/assets/images/locations/mathura \
  public/assets/images/locations/akrura-tirtha \
  public/assets/images/locations/kaliya-daha \
  public/assets/images/locations/praskandana \
  public/assets/images/locations/dvadashaditya \
  public/assets/images/locations/keshi-tirtha \
  public/assets/images/locations/cira-ghata \
  public/assets/images/locations/tentuli-tala \
  public/assets/images/locations/soro-kshetra \
  public/assets/images/locations/prayaga

# Create icon assets directory
mkdir -p public/assets/icons

# Place .gitkeep in every location image folder so git tracks them
for dir in public/assets/images/locations/*/; do
  touch "${dir}.gitkeep"
done

# Verify: should print exactly 32 lines
ls public/assets/images/locations/ | wc -l
```

**Expected output of the final `wc -l` command:** `32`

**Why `public/` instead of `assets/`?** In a Vite project, the `public/` directory is served at the root URL without processing. Files in `public/` are copied verbatim to `dist/` during build. Image files referenced in `locations.js` as `images: ['assets/images/locations/...']` resolve to `public/assets/images/...` at development time and to `dist/assets/images/...` after build. This is different from the previous HTML-only project where `assets/` was at the root.

**Why `.gitkeep`?** Git tracks files, not directories. An empty folder will be ignored by git and will not exist after a fresh clone. Adding an empty `.gitkeep` file forces git to include the folder. When real photos are added in a later phase, the `.gitkeep` file can stay harmlessly or be deleted — it does not affect the gallery logic.

**Complete list of all files and directories that must exist after Section 2:**

```
gaur_yatra/
├── index.html
├── vite.config.js
├── package.json
├── package-lock.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/           ← empty directory, populated in Sections 4–7
│   ├── data/                 ← empty directory, populated in Section 3
│   ├── hooks/                ← empty directory, populated in Section 8
│   └── styles/
│       └── index.css         ← moved from src/index.css
├── public/
│   └── assets/
│       ├── icons/            ← populated in Section 9
│       └── images/
│           └── locations/
│               ├── arit-grama/.gitkeep
│               ├── radha-kunda/.gitkeep
│               ├── shyama-kunda/.gitkeep
│               ├── sumanas-lake/.gitkeep
│               ├── govardhana-hill/.gitkeep
│               ├── govardhana-village/.gitkeep
│               ├── brahma-kunda/.gitkeep
│               ├── annakuta-grama/.gitkeep
│               ├── ganthuli-grama/.gitkeep
│               ├── manasa-ganga/.gitkeep
│               ├── govinda-kunda/.gitkeep
│               ├── kamyavana/.gitkeep
│               ├── nandishvara/.gitkeep
│               ├── pavana-lake/.gitkeep
│               ├── khadiravana/.gitkeep
│               ├── seshashayi/.gitkeep
│               ├── khela-tirtha/.gitkeep
│               ├── bhandiravana/.gitkeep
│               ├── bhadravana/.gitkeep
│               ├── shrivana/.gitkeep
│               ├── lohavana/.gitkeep
│               ├── mahavana-gokula/.gitkeep
│               ├── mathura/.gitkeep
│               ├── akrura-tirtha/.gitkeep
│               ├── kaliya-daha/.gitkeep
│               ├── praskandana/.gitkeep
│               ├── dvadashaditya/.gitkeep
│               ├── keshi-tirtha/.gitkeep
│               ├── cira-ghata/.gitkeep
│               ├── tentuli-tala/.gitkeep
│               ├── soro-kshetra/.gitkeep
│               └── prayaga/.gitkeep
└── docs/
    └── planning/
        ├── gaur-yatra-plan.md
        └── phase-1-foundation.md
```

---

### Section 3: `src/main.jsx` and `src/styles/index.css` Entry Points

#### `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

// React 19 root API — replaces ReactDOM.render()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Note:** The CSS import `'./styles/index.css'` must point to the moved file. This is the single CSS entry point — Tailwind v4 and Leaflet CSS overrides both live here.

#### `src/styles/index.css`

**File path:** `src/styles/index.css`

This file provides the Tailwind v4 import, panel height calculations, scrollbar styles, verse card base styles, marker pulse animation, and Leaflet popup overrides. See Section 8 for the full file contents.

---

### Section 4: `src/data/locations.js` — All 32 Locations

**File path:** `src/data/locations.js`

This file is the single source of truth for all location data. It uses a named ES module export. All other modules import from this file — no globals.

**Key difference from v1:** Uses `export const locations = [...]` instead of `const locations = [...]`. The `id` field must exactly match the folder name under `public/assets/images/locations/<id>/`.

#### Schema Reference

Every location object must have all of these fields. Missing fields will cause errors in Phases 3 and 4.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Kebab-case unique identifier. Must match the folder name under `public/assets/images/locations/`. |
| `name` | String | Yes | English display name for UI rendering. |
| `nameDevanagari` | String | Yes | Devanagari script name for the right panel (location info section). |
| `journeyOrder` | Number | Yes | Integer 1–32. Used to sort the Polyline and for Play Journey sequencing. |
| `lat` | Number | Yes | Latitude in decimal degrees (WGS84). |
| `lng` | Number | Yes | Longitude in decimal degrees (WGS84). |
| `verses` | Array of String | Yes | Verse number strings matching entries in `verses.js`. Empty array `[]` if no verses are assigned yet. |
| `description` | String | Yes | 2–3 sentences of spiritual significance. Shown in the right panel (location info section). |
| `googleMapsUrl` | String | Yes | Pre-built URL: `"https://maps.google.com/?q=<lat>,<lng>"`. No API key needed. |
| `images` | Array of String | Yes | Relative paths to photos. Empty array `[]` until user adds real photos. The gallery shows a placeholder when this is empty. |

#### Full `src/data/locations.js` File

```javascript
// All 32 sacred locations from CC Madhya Lila Chapter 18.
// Coordinates are approximate and sourced from academic pilgrimage guides.
// A v2 refinement pass using Google Earth is planned (see open questions in master plan).
//
// IMPORTANT: The `id` field of each location must exactly match the folder name
// under public/assets/images/locations/<id>/ — the gallery module builds image paths from it.

export const locations = [
  {
    id: "arit-grama",
    name: "Arit-grama (Arith)",
    nameDevanagari: "अरिट ग्राम",
    journeyOrder: 1,
    lat: 27.5050,
    lng: 77.5300,
    verses: ["18.3"],
    description: "Arit-grama, also known as Arith, is the sacred village where Sri Chaitanya Mahaprabhu began His tour of Vraj Bhumi. According to the Caitanya Caritamrita, this is the location where Radha and Krishna performed Their Rasa dance. Mahaprabhu was overwhelmed with ecstatic love upon arriving here.",
    googleMapsUrl: "https://maps.google.com/?q=27.5050,77.5300",
    images: []
  },
  {
    id: "radha-kunda",
    name: "Radha-kunda",
    nameDevanagari: "राधा कुण्ड",
    journeyOrder: 2,
    lat: 27.5050,
    lng: 77.4640,
    verses: ["18.4", "18.5", "18.6", "18.7", "18.8", "18.9", "18.10", "18.11", "18.12", "18.13", "18.14"],
    description: "Radha-kunda is considered the most sacred lake in all of Vrindavan, personally identified by Sri Chaitanya Mahaprabhu during this visit. It is the bathing place of Srimati Radharani and is regarded as non-different from Her. Mahaprabhu bathed here and exhibited extreme ecstasy upon recognizing this supremely holy site.",
    googleMapsUrl: "https://maps.google.com/?q=27.5050,77.4640",
    images: []
  },
  {
    id: "shyama-kunda",
    name: "Shyama-kunda",
    nameDevanagari: "श्यामा कुण्ड",
    journeyOrder: 3,
    lat: 27.5055,
    lng: 77.4630,
    verses: ["18.5", "18.6"],
    description: "Shyama-kunda is Lord Krishna's own sacred lake, located immediately adjacent to Radha-kunda. Sri Chaitanya Mahaprabhu identified this lake as well during His ecstatic visit, and the two kundas together represent the eternal divine couple Radha and Krishna. The waters here are considered supremely purifying.",
    googleMapsUrl: "https://maps.google.com/?q=27.5055,77.4630",
    images: []
  },
  {
    id: "sumanas-lake",
    name: "Sumanas Lake",
    nameDevanagari: "सुमनस सरोवर",
    journeyOrder: 4,
    lat: 27.4950,
    lng: 77.4580,
    verses: ["18.15"],
    description: "Sumanas Lake is one of the sacred bodies of water on the Govardhana Hill circumambulation path. Mahaprabhu visited this lake as part of His parikrama of Govardhana, feeling deep ecstasy at each holy site connected with Krishna's pastimes. The lake is associated with ancient Vedic sages who performed austerities here.",
    googleMapsUrl: "https://maps.google.com/?q=27.4950,77.4580",
    images: []
  },
  {
    id: "govardhana-hill",
    name: "Govardhana Hill",
    nameDevanagari: "गोवर्धन गिरि",
    journeyOrder: 5,
    lat: 27.4940,
    lng: 77.4620,
    verses: [
      "18.15", "18.16", "18.17", "18.18", "18.19", "18.20", "18.21", "18.22",
      "18.23", "18.24", "18.25", "18.26", "18.27", "18.28", "18.29", "18.30",
      "18.31", "18.32", "18.33", "18.34", "18.35", "18.36", "18.37", "18.38",
      "18.39", "18.40", "18.41", "18.42", "18.43", "18.44", "18.45"
    ],
    description: "Govardhana Hill is one of the most sacred sites in all of Vraj Bhumi, the hill that Lord Krishna lifted on His finger for seven days to protect the residents of Vrindavan from Indra's devastating rains. Sri Chaitanya Mahaprabhu performed a full parikrama (circumambulation) of the entire hill while in a state of profound ecstatic love. He worshipped the hill as non-different from Krishna Himself.",
    googleMapsUrl: "https://maps.google.com/?q=27.4940,77.4620",
    images: []
  },
  {
    id: "govardhana-village",
    name: "Govardhana Village",
    nameDevanagari: "गोवर्धन ग्राम",
    journeyOrder: 6,
    lat: 27.4970,
    lng: 77.4670,
    verses: ["18.17", "18.18", "18.19", "18.20", "18.21", "18.22"],
    description: "Govardhana Village is the principal settlement at the foot of Govardhana Hill, home to the famous Harideva temple. Sri Chaitanya Mahaprabhu visited the Harideva deity here and was overwhelmed with emotion upon beholding this ancient form of the Lord. The village is a major pilgrimage hub for the Govardhana parikrama route.",
    googleMapsUrl: "https://maps.google.com/?q=27.4970,77.4670",
    images: []
  },
  {
    id: "brahma-kunda",
    name: "Brahma-kunda",
    nameDevanagari: "ब्रह्म कुण्ड",
    journeyOrder: 7,
    lat: 27.4940,
    lng: 77.4640,
    verses: ["18.21"],
    description: "Brahma-kunda is a sacred lake on the Govardhana parikrama path associated with Lord Brahma, the creator. It is said that Brahma himself came here to offer prayers to Lord Krishna. Sri Chaitanya Mahaprabhu passed through this site during His circumambulation of Govardhana Hill.",
    googleMapsUrl: "https://maps.google.com/?q=27.4940,77.4640",
    images: []
  },
  {
    id: "annakuta-grama",
    name: "Annakuta-grama",
    nameDevanagari: "अन्नकूट ग्राम",
    journeyOrder: 8,
    lat: 27.5070,
    lng: 77.4530,
    verses: ["18.26", "18.27", "18.28", "18.29", "18.30"],
    description: "Annakuta-grama is the village associated with the famous Annakuta festival, in which Lord Krishna instructed the residents of Vrindavan to offer a great mountain of food to Govardhana Hill rather than to Indra. Sri Chaitanya Mahaprabhu visited this place and felt deep connection with Krishna's childhood pastimes here.",
    googleMapsUrl: "https://maps.google.com/?q=27.5070,77.4530",
    images: []
  },
  {
    id: "ganthuli-grama",
    name: "Ganthuli-grama",
    nameDevanagari: "गाँठुली ग्राम",
    journeyOrder: 9,
    lat: 27.5100,
    lng: 77.4700,
    verses: ["18.29", "18.30", "18.31", "18.32", "18.33", "18.34", "18.35", "18.36"],
    description: "Ganthuli-grama is a sacred village in the Govardhana area associated with the Gopis' pastimes with Krishna. Sri Chaitanya Mahaprabhu was drawn to this place with great devotional intensity during His parikrama. The name of the village evokes the sound of the Gopis' ankle bells tinkling as they danced with the Lord.",
    googleMapsUrl: "https://maps.google.com/?q=27.5100,77.4700",
    images: []
  },
  {
    id: "manasa-ganga",
    name: "Manasa-ganga",
    nameDevanagari: "मानस गंगा",
    journeyOrder: 10,
    lat: 27.4960,
    lng: 77.4630,
    verses: ["18.32"],
    description: "Manasa-ganga is the sacred lake at the foot of Govardhana Hill, said to have been manifested by Lord Krishna from His mind (manasa). It is considered as holy as the Ganga river itself. Pilgrims performing the Govardhana parikrama traditionally bathe in Manasa-ganga before completing their circumambulation.",
    googleMapsUrl: "https://maps.google.com/?q=27.4960,77.4630",
    images: []
  },
  {
    id: "govinda-kunda",
    name: "Govinda-kunda",
    nameDevanagari: "गोविन्द कुण्ड",
    journeyOrder: 11,
    lat: 27.5000,
    lng: 77.4580,
    verses: ["18.35"],
    description: "Govinda-kunda is the sacred lake where Lord Indra came to bathe and offer apologies to Krishna after being defeated by the Govardhana Hill episode. Krishna bathed here as well, receiving the name 'Govinda' from Indra on this occasion. Sri Chaitanya Mahaprabhu visited this site with great reverence.",
    googleMapsUrl: "https://maps.google.com/?q=27.5000,77.4580",
    images: []
  },
  {
    id: "kamyavana",
    name: "Kamyavana",
    nameDevanagari: "काम्यवन",
    journeyOrder: 12,
    lat: 27.5430,
    lng: 77.4270,
    verses: ["18.55", "18.56", "18.57"],
    description: "Kamyavana, the 'forest of desires', is one of the twelve principal forests of Vrindavan and is associated with many of Krishna's transcendental pastimes. Sri Chaitanya Mahaprabhu visited this forest and experienced intense spiritual ecstasy, rolling on the ground and calling out the names of Krishna. Numerous sacred ponds and sites related to Radha-Krishna's forest pastimes are found here.",
    googleMapsUrl: "https://maps.google.com/?q=27.5430,77.4270",
    images: []
  },
  {
    id: "nandishvara",
    name: "Nandishvara (Nandgaon)",
    nameDevanagari: "नन्दीश्वर",
    journeyOrder: 13,
    lat: 27.5710,
    lng: 77.3780,
    verses: ["18.57"],
    description: "Nandishvara, also known as Nandgaon, is the village of Nanda Maharaja — Lord Krishna's foster father. The large hill here is called Nanda-bhavan, where Krishna spent His childhood years. Sri Chaitanya Mahaprabhu arrived here feeling the village to be as good as Vaikuntha, the spiritual world, overwhelmed with feelings of parental love for Krishna.",
    googleMapsUrl: "https://maps.google.com/?q=27.5710,77.3780",
    images: []
  },
  {
    id: "pavana-lake",
    name: "Pavana Lake",
    nameDevanagari: "पावन सरोवर",
    journeyOrder: 14,
    lat: 27.5700,
    lng: 77.3790,
    verses: ["18.58"],
    description: "Pavana Lake (Pavana Sarovara) is the sacred lake near Nandgaon where Nanda Maharaja used to bring the young Krishna to bathe. It is said that simply hearing the name of this lake or bathing in its waters purifies one of all sins. Sri Chaitanya Mahaprabhu bathed in this lake and felt himself in direct contact with Krishna's childhood pastimes.",
    googleMapsUrl: "https://maps.google.com/?q=27.5700,77.3790",
    images: []
  },
  {
    id: "khadiravana",
    name: "Khadiravana",
    nameDevanagari: "खदिरवन",
    journeyOrder: 15,
    lat: 27.5300,
    lng: 77.4100,
    verses: ["18.63"],
    description: "Khadiravana is one of the twelve forests of Vrindavan, named after the khadira (acacia) trees that grow here. Krishna is said to have sported in this forest with the Gopis. Sri Chaitanya Mahaprabhu passed through Khadiravana during His tour of the twelve forests of Vrindavan, experiencing transcendental bliss at each step.",
    googleMapsUrl: "https://maps.google.com/?q=27.5300,77.4100",
    images: []
  },
  {
    id: "seshashayi",
    name: "Seshashayi",
    nameDevanagari: "शेषशायी",
    journeyOrder: 16,
    lat: 27.5050,
    lng: 77.6700,
    verses: ["18.64"],
    description: "Seshashayi is the sacred site where a deity of Lord Vishnu reclining on Sesha (the divine serpent) is worshipped. It commemorates the cosmic form of the Lord reposing on the waters of the Causal Ocean. Sri Chaitanya Mahaprabhu visited this ancient temple site with great devotion during His Vraj parikrama.",
    googleMapsUrl: "https://maps.google.com/?q=27.5050,77.6700",
    images: []
  },
  {
    id: "khela-tirtha",
    name: "Khela-tirtha",
    nameDevanagari: "खेला तीर्थ",
    journeyOrder: 17,
    lat: 27.5100,
    lng: 77.5800,
    verses: ["18.66"],
    description: "Khela-tirtha is the sacred bathing place associated with the pastimes (khela means 'play') of Lord Krishna and His cowherd friends. It is one of the important tirthas along the Yamuna river in the Vrindavan region. Mahaprabhu stopped here during His pilgrimage through the twelve forests of Vraj.",
    googleMapsUrl: "https://maps.google.com/?q=27.5100,77.5800",
    images: []
  },
  {
    id: "bhandiravana",
    name: "Bhandiravana",
    nameDevanagari: "भाण्डीरवन",
    journeyOrder: 18,
    lat: 27.5580,
    lng: 77.5200,
    verses: ["18.66"],
    description: "Bhandiravana is named after the ancient Bhandira banyan tree, one of the most sacred trees in all of Vraj Bhumi. Under this tree, Lord Brahma performed the cosmic marriage ceremony of Radha and Krishna. Sri Chaitanya Mahaprabhu embraced the Bhandira tree in ecstasy, calling it non-different from Krishna Himself.",
    googleMapsUrl: "https://maps.google.com/?q=27.5580,77.5200",
    images: []
  },
  {
    id: "bhadravana",
    name: "Bhadravana",
    nameDevanagari: "भद्रवन",
    journeyOrder: 19,
    lat: 27.5700,
    lng: 77.5500,
    verses: ["18.66"],
    description: "Bhadravana is one of the twelve principal forests of Vrindavan, meaning the 'auspicious forest'. It is associated with Krishna's pastimes with His cowherd friends and the Gopis. Sri Chaitanya Mahaprabhu visited this forest as part of His parikrama of all twelve forests of Vraj.",
    googleMapsUrl: "https://maps.google.com/?q=27.5700,77.5500",
    images: []
  },
  {
    id: "shrivana",
    name: "Shrivana",
    nameDevanagari: "श्रीवन",
    journeyOrder: 20,
    lat: 27.5200,
    lng: 77.5600,
    verses: ["18.67"],
    description: "Shrivana, the 'forest of Sri (Lakshmi)', is one of the twelve forests of Vrindavan. According to scriptural tradition, Goddess Lakshmi herself performed austerities here to attain the association of Lord Krishna in His Vrindavan pastimes. Sri Chaitanya Mahaprabhu experienced deep spiritual emotions while traversing this forest.",
    googleMapsUrl: "https://maps.google.com/?q=27.5200,77.5600",
    images: []
  },
  {
    id: "lohavana",
    name: "Lohavana",
    nameDevanagari: "लोहवन",
    journeyOrder: 21,
    lat: 27.5600,
    lng: 77.5800,
    verses: ["18.67"],
    description: "Lohavana is one of the twelve forests of Vrindavan where the demon Lohajangha was killed by Krishna. The forest is sacred as a site of one of Krishna's heroic childhood pastimes protecting the residents of Vraj. Sri Chaitanya Mahaprabhu visited Lohavana as part of His complete parikrama of all twelve forests.",
    googleMapsUrl: "https://maps.google.com/?q=27.5600,77.5800",
    images: []
  },
  {
    id: "mahavana-gokula",
    name: "Mahavana / Gokula",
    nameDevanagari: "महावन / गोकुल",
    journeyOrder: 22,
    lat: 27.4550,
    lng: 77.7100,
    verses: ["18.67", "18.68"],
    description: "Mahavana, also known as Gokula, is the site of Krishna's very first childhood pastimes — where He was brought immediately after His birth in Mathura and raised by Nanda and Yashoda Maharani. This great forest is the oldest of the twelve Vraj forests. Sri Chaitanya Mahaprabhu visited the birthplace of Krishna's earliest and most intimate childhood pastimes.",
    googleMapsUrl: "https://maps.google.com/?q=27.4550,77.7100",
    images: []
  },
  {
    id: "mathura",
    name: "Mathura",
    nameDevanagari: "मथुरा",
    journeyOrder: 23,
    lat: 27.5020,
    lng: 77.6870,
    verses: ["18.69"],
    description: "Mathura is the most sacred city in Vraj Bhumi — the actual birthplace of Lord Sri Krishna, who appeared here in the prison cell of Kamsa's palace to His parents Devaki and Vasudeva. Sri Chaitanya Mahaprabhu was deeply moved upon visiting the birthplace of the Lord, experiencing the highest levels of ecstatic love.",
    googleMapsUrl: "https://maps.google.com/?q=27.5020,77.6870",
    images: []
  },
  {
    id: "akrura-tirtha",
    name: "Akrura-tirtha",
    nameDevanagari: "अक्रूर तीर्थ",
    journeyOrder: 24,
    lat: 27.5100,
    lng: 77.6800,
    verses: ["18.70", "18.71", "18.72", "18.73", "18.74", "18.75", "18.76", "18.77", "18.78"],
    description: "Akrura-tirtha is the sacred bathing ghat on the Yamuna where Akrura, the devotee who came to escort Krishna from Vrindavan to Mathura, bathed and had a transcendental vision of Krishna and Balarama within the waters. It is one of the most sacred ghats of Mathura. Sri Chaitanya Mahaprabhu bathed here and was transported into ecstasy.",
    googleMapsUrl: "https://maps.google.com/?q=27.5100,77.6800",
    images: []
  },
  {
    id: "kaliya-daha",
    name: "Kaliya Lake",
    nameDevanagari: "कालिय दह",
    journeyOrder: 25,
    lat: 27.5810,
    lng: 77.7000,
    verses: ["18.71"],
    description: "Kaliya-daha is the deep pool in the Yamuna river where the multi-hooded serpent Kaliya resided and was poisoning the Yamuna with his venom. Lord Krishna dove into the pool, defeated Kaliya in a dramatic battle, and danced on the serpent's many hoods, ultimately showing mercy and sending him to Ramanaka-dvipa. Sri Chaitanya Mahaprabhu stood at this site in ecstatic remembrance of Krishna's pastime.",
    googleMapsUrl: "https://maps.google.com/?q=27.5810,77.7000",
    images: []
  },
  {
    id: "praskandana",
    name: "Praskandana",
    nameDevanagari: "प्रस्कन्दन",
    journeyOrder: 26,
    lat: 27.5750,
    lng: 77.6950,
    verses: ["18.71"],
    description: "Praskandana is one of the sacred tirthas along the Yamuna in the Mathura-Vrindavan region, associated with Vedic traditions of ritual bathing and purification. Sri Chaitanya Mahaprabhu visited this tirtha as part of His comprehensive pilgrimage through all the sacred sites of Vraj Bhumi described in the scriptures.",
    googleMapsUrl: "https://maps.google.com/?q=27.5750,77.6950",
    images: []
  },
  {
    id: "dvadashaditya",
    name: "Dvadashaditya",
    nameDevanagari: "द्वादशादित्य",
    journeyOrder: 27,
    lat: 27.5850,
    lng: 77.6950,
    verses: ["18.72"],
    description: "Dvadashaditya (meaning 'twelve suns') is a sacred tirtha in Mathura associated with the worship of the twelve Adityas (solar deities). Ancient tradition holds that the twelve Adityas came here to worship Lord Krishna. Sri Chaitanya Mahaprabhu visited this site during His comprehensive pilgrimage of the Mathura sacred sites.",
    googleMapsUrl: "https://maps.google.com/?q=27.5850,77.6950",
    images: []
  },
  {
    id: "keshi-tirtha",
    name: "Keshi-tirtha",
    nameDevanagari: "केशी तीर्थ",
    journeyOrder: 28,
    lat: 27.5830,
    lng: 77.7020,
    verses: ["18.72", "18.73", "18.74"],
    description: "Keshi-tirtha is named after the demon Keshi, who was sent by Kamsa in the form of a wild horse to kill Krishna but was instead killed by the Lord. The spot where Keshi was slain and where Krishna subsequently bathed has become a sacred tirtha on the Yamuna. After this victory, Krishna received the name 'Keshava'. Mahaprabhu visited this site with great devotion.",
    googleMapsUrl: "https://maps.google.com/?q=27.5830,77.7020",
    images: []
  },
  {
    id: "cira-ghata",
    name: "Cira-ghata",
    nameDevanagari: "चीर घाट",
    journeyOrder: 29,
    lat: 27.5790,
    lng: 77.7000,
    verses: ["18.75"],
    description: "Cira-ghata (the 'ghat of stolen garments') is the famous bathing place on the Yamuna where Lord Krishna stole the garments of the young Gopis who were bathing and climbed a Kadamba tree, playfully requiring them to come forward to retrieve their clothes. This humorous and deeply spiritual pastime demonstrated the importance of full surrender to the Lord. Sri Chaitanya Mahaprabhu visited this sacred site.",
    googleMapsUrl: "https://maps.google.com/?q=27.5790,77.7000",
    images: []
  },
  {
    id: "tentuli-tala",
    name: "Tentuli-tala (Amli-tala)",
    nameDevanagari: "तेँतुली तल",
    journeyOrder: 30,
    lat: 27.5825,
    lng: 77.7010,
    verses: ["18.75", "18.76", "18.77", "18.78"],
    description: "Tentuli-tala, also known as Amli-tala, is named after the tamarind (tentuli/amli) tree under which Lord Krishna used to sit and play His flute, calling the Gopis to the Rasa dance. The sweet and slightly sour tamarind is said to represent the mixture of separation and union experienced in the Gopis' love for Krishna. Sri Chaitanya Mahaprabhu embraced the tamarind tree here in great ecstasy.",
    googleMapsUrl: "https://maps.google.com/?q=27.5825,77.7010",
    images: []
  },
  {
    id: "soro-kshetra",
    name: "Soro-kshetra",
    nameDevanagari: "सोरो क्षेत्र",
    journeyOrder: 31,
    lat: 27.8850,
    lng: 79.7300,
    verses: ["18.214"],
    description: "Soro-kshetra is a sacred pilgrimage site located beyond the main Vraj Bhumi region. Sri Chaitanya Mahaprabhu visited this place on His way back from Vraj Bhumi. It is associated with ancient Vedic tirthas and traditions. The location marks the transition of the journey from the Vrindavan region toward Prayaga.",
    googleMapsUrl: "https://maps.google.com/?q=27.8850,79.7300",
    images: []
  },
  {
    id: "prayaga",
    name: "Prayaga (Allahabad)",
    nameDevanagari: "प्रयाग",
    journeyOrder: 32,
    lat: 25.4358,
    lng: 81.8463,
    verses: ["18.214", "18.215", "18.216", "18.217", "18.218", "18.219", "18.220", "18.221", "18.222"],
    description: "Prayaga (modern Allahabad, now Prayagraj) is located at the Triveni Sangam — the confluence of the Ganga, Yamuna, and the invisible Sarasvati rivers. It is one of the holiest tirthas in all of India. Sri Chaitanya Mahaprabhu concluded this leg of His pilgrimage at Prayaga, where He met Rupa Goswami and instructed him for ten days, transmitting the entire science of devotional service.",
    googleMapsUrl: "https://maps.google.com/?q=25.4358,81.8463",
    images: []
  }
];
```

---

### Section 5: `src/data/verses.js` and `src/hooks/useJourney.js` — Stubs

These files must be created in Phase 1 so the import paths in `App.jsx` and other components are valid and no module resolution errors are thrown.

#### `src/data/verses.js` (stub)

```javascript
// Stub — populated in Phase 2 with scraped Vedabase data
// Each verse object has: id, number, verseType, sanskrit, translation, locationId
export const verses = [];
```

#### `src/hooks/useJourney.js` (stub)

```javascript
// Custom hook for the Play Journey animation sequence.
// Wired in Phase 4: manages currentStep, isPlaying state, setInterval logic,
// advancing through locations in journeyOrder, calling onLocationChange callback.
export default function useJourney(_locations, _onLocationChange) {
  // Phase 4 implementation goes here.
  return {
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    currentLocationName: '',
    start: () => {},
    pause: () => {},
    stop: () => {},
  };
}
```

---

### Section 6: `src/App.jsx` — Root Component

**File path:** `src/App.jsx`

`App.jsx` is the single source of state for the selected location and selected verse. It passes `selectedLocationId`, `setSelectedLocationId`, `selectedVerseId`, and `setSelectedVerseId` down to child components that need them. For Phase 1, most children are stubs — the layout and state wiring must be correct so Phases 2–3 can add interactivity without restructuring.

```jsx
import { useState } from 'react'
import Header from './components/Header.jsx'
import VersePanel from './components/VersePanel.jsx'
import MapView from './components/MapView.jsx'
import GalleryPanel from './components/GalleryPanel.jsx'
import BottomPanel from './components/BottomPanel.jsx'

export default function App() {
  // selectedLocationId is the join key across all panels.
  // null = nothing selected. Set to a location id string when user clicks a marker or verse.
  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const [selectedVerseId, setSelectedVerseId] = useState(null)

  return (
    // flex flex-col h-screen: stacks header, main row, footer vertically
    // overflow-hidden: prevents document-level scroll — only panels scroll internally
    <div className="flex flex-col h-screen overflow-hidden bg-stone-950 text-stone-100">

      <Header />

      {/* flex-1: main row fills all height between header (56px) and bottom panel (120px) */}
      {/* overflow-hidden: prevents flex children from overflowing the viewport */}
      <main className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL: Verse list — 20% width, scrolls independently */}
        <VersePanel
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
          selectedVerseId={selectedVerseId}
          setSelectedVerseId={setSelectedVerseId}
        />

        {/* CENTER PANEL: Map — 55% width */}
        {/* MapView needs selectedLocationId to highlight the active marker in Phase 3 */}
        <MapView
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
        />

        {/* RIGHT PANEL: Photo gallery + location info — 25% width */}
        <GalleryPanel
          selectedLocationId={selectedLocationId}
        />

      </main>

      {/* BOTTOM PANEL: Verse reader — fixed 120px height */}
      <BottomPanel
        selectedVerseId={selectedVerseId}
        setSelectedVerseId={setSelectedVerseId}
      />

    </div>
  )
}
```

**Key layout decisions:**

| Decision | Rationale |
|----------|-----------|
| `h-screen overflow-hidden` on root div | Prevents the page from ever scrolling at the document level. Only `<VersePanel>` and `<GalleryPanel>` scroll internally. |
| `flex flex-col` on root div | Stacks `<Header>`, `<main>`, `<BottomPanel>` vertically so each takes its correct slice of the viewport. |
| `flex-1` on `<main>` | Tells the main row to fill all remaining height between the 56px header and 120px footer. |
| `overflow-hidden` on `<main>` | Without this, flex children may expand past the viewport and create a document-level scrollbar. |
| Props pattern: `selectedLocationId` + `selectedVerseId` with setters | The map, verse panel, and bottom panel all need to read and/or set the selected location and verse. Lifting both states to `App.jsx` keeps a single source of truth without needing a state library in Phase 1. |

---

### Section 7: `src/components/MapView.jsx` — React-Leaflet Map

**File path:** `src/components/MapView.jsx`

This is the most critical component in Phase 1. It renders the interactive map using React-Leaflet components verified against the official React-Leaflet documentation.

#### React-Leaflet API Used (verified via Context7)

| Component/Hook | Import | Purpose |
|---------------|--------|---------|
| `MapContainer` | `react-leaflet` | Wrapper that creates the Leaflet map instance. Props: `center`, `zoom`, `style`. |
| `TileLayer` | `react-leaflet` | Renders OpenStreetMap tiles. Props: `url`, `attribution`, `maxZoom`. |
| `Marker` | `react-leaflet` | Places a pin at a geographic position. Props: `position`, `icon`. |
| `Popup` | `react-leaflet` | Renders a popup bubble inside a `Marker`. Appears on marker click. |
| `Polyline` | `react-leaflet` | Draws a line through an array of positions. Props: `positions`, `pathOptions` (object with `color`, `weight`, `opacity`, etc.). |
| `useMap` | `react-leaflet` | Hook that returns the Leaflet map instance — used by child components for `flyTo()`, `setZoom()` etc. Must be called inside a component that is a descendant of `MapContainer`. |
| `L.icon()` | `leaflet` (the `L` object) | Creates a custom icon object passed to each `<Marker icon={...}>`. |

**Critical: Leaflet CSS import.** React-Leaflet does not automatically include Leaflet's CSS. Without it, tiles display broken and marker positions are incorrect. Import it directly in `MapView.jsx` (not just in `index.css`) so the dependency is co-located with the component that needs it.

#### Map Initialization Decisions

| Parameter | Value | Reason |
|-----------|-------|--------|
| Center | `[27.5, 77.65]` | Geographic midpoint of the entire journey including Prayaga and Mathura outliers. Places the core Vrindavan/Govardhana cluster slightly left-of-center, which works well at zoom 12. |
| Zoom | `12` | At zoom 12, the Govardhana/Vrindavan/Radha-kunda cluster is clearly legible without marker overlap. Soro-kshetra and Prayaga appear as off-screen pins accessible by panning. |
| Max zoom | `18` | OpenStreetMap supports zoom levels up to 19, but 18 is a safe practical maximum for this region. |
| `style` prop | `{ height: '100%', width: '100%' }` | React-Leaflet's `<MapContainer>` requires an explicit height. Using 100% works because the parent `<div>` in `MapView.jsx` has a concrete height set via `calc()` in `index.css`. |

#### Custom Icon Decisions

`L.icon()` creates a custom icon object passed to each `<Marker icon={chaitanyaIcon}>`. Here is what each parameter controls:

| Parameter | Value | Explanation |
|-----------|-------|-------------|
| `iconUrl` | `` `${import.meta.env.BASE_URL}assets/icons/chaitanya-marker.svg` `` | Uses `import.meta.env.BASE_URL` so the path resolves to `/` in dev and `/gaur-yatra/` in production. This ensures the icon loads correctly both locally and on GitHub Pages. |
| `iconSize` | `[32, 32]` | Width and height in pixels. 32x32 is legible at all zoom levels without crowding nearby markers. |
| `iconAnchor` | `[16, 32]` | The pixel within the icon that maps to the marker's geographic coordinate. `[16, 32]` = center-bottom of a 32x32 icon — the bottom tip sits exactly on the coordinate point. |
| `popupAnchor` | `[0, -34]` | Offset from `iconAnchor` where the popup opens. `-34` on Y = above the icon, so the popup does not overlap the marker. |

#### Polyline Design Decisions

| Property | Value | Reason |
|----------|-------|--------|
| `color` | `'#FF6B35'` | Saffron-orange — spiritually resonant with the devotional context. High contrast against OpenStreetMap tile backgrounds. |
| `weight` | `2.5` | Thick enough to be visible at all zoom levels without obscuring map features beneath. |
| `opacity` | `0.7` | Slightly transparent so road and geographic features remain readable under the path. |
| Sort key | `journeyOrder` | The `positions` array passed to `<Polyline>` must be sorted by `journeyOrder` to draw the correct chronological path. Never assume `locations` array insertion order matches journey order. |

#### `MapController` Sub-Component Pattern

`useMap()` can only be called inside a component rendered as a descendant of `<MapContainer>`. To expose programmatic map control (needed in Phase 3 for `flyTo()`), a `<MapController>` component is rendered inside `<MapContainer>`. In Phase 1 it is a no-op — the pattern is established so Phase 3 does not require structural changes.

#### Full `src/components/MapView.jsx` File

```jsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet'
// Leaflet CSS MUST be imported here (or in main.jsx) — without it tiles and
// marker positions break. React-Leaflet does not include this automatically.
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { locations } from '../data/locations.js'

// Custom icon — uses the SVG placeholder in public/assets/icons/.
// iconAnchor [16, 32]: bottom-center of the 32x32 icon sits on the coordinate.
// popupAnchor [0, -34]: popup opens above the icon, not overlapping it.
const chaitanyaIcon = L.icon({
  iconUrl: `${import.meta.env.BASE_URL}assets/icons/chaitanya-marker.svg`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
})

// Sort locations by journeyOrder for the Polyline positions array.
// Using [...locations] (spread copy) to avoid mutating the imported array.
const journeyPath = [...locations]
  .sort((a, b) => a.journeyOrder - b.journeyOrder)
  .map((loc) => [loc.lat, loc.lng])

// MapController is rendered inside MapContainer so it can call useMap().
// In Phase 1 it is a no-op. Phase 3 will use it to call map.flyTo() on location select.
// Props: selectedLocationId — used in Phase 3 to trigger flyTo when selection changes.
function MapController({ selectedLocationId: _selectedLocationId }) {
  // useMap() establishes the hook — Phase 3 adds flyTo logic
  useMap()
  return null
}

export default function MapView({ selectedLocationId, setSelectedLocationId }) {
  return (
    // w-[55%]: takes 55% of the main row width
    // The .map-view-column CSS class in index.css sets height via calc()
    // React-Leaflet needs an explicit pixel height — percentage height only works
    // if the parent has an explicit height. The class handles this.
    <div className="w-[55%] map-view-column">
      <MapContainer
        center={[27.5, 77.65]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap tile layer — no API key required.
            Attribution text is legally required by the ODbL license. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Render one Marker per location */}
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={chaitanyaIcon}
            title={loc.name}
            eventHandlers={{
              // In Phase 1: clicking a marker just opens the popup.
              // In Phase 3: replace this with setSelectedLocationId(loc.id).
              click: () => {
                setSelectedLocationId(loc.id)
              },
            }}
          >
            {/* Popup shows name + verse range. Styled via Leaflet override CSS in index.css */}
            <Popup>
              <strong>{loc.name}</strong>
              <br />
              <span style={{ fontSize: '0.7rem', color: '#d97706' }}>
                Verses: {loc.verses.join(', ')}
              </span>
            </Popup>
          </Marker>
        ))}

        {/* Polyline connects all 32 locations in journeyOrder sequence.
            positions array is pre-sorted above (outside component) so it
            does not recompute on every render. */}
        <Polyline
          positions={journeyPath}
          pathOptions={{ color: '#FF6B35', weight: 2.5, opacity: 0.7 }}
        />

        {/* MapController must be inside MapContainer to use useMap() hook.
            Receives selectedLocationId for Phase 3 flyTo logic. */}
        <MapController selectedLocationId={selectedLocationId} />

      </MapContainer>
    </div>
  )
}
```

**Why `journeyPath` is computed outside the component:** Sorting and mapping 32 items on every render would be wasteful. Since `locations` is a static import that never changes, computing `journeyPath` at module load time means it is computed exactly once for the lifetime of the app.

---

### Section 8: Stub Components

These four components must be created in Phase 1 so `App.jsx` can import them without errors. They render placeholder content only — wired in Phases 2, 3, and 4.

#### `src/components/Header.jsx`

```jsx
export default function Header() {
  return (
    // h-14 = 56px. This exact value is used in calc() in index.css.
    // If header height changes, update the CSS calc() values to match.
    // shrink-0: prevents flex from compressing the header when viewport is small.
    <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-amber-900 border-b border-amber-700 z-10">

      <h1 className="text-amber-100 font-semibold text-lg tracking-wide">
        Gaur Yatra
        <span className="text-amber-300 text-sm font-normal ml-2">
          — Chaitanya Mahaprabhu&apos;s Journey Through Vraj Bhumi
        </span>
      </h1>

      {/* Play/Pause controls — disabled in Phase 1; wired in Phase 4 */}
      <div className="flex items-center gap-3">
        <span id="journey-progress" className="text-amber-300 text-sm hidden">
          Location 0 / 32
        </span>
        <button
          disabled
          aria-label="Play journey"
          className="px-3 py-1 rounded bg-amber-700 text-amber-100 text-sm font-medium
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-amber-600 transition-colors"
        >
          Play Journey &#9654;
        </button>
        <button
          disabled
          aria-label="Pause journey"
          className="px-3 py-1 rounded bg-amber-700 text-amber-100 text-sm font-medium
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-amber-600 transition-colors"
        >
          Pause &#9646;&#9646;
        </button>
      </div>

    </header>
  )
}
```

#### `src/components/VersePanel.jsx`

```jsx
// STUB — Phase 1 placeholder only.
// Phase 2 will replace the placeholder with rendered verse cards grouped by location.
// Props accepted now (even as stubs) so App.jsx prop drilling is established.
export default function VersePanel({ selectedLocationId: _selectedLocationId, setSelectedLocationId: _setSelectedLocationId, selectedVerseId: _selectedVerseId, setSelectedVerseId: _setSelectedVerseId }) {
  return (
    // w-1/5: 20% of the main row
    // verse-panel-column CSS class in index.css sets calc() height and scrollbar
    <div className="w-1/5 verse-panel-column overflow-y-auto bg-stone-900 border-r border-stone-700 p-3">
      <p className="text-stone-500 text-sm italic p-4">
        Verses grouped by location...
      </p>
    </div>
  )
}
```

#### `src/components/GalleryPanel.jsx`

```jsx
// STUB — Phase 1 placeholder only.
// Phase 4 will replace the placeholder with photo gallery + location info
// (name, Devanagari, description, Google Maps link).
export default function GalleryPanel({ selectedLocationId: _selectedLocationId }) {
  return (
    // w-1/4: 25% of the main row
    // gallery-panel-column CSS class in index.css sets calc() height
    <div className="w-1/4 gallery-panel-column overflow-y-auto bg-stone-900 border-l border-stone-700 p-3">
      <p className="text-stone-500 text-sm italic p-4">
        Gallery coming...
      </p>
    </div>
  )
}
```

#### `src/components/BottomPanel.jsx`

```jsx
// STUB — Phase 1 placeholder only.
// Phase 3 will populate this as a verse reader showing Sanskrit + translation
// with prev/next navigation through all 229 verses.
export default function BottomPanel({ selectedVerseId: _selectedVerseId, setSelectedVerseId: _setSelectedVerseId }) {
  return (
    // h-[120px]: fixed 120px height. shrink-0: never compressed by flex.
    // This exact value is used in calc() in index.css.
    <footer className="h-[120px] shrink-0 bg-stone-900 border-t border-stone-700 flex items-center px-6">
      <p className="text-stone-500 text-sm italic">
        Select a verse to read...
      </p>
    </footer>
  )
}
```

---

### Section 9: `src/styles/index.css` — Tailwind v4 + Custom CSS

**File path:** `src/styles/index.css`

This file has two responsibilities: (1) load Tailwind CSS v4, (2) provide styles that Tailwind utility classes cannot express cleanly — complex `calc()` heights, custom scrollbar appearance, CSS keyframe animations, and Leaflet popup overrides.

**Tailwind v4 import syntax:** Tailwind CSS v4 uses `@import "tailwindcss"` — this replaces all three of the v3 directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`). There is no `tailwind.config.js` in v4. Content scanning is automatic.

```css
/* ================================================================
   TAILWIND CSS v4
   Single @import replaces the three @tailwind directives from v3.
   The @tailwindcss/vite plugin intercepts this import and handles
   JIT compilation, content scanning, and HMR automatically.
   DO NOT use @tailwind base / components / utilities syntax here —
   that is the v3 approach and will not work with @tailwindcss/vite.
   ================================================================ */
@import "tailwindcss";

/* ================================================================
   PANEL HEIGHT CALCULATIONS
   Header: 56px (h-14). Bottom panel: 120px (h-[120px]).
   All three columns must fill exactly: 100vh - 56px - 120px = calc(100vh - 176px).

   React-Leaflet's <MapContainer> requires an explicit non-percentage height.
   Setting height: 100% on MapContainer works here because its parent
   (.map-view-column) has a concrete pixel height from calc().
   ================================================================ */

/* Applied to the left panel column wrapper in VersePanel.jsx */
.verse-panel-column {
  height: calc(100vh - 176px); /* 176px = 56px header + 120px footer */
}

/* Applied to the center map column wrapper in MapView.jsx */
.map-view-column {
  height: calc(100vh - 176px);
}

/* Applied to the right panel column wrapper in GalleryPanel.jsx */
.gallery-panel-column {
  height: calc(100vh - 176px);
}

/* ================================================================
   LEFT PANEL SCROLLBAR STYLING
   Webkit-based browsers (Chrome, Safari, Edge) support custom scrollbars.
   Firefox uses the scrollbar-* standard properties.
   ================================================================ */

.verse-panel-column::-webkit-scrollbar {
  width: 6px;
}

.verse-panel-column::-webkit-scrollbar-track {
  background: #1c1917; /* stone-900 */
}

.verse-panel-column::-webkit-scrollbar-thumb {
  background: #78350f; /* amber-900 */
  border-radius: 3px;
}

.verse-panel-column::-webkit-scrollbar-thumb:hover {
  background: #92400e; /* amber-800 */
}

/* Firefox scrollbar */
.verse-panel-column {
  scrollbar-width: thin;
  scrollbar-color: #78350f #1c1917;
}

/* ================================================================
   VERSE CARD BASE STYLES
   Used in Phase 2 when VersePanel renders verse cards.
   Defined here in Phase 1 so the styles are ready to use immediately.
   ================================================================ */

.verse-card {
  padding: 10px 12px;
  margin-bottom: 6px;
  border-radius: 6px;
  background-color: #1c1917; /* stone-900 */
  border: 1px solid #292524; /* stone-800 */
  cursor: default;
  transition: background-color 0.2s ease;
}

/* Verse has an associated location — make it look interactive */
.verse-card--has-location {
  cursor: pointer;
  border-left: 3px solid #b45309; /* amber-700 */
}

.verse-card--has-location:hover {
  background-color: #292524; /* stone-800 */
}

/* Active verse state: when a location is selected, these verses are highlighted */
.verse-card--active {
  background-color: #451a03; /* amber-950 */
  border-color: #d97706; /* amber-600 */
}

.verse-number {
  font-size: 0.7rem;
  font-weight: 600;
  color: #d97706; /* amber-600 */
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.verse-text {
  font-size: 0.8rem;
  color: #d6d3d1; /* stone-300 */
  line-height: 1.5;
}

/* Location badge shown on verse cards that have a locationId */
.verse-location-badge {
  display: inline-block;
  margin-top: 5px;
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 9999px;
  background-color: #78350f; /* amber-900 */
  color: #fde68a; /* amber-200 */
  font-weight: 500;
}

/* ================================================================
   MARKER PULSE ANIMATION
   Used in Phase 3 when a location is selected — the marker on the
   map pulses to draw attention to it.
   Applied in Phase 3 by adding/removing the 'marker-pulse' class
   to the marker's DOM element via the Leaflet marker ref.
   ================================================================ */

@keyframes markerPulse {
  0% {
    transform: scale(1);
    filter: brightness(1) drop-shadow(0 0 0px #f59e0b);
  }
  50% {
    transform: scale(1.25);
    filter: brightness(1.4) drop-shadow(0 0 8px #f59e0b);
  }
  100% {
    transform: scale(1);
    filter: brightness(1) drop-shadow(0 0 0px #f59e0b);
  }
}

.marker-pulse img {
  animation: markerPulse 0.8s ease-in-out 3; /* pulse 3 times then stop */
}

/* ================================================================
   LEAFLET POPUP OVERRIDES
   Leaflet injects its own popup HTML — these rules theme it to match
   the dark color palette of the application.
   ================================================================ */

.leaflet-popup-content-wrapper {
  background-color: #1c1917; /* stone-900 */
  color: #fde68a; /* amber-200 */
  border: 1px solid #78350f; /* amber-900 */
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.leaflet-popup-tip {
  background-color: #1c1917;
}

.leaflet-popup-content {
  font-size: 0.8rem;
  font-weight: 600;
  margin: 8px 12px;
  line-height: 1.4;
}

/* Leaflet's close button color */
.leaflet-popup-close-button {
  color: #d97706 !important;
}
```

---

### Section 10: Placeholder Marker Icon

**File path:** `public/assets/icons/chaitanya-marker.svg`

Leaflet requires that `iconUrl` resolves to a valid image file. Using an inline-generated SVG avoids any external dependency. Create this file with the following content:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <!-- Outer glow ring -->
  <circle cx="16" cy="16" r="14" fill="#FF6B35" opacity="0.3"/>
  <!-- Main circle -->
  <circle cx="16" cy="16" r="10" fill="#FF6B35" stroke="#FDE68A" stroke-width="2"/>
  <!-- Inner dot — represents the sacred location point -->
  <circle cx="16" cy="16" r="3" fill="#FDE68A"/>
</svg>
```

**Why `public/` for the SVG?** Files in `public/` are served at the root URL path during development and copied verbatim to `dist/` during build. Since `L.icon({ iconUrl: ... })` is a runtime URL (not a Vite import), Vite cannot process it as a module. It must be in `public/` so it resolves correctly at runtime. The `import.meta.env.BASE_URL` prefix ensures the path works both in dev (`/`) and production (`/gaur-yatra/`).

**Note on the final PNG icon:** When the real Chaitanya Mahaprabhu marker PNG is ready in Phase 5, update the `iconUrl` in `MapView.jsx` to `'/assets/icons/chaitanya-marker.png'` and adjust `iconSize` to match the PNG dimensions (expected `[40, 50]` per the master plan).

---

### Section 11: Dev Server + Build Verification

#### Start the Dev Server

```bash
npm run dev
```

Vite starts on `http://localhost:5173` (default port). Hot Module Replacement is active — changes to `.jsx` and `.css` files update the browser instantly without a full reload.

**Expected terminal output:**
```
  VITE v5.x.x  ready in X ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

#### Verify the Build

```bash
npm run build
```

Vite compiles the project to `dist/`. Open `dist/index.html` in a text editor and verify that all asset `src` and `href` attributes start with `/gaur-yatra/`:

```html
<!-- Correct — base prefix applied -->
<script type="module" src="/gaur-yatra/assets/index-Abc123.js"></script>
<link rel="stylesheet" href="/gaur-yatra/assets/index-Def456.css">

<!-- Wrong — base prefix missing — do NOT proceed with this output -->
<script type="module" src="/assets/index-Abc123.js"></script>
```

If the base prefix is missing, verify `vite.config.js` has `base: '/gaur-yatra/'` and re-run `npm run build`.

---

## Testing Strategy

- [ ] **Structure test:** `ls public/assets/images/locations/ | wc -l` returns `32`; `.gitkeep` exists in each folder
- [ ] **Dev server test:** `npm run dev` starts with no errors; browser opens map at `http://localhost:5173`
- [ ] **Console test:** Zero errors in browser DevTools console on fresh page load
- [ ] **Map render test:** 32 markers visible, polyline drawn, tiles loaded, zoom controls functional
- [ ] **Popup test:** Click each marker — popup shows location name and verse numbers
- [ ] **Layout test:** 3 columns visible, header and footer correct heights, left/right panel placeholders visible
- [ ] **Build test:** `npm run build` succeeds; `dist/index.html` contains `/gaur-yatra/` asset prefixes
- [ ] **Data assertions:** Run the browser console checks in Section 12, Step 4

**Edge cases to verify in Phase 1:**
- Locations with close coordinates — Radha-kunda `[27.5050, 77.4640]` and Brahma-kunda `[27.4940, 77.4640]` share the same longitude. Their markers should be adjacent, not overlapping.
- Prayaga `[25.4358, 81.8463]` is far southeast of the main cluster. It will not be visible at the initial zoom level 12 — but the marker and polyline endpoint must exist (verified by zooming out to zoom 6).
- React StrictMode in development causes components to render twice. The map must initialize correctly on second mount. React-Leaflet handles this via its internal ref management, but verify no `Map container is already initialized` errors appear in the console.

---

### Section 12: Phase 1 Completion Checklist

Work through these checks in order. Do not proceed to Phase 2 until all pass.

#### Step 1 — File Structure Verification

```bash
# From project root:
ls public/assets/images/locations/ | wc -l
# Expected: 32

find public/assets/images/locations -name ".gitkeep" | wc -l
# Expected: 32

ls src/components/
# Expected: BottomPanel.jsx  GalleryPanel.jsx  Header.jsx  MapView.jsx  VersePanel.jsx

ls src/data/
# Expected: locations.js  verses.js

ls src/hooks/
# Expected: useJourney.js

ls src/styles/
# Expected: index.css

ls public/assets/icons/
# Expected: chaitanya-marker.svg
```

#### Step 2 — Browser Console Check

Open `http://localhost:5173` in Chrome. Open DevTools (F12) → Console tab.

**Expected: zero errors.** The following are acceptable non-blocking messages:
- Vite HMR connection messages — informational only.
- React StrictMode double-render — expected behavior in development.

**Errors that indicate a problem (must fix before Phase 2):**

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `Cannot find module '../data/locations.js'` | `locations.js` import path wrong in `MapView.jsx` | Verify the relative path from `src/components/` to `src/data/` |
| `Map container is already initialized` | React StrictMode double-mounting the map | Wrap `<MapContainer>` in a `key` prop or check React-Leaflet version compatibility with React 19 |
| `404 /assets/icons/chaitanya-marker.svg` | SVG file missing from `public/assets/icons/` | Create the file at `public/assets/icons/chaitanya-marker.svg` |
| `Leaflet tiles not loading` | Leaflet CSS not imported | Verify `import 'leaflet/dist/leaflet.css'` is in `MapView.jsx` |
| `height: 0px` on map container | `.map-view-column` CSS class missing height | Verify `index.css` has `.map-view-column { height: calc(100vh - 176px); }` |
| `Failed to resolve import "leaflet"` | `leaflet` not installed | Run `npm install leaflet react-leaflet` |
| `Failed to resolve import "@tailwindcss/vite"` | Tailwind v4 plugin not installed | Run `npm install -D @tailwindcss/vite` |

#### Step 3 — Visual Verification

What the page should look like after Phase 1 is complete:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [amber header bar — 56px]                                                   │
│  "Gaur Yatra — Chaitanya Mahaprabhu's Journey Through Vraj Bhumi"           │
│  [Play Journey ▶] (greyed out)   [Pause ‖] (greyed out)                     │
├───────────────┬──────────────────────────────────────────┬────────────────────┤
│  "Verses      │  [OpenStreetMap tiles]                   │  "Gallery          │
│   grouped by  │  [32 orange circle markers]              │   coming..."       │
│   location.." │  [saffron-orange polyline path]          │                    │
│               │  [Leaflet zoom controls top-left]        │                    │
│               │  [Attribution bottom-right]              │                    │
├───────────────┴──────────────────────────────────────────┴────────────────────┤
│  [dark bottom panel — 120px]                                                  │
│  "Select a verse to read..."                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Check each visual element:**
- [ ] Header is amber/brown, full width, ~56px tall
- [ ] Play and Pause buttons are visible but greyed out (disabled state)
- [ ] Three columns visible: left dark panel (20%), center map (55%), right dark panel (25%)
- [ ] Map fills the center column completely — no white gaps, no clipped tiles at edges
- [ ] OpenStreetMap tile layer loads (streets, labels, terrain visible)
- [ ] All 32 orange circle markers are visible in the Vrindavan/Mathura region
- [ ] Markers are NOT at coordinates `[0, 0]` — that would indicate an import error
- [ ] Saffron-orange polyline connects markers in a visible path through the region
- [ ] Clicking any marker shows a popup with the location name and verse numbers
- [ ] Bottom panel is dark, full width, ~120px tall, shows "Select a verse to read..."
- [ ] Left panel shows "Verses grouped by location..."
- [ ] Right panel shows "Gallery coming..."

#### Step 4 — Data Integrity Check

Run these in the browser console (DevTools → Console):

```javascript
// Import locations from the module to inspect in console
// Note: in a Vite React app, modules are not global.
// Use the React DevTools or add a temporary window assignment.
// Temporarily add this line to App.jsx to expose for testing:
//   import { locations } from './data/locations.js'
//   window.__locations = locations
// Then run these assertions:

// Check: all 32 locations loaded
console.assert(window.__locations.length === 32, 'FAIL: Expected 32 locations, got ' + window.__locations.length);

// Check: all locations have unique journeyOrder values 1–32
const orders = window.__locations.map(l => l.journeyOrder).sort((a, b) => a - b);
const expectedOrders = Array.from({length: 32}, (_, i) => i + 1);
console.assert(
  JSON.stringify(orders) === JSON.stringify(expectedOrders),
  'FAIL: journeyOrder values are not 1–32. Got: ' + JSON.stringify(orders)
);

// Check: all locations have lat/lng within plausible India bounds
const outOfBounds = window.__locations.filter(l =>
  l.lat < 20 || l.lat > 30 || l.lng < 70 || l.lng > 90
);
// Note: Prayaga at lat=25.4358 IS within 20–30. All should pass.
console.assert(
  outOfBounds.length === 0,
  'FAIL: Suspicious coordinates on: ' + outOfBounds.map(l => l.id).join(', ')
);

// Check: all id values match the expected folder names
console.log('Location IDs (each must match a folder in public/assets/images/locations/):');
window.__locations.forEach(l => console.log('  ' + l.journeyOrder + '. ' + l.id));

// Remove the temporary window.__locations line from App.jsx after testing.
```

**All assertions must pass before Phase 2 begins.** Remove the `window.__locations = locations` debug line from `App.jsx` immediately after running the checks.

#### Step 5 — Build Smoke Test

```bash
npm run build
# Verify: no build errors in terminal

# Preview the built output with the base path applied
npm run preview
# Opens: http://localhost:4173/gaur-yatra/
```

`npm run preview` serves the `dist/` folder with the base path applied — this simulates GitHub Pages conditions exactly. Verify:
- [ ] `http://localhost:4173/gaur-yatra/` loads the app
- [ ] Map tiles load
- [ ] All 32 markers render
- [ ] No 404 errors in the Network tab for any asset

---

## Rollout & Deployment

### Local Development (Phase 1)

```bash
# Start Vite dev server with HMR
npm run dev
# Opens: http://localhost:5173

# Build for production
npm run build

# Preview the production build (simulates GitHub Pages base path)
npm run preview
# Opens: http://localhost:4173/gaur-yatra/
```

### GitHub Pages (Phase 5)

GitHub Pages deployment is documented in the master plan. Phase 1 does not deploy to GitHub Pages — that happens in Phase 5 after all features are complete. The `base: '/gaur-yatra/'` config is set now so no build configuration changes are needed at deployment time.

---

## Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|------------|
| React-Leaflet + React 19 compatibility | High | Medium | React-Leaflet v4.x supports React 18+. Verify the installed version: `npm ls react-leaflet`. If React 19 is not yet fully supported, pin to React 18 by changing `package.json` and re-running `npm install`. |
| Map container 0px height — map renders invisible | High | Medium | The `.map-view-column` CSS class must have an explicit `calc()` height. Never use `height: 100%` on a Leaflet container unless every ancestor has an explicit height. Verify in checklist Step 3. |
| Leaflet CSS not loaded — broken tile layout | High | Low | `import 'leaflet/dist/leaflet.css'` must appear in `MapView.jsx`. Vite will bundle it. Without it, tile layers display broken and markers are mispositioned. |
| `base` not set — 404s on GitHub Pages | High | Medium | Verified in checklist Step 5 via `npm run preview`. Check `dist/index.html` for `/gaur-yatra/` prefixes before deploying. |
| `public/` assets not found at runtime | Medium | Low | `L.icon({ iconUrl: '/assets/...' })` is a runtime URL, not a Vite import. Files must be in `public/` — Vite cannot process runtime string paths. The SVG must be at `public/assets/icons/chaitanya-marker.svg`. |
| React StrictMode double-mount of MapContainer | Medium | Low | React-Leaflet handles this internally. If `Map container is already initialized` appears, upgrade to the latest React-Leaflet patch release. |
| Coordinate inaccuracies for lesser-known locations | Medium | High | Coordinates are approximate. A v2 refinement pass using Google Earth is planned. For Phase 1 the goal is markers in the correct region, not exact GPS accuracy. |
| 32 image folders not tracked by git after clone | Medium | Medium | `.gitkeep` files in each folder ensure git tracks them. Verify with `find public/assets/images/locations -name .gitkeep | wc -l` === 32 after a fresh clone. |
| Tailwind v4 CSS not applied | Medium | Low | Ensure `@import "tailwindcss"` (not `@tailwind base`) is in `src/styles/index.css` and `@tailwindcss/vite` is in `vite.config.js` plugins. The v3 `tailwind.config.js` approach will not work. |

---

## Open Questions

- [ ] **Custom marker icon** — The final Chaitanya Mahaprabhu PNG icon must be sourced or commissioned before Phase 5. Who is responsible for obtaining this? Resolution needed before Phase 5 begins.
- [ ] **Coordinate validation** — Several locations (Praskandana, Dvadashaditya, Cira-ghata, Tentuli-tala) have coordinates within a few hundred meters of each other along the Mathura riverfront. Should these be validated against ISKCON pilgrimage GPS data before Phase 3 interactivity is built on top of them?
- [ ] **React-Leaflet version pinning** — React 19 was released recently. Confirm `react-leaflet@4.x` is compatible with React 19 before scaffolding. Check the React-Leaflet GitHub issues if `npm install` reports peer dependency warnings.
- [ ] **Header height flexibility** — Header is hardcoded to `h-14` (56px). If the header content requires more space in Phase 5 (subtitle, breadcrumb, responsive adjustments), the CSS `calc()` values in `index.css` must be updated to match. This is a known coupling point.

---

## What Phase 1 Outputs That Phase 2 Depends On

Phase 2 (Verse Data — Scrape + Populate) requires these artifacts to be stable and correct before it begins:

| Artifact | File | What Phase 2 Needs From It |
|----------|------|---------------------------|
| `<VersePanel>` component | `src/components/VersePanel.jsx` | Phase 2 populates this component with rendered verse card JSX. The component exists with the correct props interface. |
| `.verse-card` CSS class | `src/styles/index.css` | Phase 2 assigns this class to each rendered verse `<div>`. The card styles must be defined. |
| `.verse-card--has-location` class | `src/styles/index.css` | Applied to verses with a `locationId`. Must be defined. |
| `.verse-location-badge` class | `src/styles/index.css` | Rendered inside each location-tagged verse card. Must be defined. |
| `export const locations` | `src/data/locations.js` | Phase 2 imports `locations` to validate that every `locationId` assigned to a verse references a real location `id`. |
| `MapController` sub-component | `src/components/MapView.jsx` | Phase 3 fills in the `flyTo()` logic inside `MapController`. The component and `useMap()` hook call must already exist. |
| `selectedLocationId` + `selectedVerseId` prop interface | `src/App.jsx` | All child components accept their respective state props and setters. Phases 2–3 wire actual selection calls without changing the prop interface. |
| 32 `.gitkeep` folders | `public/assets/images/locations/` | Phase 4 gallery reads `loc.images[]` paths, which reference these folders. The folder structure must match the location IDs exactly. |

**Stability contract:** Once Phase 1 is complete, the following must NOT change without updating every subsequent phase:

1. The `id` field values of all 32 location objects in `locations.js` — these are the join keys between locations, verses, map markers, gallery folders, and bottom panel.
2. The prop names on all components: `selectedLocationId`, `setSelectedLocationId`, `selectedVerseId`, `setSelectedVerseId`.
3. The CSS class names used as styling contracts: `.verse-card`, `.verse-card--has-location`, `.verse-card--active`, `.verse-location-badge`, `.marker-pulse`.
4. The height values in `index.css` `calc()` expressions — changing header or footer height requires updating all three `calc(100vh - 176px)` calls.
5. The `public/assets/` path structure — gallery module in Phase 4 builds image paths from `loc.id`.

---

## References

- Parent planning document: `docs/planning/gaur-yatra-plan.md`
- React-Leaflet documentation: https://react-leaflet.js.org/docs/start-setup
- React-Leaflet `<MapContainer>` API: https://react-leaflet.js.org/docs/api-map
- React-Leaflet `useMap` hook: https://react-leaflet.js.org/docs/api-hooks#usemap
- Leaflet `L.icon()` API reference: https://leafletjs.com/reference.html#icon
- Tailwind CSS v4 Vite installation: https://tailwindcss.com/docs/installation/vite
- `@tailwindcss/vite` plugin: https://github.com/tailwindlabs/tailwindcss/tree/next/packages/%40tailwindcss-vite
- OpenStreetMap tile URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- OpenStreetMap attribution requirement: https://www.openstreetmap.org/copyright
- Vite `base` configuration: https://vite.dev/config/shared-options.html#base
- Vite React template: `npm create vite@latest . -- --template react`
- Source text (CC Madhya 18): https://vedabase.io/en/library/cc/madhya/18/
- Target deploy URL: `https://dev-arctik.github.io/gaur-yatra`
