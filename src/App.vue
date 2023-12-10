<template>
  <v-app id="inspire">
    <Menu v-if="windowWidth > 600"></Menu>
    <v-main class="main">
      <div class="main-wrapper">
        <router-view :key="$route.fullPath"></router-view>

        <!-- <PomodoroFlex class="pomodoro" :class="{ 'mobile': !isLargeScreen }" @click="pomodoro.pro = false" /> -->

        <div class="pomodoro-controls" v-if="windowWidth < 600">
          <PomodoroControls />
        </div>
      </div>
    </v-main>
    <ZenScreen />
  </v-app>
</template>


<script setup lang="ts">
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import Menu from '@/components/Menus/Menu.vue';
import PauseScreen from '@/components/Pause/PauseScreen.vue';
import ZenScreen from '@/components/Zen/ZenScreen.vue';
import PomodoroControls from '@/components/Pomodoro/PomodoroControls.vue';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";

const pomodoro = usePomodoroStore();

const windowWidth = ref(window.innerWidth);
const isLargeScreen = computed(() => windowWidth.value > 600);


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

<style lang="scss">
html {
  overflow: hidden !important;
}

.btn {
  border-radius: 1rem !important;
}

.font-press {
  font-family: 'Press Start 2P', Arial, Helvetica, sans-serif !important;
}

.font-casio {
  font-family: 'casio', Arial, Helvetica, sans-serif !important;
}

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
      bottom: 5rem;
    }

    .pomodoro-controls {
      position: absolute;
      bottom: 10rem;
      // centered
      display: flex;
      justify-content: center;
      align-content: center;
      width: 100%;
      z-index: 1499;

    }

  }
}</style>
