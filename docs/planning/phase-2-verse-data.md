# Feature: Phase 2 — Verse Data: Scrape Vedabase + VersePanel/VerseCard Components

**Version:** v2.0
**Status:** Approved
**Type:** Implementation Guide
**Created:** 2026-03-05
**Last Modified:** 2026-03-05
**Parent Plan:** `docs/planning/gaur-yatra-plan.md`
**Tech Stack:** React 19 + Vite

---

## Problem Statement

Phase 1 delivers the React + Vite project shell — the Leaflet map rendered inside a React component, 32 location markers, the polyline, and the 3-column layout as JSX. The left panel (`VersePanel`) exists only as a placeholder. Phase 2 bridges the gap between the visual map and the scripture it depicts.

This phase has two distinct halves:

1. **Data work:** Scrape all 229 verses from Vedabase and produce `src/data/verses.js` — an ES module array with full verse objects, manually annotated with `locationId` and `verseType` values.
2. **Component work:** Build `src/components/VersePanel.jsx` and `src/components/VerseCard.jsx` — the React components that render a condensed verse list in the scrollable left panel, grouped by location, with verse type badges, active highlighting, and scroll-to-verse behavior driven by `selectedLocationId` and `selectedVerseId` state.

This is the most labor-intensive phase of the project. The scraping is a one-time extraction; the verse-to-location and verse-type mapping requires careful manual review of the chapter text. The component work requires understanding how `selectedLocationId` and `selectedVerseId` state flows from `App.jsx` through `VersePanel` and into each `VerseCard`.

---

## Goals & Success Criteria

- `src/data/verses.js` contains exactly 229 verse objects, each with `id`, `number`, `sanskrit`, `translation`, `verseType`, and `locationId`.
- Each verse has a `verseType` classification: `"arrival"` | `"event"` | `"glory"` | `"narrative"`.
- `VersePanel` renders all 229 verses in the left panel as a condensed, grouped-by-location verse list with no React warnings.
- Each `VerseCard` displays: verse number, verse type badge (small colored pill), and a one-line truncated translation preview.
- Every `locationId` value in `verses.js` resolves to a real entry in `src/data/locations.js`.
- When `selectedLocationId` changes, the panel auto-scrolls to the first verse for that location.
- `verses.length === 229` verifiable in the browser console.
- `npm run dev` produces no errors or React key warnings.

**Definition of "done":** The left panel shows a condensed verse list grouped by location, verse type badges are visible on every verse, the panel scrolls to the correct verse when `selectedLocationId` changes, and clicking a verse sets both `selectedVerseId` and `selectedLocationId` correctly.

---

## Requirements

### Functional Requirements

- **FR-P2-001:** Scrape all 229 verses from `https://vedabase.io/en/library/cc/madhya/18/` — extracting verse number, Sanskrit/Bengali text, and English translation (NOT purport).
- **FR-P2-002:** Populate `src/data/verses.js` as `export const verses = [...]` with all 229 objects matching the schema defined below.
- **FR-P2-003:** Manually assign `locationId` values to all verses that directly name a visited location; set `locationId: null` for purely narrative or philosophical verses. For each verse, also assign a `verseType` value (`"arrival"` | `"event"` | `"glory"` | `"narrative"`) during the manual mapping pass alongside `locationId`.
- **FR-P2-004:** `VersePanel` renders all 229 `VerseCard` components inside a scrollable container on mount, grouped by `locationId` with location divider/headers between groups.
- **FR-P2-005:** Each `VerseCard` is a condensed card showing: verse number (e.g., "18.4"), verse type badge (small colored pill), and a one-line truncated translation preview. Full verse text is NOT shown here — it is rendered in the bottom panel (VerseReader).
- **FR-P2-006:** `VersePanel` uses `useEffect` watching `selectedLocationId` to scroll the panel to the first verse matching that location.
- **FR-P2-007:** `VerseCard` uses `React.memo()` to prevent all 229 cards from re-rendering when only the active card changes.
- **FR-P2-008:** Clicking a `VerseCard` sets `selectedVerseId` (the verse's id) AND `selectedLocationId` (the verse's `locationId`, if not null).

### Non-Functional Requirements

- The scraper script (Option A or B) is a one-time utility — it is NOT committed to the repository.
- Only the output — `src/data/verses.js` — is committed.
- Scraping must be done respectfully: no aggressive polling, no bypassing CAPTCHAs. A single page load suffices.
- 229 `<VerseCard>` components is negligible React rendering cost at this scale — no virtualization or pagination is needed or desired (see performance rationale in Step 4).

### Assumptions

- [ASSUMPTION] Phase 1 is complete: `App.jsx` has `selectedLocationId` and `setSelectedLocationId` state, `src/data/locations.js` exports the `locations` array, `VersePanel` has a placeholder in `App.jsx`, and Tailwind CSS v4 is configured via `@theme {}` in `src/styles/index.css`.
- [ASSUMPTION] The Vedabase page renders full verse content without requiring JavaScript execution for its main content (it does as of the time of writing — but the Playwright option handles the JS-rendered case anyway).
- [ASSUMPTION] Verse numbering in CC Madhya 18 is sequential from 18.1 to 18.229 with no gaps or sub-verses that would break the count.
- [ASSUMPTION] The `locations` array from Phase 1 uses exactly the 32 kebab-case IDs listed in the master plan. Any mismatch between a `locationId` in `verses.js` and the IDs in `locations.js` will silently break Phase 3 interactions.

---

## Dependencies from Phase 1

Phase 2 cannot proceed without these Phase 1 deliverables:

| Dependency | File | What Phase 2 Needs |
|------------|------|--------------------|
| State lifted to App | `src/App.jsx` | `selectedLocationId` and `setSelectedLocationId` state defined in `App`, passed as props to `VersePanel` |
| VersePanel placeholder | `src/App.jsx` | A `<VersePanel>` import and usage stub that Phase 2 replaces with the real component |
| Location data module | `src/data/locations.js` | `export const locations = [...]` so `VersePanel` can import it for location name lookup on badges |
| Tailwind CSS v4 | `src/styles/index.css` (`@theme {}`) | Tailwind utility classes used in `VersePanel.jsx` and `VerseCard.jsx` |
| Vite project shell | `vite.config.js`, `package.json` | `npm run dev` must work before Phase 2 component work begins |

Specifically, `App.jsx` from Phase 1 must define state in a form compatible with Phase 2:

```jsx
// src/App.jsx — Phase 1 output that Phase 2 relies on
const [selectedLocationId, setSelectedLocationId] = useState(null);
const [selectedVerseId, setSelectedVerseId] = useState(null);

// Phase 1 stub — replaced by Phase 2:
<VersePanel
  selectedLocationId={selectedLocationId}
  setSelectedLocationId={setSelectedLocationId}
  selectedVerseId={selectedVerseId}
  setSelectedVerseId={setSelectedVerseId}
/>
```

---

## Step 1 — Vedabase Scraping Strategy

The source URL: `https://vedabase.io/en/library/cc/madhya/18/`

This is a ONE-TIME extraction. The scraper is a throwaway utility — it produces `verses.js` and is then discarded. Do not commit the scraper to the repository.

