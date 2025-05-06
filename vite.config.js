import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    strictPort: true,
    port: process.env.CLIENT_PORT,
    proxy: {
      '/api': `http://express_server:${process.env.SERVER_PORT}`, // have to use the container name
    },
  },
  base: '/my-pwa-app/', // important for GitHub Pages (replace with your repo name)
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'My Vite PWA App',
        short_name: 'VitePWA',
        description: 'A Vite-powered PWA deployed to GitHub Pages',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
