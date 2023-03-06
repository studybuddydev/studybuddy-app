<template>
  <v-app id="inspire">

    <v-footer app class="bg-black pa-0">
      <Pomodoro />
    </v-footer>

    <Menu />
    
    <v-main>
      <router-view></router-view>
    </v-main>


  </v-app>
</template>


<script setup lang="ts">
import Pomodoro from '@/components/Pomodoro.vue';
import Menu from '@/components/Menus/Menu.vue';
</script>

<style>
html {
  overflow: hidden !important;
}
</style>
