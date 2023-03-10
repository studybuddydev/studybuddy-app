<template>
  <v-footer app class="bg-black pa-0">
    <div class="progress" :style="{
        background: `linear-gradient(to right, ${ barColor } ${percentage}%, black ${percentage}%)`,
      }">
      <div class="pomodori">
        <v-icon class="icon" v-for="i in cProgress.pomodoriDone" :key="i" color="#FFD700">mdi-food-apple</v-icon>
        <v-icon class="icon" v-for="i in cProgress.studyDone" :key="i" color="red" size="x-small">mdi-food-apple</v-icon>
      </div>
      <p>
        {{ cProgress.status === EPomodoroStatus.Study ? 'Study' : (cProgress.status === EPomodoroStatus.ShortBreak ? 'Break' : 'Long Break') }}
      </p>
      <p class="mx-3">{{ timerText }}</p>
    </div>

    <div class="controls px-5 py-3">

      
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

    <v-snackbar v-model="snackbar.show" vertical elevation="24" color="secondary" :timeout="60000">
      <div class="text-h6 pb-2 d-flex align-center">
        <v-icon :color="snackbar.pomodoro ? '#FFD700' : 'red'">mdi-food-apple</v-icon>
        {{ snackbar.title }}
      </div>
      <p class="text-subtitle-1" v-for="t in snackbar.text" >{{ t }}</p>
      <template v-slot:actions>
        <v-btn variant="flat" @click="snackbar.show = false"> Ok </v-btn>
      </template>
    </v-snackbar>

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
              <v-col cols="12"> <v-text-field v-model="tempSettings.nrStudy" type="number" label="Long Break After" required></v-text-field> </v-col>
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
import { useTheme } from 'vuetify'
import type { CurrentPomodoro } from '@/types';
const state = useStateStore();
const theme = useTheme();


enum ESound {
  PomoDone = 'pomo.wav',
  PomodoroDone = 'pomodoro.wav',
  BreakDone = 'break.wav',
}

// ---------- SETTINGS ------------
const settings = ref(state.getPomodoroSettings());
const tempSettings = ref( { ...settings.value } );
const settingsOpen = ref(false);
const snackbar = ref({
  show: false,
  title: '',
  text: [''],
  pomodoro: false
});

function saveSettings() {
  tempSettings.value.studyLength = +tempSettings.value.studyLength;
  tempSettings.value.longBreakLength = +tempSettings.value.longBreakLength;
  tempSettings.value.shortBreakLength = +tempSettings.value.shortBreakLength;
  tempSettings.value.nrStudy = +tempSettings.value.nrStudy;
  settings.value = { ...tempSettings.value };
  settingsOpen.value = false;
  state.setPomodoroSettings(settings.value);
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
const cProgress = ref<CurrentPomodoro>(state.getCurrentPomodoro() ?? {
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


setInterval(() => {

  currentMs.value = new Date().getTime();

  timerTime.value = cProgress.value.msPassed;
  if (!cProgress.value.paused)
    timerTime.value += currentMs.value - cProgress.value.msStarted;

  percentage.value = ((timerTime.value / 1000) / currentLength.value) * 100;
  if (!nextStateAvailable.value) {
    if (timerTime.value / 1000 > currentLength.value) {
      nextStateAvailable.value = true;
      if (cProgress.value.status === EPomodoroStatus.Study) {
        if (cProgress.value.studyDone + 1 >= settings.value.nrStudy) {
          showSnackbar(true);
          playSound(ESound.PomodoroDone);
        } else {
          playSound(ESound.PomoDone);
          showSnackbar(false);
        }
      } else {
        playSound(ESound.BreakDone);
      }
    }
  }

}, REFRESH_RATE);

function nextState() {
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
  state.removeCurrentPomodoro();
}

function toggle() {
  if (!cProgress.value.pomodoroRunning) startPomodoro();
  else if (nextStateAvailable.value)    nextState();
  else if (cProgress.value.paused)      play();
  else                                  pause();
  state.setCurrentPomodoro(cProgress.value);
}

function showSnackbar(pomodore = false) {
  snackbar.value.show = true;
  if (pomodore) {
    snackbar.value.title = 'Pomo d\'oro!';
    snackbar.value.text = ['Hai completato un pomo d\'oro.', 'Goditi la meritata pausa!'];
    snackbar.value.pomodoro = true;
  } else {
    snackbar.value.title = 'Pomo!'
    snackbar.value.text = ['Hai completato un pomo.', 'Ora di andare a fare una passegiata!'];
    snackbar.value.pomodoro = false;
  }

}

function playSound(sound: ESound) {
  const audio = new Audio(`/sounds/${sound}`);
  audio.play();
}

</script>


<style lang="scss">
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
    margin-right: 0.3em;
    margin-left: 0.3em;

  }
}
</style>