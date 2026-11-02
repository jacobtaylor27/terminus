import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from GitHub Pages at https://jacobtaylor27.github.io/terminus/
  base: '/terminus/',
})
