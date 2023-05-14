<template>
  <div transition="fade-transition">
    <v-scroll-x-transition>
      <div class="pause-screen" v-if="pause">
        <p class="text-primary">You are taking a</p>
        <h2 class="text-primary">BREAK</h2>

        <ul>
          <li @click="resumePomodoro()">Resume</li>
          <li>Settings</li>
        </ul>
      </div>
    </v-scroll-x-transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
const pomodoro = usePomodoroStore();

const pause = ref(false);
const pauseFromPomodoro = computed(() => pomodoro.status.isBreak && !!pomodoro.status.interval);

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
  }
});

function resumePomodoro() {
  if (pomodoro.going && pauseFromPomodoro.value) {
    pomodoro.nextStep();
  }
  pause.value = false;
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.pause-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5000;

  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(30px);

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Press Start 2P', cursive;

  h2 {
    font-size: 7rem;
  }

  p {
    font-size: 1rem;
  }

  ul {
    list-style: none;
    margin-top: 2rem;
    font-size: 1.5rem;

    li {
      margin: 0.5rem 0;
      text-align: center;
      cursor: pointer;
      padding: 0.5rem;


      &:hover {
        color: rgb(var(--v-theme-primary));
        text-decoration: underline;
      }
    }
  }
}
</style>