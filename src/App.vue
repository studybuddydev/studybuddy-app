<template>
  <v-app id="inspire">

    <v-footer app class="bg-black pa-0">
      <TomatoFooterVue />
    </v-footer>

    <Menu />
    
    <v-main>
      <router-view></router-view>
    </v-main>


  </v-app>
</template>


<script setup lang="ts">
import TomatoFooterVue from '@/components/TomatoFooter.vue';
import Menu from '@/components/Menu.vue';
</script>

<style>
html {
  overflow: hidden !important;
}
</style>
