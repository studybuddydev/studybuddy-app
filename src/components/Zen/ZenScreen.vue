
<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSettingsStore } from "@/stores/settings";
import minecraftSentences from '@/assets/minecraft.json';
import PomodoroCircle from '@/components/Pomodoro/PomodoroCircle.vue';
import PomodoroReport from '@/components/Pomodoro/PomodoroReport.vue';
import Settings from '@/components/Settings/Settings.vue';
import Info from '@/components/common/Info.vue';
import LongAwayPopup from '@/components/Zen/LongAwayPopup.vue'
import UserBanner from '@/components/Zen/UserBanner.vue'
import BottomBar from '@/components/Zen/BottomBar.vue'
import About from '@/components/Zen/About.vue'

const pomodoro = usePomodoroStore();
const settings = useSettingsStore();

const appVersion = APP_VERSION;

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

const isPipped = ref(false);
const pipSupported = computed(() => (window as any).documentPictureInPicture);




async function pipIt() {
  const player = document.querySelector("#pomocirclepip");

  if (!(window as any).documentPictureInPicture) return;

  if ((window as any).documentPictureInPicture.window) {
    (window as any).documentPictureInPicture.window.close();
    isPipped.value = false;
    return;
  }

  // Open a Picture-in-Picture window.
  const pipWindow = await (window as any).documentPictureInPicture.requestWindow();

  // Copy style sheets over from the initial document
  // so that the player looks the same.
  [...(document.styleSheets as any)].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
      const style = document.createElement('style');

      style.textContent = cssRules;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      const link = document.createElement('link');

      link.rel = 'stylesheet';
      link.type = styleSheet.type;
      link.media = styleSheet.media;
      link.href = styleSheet.href;
      pipWindow.document.head.appendChild(link);
    }
  });

  // Move the player to the Picture-in-Picture window.
  pipWindow.document.body.append(player);

  // Move the player back when the Picture-in-Picture window closes.
  pipWindow.addEventListener("pagehide", (event: any) => {
    const playerContainer = document.querySelector("#pomocirclepipparent");
    const pipPlayer = event.target.querySelector("#pomocirclepip");
    playerContainer?.append(pipPlayer);
    isPipped.value = false;
  });
  isPipped.value = true;

}

const onKeyUp = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    // if (pomodoro.going)
    //   pomodoro.togglePauseStudy();
    // else
    //   pomodoro.startPomodoro();
  } else if (e.code === 'Escape') {
    zenMode.value = !zenMode.value;
    if (!zenMode.value) {
      showPomoHistory.value = false;
    }
    
  }
};

onMounted(() => { window.addEventListener('keyup', onKeyUp) });
onUnmounted(() => { window.removeEventListener('keyup', onKeyUp) });


const minecraftSentence = minecraftSentences.sentences[Math.floor(Math.random() * minecraftSentences.sentences.length)];


</script>

<template>
  <div :class="zenStyle.backgroundImage ? 'img-background' : ''">
    <Settings class="settings" v-model="openSettingsTab" />
    <LongAwayPopup />

    <div v-if="pipSupported" class="hide" id="pomocirclepipparent">
      <div id="pomocirclepip"
        :class="zenStyle.backgroundImage ? 'pomodoro-circle-component-on-pip-wrapper-wrapper img-background' : 'pomodoro-circle-component-on-pip-wrapper-wrapper'"
        :style="zenStyle">
        <div class="pomodoro-circle-component-on-pip-wrapper">
          <PomodoroCircle class="pomodoro-circle-component pomodoro-circle-component-on-pip" :in-pip="true" />
        </div>
      </div>
    </div>

    <div transition="fade-transition">
      <v-scroll-y-reverse-transition>
        <div class="zen-screen" v-if="zenMode" :style="zenStyle">

          <About :show-title="!pomodoro.created" />
          <UserBanner v-if="!showPomoHistory" @open-settings-tab="event => openSettingsTab = event" />

          <!-- main content in the center-->
          <div class="main-content">

            <!-- welcome screen -->
            <div v-if="pomodoro.created && !pomodoro.going" class="created-box">
              <div class="blur rounded-box pa-7 created-box-wrapper">
                <Info :text="$t('info.welcome')" class="info-welcome" />
                <p class="text-primary font-press">{{ $t("pause.welcome") }}</p>
                <div class="title">
                  <img src="/images/logo.png" alt="logo" class='logo' />
                  <h1 class="text-primary">StudyBuddy</h1>
                </div>
                <h6 class="text-version">v{{ appVersion }}</h6>
                <h3 class="minecraft-sentence font-press">{{minecraftSentence}}</h3>
              </div>
            </div>
            <!-- finish screen -->
            <div v-else-if="pomodoro.terminated && !pomodoro.going" class="blur rounded-box finish-box">
              <v-icon class="close-icon" icon="mdi-close" @click="pomodoro.createPomodoro()"/>
              <div v-if="pomodoro.report?.shortPomo">
                <p class="pause font-press text-center">{{ $t("pause.pomoDoneShort") }}</p>
                <h3 class="text-primary font-press text-center">{{ $t("pause.goodjobShort") }}</h3>
              </div>
              <div v-else-if="(pomodoro.report?.points ?? 0) < 0.5">
                <p class="pause font-press text-center">{{ $t("pause.pomoDoneBad") }}</p>
                <h2 class="text-primary font-press text-center">{{ $t("pause.goodjobBad") }}</h2>
              </div>
              <div v-else>
                <p class="pause font-press text-center">{{ $t("pause.pomoDone") }}</p>
                <h2 class="text-primary font-press text-center">{{ $t("pause.goodjob") }}</h2>
              </div>
            </div>

            <div class="pomodoro-circle-component-on-zen-wrapper" v-if="
              !isPipped && (pomodoro.countdownRunning || (pomodoro.going && (!settings.generalSettings.hideTime || pomodoro.pauseing)))
            ">
              <PomodoroCircle class="pomodoro-circle-component pomodoro-circle-component-on-zen" :in-pip="false" />
              <v-btn v-if="pomodoro.going && pipSupported" density="comfortable" size="small" class="btn-pip bg-surface"
                icon="mdi-flip-to-front" @click="pipIt()" />
              <Info v-if="pomodoro.pauseing" :text="$t('info.pause')" class="info-pause" />
            </div>
            <!-- report table-->
            <PomodoroReport v-if="pomodoro.report" :report="pomodoro.report" />

            <div class="pomopause">
              <v-btn class='btn bg-primary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going"
                @click="showPomoHistory = true">
                <v-icon class="icon" icon="mdi-folder-clock-outline" />
              </v-btn>
              <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going && !pomodoro.report?.shortPomo"
                @click="pomodoro.startPomodoro()">
                <span>{{ $t("pause.study") }}</span>
                <v-icon class="icon" icon="mdi-play" />
              </v-btn>
              <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going && pomodoro.report?.shortPomo"
                @click="pomodoro.createPomodoro()">
                <span>{{ $t("backHome") }}</span>
                <v-icon class="icon" icon="mdi-home" />
              </v-btn>
            </div>

          </div>
        </div>
      </v-scroll-y-reverse-transition>

    </div>
    <BottomBar
      :zen-mode="zenMode"
      :show-pomo-history="showPomoHistory"
      @set-zen-mode="zenMode = $event"
      @set-show-pomo-history="showPomoHistory = $event"
      @open-settings-tab="openSettingsTab = $event"
    />

  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

