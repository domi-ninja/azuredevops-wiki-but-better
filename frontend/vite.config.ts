import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, './'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/.attachments': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  // Ensure client-side routing works on production builds
  appType: 'spa'
})
