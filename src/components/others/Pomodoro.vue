<template>
  <v-footer app class="bg-black pa-0">
    <div class="progress" :style="{
        background: `linear-gradient(to right, ${barColor} ${percentage}%, black ${percentage}%)`,
      }">
      <div class="pomodori">
        <v-icon class="icon" v-for="i in cProgress.pomodoriDone" :key="i" color="#FFD700">mdi-food-apple</v-icon>
        <v-icon class="icon" v-for="i in cProgress.studyDone" :key="i" color="red" size="x-small">mdi-food-apple</v-icon>
      </div>

      <v-sheet
        class="controls-popup d-flex"
        :height="controlHeight"
        :width="controlWidth"
        :color="controlColor">
        <div class="controls">
          <v-btn
            class="control-btn btn-play-pause" color="secondary" :icon="showBreakCommands ? 'mdi-skip-next' : 'mdi-stop'"
            v-if="cProgress.paused || showBreakCommands" @click="showBreakCommands ? nextState() : stop()" size="x-small"></v-btn>
          <v-btn
            class="control-btn btn-play-pause"
            :class="controlsMax ? '' : (cProgress.status === EPomodoroStatus.Study ? 'pause-btn' : 'coffee-btn')"
            :color="inBreak ? 'brown' : 'secondary'"
            :icon="mainControlIcon"
            @click="toggle()"
            ></v-btn>
          <v-btn
            class="control-btn btn-play-pause" color="secondary" icon="mdi-cog"
            v-if="cProgress.paused || showBreakCommands" @click="settingsOpen = true" size="x-small"></v-btn>
        </div>
        <div v-if="nextStateAvailable">
          <p class="text-center">{{ pomodoroDone !== null ? (pomodoroDone ? $t('pomodoro') : $t('pomo')) : $t('work') }}</p>
        </div>
      </v-sheet>

      <p class="mx-3 timer">{{ timerText }}</p>
    </div>

    <v-dialog v-model="settingsOpen" width="500">
      <v-card v-on:keyup.enter="saveSettings()">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="closeSettings()"> <v-icon>mdi-close</v-icon> </v-btn>
          <v-toolbar-title>{{ $t('popup.settings.title') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items> <v-btn variant="text" @click="saveSettings()" > {{ $t('save') }} </v-btn> </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12"> <v-text-field v-model="tempSettings.studyLength" type="number" :label="$t('pomo.studyLenght')" required></v-text-field> </v-col>
              <v-col cols="12"> <v-text-field v-model="tempSettings.shortBreakLength" type="number" :label="$t('pomo.shortBreakLenght')" required></v-text-field> </v-col>
              <v-col cols="12"> <v-text-field v-model="tempSettings.longBreakLength" type="number" :label="$t('pomo.longBreakLenght')" required></v-text-field> </v-col>
              <v-col cols="12"> <v-text-field v-model="tempSettings.nrStudy" type="number" :label="$t('pomo.longBreakAfter')" required></v-text-field> </v-col>
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
import { useSettingsStore } from "@/stores/settings";
import { EPomodoroStatus } from '@/types';
import { useTheme } from 'vuetify'
import type { PomodotoStatus } from '@/types';
const state = useStateStore();
const settingsStore = useSettingsStore();
const theme = useTheme();


enum ESound {
  PomoDone = 'pomo.wav',
  PomodoroDone = 'pomodoro.wav',
  BreakDone = 'break.wav',
}

// ---------- SETTINGS ------------
const settings = ref(settingsStore.settingsWithDefaults.pomodoro!.pomodoroSettings!);
const tempSettings = ref( { ...settings.value } );
const settingsOpen = ref(false);

function saveSettings() {
  tempSettings.value.studyLength = +tempSettings.value.studyLength;
  tempSettings.value.longBreakLength = +tempSettings.value.longBreakLength;
  tempSettings.value.shortBreakLength = +tempSettings.value.shortBreakLength;
  tempSettings.value.nrStudy = +tempSettings.value.nrStudy;
  settings.value = { ...tempSettings.value };
  settingsOpen.value = false;
  settingsStore.updatePomodoroSettings(settings.value);
}

function closeSettings() {
  tempSettings.value = { ...settings.value };
  settingsOpen.value = false;
}

const barColor = computed(() => {
  if (cProgress.value.paused) return theme.current.value.colors.warning;
  return cProgress.value.status === EPomodoroStatus.Study ? theme.current.value.colors.surface : theme.current.value.colors.secondary;
});

// ---------- TIMER ------------
const cProgress = ref<PomodotoStatus>(state.getPomodoroStatus() ?? {
  pomodoroRunning: false,
  msPassed: 0,
  msStarted: 0,
  paused: true,
  status: EPomodoroStatus.Study,
  studyDone: 0,
  pomodoriDone: 0,
});

const REFRESH_RATE = 25;
const currentMs = ref(0);
const timerTime = ref(0);
const percentage = ref(0);
const nextStateAvailable = ref(false);
const showBreakCommands = ref(false);

const controlsMax = computed(() => cProgress.value.paused || nextStateAvailable.value || showBreakCommands.value);
const inBreak = computed(() => !nextStateAvailable.value && !cProgress.value.paused && cProgress.value.status !== EPomodoroStatus.Study);
const pomodoroDone = ref<boolean | null>(null); // true d'oro, false pomo, null none

const controlHeight = computed(() => {
  if (!controlsMax.value) return '0rem';
  if (nextStateAvailable.value) return '6.2rem';
  return '4.5rem';
});
const controlWidth = computed(() => {
  if (cProgress.value.paused) return '12rem';
  return '10rem';
});
const controlColor = computed(() => {
  if (pomodoroDone.value === null) return '';
  if (pomodoroDone.value) '#AA5200'; 
  return 'red';
});
const mainControlIcon = computed(() => {
  if (nextStateAvailable.value) return 'mdi-skip-next';
  if (cProgress.value.paused) return 'mdi-play';
  if (cProgress.value.status === EPomodoroStatus.Study) return 'mdi-pause';
  return 'mdi-coffee';
});

const currentLength = computed(() => {
  const mult = 60;

  switch (cProgress.value.status) {
    case EPomodoroStatus.Study:
      return settings.value.studyLength * mult;
    case EPomodoroStatus.ShortBreak:
      return settings.value.shortBreakLength * mult;
    case EPomodoroStatus.LongBreak:
      return settings.value.longBreakLength * mult;
  }
});
function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
const timerText = computed(() => `${formatTime(Math.floor(timerTime.value / 1000))} / ${formatTime(currentLength.value)}`);

const maxInactiveTime = 1000 * 60 * 60 * 8; // 8 hours
setInterval(() => {


  if (cProgress.value.pomodoroRunning === true && currentMs.value - cProgress.value.msStarted > maxInactiveTime) {
    stop()
    return;
  }

  currentMs.value = new Date().getTime();

  timerTime.value = cProgress.value.msPassed;
  if (!cProgress.value.paused)
    timerTime.value += currentMs.value - cProgress.value.msStarted;

  percentage.value = ((timerTime.value / 1000) / currentLength.value) * 100;
  if (!nextStateAvailable.value) {
    if (timerTime.value / 1000 > currentLength.value) {
      showBreakCommands.value = false;
      nextStateAvailable.value = true;
      if (cProgress.value.status === EPomodoroStatus.Study) {
        if (cProgress.value.studyDone + 1 >= settings.value.nrStudy) {
          // showSnackbar(true);
          pomodoroDone.value = true;
          playSound(ESound.PomodoroDone);
        } else {
          playSound(ESound.PomoDone);
          // showSnackbar(false);
          pomodoroDone.value = false;
        }
      } else {
        playSound(ESound.BreakDone);
      }
    }
  }

}, REFRESH_RATE);

function nextState() {
  showBreakCommands.value = false;
  switch (cProgress.value.status) {
    case EPomodoroStatus.Study:
      cProgress.value.studyDone += 1;
      if (cProgress.value.studyDone >= settings.value.nrStudy) {
        cProgress.value.status = EPomodoroStatus.LongBreak;
        cProgress.value.pomodoriDone += 1;
        cProgress.value.studyDone = 0;
      } else {
        cProgress.value.status = EPomodoroStatus.ShortBreak;
      }
      break;
    case EPomodoroStatus.ShortBreak:
    case EPomodoroStatus.LongBreak:
      cProgress.value.status = EPomodoroStatus.Study;
      break;
  }
  cProgress.value.msPassed = 0;
  cProgress.value.msStarted = new Date().getTime();
  cProgress.value.paused = false;
  nextStateAvailable.value = false;
  pomodoroDone.value = null;
}

function startPomodoro() {
  cProgress.value.msPassed = 0;
  cProgress.value.status = EPomodoroStatus.Study;
  cProgress.value.studyDone = 0;
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
  cProgress.value.studyDone = 0;
  cProgress.value.pomodoriDone = 0;
  cProgress.value.pomodoroRunning = false;
  state.removePomodoroStatus();
}

function toggle() {
  if (inBreak.value) {
    showBreakCommands.value = !showBreakCommands.value;
    return;
  }
  if (!cProgress.value.pomodoroRunning) startPomodoro();
  else if (nextStateAvailable.value)    nextState();
  else if (cProgress.value.paused)      play();
  else                                  pause();
  state.setPomodoroStatus(cProgress.value);
}

function playSound(sound: ESound) {
  const audio = new Audio(`/sounds/${sound}`);
  audio.play();
}

</script>


<style lang="scss">
.controls-popup {
  align-self: end;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease-out;
  border-radius: 1rem 1rem 0 0 !important;

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .control-btn {
      margin: 0.5em;
    }
    
    .pause-btn, .coffee-btn {
      transform: translateY(-3em);
    }
      
    .pause-btn:hover {
      transform: scale(1.2) perspective(1px) translateY(-3.1em);
    }
  }
}

.progress {
  width: 100%;
  display: flex;
  flex-direction: row;
  transition: all 1s ease-in-out;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 1.5rem;

  .icon {
    text-shadow: 0 0 2px #000;
  }

  p {
    padding: 0.2em;
    text-shadow: 0 0 2px #000;
    border-radius: 0.5em;
  }

  .pomodori {
    display: flex;
    align-items: center;;
  }

  .timer {
    text-align: right;
  }
  
  .pomodori, .timer {
    width: 10rem;
  }

}

</style>