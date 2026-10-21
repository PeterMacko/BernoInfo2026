import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: { main: new URL('./index.html', import.meta.url).pathname, about: new URL('./o-projekte/index.html', import.meta.url).pathname } } },
  // Disable SPA history fallback: unknown static profile URLs must return HTTP 404.
  appType: 'mpa',
})
