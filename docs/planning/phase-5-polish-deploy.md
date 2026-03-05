# Feature: Phase 5 — Polish + Vite Build + GitHub Pages Deployment

**Version:** v3.0
**Status:** Approved
**Type:** Implementation Guide
**Created:** 2026-03-05
**Last Modified:** 2026-03-05
**Revision Note:** v3.0 — Updated for redesigned layout: bottom panel is now a verse reader (not location info display), right panel includes location info card below gallery, left panel uses condensed verse list grouped by location with verse type badges (`arrival`/`event`/`glory`/`narrative`), `purportExcerpt` field removed from verse model.

---

## Problem Statement

Phases 1–4 produce a fully functional Gaur Yatra React application: map with 32 markers, 229 verses in the left panel (grouped by location with type badges), a bottom-panel verse reader as the primary reading area, a right panel with gallery and location info, and Play Journey mode. Phase 5 is the hardening pass that takes the project from "it works" to "it is ready for devotees and the public."

This phase covers visual polish (color palette, typography, verse type badge styling, verse reader typography, custom marker icon, Leaflet popup overrides, scrollbar styling), Tailwind CSS v4 configuration, an accessibility pass, a performance review, a Vite production build, and the step-by-step GitHub Pages deployment using the `gh-pages` npm package. At the end of this phase the site is live at `https://dev-arctik.github.io/gaur-yatra`.

The key difference from earlier planning: the project uses **React 19 + Vite + Tailwind CSS v4**, not plain HTML/CSS/JS. This changes the build process, the deployment mechanism, the Tailwind configuration approach, and the asset path handling. Every section below reflects this stack.

**Layout context:** The app uses a redesigned layout with `selectedLocationId` AND `selectedVerseId` state in `App.jsx`. The left panel (20% width) shows a condensed verse list grouped by location with verse type badges. The bottom panel is the **primary reading area** — a full verse reader displaying Sanskrit text, English translation, verse type badge, and prev/next navigation. The right panel (25% width) contains the gallery carousel on top and a location info card (name, Devanagari, description, Google Maps link) below it. Verses have a `verseType` field: `"arrival"` | `"event"` | `"glory"` | `"narrative"`.

---

## Goals & Success Criteria

- Every UI element reflects the devotional saffron/gold/maroon color palette consistently — no default browser blue links, no unstyled component defaults, no default Leaflet popup chrome visible in the final product.
- The Devanagari script in the bottom panel verse reader and the right panel location info card renders correctly in the chosen Google Font — no font fallback boxes.
- A custom Chaitanya Mahaprabhu marker icon (or an approved fallback) is in place at `src/assets/icons/` in both default and selected variants.
- Leaflet's default popup styles are overridden — rounded corners, custom shadow, no blue border, project typography inside the popup.
- All interactive elements carry `aria-label` attributes; map markers carry `title` attributes.
- `npm run build` completes without errors. The `dist/` folder is the deployable artifact.
- `npm run preview` serves the production build locally and the full smoke test passes — all assets resolve, no 404s.
- `npm run deploy` pushes `dist/` to the `gh-pages` branch and GitHub Pages serves the site at `https://dev-arctik.github.io/gaur-yatra`.
- A proper `README.md` exists at the project root.
- The smoke test checklist passes on Chrome, Firefox, and Safari against the live GitHub Pages URL.

**Definition of "done":** The smoke test checklist at the bottom of this document passes on all three browsers, the GitHub Pages URL resolves, and no console errors appear.

---

## Requirements

### Functional Requirements

- **FR-P5-001:** The header bar displays the project title in Crimson Text, uses a saffron/gold gradient background, and provides appropriate padding so the title and Play/Pause controls are not crowded.
- **FR-P5-002:** The left panel shows a condensed verse list **grouped by location**. Each location group has a divider/header with the location name. Each verse entry is compact (one line) with a verse type badge pill. The panel has a custom scrollbar styled with the saffron palette.
- **FR-P5-003:** Verse type badge pills use color-coded backgrounds: `arrival` → green (`#16A34A`), `event` → blue (`#2563EB`), `glory` → gold/saffron (`#D97706`), `narrative` → gray (`#6B7280`). All badges use white text.
- **FR-P5-004:** The active/selected verse highlight uses a warm left border and a light cream background tint.
- **FR-P5-005:** The map marker uses a final custom icon for Chaitanya Mahaprabhu (PNG, 40×50 px, transparent background). A selected variant (or a CSS pulse animation) is implemented for the highlighted state.
- **FR-P5-006:** Leaflet's default popup styles are overridden in a global CSS file — rounded corners, custom shadow, no blue border, project typography.
- **FR-P5-007:** The polyline is styled with the saffron color (`#E8730C`), weight 2.5, opacity 0.7, and a dashed pattern.
- **FR-P5-008:** The right gallery panel image container uses a fixed 4:3 aspect ratio; arrow buttons are styled as rounded icon-buttons in the project palette.
- **FR-P5-009:** The bottom panel is the **primary verse reader**. It is fixed to the viewport bottom with generous height for comfortable reading. It displays: the verse number prominently, the Sanskrit text in Noto Serif Devanagari font, the English translation in Crimson Text at a comfortable reading size, a verse type badge, and Prev/Next navigation buttons styled with the saffron/maroon theme. The panel transitions its content with a CSS `opacity + transform` animation when the selected verse changes. The bottom panel should feel like a **book reader** — not a toolbar or info strip.
- **FR-P5-010:** Sanskrit/Devanagari text in the bottom panel verse reader uses "Noto Serif Devanagari" loaded from Google Fonts via a `<link>` tag in `index.html`. English translation text uses "Crimson Text" at a larger, more comfortable reading size than the condensed left panel. The `.devanagari` CSS class is applied only to Sanskrit elements.
- **FR-P5-010a:** The right panel contains a **location info card** below the gallery carousel. This card displays: the location name in a header style, the Devanagari name below it, the description text, and a Google Maps button styled as a subtle link/button. Devanagari text here also uses the `.devanagari` CSS class.
- **FR-P5-011:** All interactive elements carry `aria-label` attributes. All 32 `<Marker>` components have `title` set to the location name. The bottom panel verse reader content region has `aria-live="polite"`.
- **FR-P5-012:** `vite.config.js` sets `base: '/gaur-yatra/'` so all assets resolve correctly when served from a GitHub Pages subdirectory path.
- **FR-P5-013:** `npm run build && npm run deploy` is the single command sequence to ship a new version to production.
- **FR-P5-014:** `README.md` at project root covers: description, live site link, local dev (`npm install && npm run dev`), photo contribution guide, tech stack, attribution, and license.
- **FR-P5-015:** A `.gitignore` file is present at the project root, covering `node_modules/`, `dist/`, `.env*`, and macOS/editor artifacts.
- **FR-P5-016:** The GitHub repository is public under `dev-arctik/gaur-yatra`, with GitHub Pages set to serve from the `gh-pages` branch.
- **FR-P5-017:** A CSS `@media (max-width: 1023px)` rule hides the main application layout and shows a centered message: "This experience is designed for desktop browsers. Please visit on a screen at least 1024px wide." This prevents mobile users from seeing a broken 3-column layout.

### Non-Functional Requirements

- **Performance:** Vite's production build automatically tree-shakes unused code, minifies JS/CSS, and code-splits dynamic imports. No manual webpack config required. Target: page load under 3 seconds on broadband, bundle size reasonable (inspect with `vite build --report` or `vite-bundle-visualizer`).
- **Browser Support:** Chrome (latest 2 versions), Firefox (latest 2 versions), Safari (latest 2 versions). The WebKit scrollbar CSS is Chrome/Safari-only; Firefox gets the `scrollbar-width: thin` fallback.
- **Asset Paths:** With Vite, assets imported inside React components via `import` statements are automatically hashed and path-rewritten at build time. Only assets referenced as string URLs (Leaflet icon URLs) require manual attention — they must be imported or placed in `public/` and referenced correctly.
- **No API Keys:** No services requiring API keys. OpenStreetMap tiles are free. Google Maps links are plain `https://maps.google.com/?q=lat,lng`.
- **No Secrets in Repo:** Nothing sensitive in any committed file.

### Assumptions

- [ASSUMPTION] Phases 1–4 are complete. The React app runs locally with `npm run dev`. All 32 markers are visible, all 229 verses are rendered with `verseType` badges, `App.jsx` manages both `selectedLocationId` and `selectedVerseId` state, the bottom panel verse reader displays the selected verse, the right panel shows gallery + location info, and Play Journey runs end-to-end.
- [ASSUMPTION] The custom Chaitanya Mahaprabhu PNG icon will be decided and placed in `src/assets/icons/` (or `public/icons/`) before the marker styling pass. If a final icon is not sourced, the lotus SVG fallback (Option C in Section 4 below) is used.
- [ASSUMPTION] The `dev-arctik` GitHub account has no existing `gaur-yatra` repo at the time of setup.
- [ASSUMPTION] Google Fonts CDN is accessible from the target audience's browsers.
- [ASSUMPTION] Node.js 18+ and npm are installed locally.

---

## User Stories

| Priority | Story | Acceptance Criteria |
|----------|-------|---------------------|
| Must | As a devotee visiting the site, I want the visual design to feel spiritually appropriate, not like a generic tech demo, so that the content is honored by its presentation. | Saffron/gold/maroon palette applied consistently; no default browser blue on interactive elements; Devanagari font renders correctly in verse reader and location info card; verse type badges are color-coded. |
| Must | As a devotee using a screen reader, I want all buttons and interactive elements to be labeled so I can navigate the site without vision. | Every button, verse card with a locationId, gallery arrow, and map marker has `aria-label` or `title` attribute. |
| Must | As a contributor wanting to add photos, I want a clear README that explains exactly which folder to place images in and how to update the data file. | README photo contribution guide matches the actual folder structure in `public/assets/images/locations/`. |
| Must | As a developer running locally, I want a single command to start the dev server. | README documents `npm install && npm run dev`; site opens at `http://localhost:5173`. |
| Must | As a visitor on GitHub, I want to understand what the project is within 10 seconds of landing on the README. | README has a one-paragraph description, screenshot/banner placeholder, and a link to the live site in the first screen. |
| Must | As the developer, I want a single command sequence to deploy a new version. | `npm run build && npm run deploy` rebuilds the production bundle and pushes it live. |
| Should | As a user with a keyboard, I want to be able to Tab to the Play/Pause buttons and gallery arrows. | Focus states are visible on all interactive elements (`:focus-visible` ring in the project palette). |

---

## Technical Design

### Architecture Overview

Phase 5 does not introduce new React components or new feature logic. All work is:
1. CSS/styling refinements to existing components (including the redesigned layout: condensed left panel with location groups + verse type badges, bottom panel as primary verse reader, right panel with gallery + location info card)
2. Accessibility attribute additions
3. Vite build configuration
4. GitHub Pages deployment setup

