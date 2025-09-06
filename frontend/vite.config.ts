import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Custom plugin to handle SPA routing for nested paths
const spaRoutingPlugin = (): Plugin => ({
  name: 'spa-routing',
  configureServer(server) {
    // Return the middleware function
    return () => {
      server.middlewares.use((req, res, next) => {
        // Check if this is a route that should be handled by the SPA
        if (req.url && req.url.startsWith('/wiki/')) {
          // Don't rewrite requests for actual files (with extensions)
          // But DO rewrite paths that look like routes
          const hasExtension = /\.[a-z0-9]+$/i.test(req.url);
          const isAsset = req.url.includes('/@') || req.url.includes('/node_modules');
          
          if (!isAsset) {
            // For wiki routes, always serve index.html
            // This includes paths like /wiki/Root/Sub1.md
            req.url = '/index.html';
          }
        }
        next();
      });
    };
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), spaRoutingPlugin()],
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
