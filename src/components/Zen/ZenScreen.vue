
<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useAuth0 } from "@auth0/auth0-vue";
import { useSettingsStore } from "@/stores/settings";
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomoSettings from '@/components/Popup/PomoSettings.vue';

const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();
const pomodoro = usePomodoroStore();
const settings = useSettingsStore();
const terminatePomoDialog = ref(false);

// const pauseFromPomodoro = computed(() => (pomodoro.status.isBreak && !!pomodoro.status.interval) || pomodoro.itsStopped);
// const pomodoroGoing = computed(() => pomodoro.going);
// const pause = ref(!pomodoroGoing.value);
// const first = computed(() => pomodoro.first);

const showTime = ref(true);
const zenMode = ref(true);
const openSettingsTab = ref<boolean | string>(false);
const zenStyle = computed<{ backgroundImage?: string, backgroundColor?: string }>(() => {
  if (settings.settings.zenMode?.backgroundImg) {
    return { backgroundImage: `url(${settings.settings.zenMode?.backgroundImg})` }
  } else if (settings.settings.zenMode?.backgroundColor) {
    return { backgroundColor: settings.settings.zenMode?.backgroundColor }
  }
  return {};
});

function toggleTime() {
  showTime.value = !showTime.value;
}

// watch(pauseFromPomodoro, (value) => {
//   pause.value = value;
// });

// function getMinutesFromPercentage(n: number) {
//   const min = n * pomodoro.settings.totalLength / 100;
//   const sec = Math.round(min * pomodoro.MINUTE_MULTIPLIER);

//   const h = Math.floor(sec / 3600);
//   const m = Math.floor((sec / 60) % 60).toString().padStart(h > 0 ? 2 : 1, '0');
//   const s = (sec % 60).toString().padStart(2, '0');
//   return `${h > 0 ? h + ':' : ''}${m}:${s}`;
// }

// function getTimerValue(getPause: boolean = false) {
//   let current = 0;
//   if (getPause) {
//     current = pomodoro.status.breaks.find(e => e.status == EPomodoroBreakStatus.DOING)?.start ?? 0;
//   } else {
//     const lastDone = pomodoro.status.breaks.findLast(e => e.status == EPomodoroBreakStatus.DONE);
//     current = lastDone ? lastDone.start + lastDone.lenght : 0;
//   }
//   return getMinutesFromPercentage(pomodoro.percentage - current)
// }

// function toogleTime() {
//   showTime.value = !showTime.value;
// }

// function msToMinutes(ms: number): string {
//   const minutes = Math.floor(ms / 1000 / 60);
//   const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
//   return `${minutes}:${seconds}`;
// }
</script>

