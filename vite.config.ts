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
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      }
    })
  ],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-map';
            }
          }
        }
      }
    }
  },
  server: {
    host: true,
    proxy: {
      '/ims': {
        target: 'https://ims.ritchennai.edu.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ims/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Rewrite Location header to keep redirects through local proxy
            const location = proxyRes.headers['location'];
            if (location) {
              let rewritten = location;
              if (rewritten.includes('ims.ritchennai.edu.in')) {
                rewritten = rewritten.replace(/https?:\/\/ims\.ritchennai\.edu\.in/gi, 'http://localhost:5173/ims');
              } else if (rewritten.startsWith('/')) {
                rewritten = '/ims' + rewritten;
              }
              proxyRes.headers['location'] = rewritten;
            }
            // Tweak cookies for localhost
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = (Array.isArray(setCookie) ? setCookie : [setCookie]).map((cookie: string) =>
                cookie
                  .replace(/Secure/gi, '')
                  .replace(/samesite=none/gi, 'SameSite=Lax')
                  .replace(/domain=[^;]+/gi, '')
              );
            }
          });
        }
      }
    },
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
