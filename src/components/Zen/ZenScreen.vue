<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSettingsStore } from "@/stores/settings";
import PomodoroPip from '@/components/Pomodoro/PomodoroPip.vue';
import Settings from '@/components/Settings/Settings.vue';
import LongAwayPopup from '@/components/Zen/LongAwayPopup.vue'
import UserBanner from '@/components/Zen/UserBanner.vue'
import BottomBar from '@/components/Zen/BottomBar.vue'
import About from '@/components/Zen/About.vue'
import StartPage from '@/components/Zen/StartPage.vue'
import FinishPage from '@/components/Zen/FinishPage.vue'
import ZenActions from '@/components/Zen/ZenActions.vue'
import PomodoroDetails from '../Pomodoro/PomodoroDetails.vue';

const pomodoro = usePomodoroStore();
const settings = useSettingsStore();

const zenMode = ref(true);
const showPomoHistory = ref(false);
const openSettingsTab = ref<boolean | string>(false);
const zenStyle = computed<{ backgroundImage?: string, backgroundColor?: string }>(() => {
  if (settings.settings.theme?.backgroundImg) {
    if (!pomodoro.onLongPause) {
      return { backgroundImage: `url(${settings.settings.theme?.backgroundImg})` }
    } else {
      return { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${settings.settings.theme?.backgroundImg})` }
    }
  } else if (settings.settings.theme?.backgroundColor) {
    return { backgroundColor: settings.settings.theme?.backgroundColor }
  }
  return {};
});

const onKeyUp = (e: KeyboardEvent) => {
  if (e.code === 'Escape') {
    zenMode.value = !zenMode.value;
    if (!zenMode.value) {
      showPomoHistory.value = false;
    }
  }
};

onMounted(() => { window.addEventListener('keyup', onKeyUp) });
onUnmounted(() => { window.removeEventListener('keyup', onKeyUp) });
</script>

<template>
  <div :class="zenStyle.backgroundImage ? 'img-background' : ''">
    <Settings v-model="openSettingsTab" />
    <LongAwayPopup />

    <div transition="fade-transition">
      <v-scroll-y-reverse-transition>
        <div class="zen-screen" v-if="zenMode" :style="zenStyle">

          <About class="top-left"
            :show-title="!pomodoro.created" />
          <UserBanner class="top-right"
            v-if="!showPomoHistory"
            @open-settings-tab="event => openSettingsTab = event" />

          <div class="main-content">
            <StartPage v-if="pomodoro.created && !pomodoro.going" />
            <FinishPage v-else-if="pomodoro.terminated && !pomodoro.going"
              :short-pomo="!!pomodoro.finishedPomoRecord?.shortPomo"
              :points="(pomodoro.finishedPomoRecord?.pomo?.report?.points ?? 0)"
              @create-pomodoro="pomodoro.createPomodoro()" />
            <PomodoroPip
              v-if="(pomodoro.countdownRunning || (pomodoro.going && (!settings.generalSettings.hideTime || pomodoro.pauseing)))"
              :zen-style="zenStyle"
              :hide-time="settings.generalSettings.hideTime" />
            <ZenActions @show-history="showPomoHistory = true" />
            <PomodoroDetails v-if="pomodoro.finishedPomoRecord?.pomo" :pomo="pomodoro.finishedPomoRecord.pomo" />
          </div>
        </div>
      </v-scroll-y-reverse-transition>
    </div>
    <BottomBar
      :zen-mode="zenMode"
      :show-pomo-history="showPomoHistory"
      @set-zen-mode="zenMode = $event"
      @set-show-pomo-history="showPomoHistory = $event"
      @open-settings-tab="openSettingsTab = $event" />
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

@font-face {
  font-family: 'casio';
  src: url('@/assets/fonts/casio-calculator-font.ttf') format('truetype');
}

.zen-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1500;
  background-color: rgb(var(--v-theme-surface));
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  .top-left {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }

  .top-right {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .main-content {
    gap: 1rem;
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    @media (max-width: 600px) {
      justify-content: flex-start;
      margin-top: 20vh;
    }
  }
}
</style>