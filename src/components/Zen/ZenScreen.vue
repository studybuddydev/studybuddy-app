
<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useStateStore } from "@/stores/state";
import { useAuth0 } from "@auth0/auth0-vue";
import { EPomodoroBreakStatus } from '@/types';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomodoroController from '@/components/Pomodoro/PomodoroController.vue';
const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();
const pomodoro = usePomodoroStore();
const state = useStateStore();

const pauseFromPomodoro = computed(() => (pomodoro.status.isBreak && !!pomodoro.status.interval) || pomodoro.itsStopped);
const pomodoroGoing = computed(() => pomodoro.going);
const pause = ref(!pomodoroGoing.value);
const firstStart = ref(!pomodoroGoing.value);
const first = computed(() => pomodoro.first);

const showTime = ref(true);

watch(pauseFromPomodoro, (value) => {
  pause.value = value;
});

function endSession() {
  pomodoro.stopPomodoro();
}

function getMinutesFromPercentage(n: number) {
  const min = n * pomodoro.settings.totalLength / 100;
  const sec = Math.round(min * pomodoro.MINUTE_MULTIPLIER);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec / 60) % 60).toString().padStart(h > 0 ? 2 : 1, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${h > 0 ? h + ':' : ''}${m}:${s}`;
}

function getTimerValue(getPause: boolean = false) {
  let current = 0;
  if (getPause) {
    current = pomodoro.status.breaks.find(e => e.status == EPomodoroBreakStatus.DOING)?.start ?? 0;
  } else {
    const lastDone = pomodoro.status.breaks.findLast(e => e.status == EPomodoroBreakStatus.DONE);
    current = lastDone ? lastDone.start + lastDone.lenght : 0;
  }
  return getMinutesFromPercentage(pomodoro.percentage - current)
}

function hideNumbers() {
  showTime.value = !showTime.value;
}



</script>

<template>
  <div transition="fade-transition">
    <v-scroll-x-transition>
      <div class="pause-screen">
        
        <!-- top left  -->
        <div class="top-left title" v-if="!first || !pomodoro.status.isBreak">
          <img src="/images/logo.png" alt="logo" class="logo" />
          <h3 class="text-primary">StudyBuddy
            <span class="bg-primary beta">BETA</span>
          </h3>
        </div>

        <!-- top right -->
        <div class="top-right">
          <p v-if="isAuthenticated" class="logged-user">
            <span>{{ user?.given_name ?? user?.nickname }}</span>
            <span><v-avatar :image="user?.picture" /></span>
          </p>
          <p class="login-button" v-else @click="loginWithRedirect()">Log In</p>
        </div>

        <!-- main content in the center-->
        <div class="main-content">
          <div v-if="!showTime"> 
            <p :class="pomodoro.status.isBreak ? 'timer font-casio' : 'timer timer-inpause font-casio'" v-if="!pomodoro.status.isBreak">{{ getTimerValue(pomodoro.status.isBreak) }}</p>
          </div>
          <div v-else>
            <p>buono studio</p>
          </div>
          <!-- welcome screen -->
          <div v-if="first && pomodoro.status.isBreak">
            <p class="text-primary font-press">{{ $t("pause.welcome") }}</p>
            <div class="title">
              <img src="/images/logo.png" alt="logo" class='logo' />
              <h1 class="text-primary">StudyBuddy</h1>
            </div>
          </div>
          <!-- pause and finish screen -->
          <div v-else-if="pomodoro.status.isBreak" class="mb-5">
            <p class="pause font-press text-center" v-if="pomodoro.getReport.reportDone">{{ $t("pause.pomoDone") }}</p>
            <p class="pause font-press text-left" v-else>{{ $t("pause.youare") }}</p>
            <h2 class="text-primary font-press text-center" v-if="pomodoro.getReport.reportDone">{{ $t("pause.goodjob") }}</h2>
            <h1 class="text-primary font-press text-center" v-else>{{ $t("pause.break") }}</h1>
            <p class="pausetime font-press text-right">da <span class="text-primary font-casio">{{ getTimerValue(true) }}</span></p>
          </div>
          <div class="pomopause" v-if="pomodoro.status.isBreak">
            <v-btn class="btn bg-background btn-main btn-settings"  v-if="first || pomodoro.getReport.reportDone">
              <v-icon size="32">mdi-cog</v-icon>
            </v-btn>
            <PomodoroController class="btn-main btn-study font-press" />
          </div>
          
          <!-- report table-->
          <div class="report" v-if="pomodoro.getReport.reportDone">
            <div class="grid-container">
              <div>{{ "tempo totale" }}</div>
              <div>{{ msTominutes(pomodoro.getReport.studyLength) }}</div>
              <div>{{"di cui studio" }}</div>
              <div>{{ msTominutes(pomodoro.getReport.studyLength - pomodoro.getReport.breakLength) }}</div>
              <div>{{"di cui pausa" }}</div>
              <div>{{ msTominutes(pomodoro.getReport.breakLength) }}</div>
              <div>{{ "n pause" }}</div>
              <div>{{ pomodoro.status.breaks.length }}</div>
              <div>{{ }}</div>
              <div>{{  }}</div>
              <div>{{"Punteggio:"}}</div>
            <div>{{ (((pomodoro.getReport.studyLength - pomodoro.getReport.breakLength) / (pomodoro.getReport.studyLength)) * 120).toFixed(1) }}%</div>
          </div>
        </div>

        <!-- pomodoro bar -->
        <div class="pomodoro-bar">
          <div class="bottom-button-wrapper font-press">
            <div v-if="!first || !pomodoro.status.isBreak">
              <PomodoroController class="pomo-box pomo-controller bottom-box" v-if="!pomodoro.getReport.reportDone && (!pomodoroGoing || !pomodoro.status.isBreak)"/>
              <v-btn class="btn bg-error btn-endsession bottom-box" @click="endSession()" v-if="pomodoroGoing && pomodoro.status.isBreak">{{ $t("pause.endSession") }}</v-btn>
            </div>
          </div>

          <PomodoroFlex class="pomo-flex" />
          <div class="bottom-button-wrapper">
            <div   @click="hideNumbers()" class="pomo-box pomo-time bottom-box font-casio" v-if="!pomodoro.getReport.reportDone && (!first || !pomodoro.status.isBreak)" >
              <p :class="{'blur-class': showTime}">{{ getMinutesFromPercentage(pomodoro.percentage) }}</p>
              <v-icon v-if="!showTime" size="32">mdi-eye-off</v-icon>
              <v-icon v-else size="32">mdi-eye</v-icon>
            </div>
          </div>
        </div>

      </div>
    </div>
    </v-scroll-x-transition>
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
@font-face {
  font-family: 'casio';
  src: url('@/assets/fonts/casio-calculator-font.ttf') format('truetype');
}
.pause-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1500;
  background-color: rgb(var(--v-theme-surface));

  .blur-class {
  filter: blur(30px);
  
  
  }
  
  .main-content {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
   // margin-top: -6em;         // check this

    .btn-main {
      height: 3rem;
      margin: 0.5rem;
    }

    .btn-study {
      width: 11rem;
      font-size: 1em;
    }

    h1, h2, h3, p {
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

    .title {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;
      margin-bottom: 1em;

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
        background-color: rgb(var(--v-theme-background));
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

    .logo {
      height: 4rem;
    }

    .beta {
      border-radius: 0.5rem;
      padding: 0.4em;
    }
  }

  .top-right {
    display: flex;
    align-items: center;
    justify-items: center;
    background-color: #FFF2;
    padding: 0.5em;
    border-radius: 0.5em;
    position: absolute;
    top: 1rem;
    right: 2rem;
    transition: background-color 0.2s ease-in-out;
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

  .pomodoro-bar {
    position: absolute;
    display: flex;
    align-items: end;
    justify-content: space-between;
    bottom: 0;
    width: 100vw;
    padding: 1.5em 1em 1em;
    background-color: rgb(var(--v-theme-background));
    border-radius: 1em 1em 0 0;

    .bottom-button-wrapper {
      width: 10rem;
      margin: 0 0.5rem;
    }

    .bottom-box {
      height: 3rem;
      line-height: 3rem;
      width: 100%;
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .pomo-flex {
      flex-grow: 1;
    }

    .pomo-time {
      display: flex;
      background-color: rgb(var(--v-theme-secondary-darken-1));

      p {
        width: 100%;
        text-align: center;
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
}
</style>
