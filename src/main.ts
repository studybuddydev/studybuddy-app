import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from "vue-i18n";

import App from './App.vue'
import router from './router'
import messages from "@intlify/unplugin-vue-i18n/messages";
/// <reference types="vite-plugin-pwa/client" />
import { useRegisterSW } from 'virtual:pwa-register/vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { themes } from '@/assets/themes'

import { setupCalendar } from 'v-calendar';

import Hotjar from '@hotjar/browser';

import { createAuth0 } from '@auth0/auth0-vue';

const siteId = 3579956;
const hotjarVersion = 6;

Hotjar.init(siteId, hotjarVersion);
useRegisterSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Serve un refreshone')
  },
})

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: JSON.parse(localStorage.getItem('state') ?? '{}')?.settings?.user?.theme ?? 'verdone',
    themes: themes,
  },
})

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('lang') ?? 'it',
  fallbackLocale: "it",
  availableLocales: ["en", "it", "fr", "es"],
  messages: messages,
});

const auth0 = createAuth0({
  domain: "studybuddyit.eu.auth0.com",
  clientId: "ZyUtaogYVjzqmWoglOEV5vT7XeHRzDtz",
  authorizationParams: {
    redirect_uri: window.location.origin
  }
})

const pinia = createPinia();

const app = createApp(App)

app.use(router);
app.use(pinia);
app.use(vuetify);
app.use(i18n);
app.use(setupCalendar, {})
app.use(auth0);
app.mount('#app');