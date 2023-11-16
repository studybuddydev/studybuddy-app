<template>
  <div transition="fade-transition">
    <v-scroll-x-transition>
      <div class="pause-screen" v-if="pause">

        <div class="top-left title" v-if="!firstStart">
          <img src="/images/logo.png" alt="logo" />
          <h3 class="text-primary">StudyBuddy
            <span class="bg-primary pa-1">BETA</span>
          </h3>
        </div>

        <div class="user-box" v-if="!isLoading" >
            <p v-if="isAuthenticated" class="logged-user" @click="openSettingsTab = 'general'">
              <span>{{ user?.given_name }}</span>
              <span><v-avatar :image="user?.picture" /></span>
            </p>
            <p class="login-button" v-else @click="loginWithRedirect()">Log In</p>
        </div>

        <div v-if="firstStart">
          <p class="text-primary">{{ $t("pause.welcome") }}</p>
          <div class="title">
            <img src="/images/logo.png" alt="logo" />
            <h2 class="text-primary">StudyBuddy</h2>
          </div>
        </div>
        <div v-else-if="pomodoro.getReport.reportDone">
          <p class="text-primary">{{ $t("pause.pomoDone") }}</p>
          <h3 class="text-primary">{{ $t("pause.goodjob") }}</h3>
        </div>
        <div v-else>
          <p class="text-primary">{{ $t("pause.youare") }}</p>
          <h2 class="text-primary">{{ $t("pause.break") }}</h2>
        </div>

        <ul>
          <!-- <li @click="startPomodoro()" v-if="!pomodoroGoing">{{$t("pause.study")}}</li>
          <li @click="resumePomodoro()" v-if="pomodoroGoing">{{$t("pause.resume")}}</li> -->
          <li @click="close()"> <pomodoro-controls /></li>

          <li @click="endSession()" v-if="pomodoroGoing">{{ $t("pause.endSession") }}</li>
          <v-divider class="my-5" :thickness="2"></v-divider>
          <!-- <li @click="openTutorial()" v-if="!state.isInTutorial">Tutorial</li> -->
          <!--  <li @click="closeTutorial()" v-else>Exit Tutorial</li> -->
          <li v-if="!isLoading" @click="openSettingsTab = pomodoro.going ? 'general' : 'pomodoro'">
            <v-icon icon="mdi-cog" size="large" /> Settings
          </li>
        </ul>

        <div class="report" v-if="pomodoro.getReport.reportDone">
          <p>{{ $t("pause.youdid") }} <br />
            {{ msTominutes(pomodoro.getReport.studyLength) }}{{ $t("pause.studyMin") }} <br />
            {{ msTominutes(pomodoro.getReport.breakLength) }} {{ $t("pause.pauseMin") }}
          </p>
        </div>
      </div>
    </v-scroll-x-transition>
  </div>

  <PomoSettings class="settings" v-model="openSettingsTab"/>
</template>

<script lang="ts" setup>
import PomoSettings from '@/components/Popup/PomoSettings.vue';
import { ref, watch, computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useStateStore } from "@/stores/state";
import PomodoroControls from '@/components/Pomodoro/PomodoroControls.vue';
import { useAuth0 } from "@auth0/auth0-vue";

import router from '@/router';
const pomodoro = usePomodoroStore();
const state = useStateStore();
const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();

const openSettingsTab = ref<string | boolean>(false);

const pauseFromPomodoro = computed(() => (pomodoro.status.isBreak && !!pomodoro.status.interval) || pomodoro.itsStopped);
const pomodoroGoing = computed(() => pomodoro.going);
const pause = ref(!pomodoroGoing.value);
const firstStart = ref(!pomodoroGoing.value);

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

function msTominutes(ms: number): string {
  const minutes = Math.floor(ms / 1000 / 60);
  const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.settings {
  z-index: 2001;
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

  .login-button  {
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

.title img {
  width: 7rem;
}


span {
  border-radius: 0.5rem;
}

.pause-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1500;

  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(50px);

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  font-family: 'Press Start 2P', cursive;

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
  }

  p {
    max-width: 700px;
    text-align: center;
    font-size: 1rem;
  }

  ul,
  .report {
    color: rgb(var(--v-theme-secondary));
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

  .title img {
    width: 5rem;
  }

  .pause-screen h2 {
    font-size: 15vw;
  }

}


.user-box:after {
  content:'';
  top:0;
  transform:translateX(100%);
  width:100%;
  height:4rem;
  position: absolute;
  z-index:1;
  animation: slide 1.2s;
  /* 
  CSS Gradient - complete browser support from http://www.colorzilla.com/gradient-editor/ 
  */
  background: -moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(128,186,232,0) 99%, rgba(125,185,232,0) 100%); /* FF3.6+ */
  background: -webkit-gradient(linear, left top, right top, color-stop(0%,rgba(255,255,255,0)), color-stop(50%,rgba(255,255,255,0.8)), color-stop(99%,rgba(128,186,232,0)), color-stop(100%,rgba(125,185,232,0))); /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(left, rgba(255,255,255,0) 0%,rgba(255,255,255,0.8) 50%,rgba(128,186,232,0) 99%,rgba(125,185,232,0) 100%); /* Chrome10+,Safari5.1+ */
  background: -o-linear-gradient(left, rgba(255,255,255,0) 0%,rgba(255,255,255,0.8) 50%,rgba(128,186,232,0) 99%,rgba(125,185,232,0) 100%); /* Opera 11.10+ */
  background: -ms-linear-gradient(left, rgba(255,255,255,0) 0%,rgba(255,255,255,0.8) 50%,rgba(128,186,232,0) 99%,rgba(125,185,232,0) 100%); /* IE10+ */
  background: linear-gradient(to right, rgba(255,255,255,0) 0%,rgba(255,255,255,0.8) 50%,rgba(128,186,232,0) 99%,rgba(125,185,232,0) 100%); /* W3C */
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ffffff', endColorstr='#007db9e8',GradientType=1 ); /* IE6-9 */
}
@keyframes slide {
	0% {transform:translateX(-100%);}
	50% {transform:translateX(100%);}
	100% {transform:translateX(-100%);}
}
</style>