For each verse, extract three fields:
1. **Verse number** — display label, e.g. `"18.1"`, `"18.42"`, `"18.229"`
2. **Sanskrit text** — the devanagari/Bengali original (romanized transliteration is also acceptable if devanagari is not available in the DOM)
3. **Translation** — the full English translation by Srila Prabhupada

**Note:** Do NOT scrape purport text. We are not showing Prabhupada's commentary in the app.

---

### Option A: Browser Console Script

This is the fastest approach. No Node.js installation needed. Open the Vedabase page in Chrome, open DevTools (F12), paste the script into the Console tab, and copy the output.

**Step-by-step:**

1. Open `https://vedabase.io/en/library/cc/madhya/18/` in Chrome.
2. Wait for the page to fully load (all verses are typically server-rendered and present in the DOM on load).
3. Open DevTools → Console tab (F12 or Cmd+Option+J on Mac).
4. Paste the script below and press Enter.
5. The script logs a JSON array to the console. Right-click the logged array → "Copy object" to copy the full JSON to your clipboard.
6. Paste into a text editor, review, then format as the `verses.js` file.

**Understanding the Vedabase DOM structure:**

Inspect the page source to confirm the selectors. As of writing, Vedabase structures each verse block roughly as:

```
<div class="r-verse-block" id="verse-18-1">        ← one block per verse
  <div class="r-verse-num">18.1</div>               ← verse number
  <div class="r-verse">                             ← Sanskrit/Bengali text block
    <p class="r-devanagari">...</p>                 ← devanagari text (may be absent)
    <p class="r-iast">prabhu kahe,--vrndavane...</p>← romanized IAST text
  </div>
  <div class="r-synonyms">...</div>                 ← word-for-word synonyms (skip)
  <div class="r-translation">                       ← translation wrapper
    <p>Sri Caitanya Mahaprabhu said...</p>          ← English translation text
  </div>
  <!-- purport section exists in the DOM but is NOT scraped — we do not show purport in the app -->
</div>
```

**IMPORTANT:** Before running the script, inspect one verse block in DevTools to confirm the exact class names. Vedabase has updated its DOM in the past. If the selectors below don't match what you see, adjust them by inspecting `document.querySelectorAll('[class*="verse"]')` to find the right class names.

**Console Script:**

```javascript
// Paste this into the Chrome DevTools console on:
// https://vedabase.io/en/library/cc/madhya/18/
// Adjust class selectors if the page structure has changed.

(function extractVerses() {
  // --- SELECTOR CONFIGURATION ---
  // If extraction fails, inspect the DOM and update these selectors.
  const VERSE_BLOCK_SELECTOR   = '.r-verse-block';      // one per verse
  const VERSE_NUM_SELECTOR     = '.r-verse-num';        // verse number label
  const SANSKRIT_SELECTOR      = '.r-iast';             // romanized Sanskrit/Bengali
  const DEVANAGARI_SELECTOR    = '.r-devanagari';       // devanagari script (may be absent)
  const TRANSLATION_SELECTOR   = '.r-translation p';    // English translation paragraph(s)
  // NOTE: purport is NOT scraped — we do not show Prabhupada's commentary in the app
  // --- END CONFIGURATION ---

  const blocks = document.querySelectorAll(VERSE_BLOCK_SELECTOR);

  if (blocks.length === 0) {
    console.error('No verse blocks found. Check VERSE_BLOCK_SELECTOR.');
    return;
  }

  console.log(`Found ${blocks.length} verse blocks. Extracting...`);

  const results = [];

  blocks.forEach((block, index) => {
    // --- Verse number ---
    const numEl = block.querySelector(VERSE_NUM_SELECTOR);
    const rawNum = numEl ? numEl.textContent.trim() : '';
    // Normalize: ensure format is "18.X" — Vedabase may show "Text 1", "18.1", etc.
    const number = rawNum.replace(/^(text\s*|verse\s*)/i, '').trim()
                         || `18.${index + 1}`; // fallback: derive from position

    // --- Sanskrit text ---
    // Prefer devanagari if present; fall back to IAST romanization
    const devanagariEl = block.querySelector(DEVANAGARI_SELECTOR);
    const iastEl       = block.querySelector(SANSKRIT_SELECTOR);
    const sanskrit = (devanagariEl ? devanagariEl.textContent.trim() : '')
                  || (iastEl       ? iastEl.textContent.trim()       : '');

    // --- Translation ---
    // Concatenate all <p> elements inside the translation div
    const translationEls = block.querySelectorAll(TRANSLATION_SELECTOR);
    const translation = Array.from(translationEls)
      .map(p => p.textContent.trim())
      .filter(t => t.length > 0)
      .join(' ');

    results.push({
      id: `cc-madhya-18-${number.replace('18.', '')}`,
      number: number,
      sanskrit: sanskrit || null,
      translation: translation || null,
      verseType: null,   // <-- fill in manually: "arrival" | "event" | "glory" | "narrative"
      locationId: null   // <-- fill in manually in the next step
    });
  });

  console.log(`Extracted ${results.length} verses.`);
  if (results.length !== 229) {
    console.warn(`Expected 229 verses but got ${results.length}. Check for missing or extra blocks.`);
  }

  // Log the full JSON for copy-paste into verses.js
  console.log('--- COPY EVERYTHING BELOW THIS LINE ---');
  console.log(JSON.stringify(results, null, 2));

  return results;
})();
```

**After running:**
- Right-click the array in the console output → "Copy object"
- Paste into a temp file (e.g., `raw-verses.json`)
- Wrap the array in `export const verses = [...];` to create the final `verses.js` file
- Proceed to Step 2 (verse-to-location mapping) before committing the file

**Troubleshooting the console script:**

| Problem | Cause | Fix |
|---------|-------|-----|
| `Found 0 verse blocks` | Selector mismatch | Run `document.querySelectorAll('[class*="verse"]')` and inspect returned elements to find the correct class |
| Verse numbers are blank | `r-verse-num` class name changed | Inspect one verse block in Elements tab; find the number heading and update `VERSE_NUM_SELECTOR` |
| Translation is blank | `r-translation p` not matching | Check if translation is in a `<span>` instead of `<p>`, update selector to `.r-translation` and use `.textContent` directly |
| Sanskrit is null for all verses | Vedabase may use different class names for devanagari | Inspect the first verse block and find the correct class for the original-language text |
| Count is not 229 | Page did not fully load, or some verses are on a separate sub-page | Scroll to the bottom of the page first; Vedabase may lazy-load verses below the fold |

---

### Option B: Playwright Script (Node.js)

Use this option if:
- The Vedabase page requires JavaScript execution to render verse content (i.e., the DOM is empty when viewed in page source)
- You want a reusable script with better error handling and file output
- You are comfortable running Node.js scripts

This script is a **development utility only** — run it once, save the output as `src/data/verses.js`, then delete the script. Do not commit it to the `gaur_yatra` repository.

**Prerequisites:**

```bash
# Create a temporary working directory OUTSIDE the project repo
mkdir ~/vedabase-scraper && cd ~/vedabase-scraper

# Initialize a throw-away package and install Playwright
npm init -y
npm install playwright

# Install the Chromium browser for Playwright
npx playwright install chromium
```

**The Script (`scrape-vedabase.js`):**

