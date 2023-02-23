<template>
  <div class="progress" :style="{
      background: `linear-gradient(to right, ${ barColor() } ${cProgress.percentage}%, black ${cProgress.percentage}%)`,
    }">
    <p>
      {{ cProgress.status === EStatus.Study ? 'Study' : 'Break' }}
    </p>
  </div>

  <div class="controls px-2 py-3">
    <p class=" mx-3">{{ getTime(cProgress.seconds) }} / {{ getTime(getLength()) }}</p>
    
    <v-btn
      class="btn-play-pause" color="secondary" icon="mdi-cog"
      v-if="cProgress.paused" @click="settingsOpen = true" size="x-small"></v-btn>
    <v-btn
      class="btn-play-pause" color="secondary" icon="mdi-stop"
      v-if="cProgress.paused" @click="stop()" size="x-small"></v-btn>
    <v-btn
      class="btn-play-pause" color="secondary" :icon="cProgress.goToNextStateAvailable ? 'mdi-skip-next' : (cProgress.paused ? 'mdi-play': 'mdi-pause')"
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
</template>

<script setup lang="ts">
import type { PomodoroSettings } from '@/types';
import { ref } from 'vue';
import { useStateStore } from "@/stores/state";
const state = useStateStore();

enum EStatus {
  Study,
  ShortBreak,
  LongBreak,
}

const UPDATE_MS = 20;

const settings = ref(state.getPomodoroSettings());
const tempSettings = ref( { ...settings.value } );
const settingsOpen = ref(false);

const cProgress = ref({
  interval: null as number | null,
  percentage: 0,
  seconds: 0,
  status: EStatus.Study,
  paused: true,
  shortBreaksDone: 0,
  goToNextStateAvailable: false,
});

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

function getTime(time: number): string {
  time = Math.floor(time);
  const minutes = Math.floor(time / 60)//.toString();
  const seconds = (time % 60)//.toString().padStart(2, '0');
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function barColor() {
  if (cProgress.value.paused) return 'blue';
  return cProgress.value.status === EStatus.Study ? 'green' : 'red';
}


function toggle() {
  if (cProgress.value.goToNextStateAvailable) {
    goToNextState();
    return;
  }
  cProgress.value.paused = !cProgress.value.paused;
  if (cProgress.value.interval === null) {
    startPomodoro();
  }
}

function stop() {
  if (cProgress.value.interval !== null) clearInterval(cProgress.value.interval);
  cProgress.value.interval = null;
  cProgress.value.seconds = 0;
  cProgress.value.paused = true;
  cProgress.value.status = EStatus.Study;
  cProgress.value.percentage = 0;
  cProgress.value.goToNextStateAvailable = false;
}

function startPomodoro() {
  cProgress.value.seconds = 0;
  cProgress.value.paused = false;
  cProgress.value.status = EStatus.Study;
  cProgress.value.percentage = 0;

  cProgress.value.interval = setInterval(() => updateProgress(), UPDATE_MS);
}

function getLength() {
  switch (cProgress.value.status) {
    case EStatus.Study:
      return settings.value.studyLength * 60;
    case EStatus.ShortBreak:
      return settings.value.shortBreakLength * 60;
    case EStatus.LongBreak:
      return settings.value.longBreakLength * 60;
  }
}
  
function updateProgress() {
  if (!cProgress.value.paused) {
    cProgress.value.seconds += UPDATE_MS / 1000;
    const lenght = getLength();
    if (cProgress.value.seconds > lenght) {
      cProgress.value.goToNextStateAvailable = true;
    }

    cProgress.value.percentage = (cProgress.value.seconds / lenght) * 100;
  }
}

function goToNextState() {
  cProgress.value.seconds = 0;
  cProgress.value.percentage = 0;
  if (cProgress.value.status === EStatus.ShortBreak || cProgress.value.status === EStatus.LongBreak) {
    cProgress.value.status = EStatus.Study;
  } else if (cProgress.value.status === EStatus.Study) {
    if (cProgress.value.shortBreaksDone >= settings.value.nrShortBreaks) {
      cProgress.value.status = EStatus.LongBreak;
      cProgress.value.shortBreaksDone = 0;
    } else {
      cProgress.value.status = EStatus.ShortBreak;
      cProgress.value.shortBreaksDone += 1;
    }
  }

  cProgress.value.goToNextStateAvailable = false;
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