import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from "node:path";
import { VitePWA } from 'vite-plugin-pwa'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
export const hash = Math.floor(Math.random() * 90000) + 10000;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
    }),
    vueJsx(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: false,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2,ttf}'],
        runtimeCaching: [
          {
            urlPattern: new RegExp('.*/assets/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets',
            }
          }
        ]
      },
      manifest: {
        name: 'StudyBuddy',
        short_name: 'StudyBuddy',
        start_url: '/',
        display: 'standalone',
        background_color: '#009999',
        theme_color: '#FF7600',
        icons: [
          {
            src: '/images/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          
        ],
      },
    }),

  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

