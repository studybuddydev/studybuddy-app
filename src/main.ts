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


// Hotjar
Hotjar.init(3579956, 6);
useRegisterSW({ immediate: true })

// Vuetify
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'bio',
    themes: themes,
  },
})


// Language
const availableLocales = ["en", "it", "fr", "es"];
const defaultLang = 'en';
function getLanguage() {
  let lang = localStorage.getItem('lang');
  if (!lang) {
    const userLanguages = (navigator.languages || [navigator.language]).map((lang) => lang.split('-')[0]);
    lang = userLanguages.find((lang) => availableLocales.includes(lang)) ?? defaultLang;
    localStorage.setItem('lang', lang);
  }
  return lang;
}
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getLanguage(),
  fallbackLocale: defaultLang,
  availableLocales: availableLocales,
  messages: messages,
});

// Auth0
const auth0 = createAuth0({
  domain: "studybuddyit.eu.auth0.com",
  clientId: "ZyUtaogYVjzqmWoglOEV5vT7XeHRzDtz",
  authorizationParams: {
    redirect_uri: window.location.origin
  }
})

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(pinia)
  .use(vuetify)
  .use(i18n)
  .use(auth0)
  .use(setupCalendar, {})
  .mount('#app');