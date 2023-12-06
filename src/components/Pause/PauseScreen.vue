<template>
  <div transition="fade-transition">
    <v-scroll-x-transition>
      <div class="pause-screen" v-if="!pro">

        <div class="top-left title">
          <img src="/images/logo.png" alt="logo" class="logo" />
          <h3 class="text-primary">StudyBuddy
            <span class="bg-primary pa-1">BETA</span>
          </h3>
        </div>


        <!-- login button and eye  -->
        <div class="user-box" v-if="pomodoro.status.isBreak || first">
          <p v-if="isAuthenticated" class="logged-user" @click="openSettingsTab = 'general'">
            <span>{{ user?.given_name ?? user?.nickname }}</span>
            <span><v-avatar :image="user?.picture" /></span>
          </p>
          <p class="login-button" v-else @click="loginWithRedirect()">Log In</p>
        </div>
        <div v-else>
          <v-btn class="user-box" @click="enterPro()"> <v-icon size="32">mdi-eye</v-icon> </v-btn>
        </div>

        <!-- 
        <p class="text-primary"> ciao abbiamo trasferito l'app per i tester a  <a href="https://test.studybuddy.it"> test.studybuddy.it</a> questa è la versione di sviluppo, potrebbe spaccarsi da un momento all'altro</p>
        <br>
        -->

        <!--  -->
        <div class="pause-box">
          <p :class="pomodoro.status.isBreak ? 'timer' : 'timer timer-inpause'" v-if="!pomodoro.status.isBreak">{{ getTimerValue(pomodoro.status.isBreak) }}</p>

          <div v-if="first && pomodoro.status.isBreak">
            <p class="text-primary">{{ $t("pause.welcome") }}</p>
            <div class="title">
              <img src="/images/logo.png" alt="logo" class='logo' />
              <h2 class="text-primary">StudyBuddy</h2>
            </div>
          </div>
          <div v-else-if="pomodoro.status.isBreak">
            <p class="text-primary pause">{{ pomodoro.getReport.reportDone ? $t("pause.pomoDone") : $t("pause.youare") }}</p>
            <h2 class="text-primary">{{ pomodoro.getReport.reportDone ? $t("pause.goodjob") : $t("pause.break") }}</h2>
            <p class="text-primary pausetime">{{ "da "+ getTimerValue(true)  }}</p>
          </div>

          <div class="pomopause" v-if="pomodoro.status.isBreak">
            <v-btn  class = 'settingsbtn' @click="openSettingsTab = 'timer'"  v-if="first || pomodoro.getReport.reportDone">
              <v-icon size="32">mdi-cog</v-icon>
            </v-btn>
            <pomodoro-controls /> 
            </div>
          <h3 class="text-primary" @click="endSession()" v-if="pomodoroGoing && pomodoro.status.isBreak">{{ $t("pause.endSession") }}</h3>
        </div>
        <!--if mobile add controls -->
         <!--  <div v-if="windowWidth < 600"> <PomodoroControls /> </div> -->
        <!--
        <ul>
         <li @click="startPomodoro()" v-if="!pomodoroGoing">{{$t("pause.study")}}</li>
          <li @click="resumePomodoro()" v-if="pomodoroGoing">{{$t("pause.resume")}}</li> 
          <li @click="close()"> <pomodoro-controls /></li>

          <li @click="endSession()" v-if="pomodoroGoing">{{ $t("pause.endSession") }}</li>-->
          <v-divider class="my-5" :thickness="2"></v-divider>
          <!-- <li @click="openTutorial()" v-if="!state.isInTutorial">Tutorial</li> -->
          <!--  <li @click="closeTutorial()" v-else>Exit Tutorial</li> -->
          <!--
          <li v-if="!isLoading && pomodoro.status.isBreak" @click="openSettingsTab = pomodoro.going ? 'general' : 'pomodoro'">
            <v-icon icon="mdi-cog" size="large" /> {{$t("pause.settings")}}
          </li>
        </ul> -->

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

        <div class="controls" v-if="!pomodoro.status.isBreak && !first"> <pomodoro-controls /></div>

      </div>
    </v-scroll-x-transition>
  </div>

  <PomoSettings class="settings" v-model="openSettingsTab" />
</template>

<script lang="ts" setup>
import PomoSettings from '@/components/Popup/PomoSettings.vue';
import { ref, watch, computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useStateStore } from "@/stores/state";
import PomodoroControls from '@/components/Pomodoro/PomodoroControls.vue';
import { useAuth0 } from "@auth0/auth0-vue";

import router from '@/router';
import { EPomodoroBreakStatus } from '@/types';
const pomodoro = usePomodoroStore();
const state = useStateStore();
const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();

const openSettingsTab = ref<string | boolean>(false);

const pauseFromPomodoro = computed(() => (pomodoro.status.isBreak && !!pomodoro.status.interval) || pomodoro.itsStopped);
const pomodoroGoing = computed(() => pomodoro.going);
const pause = ref(!pomodoroGoing.value);
const firstStart = ref(!pomodoroGoing.value);

