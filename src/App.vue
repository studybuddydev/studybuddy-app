<template>
  <v-app id="inspire" >
    <PomodoroFlex /> <!-- keep it on the top -->
    <Menu />
    <v-main class="main">
      <router-view :key="$route.fullPath"></router-view>
    </v-main>
    
    <CookieBanner />

    <PauseScreen />

  </v-app>

</template>


<script setup lang="ts">
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import Menu from '@/components/Menus/Menu.vue';
import CookieBanner from '@/components/Cookie/CookieBanner.vue';
import PauseScreen from '@/components/Pause/PauseScreen.vue';
import { useTheme } from 'vuetify'
import { useStateStore } from "@/stores/state";
import BaseDialog from '@/components/common/BaseDialog.vue'
const t = useStateStore().getTheme();
if (t) useTheme().global.name.value = t;

</script>

<style scoped lang="scss">
.main {
  height: 100vh;
  overflow: auto;
}
</style>