```
gaur_yatra/                         <- project root (local folder name)
├── index.html                      <- Vite entry point; Google Fonts <link> added here
├── vite.config.js                  <- base: '/gaur-yatra/' CRITICAL for GitHub Pages
├── package.json                    <- deploy script added: "gh-pages -d dist"
├── .gitignore                      <- updated for Vite project
├── README.md                       <- NEW: created in Phase 5
├── src/
│   ├── main.jsx                    <- React root; no changes in Phase 5
│   ├── App.jsx                     <- Top-level layout; selectedLocationId + selectedVerseId state; aria-labels on panels
│   ├── styles/
│   │   └── index.css               <- MAJORITY of Phase 5 CSS work here
│   │                                  Tailwind @import + @theme tokens + component overrides
│   │                                  Includes: verse type badge colors, verse reader typography,
│   │                                  location group dividers, location info card styling
│   ├── components/
│   │   ├── Header.jsx              <- aria-labels on Play/Pause; font applied
│   │   ├── VersePanel.jsx          <- condensed verse list GROUPED BY LOCATION; verse type badges; scrollbar
│   │   ├── MapView.jsx            <- popup config; polyline dash; marker pulse
│   │   ├── GalleryPanel.jsx        <- aspect ratio; arrow buttons; placeholder card; location info card below gallery
│   │   ├── BottomPanel.jsx         <- PRIMARY VERSE READER: Sanskrit + translation + verse type badge + prev/next nav
│   │   └── VerseCard.jsx           <- aria-label; verse type badge pill
│   ├── assets/
│   │   └── icons/                          <- ES module imports, Vite-processed
│   │       ├── chaitanya-marker.png         <- final icon placed here
│   │       └── chaitanya-marker-active.png  <- selected variant
│   └── data/
│       ├── verses.js               <- no changes in Phase 5
│       └── locations.js            <- no changes in Phase 5
├── public/
│   └── assets/
│       └── images/locations/       <- user photos, served as-is by Vite (not processed)
│           ├── arit-grama/
│           ├── radha-kunda/
│           └── ... (32 folders)
└── dist/                           <- Vite build output; never committed; deployed by gh-pages
```

### CSS Architecture

With Tailwind CSS v4, there is **no `tailwind.config.js`**. All configuration — including custom colors and custom fonts — lives in the main CSS file using the `@theme` directive. This is the CSS-first configuration approach introduced in Tailwind v4.

The main CSS file (`src/styles/index.css`) has this structure:

```
/* 0. Tailwind import (replaces @tailwind base/components/utilities) */
/* 1. @theme — Design Tokens (Tailwind v4 custom colors + fonts) */
/* 2. CSS Custom Properties (for non-Tailwind usage, e.g., Leaflet JS) */
/* 3. Base / Reset */
/* 4. Header */
/* 5. Left Panel — Condensed Verse List (location group dividers, verse type badges, compact entries) */
/* 6. Center Panel — Map & Leaflet Overrides */
/* 7. Right Panel — Gallery + Location Info Card (gallery carousel, location name/Devanagari/description/Maps button) */
/* 8. Bottom Panel — Verse Reader (Sanskrit text, translation, verse type badge, prev/next nav) */
/* 9. Animations */
/* 10. Scrollbar (WebKit) */
/* 11. Focus / Accessibility */
/* 12. Utility Classes (including verse type badge color variants) */
```

---

## Section 1: Color Palette & Typography

### Approved Color Palette

These values are defined in two places:
- In `@theme {}` inside the main CSS file — this makes them available as Tailwind utility classes (`bg-saffron`, `text-maroon`, etc.)
- As `:root` CSS custom properties — required because Leaflet's polyline `color` option and JS code cannot read Tailwind's generated classes; they need `var(--color-saffron)` directly

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-saffron` | `#E8730C` | Primary brand — header gradient end, location badges, active verse border, polyline |
| `--color-saffron-light` | `#FF8C2A` | Header gradient start, hover states |
| `--color-saffron-pale` | `#FFF4EC` | Active verse background tint, card hover bg |
| `--color-maroon` | `#8B1A1A` | Secondary — photo counter, verse number text, popup accent |
| `--color-maroon-dark` | `#5C0F0F` | Deep hover state for maroon elements |
| `--color-lotus-pink` | `#E8A0BF` | Accent — placeholder card border, decorative dividers |
| `--color-cream` | `#FDF6EC` | Page/panel background |
| `--color-cream-dark` | `#F5E8D0` | Alternating verse card background |
| `--color-brown-text` | `#3D2108` | Primary body text — translations, descriptions |
| `--color-brown-heading` | `#1A0A00` | Headings, location names, verse numbers |
| `--color-border-warm` | `#DEC49A` | Panel borders, card borders, dividers |

### Tailwind v4 CSS-First Configuration

Verified via Context7 (`/tailwindlabs/tailwindcss.com`). In Tailwind v4 there is no `tailwind.config.js`. Custom design tokens are declared with the `@theme` directive inside the CSS entry point:

```css
/* src/styles/index.css */

/* Step 0: Import Tailwind — replaces the old @tailwind base/components/utilities */
@import "tailwindcss";

/* Step 1: @theme — custom design tokens
   These become Tailwind utility classes automatically:
   bg-saffron, text-maroon, font-crimson, etc.
   Tailwind v4 reads --color-* prefixed variables to generate color utilities,
   and --font-* prefixed variables to generate font-family utilities. */
@theme {
  /* Colors — Tailwind generates bg-*, text-*, border-*, ring-* utilities for each */
  --color-saffron:       #E8730C;
  --color-saffron-light: #FF8C2A;
  --color-saffron-pale:  #FFF4EC;
  --color-maroon:        #8B1A1A;
  --color-maroon-dark:   #5C0F0F;
  --color-lotus-pink:    #E8A0BF;
  --color-cream:         #FDF6EC;
  --color-cream-dark:    #F5E8D0;
  --color-brown-text:    #3D2108;
  --color-brown-heading: #1A0A00;
  --color-border-warm:   #DEC49A;

  /* Fonts — Tailwind generates font-crimson, font-devanagari utilities */
  --font-crimson:    'Crimson Text', Georgia, serif;
  --font-devanagari: 'Noto Serif Devanagari', serif;
}

/* Step 2: CSS Custom Properties for Leaflet + JS consumers
   Leaflet's polyline color option and JS cannot read Tailwind utilities —
   they need raw CSS variables. Mirror the palette here. */
:root {
  --color-saffron:       #E8730C;
  --color-saffron-light: #FF8C2A;
  --color-saffron-pale:  #FFF4EC;
  --color-maroon:        #8B1A1A;
  --color-maroon-dark:   #5C0F0F;
  --color-lotus-pink:    #E8A0BF;
  --color-cream:         #FDF6EC;
  --color-cream-dark:    #F5E8D0;
  --color-brown-text:    #3D2108;
  --color-brown-heading: #1A0A00;
  --color-border-warm:   #DEC49A;
  --bottom-panel-height: 12rem; /* increased from 7rem — verse reader needs comfortable reading space */
}
```

With this setup, you can write Tailwind classes like `bg-saffron`, `text-maroon`, `font-crimson` directly in JSX. For one-off overrides, use inline CSS or the standard class names.

### Tailwind Vite Plugin (Required in `vite.config.js`)

Verified via Context7 (`/tailwindlabs/tailwindcss.com` — `@tailwindcss/vite` plugin). Tailwind v4 uses a dedicated Vite plugin instead of PostCSS:

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
  base: '/gaur-yatra/',
})
```

Install the plugin (if not already done in earlier phases):

```bash
npm install @tailwindcss/vite
```

### Google Fonts in `index.html`

Google Fonts are loaded in `index.html` — the Vite HTML entry point — not in a component. This ensures fonts are available before React mounts and paints:

```html
<!-- index.html <head> — after <title>, before any stylesheet or script -->

<!-- Preconnect reduces font load latency by establishing the connection early -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Single <link> loads both fonts in one network round trip -->
<link
  href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Devanagari:wght@400;600&display=swap"
  rel="stylesheet"
>
```

**Why Crimson Text:** A classical old-style serif with strong Renaissance letterforms — evokes the timeless quality of scripture while remaining highly legible at small sizes.

**Why Noto Serif Devanagari:** Google's Noto project is designed to display all Unicode characters without tofu (missing glyph boxes). The Serif variant matches the classical feel of Crimson Text.

### Font Assignment

| Element | Tailwind Class | Font | Weight | Size |
|---------|---------------|------|--------|------|
| Header title | `font-crimson` | Crimson Text | 600 | `text-2xl` |
| Left panel — location group header | `font-crimson` | Crimson Text | 600 | `text-sm` |
| Left panel — condensed verse entry | `font-crimson` | Crimson Text | 400 | `text-xs` |
| Left panel — verse type badge pill | system sans-serif | -apple-system, sans-serif | 600 | `text-[0.6rem]` |
| Bottom panel — verse number | `font-crimson` | Crimson Text | 600 | `text-xl` |
| Bottom panel — Sanskrit text (verse reader) | `.devanagari` CSS class | Noto Serif Devanagari | 600 | `text-lg` |
| Bottom panel — English translation (verse reader) | `font-crimson` | Crimson Text | 400 | `text-base` (comfortable reading size) |
| Bottom panel — verse type badge | system sans-serif | -apple-system, sans-serif | 600 | `text-xs` |
| Bottom panel — Prev/Next buttons | `font-crimson` | Crimson Text | 600 | `text-sm` |
| Right panel — location name | `font-crimson` | Crimson Text | 600 | `text-lg` |
| Right panel — Devanagari name | `.devanagari` CSS class | Noto Serif Devanagari | 600 | `text-base` |
| Right panel — location description | `font-crimson` | Crimson Text | 400 | `text-sm` |
| Right panel — Google Maps button | system sans-serif | -apple-system, sans-serif | 600 | `text-xs` |
| Gallery counter | `font-crimson` | Crimson Text | 400 | `text-sm` |

```css
/* src/styles/index.css — Section 12: Utility Classes */
/* .devanagari is a named CSS class, not a Tailwind utility.
   Apply it to any element that contains Devanagari script.
   This prevents Crimson Text (Latin-only) from attempting to render
   Devanagari glyphs and producing fallback boxes. */
.devanagari {
  font-family: 'Noto Serif Devanagari', serif;
  font-weight: 600;
  line-height: 1.6; /* Devanagari needs more line height than Latin */
}
```

---

## Section 2: Header Bar Styling

### Target Appearance

```
+--------------------------------------------------------------------------------+
|  @@@@@@@@@@@@@@@@@@@@@@@@@ SAFFRON GRADIENT @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  |
|  Gaur Yatra - Chaitanya Mahaprabhu's Journey Through Vraj Bhumi                |
|                                   [Play Journey]  [Pause]  Location 0 / 32   |
+--------------------------------------------------------------------------------+
```

### Styling Changes to Header.jsx

> **WARNING — DO NOT replace Phase 4's Header component.** Phase 5 only STYLES the existing Header — it does not change the component logic or props. The `Header.jsx` from Phase 4 (with `useJourney` integration) must be preserved. Phase 4's Header accepts a `{ journey }` prop (the object returned by `useJourney` containing `isPlaying`, `currentStep`, `totalSteps`, `currentLocationName`, `start`, `pause`, `stop`) and conditionally renders Play/Resume, Pause, and Stop buttons based on journey state. **Do not regress this to a static mockup.** See `phase-4-gallery-journey.md` → Step 4: Header.jsx — Play Controls for the authoritative component definition.

Phase 5 applies the following **styling-only** changes to the existing Phase 4 `Header.jsx`. The `journey` prop, all button state logic, and conditional rendering remain exactly as Phase 4 defined them.

**Changes to apply on top of Phase 4's Header.jsx:**

1. **Header `<header>` element** — replace the Tailwind `bg-saffron-800` class with an inline gradient and box-shadow:
   ```jsx
   style={{
     background: 'linear-gradient(135deg, #FF8C2A 0%, #E8730C 60%, #8B1A1A 100%)',
     boxShadow: '0 2px 8px rgba(61, 33, 8, 0.3)',
   }}
   ```
2. **Title `<h1>`** — add `font-crimson text-2xl font-semibold tracking-wide` and a text-shadow:
   ```jsx
   style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
   ```
3. **Journey control buttons** — add `border border-white/40 bg-white/20 hover:bg-white/35` to Play/Resume, and `bg-maroon` to Pause (keep the existing conditional rendering and `onClick` handlers intact).
4. **Progress `<span>`** — add `font-crimson text-sm text-white/85 min-w-28 text-right` classes.

---

## Section 3: Left Panel — Condensed Verse List (Grouped by Location)

The left panel (20% width) shows a condensed, scannable verse list **grouped by location**. Each location group has a divider/header, and each verse entry is compact (one line) with a colored verse type badge pill.

### CSS Overrides (beyond Tailwind utilities)

```css
/* src/styles/index.css — Section 5: Left Panel */

