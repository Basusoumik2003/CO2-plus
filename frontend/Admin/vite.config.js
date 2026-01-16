import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Auth service (users, auth)
      '/api/users': {
        target: process.env.VITE_AUTH_SERVICE_URL || 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      },
      '/api/auth': {
        target: process.env.VITE_AUTH_SERVICE_URL || 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      },

      // Notification service
      '/api/notifications': {
        target: process.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },

      // ✅ Asset service (THIS WAS MISSING)
      '/api/assets': {
        target: process.env.VITE_ASSET_SERVICE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // ✅ ORG ASSET SERVICE (THIS FIXES YOUR ERROR)
      '/api/org-assets': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    }
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'ui-vendor': ['lucide-react', 'react-icons']
        }
      }
    }
  }
})
