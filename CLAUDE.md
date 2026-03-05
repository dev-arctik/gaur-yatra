# Gaur Yatra — Project Instructions

## Project Overview
Interactive website visualizing Lord Chaitanya Mahaprabhu's journey through Vraj Bhumi based on Caitanya Caritamrita Madhya Lila Chapter 18 (229 verses, 32 sacred locations). Hosted on GitHub Pages at `dev-arctik.github.io/gaur-yatra`.

## Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin (CSS-first config with `@theme {}` — NO `tailwind.config.js` or `postcss.config.js`)
- **Map:** React-Leaflet v4 + Leaflet.js with OpenStreetMap tiles
- **Deployment:** GitHub Pages via `gh-pages` npm package
- **Package Manager:** npm (not Poetry — this is a JS project)

## Key Architecture Decisions

### State Model
- `App.jsx` holds two state variables: `selectedLocationId` and `selectedVerseId`
- All child components receive state via props — no Redux, no Context
- `useJourney` custom hook manages Play Journey auto-advance

### Layout (Desktop Only, min 1024px)
- **Left panel (20%):** Condensed verse list grouped by location with verse type badges
- **Center panel (55%):** React-Leaflet map with 32 markers + polyline
- **Right panel (25%):** Photo gallery + location info (name, Devanagari, description, Google Maps link)
- **Bottom panel:** Verse reader — Sanskrit + translation with prev/next through all 229 verses

### Data Model
- `src/data/locations.js` — `export const locations = [...]` (32 location objects, named export)
- `src/data/verses.js` — `export const verses = [...]` (229 verse objects, named export)
- Each verse has a `verseType` field: `"arrival"` | `"event"` | `"glory"` | `"narrative"`
- No `purportExcerpt` field — only Sanskrit + translation

### Exports
- All React components use `export default`
- All data files use named exports (`export const`)

### Asset Paths
- User photos go in `public/assets/images/locations/<location-id>/` (served as-is by Vite)
- Icons go in `src/assets/icons/` (ES module imports, Vite-processed)
- Always use `import.meta.env.BASE_URL` to prefix runtime asset paths — never hardcode `/gaur-yatra/`
- `vite.config.js` must have `base: '/gaur-yatra/'` for GitHub Pages

### React-Leaflet Patterns
- `useMap()` must be called inside a child of `<MapContainer>` (use `<MapController>` pattern)
- `<Polyline>` uses `pathOptions={{ color, weight, opacity }}` — NOT direct props
- Marker icons use `L.icon()` with `import.meta.env.BASE_URL` prefix

### Tailwind v4
- Uses `@import "tailwindcss"` in CSS (not `@tailwind base/components/utilities`)
- Custom values defined via `@theme {}` directive in `src/styles/index.css`
- Vite plugin: `@tailwindcss/vite` — no PostCSS pipeline

## File Structure
```
src/
  main.jsx                 # React entry point
  App.jsx                  # Root — holds selectedLocationId + selectedVerseId state
  components/
    Header.jsx             # Title + Play/Pause/Stop controls
    VersePanel.jsx         # Left panel — grouped verse list
    VerseCard.jsx          # Condensed verse entry with type badge
    MapView.jsx            # React-Leaflet map with markers + polyline
    GalleryPanel.jsx       # Right panel — photo carousel + location info
    BottomPanel.jsx        # Verse reader — Sanskrit + translation + prev/next
  hooks/
    useJourney.js          # Play Journey auto-advance hook
  data/
    locations.js           # 32 location objects
    verses.js              # 229 verse objects
  styles/
    index.css              # Tailwind v4 directives + custom CSS
public/
  assets/
    icons/                 # Marker icon placeholder
    images/locations/      # 32 folders for user-contributed photos
```

## Planning Docs
All planning documentation is in `docs/planning/`. Implementation order: Phase 1 -> 2 -> 3 -> 4 -> 5. Phase docs are authoritative over the master plan for implementation details.

## Commands
```bash
npm run dev        # Start Vite dev server
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run deploy     # Deploy dist/ to GitHub Pages via gh-pages
```

## Important Notes
- Mobile responsiveness is deferred to v2 — desktop only (min 1024px)
- Vedabase content is BBT material — attribute clearly in footer/README (educational/devotional non-commercial)
- Leaflet CSS must be imported before any React-Leaflet component mounts
- The `public/` directory is for user-contributed photos; `src/assets/` is for Vite-processed assets