/* Verse panel scrollable area */
#verse-panel {
  width: 20%;
  height: calc(100vh - 3.5rem - var(--bottom-panel-height));
  overflow-y: auto;
  background-color: var(--color-cream);
  border-right: 1px solid var(--color-border-warm);
}

/* --- Location Group Divider/Header --- */
.location-group-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0.4rem 0.75rem;
  background-color: var(--color-cream-dark);
  border-bottom: 1px solid var(--color-border-warm);
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-brown-heading);
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.location-group-header:hover {
  background-color: var(--color-saffron-pale);
}

.location-group-header.location--active {
  background-color: var(--color-saffron-pale);
  border-left: 3px solid var(--color-saffron);
  padding-left: calc(0.75rem - 3px);
}

/* --- Condensed Verse Entry (compact, one line each) --- */
.verse-entry {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem 0.25rem 1.25rem; /* indented under location header */
  border-bottom: 1px solid rgba(222, 196, 154, 0.3); /* subtle divider */
  cursor: pointer;
  transition: background-color 0.12s ease;
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 0.78rem;
  color: var(--color-brown-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verse-entry:hover {
  background-color: var(--color-saffron-pale);
}

/* Active/selected verse */
.verse-entry.verse--active {
  border-left: 4px solid var(--color-saffron);
  background-color: var(--color-saffron-pale);
  padding-left: calc(1.25rem - 4px); /* compensate for border width */
}

.verse-entry.verse--active .verse-number {
  color: var(--color-saffron);
}

.verse-number {
  font-weight: 600;
  color: var(--color-maroon);
  font-size: 0.72rem;
  flex-shrink: 0;
  min-width: 3.5rem;
}

.verse-entry-text {
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

/* --- Verse Type Badge Pills --- */
/* Small colored pills indicating verse type: arrival, event, glory, narrative */
.verse-type-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
  color: #FFFFFF;
}

/* Verse type color variants */
.verse-type-badge--arrival {
  background-color: #16A34A; /* green — new location arrival */
}
.verse-type-badge--event {
  background-color: #2563EB; /* blue — something happening */
}
.verse-type-badge--glory {
  background-color: #D97706; /* gold/saffron — praising the location */
}
.verse-type-badge--narrative {
  background-color: #6B7280; /* gray — general narrative text */
}
```

### VersePanel JSX Pattern (Grouped by Location)

```jsx
// src/components/VersePanel.jsx — condensed list grouped by location
{locationGroups.map(group => (
  <div key={group.locationId} className="location-group">
    <div
      className={`location-group-header ${
        group.locationId === selectedLocationId ? 'location--active' : ''
      }`}
      onClick={() => setSelectedLocationId(group.locationId)}
    >
      {group.locationName}
    </div>
    {group.verses.map(verse => (
      <div
        key={verse.id}
        className={`verse-entry ${verse.id === selectedVerseId ? 'verse--active' : ''}`}
        onClick={() => setSelectedVerseId(verse.id)}
        aria-label={`Verse ${verse.number} — ${verse.verseType} verse at ${group.locationName}`}
      >
        <span className="verse-number">{verse.number}</span>
        <span className={`verse-type-badge verse-type-badge--${verse.verseType}`}>
          {verse.verseType}
        </span>
        <span className="verse-entry-text">{verse.translation}</span>
      </div>
    ))}
  </div>
))}
```

### Custom Scrollbar

```css
/* src/styles/index.css — Section 10: Scrollbar */

/* WebKit (Chrome, Safari, Edge) */
#verse-panel::-webkit-scrollbar { width: 6px; }
#verse-panel::-webkit-scrollbar-track { background: var(--color-cream-dark); }
#verse-panel::-webkit-scrollbar-thumb {
  background-color: var(--color-saffron);
  border-radius: 3px;
}
#verse-panel::-webkit-scrollbar-thumb:hover { background-color: var(--color-maroon); }

/* Firefox */
#verse-panel {
  scrollbar-width: thin;
  scrollbar-color: var(--color-saffron) var(--color-cream-dark);
}
```

---

## Section 4: Marker Icon Sourcing

### Decision Matrix

| Option | Description | Pros | Cons | Recommended? |
|--------|-------------|------|------|--------------|
| A | Devotional Chaitanya Mahaprabhu dancing silhouette PNG (transparent bg) | Spiritually authentic; visually unique | Time to source; licensing depends on source | YES — preferred if image can be sourced before Phase 5 |
| B | SVG icon — silhouette of a dancing figure used with `L.divIcon` | Perfectly scalable; tiny file size; can be recolored via CSS | Requires drawing skill or a clean SVG source | YES — strong alternative to A |
| C | Lotus flower SVG/PNG (fallback) | Universally recognized devotional symbol; freely available | Less specific to Chaitanya Mahaprabhu | FALLBACK — use only if neither A nor B is ready |

### Sourcing Guidance for Option A (PNG)

- **ISKCON Media Library** (`media.iskcon.com`): Contains approved devotional artwork. Check usage terms — educational non-commercial use is generally permitted with attribution.
- **Wikimedia Commons**: Search "Chaitanya Mahaprabhu" — several public domain or CC-licensed devotional silhouettes exist.
- **AI Generation**: Prompt: *"Simple vector silhouette of a dancing Vaishnava monk with arms raised, saffron robes, transparent background, suitable for a map marker icon, flat illustration style."*

### Size Requirements

```
Final PNG: 40 x 50 pixels, transparent background
Format: PNG-24 (supports alpha transparency)
Files (icons use ES module imports — Vite-processed):
  src/assets/icons/chaitanya-marker.png         <- default state
  src/assets/icons/chaitanya-marker-active.png  <- selected state

Note on asset path conventions:
  - Icons -> src/assets/icons/ (ES module imports, Vite-processed, paths auto-prefixed with base)
  - User photos -> public/assets/images/locations/ (served as-is, referenced via import.meta.env.BASE_URL)
```

### Leaflet Icon Configuration in React

In a Vite + React project, assets imported with `import` are processed by Vite (hashed, optimized). Import the icon files at the top of `MapView.jsx`:

```jsx
// src/components/MapView.jsx

import chaitanyaIconUrl from '../assets/icons/chaitanya-marker.png'
import chaitanyaIconActiveUrl from '../assets/icons/chaitanya-marker-active.png'

// Leaflet icon definitions — use imported URLs, not string paths
const chaitanyaIcon = L.icon({
  iconUrl:     chaitanyaIconUrl,
  iconSize:    [40, 50],   // width, height in pixels
  iconAnchor:  [20, 50],   // bottom-center of icon is the geographic point
  popupAnchor: [0, -52],   // popup opens just above the icon tip
})

const chaitanyaIconActive = L.icon({
  iconUrl:     chaitanyaIconActiveUrl,
  iconSize:    [44, 55],   // slightly larger to convey selection
  iconAnchor:  [22, 55],
  popupAnchor: [0, -57],
})
```

**Why `import` instead of a string path?** Vite processes imported assets: it applies content hashing for cache busting, optimizes the files, and ensures the `base` path prefix is applied automatically. A raw string like `'assets/icons/chaitanya-marker.png'` would NOT get the `/gaur-yatra/` prefix added and would 404 on GitHub Pages.

**Alternative — place icons in `public/`:** If you prefer to keep icons as static files (no Vite processing), place them in `public/icons/` and reference them as `/gaur-yatra/icons/chaitanya-marker.png`. This is less common but valid. The `import` approach above is the recommended Vite idiom.

### Marker Pulse Animation (CSS — for selected state)

```css
/* src/styles/index.css — Section 9: Animations */

@keyframes markerPulse {
  0%   { transform: scale(1);   opacity: 0.8; }
  50%  { transform: scale(1.3); opacity: 0.3; }
  100% { transform: scale(1);   opacity: 0.8; }
}

.marker-selected {
  animation: markerPulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 6px #E8730C);
}

/* BottomPanel fade-in-up animation (used with key={selectedVerseId} to restart on change).
   Phase 3 introduced animate-fadeInUp as a Tailwind utility class.
   In Tailwind v4, custom animations are registered via @theme AND defined via @keyframes
   in the global CSS file (src/styles/index.css). There is no tailwind.config.js in v4.

   Option A (Recommended): Define in @theme + @keyframes in src/styles/index.css.
   Add this inside the @theme {} block at the top of the file:
     --animate-fadeInUp: fadeInUp 0.3s ease forwards;
   Then define the keyframes here:
*/
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Option B (Alternative): If you prefer not to use @theme, define a plain CSS class
   instead of the Tailwind animate-fadeInUp utility:
   .animate-fadeInUp {
     animation: fadeInUp 0.3s ease forwards;
   }
   Then use className="animate-fadeInUp" in BottomPanel.jsx as a regular CSS class.
   Both approaches work — Option A integrates with Tailwind's utility system. */
```

In the React-Leaflet JSX approach, marker highlighting is handled declaratively by swapping the `icon` prop on each `<Marker>` based on `selectedLocationId`. The `chaitanyaIconActive` icon (slightly larger, with the pulse animation applied via CSS) is used for the selected marker, while all others use `chaitanyaIcon`:

```jsx
// src/components/MapView.jsx — declarative marker highlighting
<Marker
  key={loc.id}
  position={[loc.lat, loc.lng]}
  icon={loc.id === selectedLocationId ? chaitanyaIconActive : chaitanyaIcon}
  title={loc.name}
  eventHandlers={{ click: () => setSelectedLocationId(loc.id) }}
>
  {/* ... Popup ... */}
</Marker>
```

The `marker-selected` CSS class (with the pulse animation) can be applied to the active marker's icon via `L.divIcon` with a custom `className`, or by using the slightly larger `chaitanyaIconActive` icon combined with the `filter: drop-shadow()` defined in the CSS. The declarative icon swap approach is preferred over imperative DOM manipulation (`getElement()`, `classList.add/remove`) because it works naturally with React's rendering model.

---

## Section 5: Leaflet Popup Customization

### Goal

Replace the default Leaflet popup (white box, blue close button, blue arrow tip) with a popup using the project palette: cream background, warm border, maroon close button, Crimson Text font.

### Popup Content Structure (React-Leaflet JSX)

The popup for each marker is declared as a React-Leaflet `<Popup>` child of `<Marker>` — **not** via the vanilla Leaflet `L.marker().bindPopup()` imperative API. This keeps all markup in JSX and avoids raw HTML string injection.

```jsx
// src/components/MapView.jsx — inside the map render, one <Marker> per location
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'

