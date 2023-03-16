<template>
  <v-app id="inspire">
    <Pomodoro /> <!-- keep it on the top -->
    <Menu />
    <v-main class="main">
      <router-view :key="$route.fullPath"></router-view>
    </v-main>
  </v-app>
</template>


<script setup lang="ts">
import Pomodoro from '@/components/Pomodoro/Pomodoro.vue';
import Menu from '@/components/Menus/Menu.vue';
</script>

<style scoped lang="scss">
.main {
  height: 100vh;
  overflow: auto;
}
</style>
