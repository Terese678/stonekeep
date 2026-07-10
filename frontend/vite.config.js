// Vite config for Stonekeep frontend.
// Wires in React support and Tailwind v4 (via its dedicated Vite plugin,
// no separate tailwind.config.js / postcss.config.js needed for v4).

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // react()      - enables JSX, fast refresh, etc.
  // tailwindcss() - lets Tailwind utility classes work in any component
  plugins: [react(), tailwindcss()],
})