{locations.map(loc => (
  <Marker
    key={loc.id}
    position={[loc.lat, loc.lng]}
    icon={loc.id === selectedLocationId ? chaitanyaIconActive : chaitanyaIcon}
    title={loc.name}
    eventHandlers={{ click: () => setSelectedLocationId(loc.id) }}
  >
    <Popup className="gaur-leaflet-popup" maxWidth={220}>
      <div className="popup-content">
        <h3 className="gaur-popup__name">{loc.name}</h3>
        <p className="gaur-popup__devanagari devanagari">{loc.nameDevanagari}</p>
        <p className="gaur-popup__verse-range">
          Verses: {loc.verses[0]}–{loc.verses[loc.verses.length - 1]}
        </p>
        <p className="gaur-popup__order">Stop {loc.journeyOrder} of 32</p>
      </div>
    </Popup>
  </Marker>
))}
```

**Important:** The `.gaur-leaflet-popup` class and all `.leaflet-popup-*` overrides must live in the **global CSS file** (`src/styles/index.css`), not in component-scoped CSS. Leaflet injects popup DOM nodes outside React's component tree, so scoped styles (CSS Modules) cannot reach them. The `.devanagari` class on `gaur-popup__devanagari` applies the Noto Serif Devanagari font — this also must be in the global CSS file imported in `main.jsx`.

### Leaflet Popup CSS Overrides

Leaflet's popup DOM structure uses specific class names that must be overridden at global scope. These overrides cannot be scoped to a single React component — they must be in the global CSS file (`src/styles/index.css`):

```css
/* src/styles/index.css — Section 6: Leaflet Overrides */

/* Outer wrapper — override white box + default shadow */
.gaur-leaflet-popup .leaflet-popup-content-wrapper {
  background-color: var(--color-cream);
  border: 1px solid var(--color-border-warm);
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(61, 33, 8, 0.18);
  padding: 0;
}

/* The content div inside the wrapper */
.gaur-leaflet-popup .leaflet-popup-content {
  margin: 0.6rem 0.8rem;
  font-family: 'Crimson Text', Georgia, serif;
  color: var(--color-brown-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* The tip/arrow pointing down to the marker */
.gaur-leaflet-popup .leaflet-popup-tip-container { margin-top: -1px; }
.gaur-leaflet-popup .leaflet-popup-tip {
  background-color: var(--color-cream);
  box-shadow: none;
}

/* Close button */
.gaur-leaflet-popup .leaflet-popup-close-button {
  color: var(--color-maroon);
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.2rem 0.4rem;
  top: 0.2rem;
  right: 0.2rem;
}
.gaur-leaflet-popup .leaflet-popup-close-button:hover {
  color: var(--color-saffron);
  background-color: transparent;
}

/* Inner popup content layout */
.gaur-popup__name {
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-brown-heading);
  margin-bottom: 0.15rem;
}
.gaur-popup__devanagari {
  font-size: 0.9rem;
  color: var(--color-maroon);
  margin-bottom: 0.2rem;
}
.gaur-popup__verse-range,
.gaur-popup__order {
  font-size: 0.75rem;
  color: var(--color-maroon);
  letter-spacing: 0.02em;
}
```

---

## Section 6: Polyline Styling

```jsx
// src/components/MapView.jsx — polyline as React-Leaflet JSX
import { Polyline } from 'react-leaflet'

// Compute the ordered path (can be memoized with useMemo)
const journeyPath = useMemo(() =>
  [...locations]
    .sort((a, b) => a.journeyOrder - b.journeyOrder)
    .map(loc => [loc.lat, loc.lng]),
  [locations]
)

// Inside the <MapContainer> return:
<Polyline
  positions={journeyPath}
  pathOptions={{
    color:     '#E8730C',  // var(--color-saffron) value — Leaflet options cannot read CSS variables
                           // Replaces the #FF6B35 placeholder from Phases 1 and 3 with the finalized saffron design token
    weight:    2.5,
    opacity:   0.7,
    dashArray: '6, 8',    // 6px dash, 8px gap — suggests motion/journey
  }}
/>
```

---

## Section 7: Right Panel — Gallery + Location Info Card

The right panel (25% width) contains two sections stacked vertically:
1. **Gallery carousel** (top) — photo viewer with prev/next arrows, or placeholder card
2. **Location info card** (bottom) — location name, Devanagari name, description, and Google Maps button

### Image Container Aspect Ratio

```css
/* src/styles/index.css — Section 7: Gallery + Location Info Card */

#gallery-panel {
  width: 25%;
  height: calc(100vh - 3.5rem - var(--bottom-panel-height));
  display: flex;
  flex-direction: column;
  background-color: var(--color-cream);
  border-left: 1px solid var(--color-border-warm);
  overflow-y: auto;
}

#gallery-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background-color: var(--color-cream-dark);
  flex-shrink: 0;
}

#gallery-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: opacity 0.25s ease;
}

#gallery-image-container img.loading { opacity: 0; }
```

### Arrow Buttons JSX (GalleryPanel.jsx)

```jsx
// src/components/GalleryPanel.jsx — arrow buttons with aria-labels
<div id="gallery-controls"
     className="flex items-center justify-between p-2 border-t border-border-warm">
  <button
    id="btn-prev-photo"
    aria-label="Previous photo"
    onClick={prevPhoto}
    disabled={currentIndex === 0}
    className="gallery-arrow"
  >
    &#8592;
  </button>
  <span id="gallery-counter" className="font-crimson text-sm text-maroon">
    {currentIndex + 1} / {photos.length}
  </span>
  <button
    id="btn-next-photo"
    aria-label="Next photo"
    onClick={nextPhoto}
    disabled={currentIndex === photos.length - 1}
    className="gallery-arrow"
  >
    &#8594;
  </button>
</div>
```

```css
/* src/styles/index.css */
.gallery-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--color-cream-dark);
  border: 1px solid var(--color-border-warm);
  color: var(--color-maroon);
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.gallery-arrow:hover {
  background-color: var(--color-saffron);
  color: #FFFFFF;
  border-color: var(--color-saffron);
}
.gallery-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
```

### Placeholder Card (No Photos State)

```jsx
// src/components/GalleryPanel.jsx — rendered when images.length === 0
<div className="gallery-placeholder m-3 flex-1">
  <div className="gallery-placeholder__icon">&#9733;</div>
  <p className="gallery-placeholder__title">Photos Coming Soon</p>
  <p className="gallery-placeholder__subtitle">
    Hare Krishna! Be the first to contribute photos of this sacred place.
  </p>
  <a
    className="gallery-placeholder__link"
    href="https://github.com/dev-arctik/gaur-yatra"
    target="_blank"
    rel="noopener noreferrer"
  >
    Contribute via GitHub
  </a>
</div>
```

```css
.gallery-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  background-color: var(--color-cream);
  border: 1.5px dashed var(--color-lotus-pink);
  border-radius: 0.5rem;
}
.gallery-placeholder__icon {
  font-size: 2rem;
  color: var(--color-lotus-pink);
  margin-bottom: 0.5rem;
}
.gallery-placeholder__title {
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-brown-heading);
  margin-bottom: 0.3rem;
}
.gallery-placeholder__subtitle {
  font-size: 0.82rem;
  color: var(--color-brown-text);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}
.gallery-placeholder__link {
  font-size: 0.8rem;
  color: var(--color-saffron);
  text-decoration: underline;
  transition: color 0.15s ease;
}
.gallery-placeholder__link:hover { color: var(--color-maroon); }
```

### Image Lazy Loading

Always set `loading="lazy"` on gallery images in `GalleryPanel.jsx`:

```jsx
// src/components/GalleryPanel.jsx
<img
  src={photos[currentIndex]}
  alt={`Photo of ${currentLocation.name}`}
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

### Location Info Card (Below Gallery)

The location info card lives below the gallery carousel in the right panel. It displays the currently selected location's name, Devanagari name, description, and a Google Maps link. This information was previously in the bottom panel but has been moved here so the bottom panel can serve as the primary verse reader.

```css
/* src/styles/index.css — Section 7 (continued): Location Info Card */

.location-info-card {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border-warm);
  background-color: var(--color-cream);
  flex-shrink: 0;
}

.location-info-card__name {
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-brown-heading);
  margin-bottom: 0.1rem;
}

.location-info-card__devanagari {
  font-family: 'Noto Serif Devanagari', serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-maroon);
  margin-bottom: 0.35rem;
  line-height: 1.5;
}

.location-info-card__description {
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 0.82rem;
  color: var(--color-brown-text);
  line-height: 1.45;
  margin-bottom: 0.5rem;
  /* Allow up to 4 lines, then clamp */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.location-info-card__maps-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-saffron);
  text-decoration: none;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border-warm);
  border-radius: 0.375rem;
  background-color: transparent;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.location-info-card__maps-btn:hover {
  background-color: var(--color-saffron);
  color: #FFFFFF;
  border-color: var(--color-saffron);
}
```

```jsx
// src/components/GalleryPanel.jsx — Location Info Card (rendered below gallery)
<div className="location-info-card">
  <h3 className="location-info-card__name">{location?.name}</h3>
  <p className="location-info-card__devanagari devanagari">
    {location?.nameDevanagari}
  </p>
  <p className="location-info-card__description">{location?.description}</p>
  <a
    className="location-info-card__maps-btn"
    href={location?.googleMapsUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Open ${location?.name} in Google Maps (opens new tab)`}
  >
    Open in Maps
  </a>
</div>
```

---

## Section 8: Bottom Panel — Verse Reader

The bottom panel is the **primary reading area** — a full verse reader. It should feel like a book reader, not a toolbar or info strip. It receives `selectedVerseId` and displays the verse's Sanskrit text, English translation, verse type badge, and prev/next navigation buttons.

### Layout CSS

```css
/* src/styles/index.css — Section 8: Bottom Panel — Verse Reader */

/* The bottom panel is a flex child of the main layout — NOT position:fixed.
   Using position:fixed would require adding padding-bottom to the main content
   area to prevent overlap, and it conflicts with the flex column layout established
   in Phase 1. Keeping it as a flex child with flex-shrink:0 ensures it always
   occupies its declared height at the bottom of the viewport without overlap. */
#bottom-panel {
  position: relative; /* needed for the attribution line's absolute positioning */
  height: var(--bottom-panel-height); /* increase from 7rem to ~12rem for reading comfort */
  flex-shrink: 0; /* prevent the panel from shrinking in the flex layout */
  background: linear-gradient(
    to right,
    var(--color-cream) 0%,
    var(--color-cream-dark) 50%,
    var(--color-cream) 100%
  );
  border-top: 3px solid var(--color-saffron); /* thicker top border — emphasizes the reading area */
  padding: 0.75rem 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(61, 33, 8, 0.12);
}

/* --- Verse Reader Content Area --- */
#verse-reader-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  max-height: 100%;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

/* Triggered when selected verse changes — fade out then fade in */
#verse-reader-content.transitioning {
  opacity: 0;
  transform: translateY(6px);
}

/* --- Verse Number + Type Badge Row --- */
.verse-reader__header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.35rem;
}

.verse-reader__number {
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-maroon);
  letter-spacing: 0.03em;
}

/* Reuse the verse type badge styles from left panel, but slightly larger for prominence */
.verse-reader__type-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  white-space: nowrap;
  color: #FFFFFF;
}

