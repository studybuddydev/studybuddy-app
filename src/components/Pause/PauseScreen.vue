<template>
  <div transition="fade-transition">
    <v-scroll-x-transition>
      <div class="pause-screen" v-if="pause">
        <div v-if="firstStart">
          <p class="text-primary">Welcome to</p>
          <h2 class="text-primary">StudyBuddy</h2>
        </div>
        <div v-else-if="pomodoro.getReport.reportDone">
          <p class="text-primary">You finished a pomodoro</p>
          <h2 class="text-primary">GOOD JOB</h2>
        </div>
        <div v-else>
          <p class="text-primary">You are taking a</p>
          <h2 class="text-primary">BREAK</h2>
        </div>

        <ul>
          <li @click="startPomodoro()" v-if="!pomodoroGoing">Study</li>
          <li @click="resumePomodoro()" v-if="pomodoroGoing">Resume</li>
          <li @click="restartPomodoro()" v-if="pomodoroGoing">Restart</li>
          <li @click="endSession()" v-if="pomodoroGoing">End Session</li>
          <v-divider class="my-5" :thickness="2"></v-divider>
          <li @click="openTutorial()" v-if="!state.isInTutorial">Tutorial</li>
          <li @click="closeTutorial()" v-else>Exit Tutorial</li>
          <li @click="openUserSettings = true">Settings</li>
        </ul>

        <div class="report" v-if="pomodoro.getReport.reportDone">
          <p>Hai fatto <br />
            {{ msTominutes(pomodoro.getReport.studyLength) }} minuti di studio <br />
            {{ msTominutes(pomodoro.getReport.breakLength) }} minuti di pause
          </p>
        </div>
      </div>
    </v-scroll-x-transition>
  </div>

  <UserSettings class="settings" v-model="openUserSettings" />

</template>

<script lang="ts" setup>
import UserSettings from '@/components/Popup/UserSettings.vue';
import { ref, watch, computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useStateStore } from "@/stores/state";
import router from '@/router';
const pomodoro = usePomodoroStore();
const state = useStateStore();

const openUserSettings = ref(false);

const pauseFromPomodoro = computed(() => (pomodoro.status.isBreak && !!pomodoro.status.interval) || pomodoro.itsStopped);
const pomodoroGoing = computed(() => pomodoro.going);
const pause = ref(!pomodoroGoing.value);
const firstStart = ref(!pomodoroGoing.value);
console.log(pomodoroGoing.value)
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
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.settings {
  z-index: 2001;
}

.pause-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1500;

  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(30px);

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Press Start 2P', cursive;

  h2 {
    text-align: center;
    font-size: 5rem;
    max-width: 700px;
  }
  
  p {
    max-width: 700px;
    text-align: center;
    font-size: 1rem;
  }

  ul, .report {
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

      // text-shadow: -1px -1px 0 rgb(var(--v-theme-primary)), 1px -1px 0 rgb(var(--v-theme-primary)), -1px 1px 0 rgb(var(--v-theme-primary)), 1px 1px 0 rgb(var(--v-theme-primary));


      &:hover {
        color: rgb(var(--v-theme-primary));
        text-decoration: underline;
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
</style>