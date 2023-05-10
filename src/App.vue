<template>
  <v-app id="inspire" >
    <PomodoroFlex /> <!-- keep it on the top -->
    <Menu />
    <v-main class="main">
      <router-view :key="$route.fullPath"></router-view>
    </v-main>
    
    <CookieBanner />

    <PauseScreen class="pause" transition="fade-transition" v-model="showPause" />
  </v-app>

</template>


<script setup lang="ts">
import { ref } from 'vue';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import Menu from '@/components/Menus/Menu.vue';
import CookieBanner from '@/components/Cookie/CookieBanner.vue';
import PauseScreen from '@/components/Pause/PauseScreen.vue';
import { useTheme } from 'vuetify'
import { useStateStore } from "@/stores/state";
const t = useStateStore().getTheme();
if (t) useTheme().global.name.value = t;

const showPause = ref(false);
document.addEventListener('keyup', function (evt) {
    if (evt.key === 'Escape') {
      showPause.value = !showPause.value;
    }
});

</script>

<style scoped lang="scss">
.main {
  height: 100vh;
  overflow: auto;
}
</style>