/* Same color variants as .verse-type-badge in left panel */
.verse-reader__type-badge--arrival  { background-color: #16A34A; }
.verse-reader__type-badge--event    { background-color: #2563EB; }
.verse-reader__type-badge--glory    { background-color: #D97706; }
.verse-reader__type-badge--narrative { background-color: #6B7280; }

/* --- Sanskrit Text (Devanagari) --- */
.verse-reader__sanskrit {
  font-family: 'Noto Serif Devanagari', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-maroon);
  line-height: 1.7; /* Devanagari needs generous line-height */
  margin-bottom: 0.4rem;
  letter-spacing: 0.01em;
}

/* --- English Translation --- */
.verse-reader__translation {
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 1.05rem; /* larger than left panel for comfortable reading */
  font-weight: 400;
  color: var(--color-brown-text);
  line-height: 1.65; /* generous leading for readability */
  letter-spacing: 0.01em;
}

/* --- Prev/Next Navigation Buttons --- */
.verse-reader__nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  align-self: center;
}

.verse-reader__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--color-cream-dark);
  border: 1.5px solid var(--color-border-warm);
  color: var(--color-maroon);
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.verse-reader__nav-btn:hover {
  background-color: var(--color-saffron);
  color: #FFFFFF;
  border-color: var(--color-saffron);
}

.verse-reader__nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.verse-reader__nav-label {
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-maroon);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**Important CSS variable update:** The `--bottom-panel-height` in `:root` should be increased from `7rem` to `12rem` (or more) to accommodate the verse reader's larger text and comfortable reading layout. Update in the `:root` block:

```css
:root {
  --bottom-panel-height: 12rem; /* increased from 7rem — verse reader needs reading space */
}
```

### Transition Logic in BottomPanel.jsx

The prop contract has changed: BottomPanel now receives `selectedVerseId` (a string), **not** `selectedLocationId`. It is a **verse reader**, not a location info display. The verse lookup happens inside the component using `useMemo`.

```jsx
// src/components/BottomPanel.jsx — Verse Reader
// Props match Phase 3/4 convention: setSelectedVerseId and setSelectedLocationId
// are state setters passed from App.jsx. Prev/next logic is INTERNAL to this component.
import { useEffect, useMemo, useRef, useState } from 'react'
import { verses } from '../data/verses'

export default function BottomPanel({ selectedVerseId, setSelectedVerseId, setSelectedLocationId }) {
  // Verse lookup happens INSIDE the component
  const verse = useMemo(
    () => verses.find(v => v.id === selectedVerseId) ?? null,
    [selectedVerseId]
  )

  // Determine prev/next availability — index computed internally
  const currentIndex = useMemo(
    () => verses.findIndex(v => v.id === selectedVerseId),
    [selectedVerseId]
  )
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < verses.length - 1

  // Prev/next handlers are internal — they compute the adjacent verse index
  // and call setSelectedVerseId. When crossing a location boundary, they also
  // call setSelectedLocationId so the map/gallery/right panel stay in sync.
  const handlePrev = () => {
    if (!hasPrev) return
    const prevVerse = verses[currentIndex - 1]
    setSelectedVerseId(prevVerse.id)
    // If the previous verse belongs to a different location, update location too
    if (prevVerse.locationId !== verse?.locationId) {
      setSelectedLocationId(prevVerse.locationId)
    }
  }

  const handleNext = () => {
    if (!hasNext) return
    const nextVerse = verses[currentIndex + 1]
    setSelectedVerseId(nextVerse.id)
    // If the next verse belongs to a different location, update location too
    if (nextVerse.locationId !== verse?.locationId) {
      setSelectedLocationId(nextVerse.locationId)
    }
  }

  const contentRef = useRef(null)
  const [displayedVerse, setDisplayedVerse] = useState(verse)

  useEffect(() => {
    if (!verse || verse.id === displayedVerse?.id) return
    const el = contentRef.current
    if (!el) return

    // Step 1: fade out
    el.classList.add('transitioning')

    const timer = setTimeout(() => {
      // Step 2: swap content while invisible
      setDisplayedVerse(verse)
      // Step 3: fade back in
      requestAnimationFrame(() => el.classList.remove('transitioning'))
    }, 250) // matches CSS transition duration

    return () => clearTimeout(timer)
  }, [verse])

  return (
    <div id="bottom-panel">
      {/* Prev button — handler is internal, not a prop */}
      <div className="verse-reader__nav">
        <button
          className="verse-reader__nav-btn"
          onClick={handlePrev}
          disabled={!hasPrev}
          aria-label="Previous verse"
        >
          &#8592;
        </button>
        <span className="verse-reader__nav-label">Prev</span>
      </div>

      {/* Verse content — the reading area */}
      <div
        id="verse-reader-content"
        ref={contentRef}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="verse-reader__header">
          <span className="verse-reader__number">{displayedVerse?.number}</span>
          {displayedVerse?.verseType && (
            <span className={`verse-reader__type-badge verse-reader__type-badge--${displayedVerse.verseType}`}>
              {displayedVerse.verseType}
            </span>
          )}
        </div>
        {displayedVerse?.sanskrit && (
          <p className="verse-reader__sanskrit devanagari">
            {displayedVerse.sanskrit}
          </p>
        )}
        <p className="verse-reader__translation">
          {displayedVerse?.translation}
        </p>
      </div>

      {/* Next button — handler is internal, not a prop */}
      <div className="verse-reader__nav">
        <button
          className="verse-reader__nav-btn"
          onClick={handleNext}
          disabled={!hasNext}
          aria-label="Next verse"
        >
          &#8594;
        </button>
        <span className="verse-reader__nav-label">Next</span>
      </div>
    </div>
  )
}
```

---

## Section 9: Accessibility Pass

### Scope for v1

Best-effort pass. The following items are required for v1. Full keyboard navigation certification and screen reader audit are deferred to v2.

### Required Attributes by Element

| Element | Attribute | Value |
|---------|-----------|-------|
| `#btn-play` | `aria-label` | `"Play the journey through all 32 locations"` |
| `#btn-pause` | `aria-label` | `"Pause the journey"` |
| Each `.verse-card` with a `locationId` | `aria-label` | `"Verse ${verse.number} — located at ${locationName}. Click to view on map."` |
| Each `<Marker>` component | `title` prop | `loc.name` (e.g., `"Radha-kunda"`) |
| `#btn-prev-photo` | `aria-label` | `"Previous photo"` |
| `#btn-next-photo` | `aria-label` | `"Next photo"` |
| `.location-info-card__maps-btn` | `aria-label` | `"Open ${loc.name} in Google Maps (opens new tab)"` |
| `#map-container` wrapper div | `aria-label` | `"Interactive map showing Chaitanya Mahaprabhu's journey through Vraj Bhumi"` |
| `#gallery-panel` | `aria-label` | `"Photo gallery and location info for the selected location"` |
| `#verse-panel` | `aria-label` | `"Condensed verse list grouped by location — 229 verses of Chaitanya Caritamrita Madhya Chapter 18"` |
| `.verse-reader__nav-btn` (prev) | `aria-label` | `"Previous verse"` |
| `.verse-reader__nav-btn` (next) | `aria-label` | `"Next verse"` |
| `#verse-reader-content` | `aria-live="polite" aria-atomic="true"` | Announces verse changes to screen readers |

### Focus States

```css
/* src/styles/index.css — Section 11: Focus / Accessibility */

/* Visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-saffron);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Remove outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## Section 10: Performance

### What Vite Gives You for Free

Vite's production build (`npm run build`) applies these optimizations automatically — no configuration needed:

| Optimization | How Vite Handles It |
|---|---|
| Tree-shaking | Rollup removes unused exports from all imported modules |
| JS minification | Terser/esbuild minifies output JS |
| CSS minification | Lightning CSS (Vite 5+) minifies output CSS |
| Code splitting | Dynamic `import()` calls become separate chunks |
| Asset hashing | All asset filenames include a content hash for cache busting |
| Path rewriting | All asset paths are prefixed with the configured `base` |

### Checking Build Size

After `npm run build`, inspect `dist/`:

```bash
ls -lh dist/assets/
```

If bundle size is a concern, run a visual analysis:

```bash
# Install bundle visualizer as a dev dependency
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.js plugins temporarily:
# import { visualizer } from 'rollup-plugin-visualizer'
# plugins: [react(), tailwindcss(), visualizer({ open: true })]

npm run build
# Opens an interactive treemap of the bundle in your browser
```

### React.memo on VerseCard

If `VerseCard` was wrapped in `React.memo` in Phase 2, verify it is still in place. With 229 verse cards rendering, the memo prevents re-rendering cards that have not changed when another card becomes active:

```jsx
// src/components/VerseCard.jsx
export default React.memo(function VerseCard({ verse, isActive, onClick }) {
  // ...
})
```

### Performance Checklist Before Deploy

| Check | Expected | How to Verify |
|-------|----------|---------------|
| `npm run build` exits 0 | No errors | Terminal output |
| `npm run preview` serves site | Loads at `http://localhost:4173/gaur-yatra/` | Browser |
| All 32 markers visible in preview | Full feature parity with dev server | Browser |
| No 404s in preview | All assets found | DevTools Network tab |
| No console errors | Zero red entries | DevTools Console |
| Initial load time | Under 3s on broadband | DevTools Network → hard reload → "Finish" time |
| Leaflet CSS loaded once | One request | Network tab |
| Google Fonts loaded | `fonts.googleapis.com` + `fonts.gstatic.com` requests | Network tab |
| Gallery images lazy | `loading="lazy"` on `<img>` | DevTools Elements |

---

## Section 11: Attribution & Footer

### Attribution Line (Inside BottomPanel)

Rather than introducing a standalone Footer component (which would require layout changes and risk overlapping the bottom panel or breaking the flex column), attribution is added as a small text line **inside** the existing BottomPanel/verse reader. This sits below the prev/next buttons and avoids any layout issues.

Add this attribution line at the bottom of the `#bottom-panel` div in `BottomPanel.jsx`, after the verse content and navigation:

```jsx
// Inside BottomPanel.jsx — at the end of the #bottom-panel div, after the Next nav
<div className="verse-reader__attribution">
  CC Madhya 18 ·{' '}
  <a href="https://vedabase.io/en/library/cc/madhya/18/" target="_blank" rel="noopener noreferrer">
    Vedabase
  </a>{' '}
  · BBT ·{' '}
  <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
    OSM
  </a>{' '}
  ·{' '}
  <a href="https://github.com/dev-arctik/gaur-yatra" target="_blank" rel="noopener noreferrer">
    GitHub
  </a>
</div>
```

```css
/* src/styles/index.css — attribution line inside the verse reader */
.verse-reader__attribution {
  position: absolute;
  bottom: 0.3rem;
  right: 1rem;
  font-size: 0.65rem;
  color: var(--color-maroon);
  opacity: 0.6;
  white-space: nowrap;
}
.verse-reader__attribution a {
  color: var(--color-saffron);
  text-decoration: none;
}
.verse-reader__attribution a:hover {
  text-decoration: underline;
  color: var(--color-maroon);
}
```

This approach keeps attribution visible without introducing a separate component or requiring changes to the main layout height calculations. The `#bottom-panel` needs `position: relative` added to its CSS (already defined above) for the absolute positioning to work correctly.

---

## Section 12: Vite Build Configuration

### `vite.config.js` — Complete File

Verified against Context7 (`/vitejs/vite` — static deploy guide):

```js
// vite.config.js — project root
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // Tailwind v4 Vite plugin — replaces PostCSS config
  ],

  // CRITICAL: base must match your GitHub Pages repository subdirectory path.
  // The site will be served at https://dev-arctik.github.io/gaur-yatra/
  // Without this setting, Vite generates asset paths like /assets/main-abc123.js
  // which resolve to https://dev-arctik.github.io/assets/... (wrong — 404).
  // With base: '/gaur-yatra/', Vite rewrites them to /gaur-yatra/assets/main-abc123.js
  // which resolves correctly.
  base: '/gaur-yatra/',

  build: {
    outDir: 'dist',       // default — output goes here
    sourcemap: false,     // disable sourcemaps in production for smaller bundle
  },
})
```

### Why `base` Matters — Explained in Full

GitHub Pages hosts your site at `https://dev-arctik.github.io/gaur-yatra/`, NOT at the root `https://dev-arctik.github.io/`.

During a Vite production build, every asset reference in your code is rewritten to an absolute path. Without `base` configured:

```html
<!-- Vite generates WITHOUT base: -->
<script type="module" src="/assets/index-Dm5wL3o_.js"></script>
<link rel="stylesheet" href="/assets/index-BUkp2vAK.css">
```

These paths resolve to `https://dev-arctik.github.io/assets/...` — that URL does not exist. Result: a blank page with 404s in the Network tab.

With `base: '/gaur-yatra/'`:

```html
<!-- Vite generates WITH base: '/gaur-yatra/' -->
<script type="module" src="/gaur-yatra/assets/index-Dm5wL3o_.js"></script>
<link rel="stylesheet" href="/gaur-yatra/assets/index-BUkp2vAK.css">
```

These resolve to `https://dev-arctik.github.io/gaur-yatra/assets/...` — correct.

The same rewriting applies to:
- All JS-imported assets (icon files, images imported with `import`)
- CSS `url()` references
- The `<link>` and `<script>` tags in `index.html`

### `package.json` Scripts

```json
{
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview",
    "deploy":  "gh-pages -d dist"
  }
}
```

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Starts Vite dev server at `http://localhost:5173` with HMR |
| `npm run build` | Bundles, minifies, and outputs the production build to `dist/` |
| `npm run preview` | Serves the `dist/` folder locally at `http://localhost:4173/gaur-yatra/` — simulates GitHub Pages |
| `npm run deploy` | Runs `gh-pages -d dist` — pushes `dist/` contents to the `gh-pages` branch on GitHub |

### Testing the Production Build Locally

Before deploying, always verify the production build locally:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173/gaur-yatra/` in your browser. The `/gaur-yatra/` prefix in the local preview URL confirms `base` is active and paths will resolve correctly on GitHub Pages.

If anything is broken in preview, fix it before deploying — what you see in preview is exactly what GitHub Pages will serve.

---

## Section 13: GitHub Repository Setup

### Step-by-Step

**1. Create the repository on GitHub.**

- Go to `https://github.com/new`
- Repository name: `gaur-yatra`
- Owner: `dev-arctik`
- Visibility: **Public** (required for free GitHub Pages hosting)
- Initialize with: **nothing** — do NOT check "Add a README", "Add .gitignore", or "Choose a license". These files already exist in the project.
- Click "Create repository"

**2. Initialize git in the local project folder.**

```bash
cd /Users/devanshraj/Projects/Work/iskcon/gaur_yatra
git init
git branch -M main
```

**3. Add the remote.**

```bash
git remote add origin https://github.com/dev-arctik/gaur-yatra.git
```

**4. Stage and commit all files.**

```bash
git add index.html vite.config.js package.json package-lock.json .gitignore README.md
git add src/ public/ docs/
git commit -m "Initial commit: Gaur Yatra v1 — Chaitanya Mahaprabhu's Journey Through Vraj Bhumi

React 19 + Vite + Tailwind CSS v4 + Leaflet.js interactive map.
32 sacred locations, 229 verses of CC Madhya 18, Play Journey mode,
synchronized 4-panel layout, photo gallery. Deploys to
https://dev-arctik.github.io/gaur-yatra via gh-pages."
```

**5. Push to GitHub.**

```bash
git push -u origin main
```

### `.gitignore` for Vite + React

```gitignore
# Dependencies
node_modules/

# Vite build output — deployed separately, not committed to main
dist/

# Environment files — never commit secrets
.env
.env.local
.env.*.local

# macOS metadata
.DS_Store
.AppleDouble
.LSOverride

# Editor directories
.idea/
.vscode/
*.swp
*.swo

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript (if added later)
*.tsbuildinfo
```

### Repository File Structure on First Push

```
gaur-yatra/                       <- GitHub repository root
├── index.html                    <- Vite HTML entry point
├── vite.config.js                <- base: '/gaur-yatra/' set here
├── package.json                  <- deploy script; dev/build/preview scripts
├── package-lock.json
├── .gitignore
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   └── index.css             <- @import "tailwindcss"; @theme { ... }
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── VersePanel.jsx          <- condensed verse list grouped by location
│   │   ├── VerseCard.jsx           <- compact verse entry with type badge
│   │   ├── MapView.jsx
│   │   ├── GalleryPanel.jsx        <- gallery carousel + location info card
│   │   └── BottomPanel.jsx         <- verse reader (Sanskrit + translation + prev/next)
│   ├── assets/
│   │   └── icons/                          <- ES module imports, Vite-processed
│   │       ├── chaitanya-marker.png
│   │       └── chaitanya-marker-active.png
│   └── data/
│       ├── verses.js
│       └── locations.js
├── public/
│   └── assets/
│       └── images/locations/               <- user photos, served as-is (not Vite-processed)
│           ├── arit-grama/
│           ├── radha-kunda/
│           └── ... (32 folders)
└── docs/
    └── planning/
        ├── gaur-yatra-plan.md
        └── phase-5-polish-deploy.md
```

---

## Section 14: GitHub Pages Deployment — Step by Step

### Option A: `gh-pages` npm Package (Recommended)

This is the simplest deployment approach. The `gh-pages` package takes the contents of `dist/` and pushes them to a dedicated `gh-pages` branch. GitHub Pages serves from that branch. No manual file copying, no CI/CD setup.

Verified via Context7 (`/tschaub/gh-pages`).

**Step 1: Install gh-pages as a dev dependency.**

```bash
npm install --save-dev gh-pages
```

This adds `gh-pages` to `devDependencies` in `package.json`. It is a build-time tool — not part of the app bundle.

**Step 2: Add the deploy script to `package.json`.**

```json
{
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview",
    "deploy":  "gh-pages -d dist"
  }
}
```

`gh-pages -d dist` means: "take everything in the `dist/` directory and push it to the `gh-pages` branch of the current repository's remote."

**Step 3: Build and deploy.**

Always build before deploying — `npm run deploy` does NOT auto-trigger a build:

```bash
npm run build && npm run deploy
```

What happens when you run this:
1. `npm run build` — Vite bundles the app into `dist/` with all paths prefixed by `/gaur-yatra/`
2. `npm run deploy` — `gh-pages` creates a temporary git clone, copies the `dist/` contents into it, commits, and force-pushes to the `gh-pages` branch on `origin`
3. GitHub detects the push to `gh-pages` and begins a Pages deployment (visible in the repo's "Deployments" sidebar on GitHub)
4. After 1–3 minutes, the site is live

**Step 4: Configure GitHub Pages to serve from the `gh-pages` branch.**

This is a one-time setup step:
1. Go to `https://github.com/dev-arctik/gaur-yatra`
2. Click the **Settings** tab
3. In the left sidebar, click **Pages** (under "Code and automation")
4. Under "Build and deployment" → "Source": select **Deploy from a branch**
5. Under "Branch": select **gh-pages**, folder **/ (root)**
6. Click **Save**

GitHub Pages will show a green checkmark and the published URL once the first deployment completes:
`https://dev-arctik.github.io/gaur-yatra`

**Step 5: Verify.**

Open `https://dev-arctik.github.io/gaur-yatra` in Chrome. The page should load with the header, map, verse panel, and gallery — identical to what `npm run preview` showed locally.

**Subsequent deployments:** Every time you make changes and want to ship them:

```bash
npm run build && npm run deploy
```

That's it. The `gh-pages` branch is always overwritten with the latest build. You never edit the `gh-pages` branch manually.

---

### Option B: GitHub Actions Workflow (Alternative — More Automated)

If you prefer deployments to trigger automatically on every push to `main` without running any local commands, use a GitHub Actions workflow.

**Why you might prefer this:** Any collaborator who pushes to `main` automatically triggers a deploy — no need to remember `npm run build && npm run deploy`.

**Why Option A is still recommended for v1:** Less setup, no YAML to debug, no GitHub secrets to manage. For a solo project, manual deploy control is often preferable.

**Create `.github/workflows/deploy.yml`:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]  # Trigger on every push to main
  workflow_dispatch:    # Allow manual trigger from the GitHub Actions UI

# Required permissions for the GITHUB_TOKEN to push to Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Prevent concurrent deployments — cancel in-progress runs if a new push arrives
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci  # Use ci instead of install for reproducible builds

      - name: Build
        run: npm run build  # Runs vite build; outputs to dist/

      - name: Configure GitHub Pages
        uses: actions/configure-pages@v4

      - name: Upload dist/ as Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist  # Upload the Vite build output

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
        # This action reads the artifact uploaded above and deploys it to Pages
```

**GitHub Pages Settings for Option B:**

When using GitHub Actions workflow (Option B), set the Pages source differently than Option A:
- Settings → Pages → Source → **GitHub Actions** (not "Deploy from a branch")

**If switching from Option A to Option B:** Change the source setting from "gh-pages branch" to "GitHub Actions". The `gh-pages` branch becomes irrelevant.

---

## Section 15: README.md

The `README.md` lives at the project root (`gaur_yatra/README.md`). It must be self-contained enough that a first-time visitor to the GitHub repository understands the project in under 30 seconds, and a contributor can add photos without reading any source code.

```markdown
# Gaur Yatra — Chaitanya Mahaprabhu's Journey Through Vraj Bhumi

An interactive map and scripture viewer documenting Lord Chaitanya Mahaprabhu's
pilgrimage through the sacred places of Vraj Bhumi, as described in the
Caitanya Caritamrita Madhya Lila, Chapter 18.

**Live site:** https://dev-arctik.github.io/gaur-yatra

---

<!-- Add after first deployment: -->
<!-- ![Screenshot of Gaur Yatra](docs/assets/screenshot.png) -->

## What This Is

[1-2 paragraph description covering: purpose, scripture source, four-panel layout
(verse panel, map, gallery, bottom panel), Play Journey mode, and the devotional
intent of the project]

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

To preview the production build (identical to what GitHub Pages serves):

```bash
npm run build
npm run preview
```

Open http://localhost:4173/gaur-yatra/ — note the /gaur-yatra/ path prefix,
which matches the GitHub Pages subdirectory.

## Contributing Photos

Photos of sacred locations in Vraj Bhumi are actively needed. To contribute:

1. Fork this repository on GitHub.
2. Add your photos to the correct folder under:
       public/assets/images/locations/<location-id>/
   (The location IDs are listed in the table below.)
   Photos in public/ are served as-is by Vite — they are NOT processed or hashed.
3. Name photos descriptively: photo-1.jpg, photo-2.jpg, etc.
   JPEG or WebP format, maximum 1 MB per photo recommended.
4. Update the images array for that location in src/data/locations.js.
   Reference photos using import.meta.env.BASE_URL:
       images: [
         `${import.meta.env.BASE_URL}assets/images/locations/<location-id>/photo-1.jpg`,
       ]
5. Submit a Pull Request with a brief description of the photos and
   their source (personal photo, Wikimedia Commons CC license, etc.).

### Location ID Reference

| # | Location ID   | Name                  |
|---|---------------|-----------------------|
| 1 | arit-grama    | Arit-grama (Arith)   |
| 2 | radha-kunda   | Radha-kunda           |
... (all 32)

## Tech Stack

- React 19 — component-based UI
- Vite — build tool and dev server
- Tailwind CSS v4 — CSS-first utility styling
- Leaflet.js 1.9.4 (via npm) — interactive map
- OpenStreetMap — map tiles (free, no API key)
- Google Fonts — Crimson Text, Noto Serif Devanagari
- gh-pages — GitHub Pages deployment

## Attribution

Translations by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada.
Source: https://vedabase.io/en/library/cc/madhya/18/
Copyright Bhaktivedanta Book Trust. Used for non-commercial educational purposes.

Map tiles copyright OpenStreetMap contributors (openstreetmap.org/copyright).

## License

Code: MIT License
Content (verse translations): Copyright Bhaktivedanta Book Trust. All rights reserved.
Contributed photos: Individual contributors retain their own rights.
This project is non-commercial and created for the glorification of Sri Chaitanya Mahaprabhu.

## Known Limitations (v1)

- Mobile / responsive layout is not supported in v1. The site targets desktop
  browsers at minimum 1024px width.
- All 32 locations show a photo placeholder on launch. Community photo
  contributions via Pull Requests are welcome.
```

---

## Section 16: Troubleshooting — GitHub Pages Common Issues

This is the most failure-prone step for developers new to Vite + GitHub Pages. Every item below has been observed in real deployments.

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Blank page at `https://dev-arctik.github.io/gaur-yatra` | `base` not set in `vite.config.js`, or set incorrectly | Confirm `base: '/gaur-yatra/'` in `vite.config.js`. Rebuild and redeploy. |
| 404 on all JS/CSS assets in Network tab | Same as above — `base` missing | Check the `src` and `href` values in the deployed `index.html` — they should start with `/gaur-yatra/assets/`. If they start with `/assets/`, `base` is missing. |
| Map shows but marker icons are missing (broken img) | Icon imported as a raw string path instead of via `import` | In `MapView.jsx`, use `import chaitanyaIconUrl from '../assets/icons/chaitanya-marker.png'` and reference `chaitanyaIconUrl` in `L.icon({ iconUrl: chaitanyaIconUrl })`. |
| 404 on the GitHub Pages URL itself (not assets) | `gh-pages` branch not set as the Pages source | Go to Settings → Pages → Source → "Deploy from a branch" → select `gh-pages` branch. |
| `gh-pages` branch shows in repo but site not live | Pages not enabled yet | Enable Pages in Settings → Pages. The branch existing does not auto-enable Pages. |
| `npm run deploy` fails with "fatal: remote error" | Not authenticated to push to GitHub | Check your git credentials. Run `git push origin main` — if that also fails, fix auth first. |
| `npm run deploy` succeeds but old version still shows | Browser cache | Hard reload: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows). Or check GitHub Deployments to confirm the new deploy completed. |
| Leaflet map not rendering | Leaflet CSS not imported in `main.jsx` or `App.jsx` | Verify `import 'leaflet/dist/leaflet.css'` is present in the React entry file. |
| Google Fonts not loading | Network/ad blocker blocking fonts CDN | Test in incognito without extensions. The fonts are optional — the site works with Georgia fallback. |
| Devanagari text shows as boxes | Google Fonts not loaded before React renders | Confirm the `<link>` for Google Fonts is in `index.html` `<head>`, not in a React component. Component-level font loading fires too late. |
| `npm run preview` shows correct path but GitHub Pages does not | `vite preview` adds `base` locally but you forgot to rebuild | Always run `npm run build` before `npm run deploy`. Preview uses the current `dist/` — if `dist/` is stale, preview is misleading. |
| Play Journey stops at step 1 | `locations` array not sorted by `journeyOrder` | Verify `useJourney` hook sorts by `journeyOrder` via `useMemo` before building the step sequence. |
| Tailwind classes not applied | `@import "tailwindcss"` missing from CSS file, or `@tailwindcss/vite` plugin not in `vite.config.js` | Check both. The v4 plugin is required — PostCSS config is not used with the Vite plugin. |
| Custom Tailwind colors not working (e.g., `bg-saffron` not applied) | `@theme { --color-saffron: ... }` missing or CSS file not imported in `main.jsx` | Confirm the CSS file with `@theme` is imported via `import './styles/index.css'` in `main.jsx`. |