@font-face {
  font-family: 'casio';
  src: url('@/assets/fonts/casio-calculator-font.ttf') format('truetype');
}

.pomodoro-circle-component-on-zen-wrapper {
  position: relative;

  .btn-pip {
    position: absolute;
    display: none;
    top: 0;
    left: 0;
  }

  
  .info-pause {
    top: 0;
    right: 0;
  }


  &:hover .btn-pip {
    display: block;
  }

  .pomodoro-circle-component-on-zen {
    height: min(50vh, 80vw);
    width: min(50vh, 80vw);
  }
}

.pomodoro-circle-component-on-pip-wrapper-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: rgb(var(--v-theme-surface));
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  .pomodoro-circle-component-on-pip-wrapper {
    width: 100vmin;
    height: 100vmin;
    padding: 1rem;

    .pomodoro-circle-component-on-pip {
      height: 100%;
    }
  }
}


// TODO Blur


.rounded-box {
  border-radius: 1rem;
}

.settings {
  z-index: 2000;
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

  .main-content {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    // margin-top: -6em;         // check this
    @media (max-width: 600px) {
      justify-content: flex-start;
      margin-top: 20vh;
    }

    .created-box {
      .created-box-wrapper {
        position: relative;
      }
      @media (max-width: 600px) {
        .title {
          display: flex;
          flex-direction: column;
        }
      }
      .minecraft-sentence {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 1rem;
        // color: rgba(var(--v-theme-on-primary));
        transform: translate(-10%, -0em) rotate(-24deg);
        animation: breath 0.5s linear infinite alternate;
      }
      @keyframes breath {
        0% {
          scale: 0.9;
        }
        100% {
          scale: 1;
        }
      }
      .text-version {
        text-align: right;
        margin-right: 3em;
        margin-top: -1.8em;
        font-size: 0.9rem;
        @media (max-width: 600px) {
          margin-top: -1.2em;
          margin-right: 2em;
        }
      }
      .info-welcome {
        margin: 1rem;
        top: 0;
        right: 0;
      }
    }
    .finish-box {
      margin: 1rem;
      padding: 1.5rem;
      position: relative;
      .close-icon {
        position: absolute;
        top: 0;
        right: 0;
        padding: 1em;
      }


      @media (max-width: 600px) {
        padding: 1rem;

        p {
          font-size: 0.7rem;
        }

        h2 {
          font-size: 1rem;
        }
      }
    }

    .btn-main-start {
      width: auto;
      margin-left: 1em;
    }

    .btn-main {
      height: 3rem;
      margin: 0.5rem;
    }

    .btn-study {
      width: 11rem;
      font-size: 1em;
    }

    h1,
    h2,
    h3,
    p {
      max-width: 700px;
    }

    h1 {
      font-size: 5rem;

      @media (max-width: 600px) {
        font-size: 3rem;
      }
    }

    h2 {
      font-size: 3rem;
      font-weight: 900;
    }

    h3 {
      font-size: 1.5rem;
      @media (max-width: 600px) {
        font-size: 0.8rem;
      }
    }

    .pomopause {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;
      margin-top: 1em;
    }

    .title {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;

      img {
        height: 7rem;
        margin-right: 0.5em;

        @media (max-width: 600px) {
          display: none;
        }
      }
    }

    p {
      max-width: 700px;
      text-align: center;
      font-size: 1rem;
    }

  }


  .btn {
    font-size: 0.8rem;
    font-weight: bold;
  }

}

</style>