const pro = computed(() => pomodoro.pro);
const first = computed(() => pomodoro.first);
const windowWidth = ref(window.innerWidth);
const isLargeScreen = computed(() => windowWidth.value > 600);

watch(pauseFromPomodoro, (value) => {
  pause.value = value;
});

document.addEventListener('keyup', function (evt) {
  if (evt.key === 'Escape') {
    if (pomodoro.going) {
      pomodoro.nextStep();
      pause.value = pauseFromPomodoro.value;
    } else {
      pause.value = !pause.value;
    }
    firstStart.value = false;
  }
});

function close() {
  pause.value = false;
  firstStart.value = false;
}

function resumePomodoro() {
  if (pomodoro.going && pauseFromPomodoro.value) {
    pomodoro.nextStep();


  }
  close();
}

function restartPomodoro() {
  pomodoro.stopPomodoro();
  pomodoro.startPomodoro();
  close();
}

function startPomodoro() {
  pomodoro.startPomodoro();
  close();
  console.log(firstStart);
}
function openTutorial() {
  state.startTutorial();
  pomodoro.startPomodoro();
  router.push('/');
  close();
}
function closeTutorial() {
  state.closeTutorial();
  pomodoro.stopPomodoro();
  pomodoro.startPomodoro();
  router.push('/');
  close();
}
function endSession() {
  pomodoro.stopPomodoro();
}

function enterPro() {
  pomodoro.pro = true;
}

function msTominutes(ms: number): string {
  const minutes = Math.floor(ms / 1000 / 60);
  const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
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
    current = pomodoro.status.breaks.findLast(e => e.status == EPomodoroBreakStatus.DONE)?.start ?? 0;
  } else {
    const lastDone = pomodoro.status.breaks.findLast(e => e.status == EPomodoroBreakStatus.DONE);
    current = lastDone ? lastDone.start + lastDone.lenght : 0;
  }
  return getMinutesFromPercentage(pomodoro.percentage - current)
}

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.pause{
  text-align: left !important;
}

.pausetime{
  text-align: right !important;
  font-size: 1.5em !important;
  
}
.grid-container {
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
}

.settingsbtn {

  color: rgb(var(--v-theme-secondary));
  background: #2A2A2A;
  // height as parent

}

.settings {
  z-index: 2001;
}

.controls {
  //bottom left 
  position: absolute;
  bottom: 0rem;
  left: 1rem;
  z-index: 2000;
}

.endsession {
  position: absolute;
  bottom: 4rem;
  right: 2rem;

  color: rgb(var(--v-theme-primary));
}

.pomopause {
  //center 
  display: flex;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
}


.logo {
  height: 4rem;
}

.top-left {
  display: flex;
  align-items: center;
  position: absolute;
  top: 1rem;
  left: 1rem;
}


.user-box {
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

.title {
  display: flex;
  align-items: center;
  font-family: 'Roboto', sans-serif;
  flex-direction: row;
}

span {
  border-radius: 0.5rem;
}

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
  backdrop-filter: blur(90px);

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  font-family: 'Press Start 2P', cursive;

  .pause-box {

    h2 {
      text-align: center;
      font-size: 5rem;
      max-width: 700px;
      font-weight: 900;
    }

    h3 {
      text-align: center;
      font-size: 1.5rem;
      max-width: 700px;
      margin-top: 0.5em;
    }

    p {
      max-width: 700px;
      text-align: center;
      font-size: 1rem;

      &.timer {
        font-size: 2.7rem;
        font-family: casio, Arial, Helvetica, sans-serif;
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


  ul,
  .report {
    color: rgb(var(--v-theme-secondary));
    background: #2A2A2A;

  }

  ul {
    list-style: none;
    margin-top: 2rem;
    font-size: 1.5rem;

    li {
      margin: 0.5rem 0;
      text-align: center;
      cursor: pointer;
      padding: 0.5rem 4rem;
      justify-content: center;
      align-items: center;
      display: flex;

      // text-shadow: -1px -1px 0 rgb(var(--v-theme-primary)), 1px -1px 0 rgb(var(--v-theme-primary)), -1px 1px 0 rgb(var(--v-theme-primary)), 1px 1px 0 rgb(var(--v-theme-primary));
      &:hover {
        color: rgb(var(--v-theme-primary));
      }

      span {
        padding: 0 1rem;
      }
    }
  }

  .report {
    border: 1px solid rgb(var(--v-theme-primary));
    padding: 2rem;
    margin-top: 2rem;
    border-radius: 1rem;
  }
}

@media screen and (max-width: 600px) {
  .title {
    flex-direction: column;
    /* stacked */
  }

  .top-left {
    top: 0.5rem;
    flex-direction: row;
    //center 
  }

  .pause-screen h2 {
    font-size: 15vw;
  }

}


.user-box:after {
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