---

## Implementation Plan

### Task Breakdown

| Task | File(s) Modified | Estimated Time | Depends On |
|------|-----------------|----------------|------------|
| Add `base: '/gaur-yatra/'` to `vite.config.js` | `vite.config.js` | 2 min | Nothing — do first |
| Verify `@tailwindcss/vite` plugin installed and in config | `vite.config.js`, `package.json` | 5 min | Nothing |
| Add Google Fonts `<link>` to `index.html` | `index.html` | 5 min | Nothing |
| Add `@import "tailwindcss"` + `@theme {}` to CSS | `src/styles/index.css` | 15 min | Nothing |
| Mirror design tokens to `:root` CSS vars | `src/styles/index.css` | 5 min | `@theme` block |
| Header component styling | `src/components/Header.jsx`, `src/styles/index.css` | 30 min | Design tokens |
| Left panel: location group dividers + condensed verse entries | `src/styles/index.css`, `VersePanel.jsx` | 30 min | Design tokens |
| Left panel: verse type badge pill colors (arrival/event/glory/narrative) | `src/styles/index.css`, `VerseCard.jsx` | 15 min | Design tokens |
| Active verse highlight + active location group header | `src/styles/index.css` | 10 min | Design tokens |
| Custom scrollbar (WebKit + Firefox) | `src/styles/index.css` | 15 min | Verse panel CSS |
| Place final marker icon at `src/assets/icons/` | `src/assets/icons/` | depends on sourcing | Icon decision |
| Update `L.icon` config with imported URL | `MapView.jsx` | 10 min | Icon files placed |
| Marker pulse animation + declarative icon swap | `src/styles/index.css`, `MapView.jsx` | 20 min | Icon imported |
| Leaflet popup content + global CSS overrides | `MapView.jsx`, `src/styles/index.css` | 45 min | Design tokens, fonts |
| Polyline dash pattern | `MapView.jsx` | 5 min | Nothing |
| Gallery aspect ratio + arrow button styles | `src/styles/index.css`, `GalleryPanel.jsx` | 30 min | Design tokens |
| Gallery placeholder card JSX + CSS | `GalleryPanel.jsx`, `src/styles/index.css` | 20 min | Design tokens |
| Right panel: location info card (name, Devanagari, description, Maps button) | `GalleryPanel.jsx`, `src/styles/index.css` | 30 min | Design tokens, Devanagari font |
| Bottom panel: verse reader layout + Sanskrit/translation typography | `src/styles/index.css`, `BottomPanel.jsx` | 45 min | Design tokens, Devanagari font |
| Bottom panel: verse type badge in reader | `BottomPanel.jsx`, `src/styles/index.css` | 10 min | Badge colors defined |
| Bottom panel: Prev/Next navigation buttons | `BottomPanel.jsx`, `src/styles/index.css` | 20 min | Verse reader layout |
| `aria-live` on verse reader content | `BottomPanel.jsx` | 5 min | Bottom panel JSX |
| `aria-label` pass on all interactive elements | `Header.jsx`, `VerseCard.jsx`, `MapView.jsx`, `GalleryPanel.jsx`, `BottomPanel.jsx` | 45 min | All components finalized |
| `title` attribute on all 32 Leaflet markers | `MapView.jsx` | 15 min | Locations data |
| `:focus-visible` CSS | `src/styles/index.css` | 10 min | Design tokens |
| Attribution line inside BottomPanel + CSS | `BottomPanel.jsx`, `src/styles/index.css` | 15 min | Bottom panel JSX |
| `loading="lazy"` audit on gallery images | `GalleryPanel.jsx` | 5 min | Gallery component |
| `React.memo` verification on VerseCard | `VerseCard.jsx` | 5 min | Nothing |
| `npm run build` — first production build | terminal | 5 min | All code complete |
| `npm run preview` — smoke test locally | browser | 20 min | Build passes |
| Write `.gitignore` | `.gitignore` | 5 min | Nothing |
| Write `README.md` | `README.md` | 45 min | Site is deployed (for live URL) |
| Install `gh-pages`, add deploy script | `package.json` | 5 min | Nothing |
| Create GitHub repo `gaur-yatra` | GitHub web UI | 5 min | Nothing |
| Initial commit + push to `main` | bash | 5 min | Repo created |
| Enable GitHub Pages (gh-pages branch) | GitHub web UI | 5 min | Files pushed to main |
| `npm run build && npm run deploy` | terminal | 3 min | Pages setting saved |
| Verify live URL | browser | 5 min | Deploy complete |
| Full smoke test — Chrome | browser | 30 min | Live URL works |
| Full smoke test — Firefox | browser | 20 min | Chrome smoke test passed |
| Full smoke test — Safari | browser | 20 min | Firefox smoke test passed |

