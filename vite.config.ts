import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Disable SPA history fallback: unknown static profile URLs must return HTTP 404.
  appType: 'mpa',
})
