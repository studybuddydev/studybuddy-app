import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from "vue-i18n";

import App from './App.vue'
import router from './router'
import messages from "@intlify/unplugin-vue-i18n/messages";

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

const app = createApp(App)

app.use(
  createAuth0({
    domain: "dev-lk2eo802harq5vdb.eu.auth0.com",
    clientId: "LoEbOp9bdkJCSQ8f8ttqVyfmY8DtxNuy",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
);

console.log(window.location.origin)

app.use(router)
app.use(createPinia())
app.use(vuetify)
app.use(i18n)
app.use(setupCalendar, {})
app.mount('#app')
