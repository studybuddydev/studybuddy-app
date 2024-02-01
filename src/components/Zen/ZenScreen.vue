
<script lang="ts" setup>
import { ref, computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useAuth0 } from "@auth0/auth0-vue";
import { useSettingsStore } from "@/stores/settings";
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomodoroCircle from '@/components/Pomodoro/PomodoroCircle.vue';
import PomodoroHistory from '@/components/Pomodoro/PomodoroHistory.vue';
import PomodoroReport from '@/components/Pomodoro/PomodoroReport.vue';
import Settings from '@/components/Popup/Settings.vue';
import { onMounted, onUnmounted } from 'vue';
import Info from '@/components/common/Info.vue'

const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();
const pomodoro = usePomodoroStore();
const settings = useSettingsStore();
const terminatePomoDialog = ref(false);

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

function stopPomodoro() {
  pomodoro.stopPomodoro();
  zenMode.value = true;
}
function pausePomodoro() {
  pomodoro.togglePauseStudy();
  zenMode.value = true;
}

function toggleZenMode() {
  zenMode.value = !zenMode.value;
  if (!zenMode.value && pomodoro.pauseing) {
    pomodoro.togglePauseStudy();
  }
}

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
  });
  isPipped.value = true;

}

const offline = ref(!navigator.onLine);

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
const setOffline = () => offline.value = !navigator.onLine;

onMounted(() => {
  window.addEventListener('online', () => setOffline);
  window.addEventListener('offline', () => setOffline);
  window.addEventListener('keyup', onKeyUp);

});
onUnmounted(() => {
  window.removeEventListener('online', () => setOffline);
  window.removeEventListener('offline', () => setOffline);
  window.removeEventListener('keyup', onKeyUp);
});



</script>

