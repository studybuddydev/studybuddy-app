<template>
  <v-footer app class="bg-black pa-0">
    <div class="progress" :style="{
        background: `linear-gradient(to right, ${ barColor } ${percentage}%, black ${percentage}%)`,
      }">
      <p>
        {{ cProgress.status === EPomodoroStatus.Study ? 'Study' : 'Break' }}
      </p>
    </div>

    <div class="controls px-2 py-3">
      <p class=" mx-3">{{ timerText }}</p>
      
      <v-btn
        class="btn-play-pause" color="secondary" icon="mdi-cog"
        v-if="cProgress.paused" @click="settingsOpen = true" size="x-small"></v-btn>
      <v-btn
        class="btn-play-pause" color="secondary" icon="mdi-stop"
        v-if="cProgress.paused" @click="stop()" size="x-small"></v-btn>
      <v-btn
        class="btn-play-pause" color="secondary" :icon="nextStateAvailable ? 'mdi-skip-next' : (cProgress.paused ? 'mdi-play': 'mdi-pause')"
        @click="toggle()"></v-btn>
    </div>

    <v-dialog v-model="settingsOpen" width="500">
      <v-card>
          <v-toolbar dark color="primary">
            <v-btn icon dark @click="closeSettings()"> <v-icon>mdi-close</v-icon> </v-btn>
            <v-toolbar-title>Settings</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items> <v-btn variant="text" @click="saveSettings()" > Save </v-btn> </v-toolbar-items>
          </v-toolbar>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12"> <v-text-field v-model="tempSettings.studyLength" type="number" label="Pomodoro Lenght in minutes" required></v-text-field> </v-col>
                <v-col cols="12"> <v-text-field v-model="tempSettings.shortBreakLength" type="number" label="Short Break Lenght in minutes" required></v-text-field> </v-col>
                <v-col cols="12"> <v-text-field v-model="tempSettings.longBreakLength" type="number" label="Long Break Lenght in minutes" required></v-text-field> </v-col>
                <v-col cols="12"> <v-text-field v-model="tempSettings.nrShortBreaks" type="number" label="Long Break After" required></v-text-field> </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
    </v-dialog>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStateStore } from "@/stores/state";
import { EPomodoroStatus } from '@/types';
import type { CurrentPomodoro } from '@/types';
const state = useStateStore();

// ---------- SETTINGS ------------
const settings = ref(state.getPomodoroSettings());
const tempSettings = ref( { ...settings.value } );
const settingsOpen = ref(false);

function saveSettings() {
  tempSettings.value.studyLength = +tempSettings.value.studyLength;
  tempSettings.value.longBreakLength = +tempSettings.value.longBreakLength;
  tempSettings.value.shortBreakLength = +tempSettings.value.shortBreakLength;
  tempSettings.value.nrShortBreaks = +tempSettings.value.nrShortBreaks;
  settings.value = { ...tempSettings.value };
  settingsOpen.value = false;
  state.setPomodoroSettings(settings.value);
}

function closeSettings() {
  tempSettings.value = { ...settings.value };
  settingsOpen.value = false;
}

const barColor = computed(() => {
  if (cProgress.value.paused) return 'blue';
  return cProgress.value.status === EPomodoroStatus.Study ? 'green' : 'red';
});

// ---------- TIMER ------------
const cProgress = ref<CurrentPomodoro>(state.getCurrentPomodoro() ?? {
  pomodoroRunning: false,
  msPassed: 0,
  msStarted: 0,
  paused: true,
  status: EPomodoroStatus.Study,
  shortBreaksDone: 0,
});

const currentMs = ref(0);
setInterval(() => {
  currentMs.value = new Date().getTime();
}, 25);


const timerTime = computed(() => {
  if (cProgress.value.paused)
    return cProgress.value.msPassed;
  return (currentMs.value - cProgress.value.msStarted) + cProgress.value.msPassed
});
const currentLength = computed(() => {
  switch (cProgress.value.status) {
    case EPomodoroStatus.Study:
      return settings.value.studyLength * 60;
    case EPomodoroStatus.ShortBreak:
      return settings.value.shortBreakLength * 60;
    case EPomodoroStatus.LongBreak:
      return settings.value.longBreakLength * 60;
  }
});
const percentage = computed(() => {
  return Math.floor(((timerTime.value / 1000) / currentLength.value) * 100);
});
const nextStateAvailable = computed(() => timerTime.value / 1000 > currentLength.value);

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
const timerText = computed(() => `${formatTime(Math.floor(timerTime.value / 1000))} / ${formatTime(currentLength.value)}`);




function nextState() {
  if (cProgress.value.status === EPomodoroStatus.ShortBreak || cProgress.value.status === EPomodoroStatus.LongBreak) {
    cProgress.value.status = EPomodoroStatus.Study;
  } else if (cProgress.value.status === EPomodoroStatus.Study) {
    if (cProgress.value.shortBreaksDone >= settings.value.nrShortBreaks) {
      cProgress.value.status = EPomodoroStatus.LongBreak;
      cProgress.value.shortBreaksDone = 0;
    } else {
      cProgress.value.status = EPomodoroStatus.ShortBreak;
      cProgress.value.shortBreaksDone += 1;
    }
  }

  cProgress.value.msPassed = 0;
  cProgress.value.msStarted = new Date().getTime();
  cProgress.value.paused = false;
}

function startPomodoro() {
  cProgress.value.msPassed = 0;
  cProgress.value.status = EPomodoroStatus.Study;
  cProgress.value.shortBreaksDone = 0;
  play();
  cProgress.value.pomodoroRunning = true;
}

function play() {
  cProgress.value.msStarted = new Date().getTime();
  cProgress.value.paused = false;
}

function pause() {
  cProgress.value.msPassed += new Date().getTime() - cProgress.value.msStarted;
  cProgress.value.paused = true;
}

function stop() {
  cProgress.value.msPassed = 0;
  cProgress.value.msStarted = 0;
  cProgress.value.paused = true;
  cProgress.value.status = EPomodoroStatus.Study;
  cProgress.value.shortBreaksDone = 0;
  cProgress.value.pomodoroRunning = false;
  state.removeCurrentPomodoro();
}

function toggle() {
  if (!cProgress.value.pomodoroRunning) startPomodoro();
  else if (nextStateAvailable.value)    nextState();
  else if (cProgress.value.paused)      play();
  else                                  pause();
  state.setCurrentPomodoro(cProgress.value);
}

</script>


<style lang="scss">
.progress {
  width: 100%;
  display: flex;
  flex-direction: row;
  transition: all 1s ease-in-out;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 1.5rem;
}

.controls {
  background-color: black;
  border-radius: 1em 0 0 0;
  position: fixed;
  bottom: 1.5rem;
  right: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: center;

  .btn-play-pause {
    margin-right: 0.5em;

  }
}
</style>