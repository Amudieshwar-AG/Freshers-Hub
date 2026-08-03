import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'map.png'],
      manifest: {
        name: 'RIT Freshers Hub',
        short_name: 'Freshers Hub',
        description: 'Your all-in-one AI-powered student portal for Rajalakshmi Institute of Technology.',
        theme_color: '#F97316',
        background_color: '#FAFAFA',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,webm}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      }
    })
  ],
  server: {
    host: true,
    watch: {
      ignored: [
        '**/backend/**',
        '**/telegram-bot/**',
        '**/.git/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