<template>
  <div :class="zenStyle.backgroundImage ? 'img-background' : ''">
    <Settings class="settings" v-model="openSettingsTab" />

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

          <!-- top left  -->
          <a class="top-left title blur" href="https://studybuddy.it" target="_blank">
            <img src="/images/logo.png" alt="logo" class="logo" />
            <h3 class="text-primary" v-if="!pomodoro.created">StudyBuddy
              <span class="bg-primary beta">BETA</span>
            </h3>
          </a>

          <!-- top right -->
          <div class="top-right blur" v-if="!isLoading"
            @click="!isAuthenticated ? loginWithRedirect() : openSettingsTab = 'general'">
            <p class="logged-user" v-if="offline">
              <v-icon v-ripple size="x-large" class="icon" icon="mdi-wifi-off" color="warning" />
              <span class="text">Offline</span>
            </p>
            <p v-else-if="isAuthenticated" class="logged-user">
              <span class="text">{{ user?.given_name ?? user?.nickname }}</span>
              <span><v-avatar :image="user?.picture" /></span>
            </p>
            <p class="login-button" v-else>
              <v-icon v-ripple size="x-large" class="icon" icon="mdi-account" />
              <span class="text">Login</span>
            </p>
          </div>

          <!-- main content in the center-->
          <div class="main-content">

            <!-- welcome screen -->
            <div v-if="pomodoro.created" class="created-box">
              <div class="blur rounded-box pa-7">
                <Info :text="$t('todo', 'info per il welcome')" class="info-welcome" />
                <p class="text-primary font-press">{{ $t("pause.welcome") }}</p>
                <div class="title">
                  <img src="/images/logo.png" alt="logo" class='logo' />
                  <h1 class="text-primary">StudyBuddy</h1>
                </div>
              </div>
            </div>
            <!-- finish screen -->
            <div v-else-if="pomodoro.terminated" class="blur rounded-box finish-box">
              <p class="pause font-press text-center">{{ pomodoro.report?.shortPomo ? $t("pause.pomoDone") : $t("pomoDoneShort") }}</p>
              <h2 class="text-primary font-press text-center">{{ pomodoro.report?.shortPomo ? $t("pause.goodjob") : $t("pause.goodjobShort") }}</h2>
            </div>

            <div class="pomodoro-circle-component-on-zen-wrapper">
              <PomodoroCircle class="pomodoro-circle-component pomodoro-circle-component-on-zen"
                v-if="pomodoro.going && (!settings.userSettings.hideTime || pomodoro.pauseing)" :in-pip="false" />
            </div>
            <!-- report table-->
            <PomodoroReport v-if="pomodoro.report" :report="pomodoro.report" />

            <div class="pomopause">
              <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going"
                @click="pomodoro.startPomodoro()">
                <span>{{ $t("pause.study") }}</span>
                <v-icon class="icon" icon="mdi-play" />
              </v-btn>
              <v-btn class='btn bg-primary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going"
                @click="showPomoHistory = true">
                <v-icon class="icon" icon="mdi-history" />
              </v-btn>
            </div>

          </div>
        </div>
      </v-scroll-y-reverse-transition>

      <v-dialog v-model="terminatePomoDialog" width="auto">
        <v-card :text="$t('zen.confirm')">
          <v-card-actions>
            <v-spacer />
            <v-btn @click="terminatePomoDialog = false">{{ $t("no") }}</v-btn>
            <v-btn color="primary" @click="stopPomodoro(); terminatePomoDialog = false">{{ $t("yes") }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="bottom-bar">
      <div class="quick-settings" v-if="zenMode">
        <v-btn v-if="pomodoro.going && pipSupported" density="comfortable" size="small" class="btn-edit bg-surface"
          :icon="isPipped ? 'mdi-flip-to-back' : 'mdi-flip-to-front'" @click="pipIt()" />
        <v-btn v-if="pomodoro.going" density="comfortable" size="small" class="btn-edit bg-surface"
          :icon="settings.userSettings.hideTime ? 'mdi-eye' : 'mdi-eye-off'"
          @click="settings.userSettings.hideTime = !settings.userSettings.hideTime" />
        <v-btn density="comfortable" class="btn-edit btn-edit-main bg-background" icon="mdi-cog"
          @click="openSettingsTab = pomodoro.going ? 'theme' : 'pomodoro'" />

      </div>
      <div :class="`pull-up-panel blur ${zenMode ? '' : 'pull-up-panel-zenmode'} ${showPomoHistory ? 'no-frost' : ''}`">
        <div class="handle" v-ripple @click="showPomoHistory = false" v-if="showPomoHistory">
          <v-icon icon="mdi-close" />
        </div>
        <div class="handle handle-zen" v-ripple @click="toggleZenMode()" v-else>
          <v-icon :icon="zenMode ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
        </div>

        <div class="pomodoro-bar">
          <div class="button-wrapper font-press pomo-left" v-if="pomodoro.going">
            <div>
              <v-btn class='btn bg-secondary pomo-btn pomo-box' @click="pomodoro.startPomodoro()"
                v-if="pomodoro.created || pomodoro.terminated">
                <v-icon class="icon" icon="mdi-play" />
              </v-btn>
              <v-btn class='btn bg-secondary pomo-btn pomo-box' @click="() => pausePomodoro()"
                v-else-if="pomodoro.studing">
                <v-icon class="icon" icon="mdi-pause" />
              </v-btn>
              <v-btn class='btn bg-secondary pomo-btn pomo-box pomo-box-disabled' v-else>
                <v-icon class="icon coffee-cup" icon="mdi-coffee" />
              </v-btn>
              <!-- <PomodoroController class="pomo-box pomo-controller bottom-box" v-if="!pomodoro.getReport.reportDone && (!pomodoroGoing || !pomodoro.status.isBreak)"/>
            <v-btn class="btn bg-error btn-endsession bottom-box" @click="endSession()" v-if="pomodoroGoing && pomodoro.status.isBreak">{{ $t("pause.endSession") }}</v-btn> -->
            </div>
          </div>
          <PomodoroFlex class="pomo-flex" :percentage="pomodoro.percentage" :displayBreaks="pomodoro.displayBreaks"
            :displayStudy="pomodoro.displayStudy" />
          <div class="button-wrapper pomo-right" v-if="pomodoro.going">
            <div class="time-button-wrapper">
              <div class="pomo-box pomo-time font-casio">
                <p v-if="!settings.userSettings.hideTime" v-html="pomodoro.timeSinceStart"></p>
              </div>
              <div :class="pomodoro.terminated ? 'pomo-box pomo-stop pomo-box-disabled' : 'pomo-box pomo-stop'"
                @click="(pomodoro.freeMode || !pomodoro.done) ? terminatePomoDialog = true : stopPomodoro()">
                <v-icon icon="mdi-stop" />
              </div>
            </div>
          </div>
        </div>
        <PomodoroHistory
          :class="`pomo-history ${showPomoHistory ? '' : 'hide-pomo-history'}`"
          @start-pomodoro="pomodoro.startPomodoro(); showPomoHistory = false"
          />
      </div>
    </div>
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


.blur {
  background-color: rgba(var(--v-theme-background));
  transition: background-color 0.2s ease-in-out;
}

.img-background {
  .blur {
    backdrop-filter: blur(5px);
    background-color: rgba(var(--v-theme-background), 0.7);

    &.no-frost {
      background-color: rgb(var(--v-theme-background));

    }
  }
}

.rounded-box {
  border-radius: 1rem;
}

.settings {
  z-index: 2000;
}

.pomo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .icon {
    font-size: 2rem;
    transition: font-size 0.1s ease-in-out;
  }

  .text {
    margin-top: 0.2em;
  }
}