<template>
  <div :class="zenStyle.backgroundImage ? 'img-background' : ''">
    <PomoSettings class="settings" v-model="openSettingsTab" />

    <div transition="fade-transition">
      <v-scroll-y-reverse-transition>
        <div class="zen-screen" v-if="zenMode" :style="zenStyle">

          <!-- top left  -->
          <div class="top-left title blur">
            <img src="/images/logo.png" alt="logo" class="logo" />
            <h3 class="text-primary">StudyBuddy
              <span class="bg-primary beta">BETA</span>
            </h3>
          </div>

          <!-- top right -->
          <div class="top-right blur">
            <p v-if="isAuthenticated" class="logged-user">
              <span>{{ user?.given_name ?? user?.nickname }}</span>
              <span><v-avatar :image="user?.picture" /></span>
            </p>
            <p class="login-button" v-else @click="loginWithRedirect()">Log In</p>
          </div>

          <!-- main content in the center-->
          <div class="main-content">
            <div v-if="pomodoro.going && showTime">
              <p class="timer blur timer-inpause font-casio" v-if="pomodoro.studing">{{ pomodoro.timeSinceStart }}</p>
            </div>
            <div v-else-if="pomodoro.going">
              <p>buono studio</p>
            </div>
            <!-- welcome screen -->
            <div v-if="pomodoro.created">
              <div class="blur rounded-box pa-7">
                <p class="text-primary font-press">{{ $t("pause.welcome") }}</p>
                <div class="title">
                  <img src="/images/logo.png" alt="logo" class='logo' />
                  <h1 class="text-primary">StudyBuddy</h1>
                </div>
              </div>
            </div>
            <!-- pause and finish screen -->
            <div v-else-if="pomodoro.terminated" class="mb-5 blur rounded-box pa-7">
              <p class="pause font-press text-center">{{ $t("pause.pomoDone") }}</p>
              <h2 class="text-primary font-press text-center">{{ $t("pause.goodjob") }}</h2>
            </div>
            <div v-else-if="pomodoro.pauseing" class="mb-5 blur rounded-box pa-7">
              <p class="pause font-press text-left">{{ $t("pause.youare") }}</p>
              <h1 class="text-primary font-press text-center">{{ $t("pause.break") }}</h1>
              <p class="pausetime font-press text-right">da <span class="text-primary font-casio">{{ pomodoro.timeInCurrentBreak }}</span></p>
            </div>

            <div class="pomopause">
              <v-btn class="btn bg-background btn-main btn-settings" v-if="!pomodoro.going" @click="openSettingsTab = true">
                <v-icon size="32" icon="mdi-cog" />
              </v-btn>
              <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.studing"
                @click="pomodoro.going ? pomodoro.study() : pomodoro.startPomodoro() ">
                <span>{{ $t("pause.study") }}</span>
                <v-icon class="icon">mdi-play</v-icon>
              </v-btn>
            </div>

            <!-- report table-->
            <!-- <div class="report font-press" v-if="pomodoro.getReport.reportDone">
              <div class="grid-container">
                <p>{{ "Tempo studio:" }}</p>
                <p class="report-value">{{ msToMinutes(pomodoro.getReport.studyLength - pomodoro.getReport.breakLength) }}</p>
                <p>{{ "Tempo pausa:" }}</p>
                <p class="report-value">{{ msToMinutes(pomodoro.getReport.breakLength) }}</p>
                <p>{{ "Tempo totale:" }}</p>
                <p class="report-value">{{ msToMinutes(pomodoro.getReport.studyLength) }}</p>
                <p>{{ "Nr. pause:" }}</p>
                <p class="report-value">{{ pomodoro.status.breaks.length }}</p>
                <p class="report-total">{{ "Punteggio:" }}</p>
                <p class="report-value report-total">{{ ((pomodoro.getReport.studyLength - pomodoro.getReport.breakLength) /
                  pomodoro.getReport.studyLength * 100).toFixed(1) }}%</p>
              </div>
            </div> -->

            <!-- pomodoro bar -->

          </div>
        </div>
      </v-scroll-y-reverse-transition>

      <v-dialog v-model="terminatePomoDialog" width="auto">
        <v-card text="Sei sicuro di voler terminare il pomodoro">
          <v-card-actions>
            <v-spacer />
            <v-btn @click="terminatePomoDialog = false">No</v-btn>
            <v-btn color="primary" @click="pomodoro.stopPomodoro(); terminatePomoDialog = false">Si</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="bottom-bar">
      <v-menu v-if="zenMode">
        <template v-slot:activator="{ props }">
          <v-btn density="comfortable" icon="mdi-pencil" class="btn-edit bg-background" v-bind="props"></v-btn>
        </template>

        <v-list>
          <v-list-item @click="toggleTime()" title="Mostra Tempo" v-if="!showTime" />
          <v-list-item @click="toggleTime()" title="Nascondi Tempo" v-else />
          <v-list-item @click="openSettingsTab = 'zen'" title="Modifica sfondo" />
        </v-list>
      </v-menu>

      <div :class="zenMode ? 'pull-up-panel blur' : 'pull-up-panel blur pull-up-panel-zenmode'">
        <div class="handle" v-ripple @click="zenMode = !zenMode">
          <v-icon :icon="zenMode ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
        </div>

        <div class="pomodoro-bar">
          <div class="bottom-button-wrapper font-press">
            <div>
              <v-btn class='btn bg-secondary pomo-btn pomo-box' @click="pomodoro.startPomodoro()" v-if="pomodoro.created">
                <v-icon class="icon" icon="mdi-play" />
              </v-btn>
              <v-btn class='btn bg-secondary pomo-btn pomo-box' @click="() => { pomodoro.togglePauseStudy(); zenMode = true; }" v-else-if="pomodoro.going">
                <v-icon class="icon" icon="mdi-pause" />
              </v-btn>
              <v-btn class='btn bg-secondary pomo-btn pomo-box' @click="() => { pomodoro.stopPomodoro(); }" v-else-if="pomodoro.done">
                <v-icon class="icon" icon="mdi-stop" />
              </v-btn>
              <v-btn class='btn bg-warning pomo-btn pomo-box' @click="pomodoro.togglePauseStudy()" v-else>
                <v-icon class="icon" icon="mdi-coffee" />
              </v-btn>
              <!-- <PomodoroController class="pomo-box pomo-controller bottom-box" v-if="!pomodoro.getReport.reportDone && (!pomodoroGoing || !pomodoro.status.isBreak)"/>
            <v-btn class="btn bg-error btn-endsession bottom-box" @click="endSession()" v-if="pomodoroGoing && pomodoro.status.isBreak">{{ $t("pause.endSession") }}</v-btn> -->
            </div>
          </div>
          <PomodoroFlex class="pomo-flex" />
          <div class="bottom-button-wrapper">
            <div class="time-bottom-button-wrapper">
              <div class="pomo-box pomo-time font-casio">
                <p v-if="showTime">{{ pomodoro.timeSinceStart }}</p>
              </div>
              <div class="pomo-box pomo-stop" @click="terminatePomoDialog = true">
                <v-icon icon="mdi-stop" />
              </div>
            </div>
          </div>
        </div>
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


