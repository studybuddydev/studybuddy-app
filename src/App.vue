<template>
  <v-app id="inspire" >
    <Menu v-if="windowWidth > 600" />
    <v-main class="main">
      <div class="main-wrapper">
        <router-view :key="$route.fullPath"></router-view>

        <PomodoroFlex class="pomodoro" :class="{'mobile': !isLargeScreen}" />

        <div class="pomodoro-controls" v-if="windowWidth < 600">
          <PomodoroControls />
        </div>
      </div>
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
  import PomodoroControls from '@/components/Pomodoro/PomodoroControls.vue';
  import { computed, ref } from 'vue';

   const windowWidth = ref(window.innerWidth);
  const isLargeScreen = computed(() => windowWidth.value > 600);

  import { ref, onMounted, onUnmounted } from 'vue';


  const updateWidth = () => {
    windowWidth.value = window.innerWidth;
  };

  onMounted(() => {
    window.addEventListener('resize', updateWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
  });


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
    .pomodoro.mobile {
      height: 3rem;
    }

    .pomodoro-controls {
      position: absolute;
      bottom: 6rem;
      // centered
      display: flex;
      justify-content: center;
      align-content: center;
      width: 100%;
      z-index: 1499;


    }

  } 
}
</style>
