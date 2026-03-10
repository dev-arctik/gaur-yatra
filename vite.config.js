import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // GitHub Pages hosts at: https://dev-arctik.github.io/gaur-yatra/
  // All asset URLs must be prefixed with /gaur-yatra/ in production
  base: '/gaur-yatra/',
})
