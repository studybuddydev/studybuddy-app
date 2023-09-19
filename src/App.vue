<template>
  <v-app id="inspire" >
    <Menu />
    <v-main class="main">
      <div class="main-wrapper">
        <router-view :key="$route.fullPath"></router-view>
        <PomodoroFlex class="pomodoro" />
      </div>
    </v-main>
    
    

    <PauseScreen />

  </v-app>

</template>


<script setup lang="ts">
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import Menu from '@/components/Menus/Menu.vue';
import CookieBanner from '@/components/Cookie/CookieBanner.vue';
import PauseScreen from '@/components/Pause/PauseScreen.vue';

</script>

<style scoped lang="scss">
.main {
  height: 100vh;
  overflow: auto;

  .main-wrapper {
    height: 100%;
    position: relative;

    .pomodoro {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
  } 
}
</style>
