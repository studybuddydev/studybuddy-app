<template>
  <v-banner color="primary" class="cookie ma-4" elevation="10" v-if="showCookie">
    <template v-slot:prepend>
      <v-avatar color="primary" icon="mdi-cookie" />
    </template>

    <v-banner-text>
      <h3>Vuoi i biscotti?</h3>
      I biscotti servono per avere statistiche sul vostro uso della piattaforma!
    </v-banner-text>

    <v-banner-actions>
      <v-btn @click="closeCookie(false)" class="mx-2" >No grazie</v-btn>
      <v-btn @click="closeCookie(true)" class="mx-2" variant="flat">Accetto</v-btn>
    </v-banner-actions>
  </v-banner>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const cookieStatus = localStorage.getItem("cookie");
const showCookie = ref(cookieStatus === null);

function closeCookie(cookies: boolean) {
  if (cookies) {
    // @ts-ignore
    gtag('consent', 'default', { 'ad_storage': 'granted', 'analytics_storage': 'granted'});
  }
  localStorage.setItem('cookie', cookies ? 'true' : 'false');
  showCookie.value = false;
}
</script>

<style scope lang="scss">
.cookie {
  position: absolute !important;
  width: 400px !important;
  top: 0;
  right: 0;
  z-index: 3000;
}
</style>