.blur {
  background-color: rgba(var(--v-theme-background));
}

.img-background {
  .blur {
    backdrop-filter: blur(10px);
    background-color: rgba(var(--v-theme-background), 0.7);
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


    .report {
      background: #2A2A2A;
      border: 1px solid rgb(var(--v-theme-primary));
      padding: 0.8rem 1.5rem 1rem;
      margin-top: 2rem;
      border-radius: 1rem;

      .grid-container {
        display: grid;
        grid-template-columns: auto auto;
        gap: 0.2rem 1.2rem;
        h2 {
          grid-column: 1 / span 2;
          text-align: center;
          margin-bottom: 0.3rem;
          font-size: 1.5rem;
        }
        p {
          text-align: left;
        }

        .report-value {
          text-align: right;
        }
        .report-total {
          margin-top: 1rem;

        }
      }
    }

    .btn-main-start {
      width: auto;
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
      }
    }

    p {
      max-width: 700px;
      text-align: center;
      font-size: 1rem;

      &.timer {
        font-size: 2.7rem;
        color: rgb(var(--v-theme-secondary));
        margin-bottom: 2em;
        padding: 0.7em 1em;
        border-radius: 0.5em;

        &.timer-inpause {
          color: rgb(var(--v-theme-primary));
        }
      }
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
    border-radius: 0.5em;
    position: absolute;
    top: 1rem;
    right: 2rem;
    transition: background-color 0.1s ease-in-out;
    height: 4rem;
    overflow: hidden;
    font-family: 'Press Start 2P', Arial, Helvetica, sans-serif;

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
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 1500;

  .btn-edit {
    align-self: flex-end;
    margin: 1rem
  }

  .pull-up-panel {
    width: 100vw;
    border-radius: 1em 1em 0 0;
    display: flex;
    flex-direction: column;

    .handle {
      align-self: center;
      margin: 0.8rem 0.8rem 0 0.8rem;
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

    .pomodoro-bar {
      transition: padding 0.1s ease-in-out;
      display: flex;
      align-items: end;
      justify-content: space-between;
      padding: 0.5rem 1rem 1.5rem;

      .pomo-flex {
        height: 2rem;
        margin: 0.5rem 0;
      }

      .pomo-flex, .pomo-box {
        transition: height 0.1s ease-in-out, margin 0.1s ease-in-out;
      }
      .bottom-button-wrapper {
        width: 10rem;
        margin: 0 0.5rem;

        .time-bottom-button-wrapper {
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
  height: 4rem;
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