```javascript
// scrape-vedabase.js — run once, discard after use.
// Usage: node scrape-vedabase.js
// Output: verses-raw.json (copy content into src/data/verses.js)

const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = 'https://vedabase.io/en/library/cc/madhya/18/';

// --- Selector configuration ---
// Update these if Vedabase changes its DOM.
const SELECTORS = {
  verseBlock:   '.r-verse-block',
  verseNum:     '.r-verse-num',
  devanagari:   '.r-devanagari',
  iast:         '.r-iast',
  translation:  '.r-translation p',
  // NOTE: purport is NOT scraped — we do not show Prabhupada's commentary in the app
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Navigating to: ${TARGET_URL}`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for at least one verse block to be present before extracting
  await page.waitForSelector(SELECTORS.verseBlock, { timeout: 30000 });

  // Scroll to the bottom to trigger any lazy-loaded content
  console.log('Scrolling to bottom to trigger lazy load...');
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  // Wait briefly for any newly loaded content to settle
  await page.waitForTimeout(2000);

  // Extract verse data in the browser context
  const verses = await page.evaluate((selectors) => {
    const blocks = document.querySelectorAll(selectors.verseBlock);
    const results = [];

    blocks.forEach((block, index) => {
      // Verse number
      const numEl = block.querySelector(selectors.verseNum);
      const rawNum = numEl ? numEl.textContent.trim() : '';
      const number = rawNum.replace(/^(text\s*|verse\s*)/i, '').trim()
                   || `18.${index + 1}`;

      // Sanskrit (devanagari preferred, fall back to IAST romanization)
      const devEl  = block.querySelector(selectors.devanagari);
      const iastEl = block.querySelector(selectors.iast);
      const sanskrit = (devEl  ? devEl.textContent.trim()  : '')
                    || (iastEl ? iastEl.textContent.trim() : '');

      // Translation: join all <p> elements
      const transEls = block.querySelectorAll(selectors.translation);
      const translation = Array.from(transEls)
        .map(p => p.textContent.trim())
        .filter(t => t.length > 0)
        .join(' ');

      results.push({
        id: `cc-madhya-18-${number.replace('18.', '')}`,
        number,
        sanskrit: sanskrit || null,
        translation: translation || null,
        verseType: null,  // filled in manually: "arrival" | "event" | "glory" | "narrative"
        locationId: null  // filled in manually in the next step
      });
    });

    return results;
  }, SELECTORS);

  console.log(`Extracted ${verses.length} verses.`);

  if (verses.length !== 229) {
    console.warn(`WARNING: Expected 229 verses, got ${verses.length}.`);
    console.warn('Check if some verses are on sub-pages or if the selectors are wrong.');
  }

  // Write raw output to file
  const output = JSON.stringify(verses, null, 2);
  fs.writeFileSync('verses-raw.json', output, 'utf8');
  console.log('Written to verses-raw.json');

  await browser.close();
})();
```

**Running the script:**

```bash
# From ~/vedabase-scraper/
node scrape-vedabase.js

# Expected output:
# Navigating to: https://vedabase.io/en/library/cc/madhya/18/
# Scrolling to bottom to trigger lazy load...
# Extracted 229 verses.
# Written to verses-raw.json
```

**After running:**

1. Open `verses-raw.json`. Spot-check 3-5 entries to verify the extraction looks correct.
2. Copy the content of the file.
3. Create `src/data/verses.js` in the project and write: `export const verses = ` followed by the pasted array and a semicolon.
4. Proceed to Step 2 (manual `locationId` mapping).
5. Delete `~/vedabase-scraper/` when done.

**Error handling during Playwright extraction:**

| Problem | Cause | Fix |
|---------|-------|-----|
| `TimeoutError: waiting for selector` | Page failed to load or selectors changed | Try `waitUntil: 'domcontentloaded'` instead; inspect the page manually |
| `verses.length` is much less than 229 | Vedabase paginated content — Chapter 18 may span multiple sub-pages | Check if there are "Next page" links on the Vedabase page and adapt the script to navigate through all sub-pages |
| Translation field is empty for all verses | `.r-translation p` selector is wrong | In `page.evaluate`, add `console.log(document.querySelector('.r-translation'))` and check the actual markup |
| Devanagari text has encoding issues | Character encoding problem in the Node.js write | Ensure `fs.writeFileSync` uses `'utf8'` encoding (it does above); open the JSON in VS Code to verify |

---

### Choosing Between Option A and Option B

| Criteria | Option A (Console) | Option B (Playwright) |
|----------|--------------------|-----------------------|
| Setup time | 0 minutes | ~10 minutes (npm install) |
| Works if content is JS-rendered | Only if content loads synchronously | Yes — waits for full JS render |
| Error handling | Manual (check output by eye) | Programmatic (warnings logged) |
| Output | Copied from console | Written to `verses-raw.json` |
| Lazy-loaded content | Scroll page manually first | Script handles auto-scroll |
| Recommended for | Quick extraction, confident the page is SSR | Safer option; handles edge cases |

**Recommendation:** Start with Option A. If the extraction returns fewer than 229 verses or the fields are blank, switch to Option B.

---

## Step 2 — Verse-to-Location Mapping

After scraping, every verse object has `locationId: null` and `verseType: null`. This step assigns the correct `locationId` and `verseType` to each verse.

**This is manual work.** Read each verse's `translation` field. If it mentions a place name from the 32-location list, update `locationId` to the matching kebab-case ID. If the verse is narrative glue, philosophical commentary, or mentions a place that is NOT in the 32-location list, leave `locationId: null`.

For each verse, also assign a `verseType` value during this same manual mapping pass:
- `"arrival"` — verse describes reaching a new location
- `"event"` — verse describes something happening at the current location
- `"glory"` — verse praises/glorifies the current location
- `"narrative"` — general text not tied to a specific location (always has `locationId: null`)

### The Mapping Process

**Recommended workflow:**

1. Open `verses-raw.json` (or the draft `verses.js`) in VS Code.
2. Open `https://vedabase.io/en/library/cc/madhya/18/` in a browser tab for reference.
3. Work through the verse ranges in the table below, updating `locationId` fields in bulk using multi-cursor editing or find-and-replace on the `id` fields.
4. For any verse range you are unsure about, read the Vedabase translation directly to confirm the location name is explicitly mentioned.

### Complete Verse-to-Location Mapping Table

The ranges below are based on the CC Madhya 18 text. Verses NOT listed have `locationId: null`.