### Phases Within Phase 5

```
Step 1: Build Foundation
  -> Set base: '/gaur-yatra/' in vite.config.js
  -> Verify @tailwindcss/vite plugin
  -> Add Google Fonts to index.html
  -> @import "tailwindcss" + @theme tokens in CSS
  -> Mirror tokens to :root CSS vars

Step 2: Left Panel (Condensed Verse List)
  -> Location group divider/header styling
  -> Condensed verse entry styling (compact, one line)
  -> Verse type badge pill colors (arrival=green, event=blue, glory=gold, narrative=gray)
  -> Active verse highlight + active location group header
  -> Custom scrollbar

Step 3: Map / Center
  -> Place final marker icon
  -> Import icon URLs in MapView.jsx
  -> Update L.icon config
  -> Marker pulse animation
  -> Leaflet popup CSS overrides
  -> Polyline dash

Step 4: Right Panel (Gallery + Location Info Card)
  -> Gallery aspect ratio
  -> Arrow buttons + aria-labels
  -> Placeholder card
  -> Location info card (name, Devanagari, description, Google Maps button)

Step 5: Bottom Panel (Verse Reader)
  -> Increase --bottom-panel-height to 12rem for reading comfort
  -> Verse reader layout: Sanskrit text + English translation
  -> Verse number + verse type badge header
  -> Sanskrit in Noto Serif Devanagari, translation in Crimson Text (larger, comfortable size)
  -> Prev/Next navigation buttons (saffron/maroon styled)
  -> CSS transition on verse change
  -> aria-live region on verse reader content

Step 6: Accessibility
  -> aria-label pass on all elements
  -> :focus-visible states

Step 7: Attribution (inside BottomPanel)

Step 8: Performance
  -> npm run build (first time)
  -> npm run preview (local smoke test)
  -> React.memo verification
  -> lazy loading audit

Step 9: README + .gitignore

Step 10: GitHub Setup + Deploy
  -> Create repo
  -> Initial commit + push
  -> Install gh-pages + add deploy script
  -> npm run build && npm run deploy
  -> Enable Pages in Settings -> gh-pages branch
  -> Verify live URL

Step 11: Smoke Testing (all 3 browsers)
```

---

## Smoke Test Checklist (Final QA)

Run on Chrome first, then repeat on Firefox and Safari. All items must pass on all three browsers at `https://dev-arctik.github.io/gaur-yatra` before Phase 5 is complete.

### Page Load

- [ ] Page loads at `https://dev-arctik.github.io/gaur-yatra` without any redirect
- [ ] No 404 errors in Network tab for any resource (HTML, CSS, JS, fonts, icons)
- [ ] No console errors (red entries) in any browser
- [ ] No unexpected console warnings (Leaflet and Vite produce none in production by default)
- [ ] Page load "Finish" time under 3 seconds (DevTools Network tab, hard reload, cache disabled)
- [ ] Google Fonts loaded: "Crimson Text" and "Noto Serif Devanagari" present in Network tab
- [ ] Header background gradient is visible (saffron to maroon)

### Vite Build Verification (Critical)

- [ ] All JS assets have `/gaur-yatra/assets/` prefix in the URL bar of Network tab
- [ ] All CSS assets have `/gaur-yatra/assets/` prefix in Network tab
- [ ] No asset URLs start with `/assets/` (would indicate `base` is missing)
- [ ] `dist/index.html` `<script src>` and `<link href>` both start with `/gaur-yatra/`

### Map

