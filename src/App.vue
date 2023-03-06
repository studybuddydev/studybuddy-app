<template>
  <v-app id="inspire">
    <Pomodoro />
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