| Verse(s) | Location ID | verseType | Key Evidence in Translation | Notes |
|----------|-------------|-----------|------------------------------|-------|
| 18.3 | `arit-grama` | `arrival` | "arrived at Arit-grama" / "came to Arith" | Journey begins here from Prayag direction |
| 18.4–14 | `radha-kunda` | `arrival` (18.4), `event`/`glory` (18.5–14) | "Where is Radha-kunda?" / "came to Radha-kunda" / "bathed in Radha-kunda" | Core discovery scene; Mahaprabhu's extended ecstasy here |
| 18.5–6 | `shyama-kunda` | `event` | "Shyama-kunda" / "the lake of Shyama" | These verses mention both Radha-kunda AND Shyama-kunda; assign `shyama-kunda` since it is the newly introduced location in these verses |
| 18.15 | `sumanas-lake` | `arrival` | "Sumanas Lake" / "the lake named Sumanas" | Brief visit; one verse |
| 18.15–16 | `govardhana-hill` | `arrival` | "Govardhana Hill" / "circumambulated Govardhana" | Overlaps with `sumanas-lake` at 18.15 — if a single verse mentions both, assign the location where the journey progresses TO, which is `govardhana-hill` |
| 18.17–22 | `govardhana-village` | `arrival` (18.17), `event` (18.18–22) | "village known as Govardhana" / "came to Govardhana" / "Harideva temple" | Extended stay; multiple interactions here |
| 18.21 | `brahma-kunda` | `arrival` | "Brahma-kunda" | Sub-location within Govardhana area |
| 18.26–30 | `annakuta-grama` | `arrival` (18.26), `event` (18.27–30) | "Annakuta-grama" / "on Govardhana Hill" | Chapter continues narrating Govardhana region |
| 18.29–36 | `ganthuli-grama` | `arrival` (18.29), `event` (18.30–36) | "Ganthuli-grama" / "village named Ganthuli" | Journey moves to this village |
| 18.32 | `manasa-ganga` | `arrival` | "Manasa-ganga" | Sub-location; a sacred lake near Govardhana |
| 18.35 | `govinda-kunda` | `arrival` | "Govinda-kunda" | Sacred kund near Govardhana |
| 18.55–57 | `kamyavana` | `arrival` | "Sri Kamyavana" / "forest of Kamya" | Journey resumes after a narrative gap |
| 18.57 | `nandishvara` | `arrival` | "Nandishvara" / "Nandgaon" | May overlap with `kamyavana` at 18.57; assign `nandishvara` as it is the new destination |
| 18.58 | `pavana-lake` | `arrival` | "Pavana Lake" / "Lake Pavana" / "Pavana-sarovara" | Single-verse mention |
| 18.63 | `khadiravana` | `arrival` | "Khadiravana" / "the Khadira forest" | |
| 18.64 | `seshashayi` | `arrival` | "Seshashayi" / "the place of Seshashayi" | |
| 18.66 | `khela-tirtha` | `arrival` | "Khela-tirtha" | Verse 18.66 names MULTIPLE locations — see multi-location note below |
| 18.66 | `bhandiravana` | `arrival` | "Bhandiravana" | See multi-location note |
| 18.66 | `bhadravana` | `arrival` | "Bhadravana" | See multi-location note |
| 18.67 | `shrivana` | `arrival` | "Shrivana" / "Sri Vana" | |
| 18.67 | `lohavana` | `arrival` | "Lohavana" / "the Loha forest" | |
| 18.67–68 | `mahavana-gokula` | `arrival` | "Mahavana" / "Gokula" | Both Mahavana and Gokula mentioned together |
| 18.69 | `mathura` | `arrival` | "returned to Mathura" / "came to Mathura" | |
| 18.70–78 | `akrura-tirtha` | `arrival` (18.70), `event` (18.71–78) | "Akrura-tirtha" / "the bathing place of Akrura" | Extended section at Akrura-tirtha |
| 18.71 | `kaliya-daha` | `event` | "Kaliya Lake" / "Kaliya-daha" | Sub-location; assign `kaliya-daha` |
| 18.71 | `praskandana` | `event` | "Praskandana" | Sub-location; same verse or adjacent |
| 18.72 | `dvadashaditya` | `arrival` | "Dvadashaditya" / "twelve Adityas" | |
| 18.72–74 | `keshi-tirtha` | `arrival` (18.72), `event` (18.73–74) | "Keshi-tirtha" / "the bathing place of Keshi" | |
| 18.75 | `cira-ghata` | `arrival` | "Cira-ghata" / "where Krishna stole the garments" | |
| 18.75–78 | `tentuli-tala` | `arrival` (18.75), `event` (18.76–78) | "Tentuli-tala" / "Amli-tala" / "the tamarind tree" | Final location in the Vrindavan section |
| 18.214 | `soro-kshetra` | `arrival` | "Soro-kshetra" | Journey has moved on; this is a later stage |
| 18.214–222 | `prayaga` | `arrival` (18.214), `event` (18.215–222) | "arrived at Prayaga" / "Allahabad" | Final destination in this chapter |

### Handling Multi-Location Verses

Verse 18.66 is the most complex case — it names Khela-tirtha, Bhandiravana, the Yamuna river, and Bhadravana in a single verse. Since each location must have exactly one `locationId` per verse object, apply this rule:

**Rule: Assign the LAST named location in the verse.** The narrative describes a journey — the verse describes passing through multiple places. The last place mentioned is where the journey currently stands.

For verse 18.66: if the order in the translation is Khela-tirtha → Bhandiravana → Yamuna → Bhadravana, assign `locationId: "bhadravana"`.

If you want all four locations to be reachable from the verse panel in Phase 3, you can alternatively create multiple verse objects for verse 18.66 with different `locationId` values (one per location). However, this complicates the verse count invariant (`verses.length === 229`). **Recommended approach:** Assign the last-mentioned location and document the others in a code comment next to the verse object so Phase 3 can optionally handle them.

Similarly for verses 18.67 (Shrivana + Lohavana) and 18.71 (Kaliya-daha + Praskandana): assign the last-mentioned location.

### Verses with `locationId: null`

The following verse ranges contain no explicit location references — they are philosophical commentary, personal interactions, prayers, or narrative transitions. Leave these as `locationId: null`:

- **18.1–2**: Introductory verses; no specific location
- **18.7–13**: Mahaprabhu's conversation at Radha-kunda — these ARE at Radha-kunda, so assign `radha-kunda` if the translation names it; null only if purely philosophical
- **18.22–25**: Narrative transition between Govardhana and the next stop
- **18.36–54**: The extended Gopala Bhatta / Brahmin interactions — verses about people encountered; assign location if a place is named, else null
- **18.78–213**: Long narrative section before Soro-kshetra — read carefully; many of these will have location references to smaller sub-locations. Assign null only when truly no location is named
- **18.222–229**: Closing verses and prayers

**Estimated count of location-tagged verses:** approximately 80–100 of the 229 total. The remaining 129–149 verses will have `locationId: null`.

---

## Step 3 — `src/data/verses.js` — ES Module Export

### File Header

```javascript
// src/data/verses.js
// Source: https://vedabase.io/en/library/cc/madhya/18/
// Caitanya Caritamrita Madhya Lila Chapter 18 — Translations by Srila Prabhupada
// Bhaktivedanta Book Trust. Used for non-commercial devotional education.
//
// locationId values reference location IDs in src/data/locations.js.
// verseType classifies each verse: "arrival" | "event" | "glory" | "narrative"
// Verses with locationId: null are narrative type (general text, not location-specific).
//
// Total: 229 verses.

export const verses = [
  // ... 229 objects
];
```

**Critical difference from the vanilla JS version:** This file uses `export const verses` (ES module named export), NOT `const verses` (global variable). This is required because Vite treats all source files as ES modules. Importing from `src/data/locations.js` works the same way — `import { locations } from './locations.js'`.

### Verse Object Schema (full reference)

