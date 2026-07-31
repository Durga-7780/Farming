import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AgroLedger',
        short_name: 'AgroLedger',
        description: 'Farmer & Mill procurement ERP',
        theme_color: '#163832',
        background_color: '#EEF1EC',
        display: 'standalone'
        // Add an `icons` array here once you drop 192x192 / 512x512 PNGs into /public
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
})
