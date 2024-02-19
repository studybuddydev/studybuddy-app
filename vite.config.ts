import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from "node:path";
import { VitePWA } from 'vite-plugin-pwa'
import manifest from './manifest';

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
// import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  //server: { https: true },
  plugins: [
    //mkcert(),
    vue(),
    VueI18nPlugin({ include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**') }),
    vueJsx(),
    VitePWA({
      devOptions: { enabled: true },
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
      manifest: manifest
    }),

  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  }
})