```javascript
{
  id: "cc-madhya-18-1",          // String. Unique. Format: "cc-madhya-18-{number}"
                                  // where {number} is the integer part (no leading zeros)
  number: "18.1",                // String. Display label. Always "18.X" format.
  sanskrit: "prabhu kahe...",    // String or null. Romanized IAST or devanagari.
  translation: "Sri Caitanya...",// String. Full English translation. Never null.
  verseType: "narrative",        // String. Required. One of: "arrival" | "event" | "glory" | "narrative"
                                  //   arrival  = verse describes reaching a new location
                                  //   event    = verse describes something happening at the current location
                                  //   glory    = verse praises/glorifies the current location
                                  //   narrative = general text not tied to a specific location (locationId is null)
  locationId: null               // String or null. Must match an id in locations.js exactly.
}
```

### Example: Verse WITH a locationId

```javascript
{
  id: "cc-madhya-18-4",
  number: "18.4",
  sanskrit: "radha-kundere gela prabhu maha-anandita",
  translation: "Sri Caitanya Mahaprabhu then went to Radha-kunda and felt great jubilation. He took His bath there and returned to Vrindavana.",
  verseType: "arrival",
  locationId: "radha-kunda"
}
```

### Example: Verse WITHOUT a locationId (philosophical/narrative)

```javascript
{
  id: "cc-madhya-18-1",
  number: "18.1",
  sanskrit: "prabhu kahe,--vrndavane yata tirtha-grama",
  translation: "Sri Caitanya Mahaprabhu said, 'All the holy places within the area of Vrindavana are like oceans of nectar. Who can properly describe even one of them?'",
  verseType: "narrative",
  locationId: null
}
```

### Example: Verse that is part of a range for one location

```javascript
{
  id: "cc-madhya-18-9",
  number: "18.9",
  sanskrit: "dekhi' mahaprabhu haila ananda-sagara",
  translation: "When Sri Caitanya Mahaprabhu saw Radha-kunda, He became an ocean of transcendental bliss. He immediately bathed in the lake and began chanting the Hare Krishna maha-mantra.",
  verseType: "event",
  locationId: "radha-kunda"
}
```

Note that verses 18.4 through 18.14 all share `locationId: "radha-kunda"` — this is intentional. In Phase 3, clicking any of these verses will pan the map to Radha-kunda and highlight the same marker.

---

## Step 4 — `src/components/VersePanel.jsx`

`VersePanel` is the scrollable left column that renders all 229 verses as a condensed list **grouped by location**. Verses sharing the same `locationId` appear under a location divider/header. Verses with `locationId: null` (narrative type) appear in a "General / Narrative" group. Each verse entry shows: verse number, verse type badge, and a truncated translation preview. The full verse text is NOT shown here — it is rendered in the bottom panel (VerseReader).

It receives `selectedLocationId`, `setSelectedLocationId`, `selectedVerseId`, and `setSelectedVerseId` from `App.jsx`, imports the verse and location data itself, and handles the scroll-to-verse side effect.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedLocationId` | `string \| null` | Yes | The currently selected location ID from `App` state. Used to derive which location group is active and to trigger the scroll `useEffect`. |
| `setSelectedLocationId` | `function` | Yes | Setter passed down from `App`'s `useState`. `VersePanel` passes it to each `VerseCard` so clicking a card updates the shared location state. |
| `selectedVerseId` | `string \| null` | Yes | The currently selected verse ID from `App` state. Used to highlight the active verse card. |
| `setSelectedVerseId` | `function` | Yes | Setter passed down from `App`'s `useState`. `VersePanel` passes it to each `VerseCard` so clicking a card updates the selected verse (which drives the bottom panel VerseReader). |

### Component Architecture

```
App.jsx
└── VersePanel.jsx  [selectedLocationId, setSelectedLocationId, selectedVerseId, setSelectedVerseId]
    ├── import { verses } from '../data/verses.js'
    ├── import { locations } from '../data/locations.js'
    ├── useRef(scrollContainerRef)        ← the outer scrollable div
    ├── useRef(verseRefs)                 ← { [verse.id]: DOM element }
    ├── useMemo(groupedVerses)            ← verses grouped by locationId
    ├── useEffect([selectedLocationId])   ← scroll to first verse on change
    └── groupedVerses.map(group =>
            <LocationDivider key={group.locationId} name={group.locationName} />
            group.verses.map(verse =>
                <VerseCard key={verse.id}
                           verse={verse}
                           isActive={verse.id === selectedVerseId}
                           onClick={() => {
                             setSelectedVerseId(verse.id);
                             if (verse.locationId) setSelectedLocationId(verse.locationId);
                           }}
                           ref={el => verseRefs.current[verse.id] = el}
                />
            )
        )
```

### Implementation

```jsx
// src/components/VersePanel.jsx
import { useRef, useEffect, useMemo } from 'react';
import { verses } from '../data/verses.js';
import { locations } from '../data/locations.js';
import VerseCard from './VerseCard.jsx';

