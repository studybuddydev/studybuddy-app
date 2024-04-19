<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
import PomodoroDetailsEnd from '@/components/Zen/PomodoroDetailsEnd.vue';
import PomodoroSetup from '@/components/Pomodoro/PomodoroSetup.vue';
import Sink from '@/components/Sink/Sink.vue';
import BackgroundVideo from '@/components/Video/BackgroundVideo.vue';

const pomodoro = usePomodoroStore();
const settings = useSettingsStore();

const zenMode = ref(true);
const showPomoHistory = ref(false);
const openSettingsTab = ref<boolean | string>(false);
const zenStyle = computed<{ backgroundImage?: string, backgroundColor?: string, backgroundVideo?: boolean }>(() => {
  const backgroundVideo = !!settings.themeSettings?.backgroundVideo;
  if (settings.themeSettings?.backgroundImg) {
    if (!pomodoro.onLongPause) {
      return { backgroundImage: `url(${settings.themeSettings?.backgroundImg})`, backgroundVideo }
    } else {
      return { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${settings.themeSettings?.backgroundImg})`, backgroundVideo }
    }
  } else if (settings.themeSettings?.backgroundColor) {
    return { backgroundColor: settings.themeSettings?.backgroundColor, backgroundVideo }
  }
  return { backgroundVideo };
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
  <div :class="(zenStyle.backgroundImage || zenStyle.backgroundVideo) ? 'img-background' : ''">
    <Settings v-model="openSettingsTab" />
    <LongAwayPopup />

    <div transition="fade-transition">
      <v-scroll-y-reverse-transition>
        <div class="zen-screen" v-if="zenMode" :style="zenStyle">

          <BackgroundVideo :class="settings.themeSettings.showOnlyMusic ? 'hide-video' : ''" />

          <div class="zen-header">
            <About class="top-left" :show-title="!pomodoro.created" />
            <UserBanner class="top-right" v-if="!showPomoHistory" @open-settings-tab="event => openSettingsTab = event"
              @open-history="showPomoHistory = true" />
          </div>

          <div class="main-content-wrapper">
            <div class="main-content">
              <StartPage v-if="pomodoro.created && !pomodoro.going && !pomodoro.settingUp" />
              <PomodoroSetup v-else-if="pomodoro.created && !pomodoro.going && pomodoro.settingUp"
                @exit-setup="pomodoro.exitSetup()" @open-settings-tab="event => openSettingsTab = event" />
              <FinishPage v-else-if="pomodoro.terminated && !pomodoro.going"
                :short-pomo="!!pomodoro.finishedPomoRecord?.shortPomo"
                :points="(pomodoro.finishedPomoRecord?.pomo?.report?.points ?? 0)" />
              <PomodoroPip
                v-if="(pomodoro.countdownRunning || (pomodoro.going && (!settings.generalSettings.hideTime || pomodoro.pauseing)))"
                :zen-style="zenStyle" :hide-time="settings.generalSettings.hideTime" />
              <ZenActions @show-history="showPomoHistory = true" />
              <PomodoroDetailsEnd class="pomo-details"
                v-if="!(pomodoro.going || pomodoro.countdownRunning) && pomodoro.finishedPomoRecord?.pomo"
                :pomo="pomodoro.finishedPomoRecord.pomo" @done="pomodoro.createPomodoro()" />

            </div>
          </div>

          <Sink class="sink" />
        </div>
      </v-scroll-y-reverse-transition>
    </div>
    <BottomBar :zen-mode="zenMode" :show-pomo-history="showPomoHistory" @set-zen-mode="zenMode = $event"
      @set-show-pomo-history="showPomoHistory = $event" @open-settings-tab="openSettingsTab = $event" />
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

@font-face {
  font-family: 'casio';
  src: url('@/assets/fonts/casio-calculator-font.ttf') format('truetype');
}

.sink {
  position: absolute;
  top: 23vh;
  right: 0;
}

.hide-video {
  display: none;
}

.zen-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1500;
  background-color: rgb(var(--v-theme-background));
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  .zen-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 4rem;
    flex-shrink: 0;
    padding: 0 1rem;
  }

  .main-content-wrapper {
    overflow-y: scroll;
    display: grid;
    align-items: center;
    width: 100vw;
    height: calc(100vh - 4.2rem);
    padding: 0;
    -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    mask-image: linear-gradient(to top, black 99.5%, transparent 100%);
    margin-top: 4.2rem;

    .main-content {
      margin-top: 1rem;
      margin-bottom: 10rem;
      display: flex;
      width: 100vw;
      align-items: center;

      flex-direction: column;
      gap: 1rem;
    }
  }



}
</style>