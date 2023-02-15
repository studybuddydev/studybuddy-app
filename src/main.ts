import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import 'v-calendar/dist/style.css';
import VCalendar from 'v-calendar';

// Use plugin with defaults
const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: { mdi }
    },
    theme: {
        defaultTheme: 'dark',
    }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VCalendar, {})

app.mount('#app')