export default function VersePanel({
  selectedLocationId, setSelectedLocationId,
  selectedVerseId, setSelectedVerseId
}) {
  // Ref on the scroll container — used to scope scrollIntoView correctly
  const scrollContainerRef = useRef(null);

  // Map of verse.id → DOM element for scroll targeting.
  const verseRefs = useRef({});

  // Pre-build a location name lookup map for location divider headers
  const locationNameMap = useMemo(() => {
    return locations.reduce((acc, loc) => {
      acc[loc.id] = loc.name;
      return acc;
    }, {});
  }, []);

  // Group verses by locationId for the condensed, grouped-by-location layout.
  // Consecutive verses with the same locationId form one group.
  // Verses with locationId: null are grouped under "General / Narrative".
  const groupedVerses = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    verses.forEach(verse => {
      const groupKey = verse.locationId || '__narrative__';
      if (!currentGroup || currentGroup.key !== groupKey) {
        currentGroup = {
          key: groupKey,
          locationId: verse.locationId,
          locationName: verse.locationId ? locationNameMap[verse.locationId] : 'General / Narrative',
          verses: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.verses.push(verse);
    });

    return groups;
  }, [locationNameMap]);

  // Scroll to the first verse for the selected location when selectedLocationId changes
  useEffect(() => {
    if (!selectedLocationId) return;

    const firstMatchingVerse = verses.find(v => v.locationId === selectedLocationId);
    if (!firstMatchingVerse) return;

    const el = verseRefs.current[firstMatchingVerse.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedLocationId]);

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto px-3 py-3 space-y-2.5 verse-panel-scroll"
    >
      {groupedVerses.map(group => (
        <div key={group.key + '-' + group.verses[0].id}>
          {/* Location divider/header for this group */}
          <div className="sticky top-0 z-10 bg-stone-100 border-b border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
            {group.locationName}
          </div>
          {group.verses.map(verse => (
            <VerseCard
              key={verse.id}
              verse={verse}
              isActive={verse.id === selectedVerseId}
              onClick={() => {
                setSelectedVerseId(verse.id);
                if (verse.locationId) {
                  setSelectedLocationId(verse.locationId);
                }
              }}
              ref={el => { verseRefs.current[verse.id] = el; }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Performance: Why No Virtualization

229 `<VerseCard>` components with minimal text content is negligible React rendering cost. The concern with large lists in React is not the initial render — it is unnecessary re-renders when state changes. That is solved by `React.memo()` on `VerseCard` (see Step 5), not by virtualization.

Virtualization libraries (react-window, react-virtual) reduce DOM node count but add complexity: they require fixed item heights or measurement logic, they break `scrollIntoView` (you can't scroll to a DOM node that isn't mounted), and they introduce dependencies and bundle size. The scroll-to-verse behavior in Phase 2 requires that the target card's DOM node actually exists — virtualization would make that impossible for off-screen verses.

**Concrete numbers:** 229 simple `<div>` elements with text takes approximately 1-3ms to render in React. This is imperceptible. The threshold where virtualization becomes worthwhile is typically 1,000–10,000 items. At 229, the complexity is not justified.

---

## Step 5 — `src/components/VerseCard.jsx`

`VerseCard` is a condensed single verse entry in the panel. It shows: verse number (e.g., "18.4"), a verse type badge (small colored pill), and a one-line truncated translation preview. It does NOT show the full translation text — that is rendered in the bottom panel (VerseReader). On click, it sets both `selectedVerseId` and `selectedLocationId`.

It is wrapped in `React.memo()` so React skips re-rendering a card if its props have not changed. Since only the `isActive` prop changes when the user selects a new verse, only the two affected cards (the previously active one and the newly active one) re-render — the other 227 are skipped entirely.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `verse` | `object` | Yes | The verse object from `verses.js`. Shape: `{ id, number, sanskrit, translation, verseType, locationId }`. |
| `isActive` | `boolean` | Yes | `true` when `verse.id === selectedVerseId`. Controls the active highlight styling (left border accent + background tint). |
| `onClick` | `function` | Yes | Called when the card is clicked. `VersePanel` passes a callback that sets `selectedVerseId` to the verse's id and `selectedLocationId` to the verse's locationId (if not null). |
| `ref` | `React ref` | Yes | Forwarded ref — `VersePanel` stores the DOM node in `verseRefs.current[verse.id]` for scroll targeting. Requires `forwardRef`. |

### Implementation

```jsx
// src/components/VerseCard.jsx
import { memo, forwardRef } from 'react';

// Verse type badge color map — each type gets a distinct pill color
const VERSE_TYPE_COLORS = {
  arrival:   'bg-blue-100 text-blue-800 border-blue-300',
  event:     'bg-green-100 text-green-800 border-green-300',
  glory:     'bg-purple-100 text-purple-800 border-purple-300',
  narrative: 'bg-stone-100 text-stone-600 border-stone-300',
};

// forwardRef is required so VersePanel can store the DOM node in verseRefs.
// memo wraps the forwardRef component to prevent re-renders when props are unchanged.
const VerseCard = memo(forwardRef(function VerseCard(
  { verse, isActive, onClick },
  ref
) {
  // Truncate translation to one line (~80 chars) for the condensed preview
  const truncatedTranslation = verse.translation
    ? verse.translation.length > 80
      ? verse.translation.slice(0, 80).trimEnd() + '…'
      : verse.translation
    : '[Translation unavailable]';

  const typeColorClass = VERSE_TYPE_COLORS[verse.verseType] || VERSE_TYPE_COLORS.narrative;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={[
        // Base card styles — condensed layout
        'rounded-lg border px-3 py-2 transition-colors duration-200 cursor-pointer',
        // Background and border vary by active state
        isActive
          ? 'bg-amber-100 border-amber-400 border-l-4 border-l-amber-500 shadow-sm'
          : 'bg-stone-50 border-stone-200 hover:bg-amber-50 hover:border-amber-300',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {/* Verse number badge */}
        <span className="inline-block bg-stone-700 text-white text-xs font-semibold font-mono tracking-wide px-2 py-0.5 rounded-full shrink-0">
          {verse.number}
        </span>

        {/* Verse type badge — small colored pill */}
        <span className={`inline-block text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${typeColorClass}`}>
          {verse.verseType}
        </span>

        {/* Truncated translation preview — single line */}
        <span className="text-sm text-stone-700 truncate">
          {truncatedTranslation}
        </span>
      </div>
    </div>
  );
}));

VerseCard.displayName = 'VerseCard';

export default VerseCard;
```

### Why `forwardRef` + `memo` in This Order

`React.memo` must wrap the result of `React.forwardRef`, not the other way around. This is because `forwardRef` returns a new component type with the ref-forwarding behavior; `memo` then wraps that component to add memoization. If you wrap in the wrong order, the ref forwarding breaks.

```jsx
// Correct:
const VerseCard = memo(forwardRef(function VerseCard(...) { ... }));

// Wrong — do not do this:
const VerseCard = forwardRef(memo(function VerseCard(...) { ... }));
```

Setting `VerseCard.displayName = 'VerseCard'` ensures the component appears with a readable name in React DevTools instead of "ForwardRef(memo(VerseCard))".

### `isActive` Prop: Conditional Styling Rules

| Condition | Left Border | Background | Cursor |
|-----------|------------|-----------|--------|
| `isActive === true` | 4px solid amber-500 | amber-100 + shadow | pointer |
| `isActive === false` | none (standard border) | stone-50, amber-50 on hover | pointer |

The `isActive` prop is computed in `VersePanel` as `verse.id === selectedVerseId`. When `selectedVerseId` is null (nothing selected), no card is active. All cards are now clickable (they all set `selectedVerseId`).

---

## Step 6 — Scroll-to-Verse Logic

The scroll behavior lives entirely in `VersePanel.jsx`'s `useEffect`. When `selectedLocationId` changes (either from a verse click inside `VersePanel`, or from a map marker click in a future phase), the effect finds the first verse for that location and scrolls to it. When `selectedVerseId` changes (from clicking a card), the bottom panel (VerseReader) updates to show the full verse text.

### How the Refs Map Works

```jsx
// In VersePanel, the refs map is a plain object inside a useRef.
// It starts empty and is populated as each VerseCard mounts.
const verseRefs = useRef({});

// Each VerseCard receives a callback ref that stores its DOM node:
ref={el => { verseRefs.current[verse.id] = el; }}

// When a card unmounts, React calls the callback with null.
// The null assignment is benign — scrollIntoView checks for null before calling.
```

### The `useEffect` in Detail

```jsx
useEffect(() => {
  if (!selectedLocationId) return;  // Nothing selected — do nothing

  // verses is imported at module level; .find() is O(n) but n=229 is trivial
  const firstMatchingVerse = verses.find(v => v.locationId === selectedLocationId);
  if (!firstMatchingVerse) return;  // No verse maps to this location — unlikely but safe

  const el = verseRefs.current[firstMatchingVerse.id];
  if (!el) return;  // Card not yet mounted — race condition guard

  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}, [selectedLocationId]);
```

**`block: 'nearest'` vs `block: 'start'`:** Using `'nearest'` scrolls the minimum amount necessary to bring the element into view. If the verse is already visible, it doesn't scroll at all. `'start'` always scrolls the element to the top of the container, which can be jarring if the user is reading a verse just below the top. `'nearest'` is the more respectful choice for a reading experience.

**Why not `document.querySelector`:** Using `verseRefs.current` (a refs map) is preferable to `document.querySelector('[data-verse-id="..."]')` because:
1. It avoids a DOM query traversal on every selection change.
2. It works correctly if `VersePanel` is ever unmounted and remounted (the refs map resets; a `document.querySelector` would still find the element if React reuses DOM nodes).
3. It keeps the scroll logic self-contained within the component — no global DOM coupling.

### Scroll Container Scoping

The `scrollContainerRef` on the outer `<div>` is stored but not used in `scrollIntoView` — `scrollIntoView` automatically finds the nearest scrollable ancestor. It is retained in the implementation in case Phase 3 needs to programmatically set `scrollTop` (e.g., for the animated Play Journey mode), where `scrollContainerRef.current.scrollTop` provides direct access to the scroll position.

---

## Step 7 — Tailwind Styling Reference

All styling uses Tailwind utility classes applied directly in JSX, with one exception: the scrollbar styles for `VersePanel` are defined in `src/styles/index.css` as plain CSS (the `tailwind-scrollbar` plugin is incompatible with Tailwind v4). The classes used are documented here for reference.

### VersePanel Container

```
h-full                    — fills the full height of its parent column
overflow-y-auto           — scroll when content overflows
px-3 py-3                 — inner padding (12px horizontal, 12px vertical)
space-y-2.5              — 10px gap between child VerseCards
verse-panel-scroll        — custom class defined in src/styles/index.css; applies
                            ::-webkit-scrollbar styles for a thin saffron-toned scrollbar
```

> **Scrollbar styling:** The `verse-panel-scroll` class applies custom scrollbar styles using `::-webkit-scrollbar` pseudo-elements. These styles are defined in `src/styles/index.css` (see the CSS below). The `tailwind-scrollbar` plugin is **NOT** used because it is incompatible with Tailwind CSS v4.
>
> Add the following to `src/styles/index.css`:
>
> ```css
> /* Custom scrollbar for the verse panel — replaces tailwind-scrollbar plugin */
> .verse-panel-scroll::-webkit-scrollbar {
>   width: 6px;
> }
> .verse-panel-scroll::-webkit-scrollbar-track {
>   background: transparent;
> }
> .verse-panel-scroll::-webkit-scrollbar-thumb {
>   background-color: #92400e; /* amber-800 */
>   border-radius: 9999px;
> }
> .verse-panel-scroll::-webkit-scrollbar-thumb:hover {
>   background-color: #78350f; /* amber-900 */
> }
> ```
>
> Firefox does not support `::-webkit-scrollbar`. For Firefox, the following standard properties are also included in the same class via `src/styles/index.css`:
>
> ```css
> .verse-panel-scroll {
>   scrollbar-width: thin;
>   scrollbar-color: #92400e transparent; /* thumb track */
> }
> ```

### VerseCard — Base State (not active)

```
rounded-lg                — 8px border radius
border                    — 1px solid border
bg-stone-50               — warm off-white background
border-stone-200          — light warm grey border
px-3 py-2                 — condensed inner padding
cursor-pointer            — all cards are interactive
transition-colors         — smooth color transitions
duration-200              — 200ms transition speed
hover:bg-amber-50         — very light amber tint on hover
hover:border-amber-300    — brighter border on hover
```

### VerseCard — Active State (`isActive === true`)

```
bg-amber-100              — warm amber background tint
border-amber-400          — amber border (all sides)
border-l-4                — thicker left border
border-l-amber-500        — strong amber left accent
shadow-sm                 — subtle drop shadow to lift the card
```

### Verse Number Badge

```
inline-block              — inline but supports padding/margin
bg-stone-700              — deep brown background
text-white                — white text
text-xs                   — 12px font size
font-semibold             — 600 weight
font-mono                 — monospace for number readability
tracking-wide             — slightly expanded letter spacing
px-2 py-0.5              — pill padding
rounded-full              — fully rounded pill shape
shrink-0                  — prevent badge from shrinking in flex layout
```

### Verse Type Badge

```
inline-block              — inline but supports padding/margin
text-[0.65rem]            — small font for compact pill
font-semibold             — 600 weight
px-1.5 py-0.5            — compact pill padding
rounded-full              — fully rounded pill shape
border                    — 1px solid border
shrink-0                  — prevent badge from shrinking in flex layout
```

**Verse type badge colors:**

| Type | Background | Text | Border |
|------|-----------|------|--------|
| `arrival` | `bg-blue-100` | `text-blue-800` | `border-blue-300` |
| `event` | `bg-green-100` | `text-green-800` | `border-green-300` |
| `glory` | `bg-purple-100` | `text-purple-800` | `border-purple-300` |
| `narrative` | `bg-stone-100` | `text-stone-600` | `border-stone-300` |

### Truncated Translation Preview

```
text-sm                   — 14px font size
text-stone-700            — medium warm brown text
truncate                  — CSS text-overflow: ellipsis for single-line truncation
```

---

## Step 8 — Phase 2 Completion Checklist

Work through this checklist in order before marking Phase 2 complete and moving to Phase 3.

### Data Integrity

- [ ] Open the browser at `http://localhost:5173` (Vite dev server: `npm run dev`).
- [ ] Open DevTools Console.
- [ ] Paste: `import('/src/data/verses.js').then(m => console.log(m.verses.length))` — must log `229`.
- [ ] Alternatively, temporarily add `window.__verses = verses` in `VersePanel.jsx` during testing and run `window.__verses.filter(v => !v.translation).length` — must return `0`.
- [ ] Verify every verse has a valid `verseType`: `window.__verses.filter(v => !['arrival','event','glory','narrative'].includes(v.verseType)).length` — must return `0`.
- [ ] Verify `verses.filter(v => v.locationId !== null).length` returns a number between 80 and 100.
- [ ] Verify all `locationId` values are valid:
  ```javascript
  // Paste into browser console (after temporarily exposing verses and locations on window):
  const locationIds = new Set(window.__locations.map(l => l.id));
  const badVerses = window.__verses.filter(v => v.locationId && !locationIds.has(v.locationId));
  console.log('Verses with invalid locationId:', badVerses);
  // Must log: []
  ```
- [ ] Run `new Set(window.__verses.map(v => v.id)).size === 229` — must return `true` (all IDs unique).
- [ ] Remove any temporary `window.__*` assignments added during testing before committing.

### Visual Checks

- [ ] Left panel renders all verse cards as a condensed, grouped-by-location list — scroll from top to bottom; verify cards are present all the way to 18.229.
- [ ] Verses are grouped under location divider/header labels — spot-check "Radha-kunda" group, "Kamyavana" group, "General / Narrative" group.
- [ ] Each verse card shows: verse number, verse type badge (colored pill), and truncated translation preview.
- [ ] Verse type badges display with correct colors: arrival (blue), event (green), glory (purple), narrative (grey).
- [ ] Full translation text is NOT shown in the left panel — only a one-line truncated preview.
- [ ] No verse cards have blank/undefined translation text.
- [ ] The left panel scrolls smoothly — no overflow issues or stuck scroll.
- [ ] Clicking any verse card highlights it (amber background), sets `selectedVerseId`, and sets `selectedLocationId` if the verse has a location.
- [ ] No React key warnings in the console (all `VerseCard` components have `key={verse.id}`).

### Scroll Behavior

- [ ] Click a verse card → the panel highlights the clicked card and the bottom panel (VerseReader) shows the full verse text.
- [ ] Click a verse in a different location group → panel scrolls if needed; previous card loses active styling.
- [ ] If the active verse is already visible in the panel, the panel does not scroll unnecessarily (because `block: 'nearest'` is used).

### React Checks

- [ ] Open React DevTools → Components tab. Confirm `VersePanel` renders 229 `VerseCard` children.
- [ ] Confirm `VerseCard` shows as `Memo(VerseCard)` in the component tree (proof that `React.memo` is applied).
- [ ] Use React DevTools Profiler: click a location badge → record → confirm only 2 `VerseCard` instances re-render (the newly active and previously active), not all 229.
- [ ] `npm run build` produces no TypeScript/ESLint errors (if the project has lint configured).

### Cross-Reference Check

- [ ] Open `src/data/locations.js` and `src/data/verses.js` side by side.
- [ ] For each of the 32 location IDs in `locations.js`, confirm at least one verse in `verses.js` references it.

---

## Step 9 — What Phase 2 Outputs That Phase 3 Depends On

Phase 3 (Interactivity — map ↔ verse panel bidirectional sync) depends entirely on the following deliverables from Phase 2:

### Components and Props Interface

| Component | File | Props Phase 3 Uses |
|-----------|------|--------------------|
| `VersePanel` | `src/components/VersePanel.jsx` | `selectedLocationId`, `setSelectedLocationId`, `selectedVerseId`, `setSelectedVerseId` — Phase 3 sets `selectedLocationId` from map marker clicks; all props are passed through unchanged |
| `VerseCard` | `src/components/VerseCard.jsx` | `isActive` — Phase 3 does not touch this directly; it is derived from `selectedVerseId` automatically inside `VersePanel` |

### Data Module

| Export | File | Phase 3 Usage |
|--------|------|---------------|
| `verses` | `src/data/verses.js` | Phase 3 reads `verses.filter(v => v.locationId === selectedLocationId)` to determine which marker to highlight; verse objects include `verseType` for badge display |

### State Architecture

Phase 3 will add a `MapView` component. `selectedLocationId` and `selectedVerseId` state remain in `App.jsx` and are passed to both `VersePanel` and `MapView`. Clicking a marker in `MapView` calls `setSelectedLocationId`, which triggers `VersePanel`'s `useEffect` and scrolls automatically — no new scroll logic is needed in Phase 3. The bottom panel (VerseReader) reads `selectedVerseId` to display the full verse text (Sanskrit + translation + prev/next navigation).

```
App.jsx
├── [selectedLocationId, setSelectedLocationId]  ← Phase 2 defines this
├── [selectedVerseId, setSelectedVerseId]         ← Phase 2 defines this
├── VersePanel (left panel)                      ← Phase 2 builds this
│   └── reads selectedLocationId → scroll; reads selectedVerseId → isActive
├── VerseReader (bottom panel)                   ← reads selectedVerseId → shows full verse text
└── MapView                                      ← Phase 3 builds this
    └── calls setSelectedLocationId on marker click
```

Phase 3 will NOT need to modify `VersePanel.jsx` or `VerseCard.jsx`. The scroll and highlighting behavior is already fully wired.

---

## Step 10 — Risk Notes Specific to Phase 2

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Vedabase DOM changes (selectors no longer match) | Scraping fails entirely | Inspect the page manually and update selectors; all selectors are in one `SELECTORS` config block at the top of both scripts |
| Verse count is not 229 | `verses.length` check fails; data is incomplete | Check if Chapter 18 is split across sub-pages on Vedabase; adapt scraper to follow pagination |
| `locationId` typo (e.g., `"Radha-kunda"` instead of `"radha-kunda"`) | Phase 3 click handlers silently fail for those verses | The cross-reference validation query above catches this; always use exact lowercase kebab-case |
| `src/styles/index.css` missing scrollbar styles | The `verse-panel-scroll` class produces no scrollbar styling | Ensure the `::-webkit-scrollbar` and `scrollbar-width`/`scrollbar-color` rules are present in `src/styles/index.css` — functionality is unaffected even without them |
| `forwardRef` omitted from `VerseCard` | `verseRefs.current[verse.id]` is always `undefined`; scroll-to-verse silently fails | Verify `VerseCard` is wrapped in `forwardRef` and that the `ref` prop appears in the `forwardRef` callback signature |
| Verses 18.36–54 (the Gopala Bhatta narrative) have no clear location markers | Those ~18 verses will correctly have `locationId: null`; this is expected | The narrative section is a conversation between Mahaprabhu and a Brahmin — no new location is visited |
| `verseType` not assigned for some verses | Verse type badge shows blank or fallback | Ensure every verse has a valid `verseType` during the manual mapping pass; validate with the checklist query |
| Sanskrit text contains mixed encoding | Displays garbled characters in the browser | Ensure `src/data/verses.js` is saved as UTF-8; Vite handles UTF-8 correctly by default |

---

## Open Questions

- [ ] **Verse 18.15 overlap** — Verse 18.15 may name both Sumanas Lake and Govardhana Hill. Decision needed: assign `sumanas-lake` or `govardhana-hill`? Recommendation: assign `govardhana-hill` as it is the more prominent and extended location; add a comment in the verse object noting the Sumanas Lake reference.
- [ ] **Verses 18.36–54** — These verses cover the Gopala Bhatta Gosvami narrative. Are any specific sub-locations mentioned within this range? This requires a careful read-through of the Vedabase translations. If sub-locations appear, they may need new entries in `src/data/locations.js` (a Phase 1 concern, but flag it now).
- [ ] **Romanized Sanskrit vs. Devanagari** — Vedabase primarily presents the IAST romanized transliteration. If devanagari is not available in the DOM, the `sanskrit` field will hold romanized text. Is that acceptable, or should devanagari be sourced separately (e.g., from a different Vedabase sub-URL)? For v1, romanized IAST is acceptable.
- [ ] **BBT attribution** — The verse translations are Bhaktivedanta Book Trust intellectual property. Where exactly should the attribution appear in the UI? In the footer? In the left panel header? Resolve before Phase 5 (Polish).
- [x] **Scrollbar styling** — RESOLVED: The `tailwind-scrollbar` plugin is incompatible with Tailwind CSS v4. Custom scrollbar styles are defined in `src/styles/index.css` using `::-webkit-scrollbar` pseudo-elements and the standard `scrollbar-width`/`scrollbar-color` properties. The `verse-panel-scroll` CSS class is applied to the VersePanel scroll container.

---

## References

- Source text: `https://vedabase.io/en/library/cc/madhya/18/`
- Master plan: `docs/planning/gaur-yatra-plan.md`
- Location data (Phase 1 output): `src/data/locations.js`
- Verse data schema: this document, Step 3
- Phase 3 planning: `docs/planning/phase-3-interactivity.md`
- Playwright documentation: `https://playwright.dev/docs/api/class-page`
- React `forwardRef` docs: `https://react.dev/reference/react/forwardRef`
- React `memo` docs: `https://react.dev/reference/react/memo`
- `scrollIntoView` MDN: `https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView`
- BBT copyright: `https://www.bbt.info/copyright`
