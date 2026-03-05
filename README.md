# Gaur Yatra

An interactive website that visualizes **Lord Chaitanya Mahaprabhu's pilgrimage through Vraj Bhumi** (the Vrindavan/Mathura region), as described in **Caitanya Caritamrita Madhya Lila Chapter 18**.

The site presents all 229 verses alongside an interactive map showing the 32 sacred locations visited during the journey, with a photo gallery of each location.

**Live site:** [dev-arctik.github.io/gaur-yatra](https://dev-arctik.github.io/gaur-yatra)

---

## Features

- **229 verses** from CC Madhya 18 displayed in a scrollable panel, grouped by location with verse type badges (arrival, event, glory, narrative)
- **Interactive map** with 32 marked sacred locations connected by a journey path polyline
- **Photo gallery** for each location with prev/next navigation
- **Verse reader** showing full Sanskrit text and English translation with sequential navigation
- **Play Journey** mode that auto-advances through all 32 locations
- **Google Maps links** for every location so you can plan your own visit
- Click any verse, map marker, or gallery to synchronize all panels

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- React-Leaflet v4 + Leaflet.js (OpenStreetMap tiles)
- Deployed as a static site on GitHub Pages

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Open http://localhost:5173

# Production build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Contributing Photos

Real photographs of each sacred location are welcome! To add photos:

1. Find the location's folder under `public/assets/images/locations/<location-id>/`
2. Add photos as JPEG or WebP files (max 1MB per photo recommended), named `photo-1.jpg`, `photo-2.jpg`, etc.
3. Update the `images` array in the corresponding location object in `src/data/locations.js`:
   ```js
   images: [
     "assets/images/locations/radha-kunda/photo-1.jpg",
     "assets/images/locations/radha-kunda/photo-2.jpg"
   ]
   ```
4. Run `npm run build && npm run deploy`

## The 32 Sacred Locations

| # | Location | Verses |
|---|----------|--------|
| 1 | Arit-grama (Arith) | 18.3 |
| 2 | Radha-kunda | 18.4-14 |
| 3 | Shyama-kunda | 18.5-6 |
| 4 | Sumanas Lake | 18.15 |
| 5 | Govardhana Hill | 18.15-45 |
| 6 | Govardhana Village (Harideva temple) | 18.17-22 |
| 7 | Brahma-kunda | 18.21 |
| 8 | Annakuta-grama | 18.26-30 |
| 9 | Ganthuli-grama | 18.29-36 |
| 10 | Manasa-ganga | 18.32 |
| 11 | Govinda-kunda | 18.35 |
| 12 | Kamyavana | 18.55-57 |
| 13 | Nandishvara (Nandgaon) | 18.57 |
| 14 | Pavana Lake | 18.58 |
| 15 | Khadiravana | 18.63 |
| 16 | Seshashayi | 18.64 |
| 17 | Khela-tirtha | 18.66 |
| 18 | Bhandiravana | 18.66 |
| 19 | Bhadravana | 18.66 |
| 20 | Shrivana | 18.67 |
| 21 | Lohavana | 18.67 |
| 22 | Mahavana / Gokula | 18.67-68 |
| 23 | Mathura | 18.69 |
| 24 | Akrura-tirtha | 18.70-78 |
| 25 | Kaliya Lake (Kaliya-daha) | 18.71 |
| 26 | Praskandana | 18.71 |
| 27 | Dvadashaditya | 18.72 |
| 28 | Keshi-tirtha | 18.72-74 |
| 29 | Cira-ghata | 18.75 |
| 30 | Tentuli-tala (Amli-tala) | 18.75-78 |
| 31 | Soro-kshetra | 18.214 |
| 32 | Prayaga (Allahabad) | 18.214-222 |

## Source Text

All verse translations are from [Vedabase](https://vedabase.io/en/library/cc/madhya/18/) — the online repository of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada's books, published by the Bhaktivedanta Book Trust (BBT). This is a non-commercial, educational, and devotional project.

## License

This project is for educational and devotional purposes. The verse translations are the property of the Bhaktivedanta Book Trust.