.pomo-box {
  height: 3rem !important;
  line-height: 3rem;
  width: 100%;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.pomo-box-disabled {
  background-color: rgb(var(--v-theme-secondary-darken-1));
  filter: saturate(0.5);
  opacity: 0.5;
  pointer-events: none;
  /* Disable user interaction */

}

.coffee-cup {
  animation: cupOnButton 2s infinite;
}

@keyframes cupOnButton {
  0% {
    transform: translateY(0) rotate(0);
  }

  50% {
    transform: translateY(-5px) rotate(5deg);
  }

  100% {
    transform: translateY(0) rotate(0);
  }
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
      @media (max-width: 600px) {
        .title {
          display: flex;
          flex-direction: column;
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

  .top-left {
    display: flex;
    align-items: center;
    position: absolute;
    top: 1rem;
    left: 1rem;
    border-radius: 1rem;
    padding: 0.5rem;
    height: 5rem;
    text-decoration: none;

    .logo {
      height: 4rem;
    }

    .beta {
      border-radius: 0.5rem;
      padding: 0.4em;
      margin-right: 1em;
    }
  }

  .top-right {
    display: flex;
    align-items: center;
    justify-items: center;
    padding: 0.5em;
    border-radius: 1em;
    position: absolute;
    top: 1rem;
    right: 1rem;
    transition: background-color 0.1s ease-in-out;
    height: 5rem;
    overflow: hidden;
    font-family: 'Press Start 2P', Arial, Helvetica, sans-serif;

    .icon {
      display: none;
    }

    @media (max-width: 600px) {
      .text {
        display: none;
      }

      .icon {
        display: block;
      }
    }

    &:hover {
      background-color: #FFF4;
      cursor: pointer;
    }

    .login-button {
      padding: 0 1rem;
    }

    .logged-user {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;

      span {
        padding: 0 0.5rem;
      }
    }
  }

  .btn {
    font-size: 0.8rem;
    font-weight: bold;
  }

}

.bottom-bar {
  pointer-events: none;
  position: fixed;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 1500;
  justify-content: flex-end;

  .quick-settings {
    pointer-events: auto;
    align-self: flex-end;
    margin: 1rem;

    &:hover {
      .btn-edit {
        display: inline;
      }
    }

    .btn-edit {
      display: none;
      margin: 0.2rem;
    }

    .btn-edit-main {
      display: inline;
    }
  }


  .pull-up-panel {
    padding-top: 0.8rem;
    pointer-events: auto;
    width: 100vw;
    border-radius: 1em 1em 0 0;
    display: flex;
    flex-direction: column;

    .pomo-history {
      height: 66vh;
      margin: 1em;
      transition: height 0.1s ease-in-out;
      overflow-y: auto;

      &.hide-pomo-history {
        height: 0;
        overflow: hidden;
        margin: 0;
      }
    }

    .handle {
      align-self: center;
      margin: 0 0.8rem 0 0.8rem;
      cursor: pointer;
      width: calc(100% - 1rem);
      height: 1.6rem;
      border-radius: 0.8rem;
      display: flex;
      justify-content: center;
      background-color: #FFFFFF00;
      transition: background-color 0.1s ease-in-out, height 0.1s ease-in-out;

      &:hover {
        background-color: #FFFFFF10;
      }
    }

    @media screen and (max-width: 600px) {
      .handle-zen {
        display: none;
      }
    }

    .pomodoro-bar {
      transition: padding 0.1s ease-in-out;
      display: flex;
      align-items: end;
      justify-content: space-between;
      padding: 0.5rem 1rem 1.5rem;

      @media (max-width: 600px) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;

        .pomo-left {
          grid-column: 1;
          grid-row: 1;
          justify-self: start;
        }

        .pomo-right {
          grid-column: 2;
          grid-row: 1;
          justify-self: end;
        }

        .pomo-flex {
          grid-column: 1 / span 2;
          grid-row: 2;
        }
      }

      .pomo-flex {
        height: 2rem;
        margin: 0.5rem 0;
      }

      .pomo-flex,
      .pomo-box {
        transition: height 0.1s ease-in-out, margin 0.1s ease-in-out;
      }

      .button-wrapper {
        width: 10rem;
        margin: 0 0.5rem;

        @media (max-width: 600px) {
          width: 100%;
          margin: 0;
          padding: 0.2rem;
        }

        .time-button-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .pomo-time {
        width: 70%;
        display: flex;
        background-color: rgb(var(--v-theme-secondary-darken-1));
        border-radius: 1rem 0 0 1rem;

        p {
          width: 100%;
          text-align: center;
        }
      }

      .pomo-stop {
        width: 27%;
        border-radius: 0 1rem 1rem 0;
        background-color: rgb(var(--v-theme-error));
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 3%;
        font-size: 1.2rem;
        transition: background-color 0.1s ease-in-out;
        cursor: pointer;

        &:hover {
          background-color: rgb(var(--v-theme-apple));
        }
      }
    }

    &.pull-up-panel-zenmode {
      .handle {
        margin: 0.3rem 0.3rem 0 0.3rem;
        height: 1.2rem;
        border-radius: 0.4rem;
        font-size: 0.8rem;
      }

      .pomodoro-bar {
        padding: 0.5rem 1rem 0.5rem;
      }

      .pomodoro-bar {
        .pomo-box {
          height: 2rem !important;
          line-height: 2rem;
        }

        .pomo-flex {
          height: 1.4rem;
          margin: 0.3rem 0;
        }
      }
    }
  }
}


.top-right:after {
  content: '';
  top: 0;
  transform: translateX(100%);
  width: 100%;
  height: 5rem;
  position: absolute;
  z-index: 1;
  animation: slide 1.2s;
  /* 
  CSS Gradient - complete browser support from http://www.colorzilla.com/gradient-editor/ 
  */
  background: -moz-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* FF3.6+ */
  background: -webkit-gradient(linear, left top, right top, color-stop(0%, rgba(255, 255, 255, 0)), color-stop(50%, rgba(255, 255, 255, 0.8)), color-stop(99%, rgba(128, 186, 232, 0)), color-stop(100%, rgba(125, 185, 232, 0)));
  /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* Chrome10+,Safari5.1+ */
  background: -o-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* Opera 11.10+ */
  background: -ms-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* IE10+ */
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* W3C */
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00ffffff', endColorstr='#007db9e8', GradientType=1);
  /* IE6-9 */
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}</style>