- [ ] All 32 markers visible on the Leaflet map
- [ ] Custom Chaitanya Mahaprabhu icon displayed (not the default Leaflet blue pin)
- [ ] Polyline connects all 32 markers in journey order
- [ ] Polyline appears dashed and saffron-colored
- [ ] Map zoom controls are visible and not obscured
- [ ] Click any marker → popup appears with location name, Devanagari name, verse range, and "Stop X of 32"
- [ ] Popup uses custom styling (cream background, warm border, Crimson Text font, no blue)

### Left Panel (Condensed Verse List)

- [ ] All 229 verses visible, numbered, and **grouped by location**
- [ ] Location group divider headers are visible with location name in bold
- [ ] Left panel scrolls smoothly
- [ ] Custom saffron scrollbar visible in Chrome/Safari
- [ ] Each verse entry has a **verse type badge pill** with correct color: arrival=green, event=blue, glory=gold, narrative=gray
- [ ] Verse entries are condensed (compact, one line each) with truncated translation text
- [ ] Click a location group header → map pans, marker highlights, gallery + location info update
- [ ] Click a verse entry → bottom panel verse reader updates to show that verse
- [ ] Active verse receives the `verse--active` class: left saffron border + pale tint
- [ ] Active location group header receives `location--active` class

### Interactivity — Panel Sync

- [ ] Click a map marker → left panel scrolls to the location group, first verse selected
- [ ] All verses for the clicked location are within the highlighted location group
- [ ] Bottom panel (verse reader) updates: verse number, Sanskrit text, translation, verse type badge
- [ ] Bottom panel content transitions with fade animation (not instant jump)
- [ ] Gallery updates to show photos or placeholder for clicked location
- [ ] Right panel location info card updates: name, Devanagari name, description
- [ ] Google Maps button in right panel location info card has correct coordinates

### Right Panel (Gallery + Location Info)

- [ ] Gallery shows placeholder card for all locations without photos
- [ ] Placeholder card has dashed lotus-pink border
- [ ] If any location has photos: prev/next arrows navigate between photos
- [ ] Photo counter updates correctly
- [ ] Prev button disabled on first photo; Next button disabled on last
- [ ] Image container maintains 4:3 aspect ratio
- [ ] Images have `loading="lazy"` attribute (verify in DevTools Elements tab)
- [ ] Location info card visible **below** gallery carousel

### Bottom Panel (Verse Reader)

- [ ] Pinned to viewport bottom as a flex child — does not scroll with page
- [ ] The panel feels like a **book reader** — generous height, comfortable text size
- [ ] Verse number displayed prominently in Crimson Text
- [ ] Verse type badge visible next to verse number with correct color
- [ ] Sanskrit text visible in Noto Serif Devanagari — no fallback boxes, generous line-height
- [ ] English translation visible in Crimson Text at comfortable reading size (larger than left panel text)
- [ ] Prev/Next navigation buttons visible, styled as rounded circles with saffron hover
- [ ] Prev button disabled on first verse; Next button disabled on last verse
- [ ] Clicking Prev/Next navigates through verses and updates the verse reader
- [ ] Content transitions with fade + slight upward movement when verse changes

### Right Panel (Location Info Card)

- [ ] Location info card visible below the gallery carousel
- [ ] Location name in header style (Crimson Text, bold)
- [ ] Devanagari name below location name in Noto Serif Devanagari — no fallback boxes
- [ ] Description text visible, clamped to 4 lines if long
- [ ] Google Maps button styled as a subtle bordered link/button
- [ ] Google Maps button opens correct coordinates in new tab
- [ ] Location info card updates when a different location is selected

### Play Journey

- [ ] Play button visible in header; Pause button disabled on initial load
- [ ] Clicking Play starts auto-advance through all 32 locations at ~3-second intervals
- [ ] Journey progress counter updates: "Location 1 / 32", etc.
- [ ] Map flies to each new location during playback
- [ ] Marker, verse reader (bottom panel), gallery, and location info card all update during playback
- [ ] Clicking Pause stops playback; Play button re-enables
- [ ] After all 32 locations visited, interval clears and Play re-enables

### Typography & Design

- [ ] Crimson Text rendering: header title, left panel text, popup text, bottom panel verse reader translation, right panel location name
- [ ] Noto Serif Devanagari rendering: bottom panel Sanskrit text, right panel Devanagari name, map popup Devanagari — no boxes, no fallback glyph
- [ ] Bottom panel verse reader text is noticeably **larger and more readable** than left panel condensed text
- [ ] Verse type badge colors are distinct and readable: green (arrival), blue (event), gold (glory), gray (narrative)
- [ ] Color palette consistent: saffron, maroon, cream — no default blue anywhere
- [ ] Focus states visible on Play/Pause, gallery arrows, and verse reader Prev/Next when tabbed to

### Attribution (Inside Bottom Panel)

- [ ] Attribution line visible at the bottom-right of the verse reader panel
- [ ] Vedabase attribution text present with working link
- [ ] OpenStreetMap (OSM) attribution present with working link
- [ ] BBT credit present
- [ ] GitHub link opens `https://github.com/dev-arctik/gaur-yatra` in new tab
- [ ] Attribution text is subtle (small font, reduced opacity) and does not interfere with reading

### README (verify on GitHub)

- [ ] `README.md` renders correctly on `https://github.com/dev-arctik/gaur-yatra`
- [ ] Project description is clear in the first screen
- [ ] Live site link is present and clickable
- [ ] Local dev instructions are accurate (`npm install && npm run dev`)
- [ ] Photo contribution guide lists all 32 location IDs
- [ ] Tech stack lists React 19, Vite, Tailwind CSS v4

---

## Known Limitations / v2 Backlog

| Item | v1 Status | v2 Plan |
|------|-----------|---------|
| Mobile / responsive layout | Not supported. Site targets desktop at minimum 1024px. | Full responsive redesign: collapsible panels, touch-friendly map, swipe gallery. |
| Real photos for all 32 locations | All 32 locations show placeholder card on launch. | Accept community photo contributions via PRs. |
| Verse audio playback | No audio in v1. | Add an audio player per verse using Bhaktivedanta Archives recordings (if rights permit). |
| Hindi / Bengali translations | English only in v1. | Source Hindi translation from Vedabase; add a language toggle. |
| Full-text search | No search in v1. | Add a search bar above the verse panel filtering verses by keyword. |
| Offline / PWA support | Not implemented in v1. | Add `service-worker.js` with precache for verses.js, locations.js, and icons. |
| Verse purport excerpts | `purportExcerpt` field removed from verse model in redesign. Not in v1 scope. | Source purport data and add a collapsible "Read Purport" section in the verse reader. |
| Full keyboard navigation audit | Partial — focus states only. | Tab order, Enter to activate verse cards, arrow keys in gallery. |
| Custom domain | Served under `dev-arctik.github.io`. | Point a custom domain at GitHub Pages and remove `base` from `vite.config.js`. |

---

## Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|------------|
| `base: '/gaur-yatra/'` missing or wrong — blank page on GitHub Pages | High | Medium | The `npm run preview` step catches this locally before any deploy. Check that preview URL is `http://localhost:4173/gaur-yatra/`. If base were wrong, preview would also 404. Make this check mandatory before every `npm run deploy`. |
| Marker icon imported as a raw string path — 404 on GitHub Pages | High | Medium | In `MapView.jsx`, always use `import chaitanyaIconUrl from '../assets/icons/...'` and pass the variable to `L.icon`. Never use a hardcoded string path for Leaflet icon URLs in a Vite project. |
| Leaflet popup CSS overrides not applying (default styles winning) | Medium | Medium | Leaflet popup CSS must be in the global CSS file imported in `main.jsx`. Scoped component CSS (CSS Modules) cannot reach Leaflet's dynamically injected DOM. Increase specificity if needed. |
| `@tailwindcss/vite` plugin missing — Tailwind classes do nothing | High | Low | Run `npm run build` early (Step 1 of implementation). If Tailwind classes are not applied, the build output will look unstyled immediately. Verify `@tailwindcss/vite` is in `package.json devDependencies` and listed in `vite.config.js` plugins. |
| `@theme {}` tokens not generating utilities — `bg-saffron` class not applied | Medium | Low | Verify `@import "tailwindcss"` appears BEFORE `@theme {}` in the CSS file, and that the CSS file is imported in `main.jsx`. The order matters in Tailwind v4. |
| Marker icon not ready by Phase 5 start | Medium | Medium | Use the lotus SVG fallback (Option C). The icon swap is a single file replacement + one line in `MapView.jsx`. Do not block the entire phase on icon sourcing. |
| Google Fonts CDN blocked for some users | Low | Low | Both fonts have acceptable system fallbacks: `Georgia, serif` for Crimson Text; `serif` for Noto Serif Devanagari. The fallback will not render Devanagari correctly, but the site will not crash. |
| Bottom panel (verse reader) overlaps left/right panels | Low | Medium | The `--bottom-panel-height` is `12rem` for comfortable reading. The bottom panel is a flex child (not position:fixed), so overlap should not occur. If it does, adjust the CSS variable value and rebuild. Ensure left/right panel `height` calc accounts for the taller bottom panel. Attribution is inside the bottom panel, so no separate footer overlap is possible. |

---

## Open Questions

- [ ] **Marker icon decision (BLOCKING for Step 3)** — Which option is approved: A (devotional PNG), B (SVG silhouette), or C (lotus fallback)? Who will source or create the icon? This must be resolved before the marker styling work begins. The rest of Phase 5 is not blocked.
- [ ] **Devanagari location names accuracy** — The 32 Devanagari names in `src/data/locations.js` need to be reviewed by someone fluent in Devanagari script to confirm correct spelling. Who will do this review?
- [ ] **Screenshot for README banner** — The README references a screenshot placeholder. This can only be taken after deployment. Who takes the screenshot and adds it to the repo?
- [ ] **License file** — Should a `LICENSE` file with MIT text be created, noting that verse translation content is copyright Bhaktivedanta Book Trust? Or is the README attribution sufficient for v1?
- [ ] **Custom domain in v1 scope?** — If a custom domain is used (e.g., `gauryatra.com`), the `base` in `vite.config.js` must change from `'/gaur-yatra/'` to `'/'`. Decide before deployment — changing this after the first deploy requires a rebuild and redeploy.

---

## References

- Master plan: `docs/planning/gaur-yatra-plan.md`
- Vite static deploy guide (verified via Context7 `/vitejs/vite`): https://vitejs.dev/guide/static-deploy.html
- Vite `base` config option (verified via Context7 `/vitejs/vite`): https://vitejs.dev/config/shared-options.html#base
- Tailwind CSS v4 `@theme` directive (verified via Context7 `/tailwindlabs/tailwindcss.com`): https://tailwindcss.com/docs/functions-and-directives#theme-directive
- `@tailwindcss/vite` plugin (verified via Context7 `/tailwindlabs/tailwindcss.com`): https://tailwindcss.com/docs/installation/using-vite
- `gh-pages` npm package (verified via Context7 `/tschaub/gh-pages`): https://github.com/tschaub/gh-pages
- Leaflet.js custom icons API: https://leafletjs.com/examples/custom-icons/
- Google Fonts — Crimson Text: https://fonts.google.com/specimen/Crimson+Text
- Google Fonts — Noto Serif Devanagari: https://fonts.google.com/noto/specimen/Noto+Serif+Devanagari
- GitHub Pages documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- OpenStreetMap tile attribution: https://www.openstreetmap.org/copyright
- Vedabase CC Madhya 18: https://vedabase.io/en/library/cc/madhya/18/
- Target deployment URL: `https://dev-arctik.github.io/gaur-yatra`
