<template>
  <div class="pomodoro">

    <div class="controls bg-secondary">
      <div class="status">{{pomoStatus.status}}</div>

      <v-btn v-if="pomoStatus.interval !== null && pomoStatus.isBreak"
        icon="mdi-stop"
        variant="text" size="x-small"
        @click="stopPomodoro()"
      />
      <v-btn v-if="pomoStatus.interval !== null"
        :icon="pomoStatus.isBreak ? 'mdi-play' : 'mdi-pause'"
        variant="text" size="small"
        @click="nextStep()"
      />
      <v-btn v-if="pomoStatus.interval === null"
        icon="mdi-cog"
        variant="text" size="x-small"
        @click="settingsOpen = true"
      />
      <v-btn v-if="pomoStatus.interval === null"
        icon="mdi-skip-next"
        variant="text" size="small"
        @click="startPomodoro()"
      />
    </div>

    <div class="progress-bar">

      <div class="blocks-container">
        <div class="progress" :style="{
          backgroundColor: theme.current.value.colors.secondary,
          color: theme.current.value.colors.surface,
          width: `${percentage}%`,
        }"> ⦿ </div>
        <div v-for="b in pomoStatus.breaks"
          :title="getMinutesFromPercentage(b.lenght)"
          :key="b.start"
          class="break"
          :style="{
            backgroundColor: theme.current.value.colors.error,
            marginLeft: `${b.start}%`,
            width: `${b.lenght}%`,
        }"><v-icon size="x-small" icon="mdi-food-apple" /></div>
        <p class="text-primary progress-text">	{{getMinutesFromPercentage(percentage)}} </p>
      </div>

    </div>
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
            <v-col cols="12"> <v-text-field v-model="tempSettings.totalLength" type="time" label="Pomodoro length" required step="300" min="0" /> </v-col>
            <v-col cols="12"> <v-text-field v-model="tempSettings.numberOfBreak" type="number" label="Number of breaks" required min="0" /> </v-col>
            <v-col cols="12"> <v-text-field v-model="tempSettings.breakLength" type="number" label="Break length [minutes]" required min="0" /> </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify'
import { useStateStore } from "@/stores/state";
import { type PomodoroFlexSettings, type PomodoroFlexStatus, type PomodoroBreak, EPomodoroBreakStatus } from '@/types';
import { watch } from 'vue';
const state = useStateStore();
const theme = useTheme();

const MINUTE_MULTIPLIER = 0.2;

interface FlexSettingsTemp extends Omit<PomodoroFlexSettings, 'totalLength'> {
  totalLength: string
}

enum ESound {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}





const settings = ref<PomodoroFlexSettings>(state.getPomodoroFlexSettings() ?? {
  totalLength: 120,
  numberOfBreak: 3,
  breakLength: 5,
});
const breakLengthPercentage = computed(() => (settings.value.breakLength * MINUTE_MULTIPLIER) / (settings.value.totalLength * MINUTE_MULTIPLIER) * 100);

function getMinutesFromPercentage(n: number) {
  const min = n * settings.value.totalLength / 100;
  const sec = Math.round(min * MINUTE_MULTIPLIER);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec / 60) % 60).toString().padStart(h > 0 ? 2 : 1, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${h > 0 ? h + ':' : ''}${m}:${s}`;
}

const pomoStatus = ref<PomodoroFlexStatus>(
  state.getPomodoroFlexStatus() ?? {
    isBreak: false,
    status: 'Inizia!',
    breaks: generateBreaks(),
    startMs: Date.now(),
    interval: null,
});
const percentage = ref<number>(0);

if (pomoStatus.value.interval !== null) {
  startInterval();
} else {
  pomoStatus.value.breaks = generateBreaks();
}

function saveStatus() {
  state.setPomodoroFlexStatus(pomoStatus.value);
}

function stopPomodoro() {
  if (pomoStatus.value.interval !== null) {
    clearInterval(pomoStatus.value.interval);
    pomoStatus.value.interval = null;
  }

  pomoStatus.value.status = 'Reinizia!';
  saveStatus();
}

function startPomodoro() {
  pomoStatus.value.isBreak = false;
  pomoStatus.value.status = 'STUDIA!';
  pomoStatus.value.breaks = generateBreaks();
  percentage.value = 0;
  pomoStatus.value.startMs = Date.now();

  saveStatus();
  pomoStatus.value.interval = startInterval();
}

function startInterval() {
  if (pomoStatus.value.interval !== null)
    clearInterval(pomoStatus.value.interval);

  return setInterval(() => {
    const now = Date.now();
    percentage.value = (now - pomoStatus.value.startMs) / (settings.value.totalLength * MINUTE_MULTIPLIER *  10);
    if (percentage.value > 100) {
      percentage.value = 100;
      if (pomoStatus.value.interval !== null) {
        clearInterval(pomoStatus.value.interval);
        pomoStatus.value.interval = null;
        playSound(ESound.PomodoroDone);
      }
    }
    updateBreaks();
  }, 16);
}

let pauseStartHit = false;
let pauseEndHIt = false;

function updateBreaks() {

  let capoTreno = percentage.value;

  for (let i = 0; i < pomoStatus.value.breaks.length; i++) {
    const b = pomoStatus.value.breaks[i];
    if (b.status === EPomodoroBreakStatus.DOING) {

      const itHasBeingGoingFor = percentage.value - b.start;
      if (b.lenght < itHasBeingGoingFor) {
        b.lenght = itHasBeingGoingFor;
        if (!pauseEndHIt) {
          playSound(ESound.BreakDone);
          pauseEndHIt = true;
        }
        saveStatus();
      } else {
        capoTreno = b.start + b.lenght;
      }

    } else if (b.status === EPomodoroBreakStatus.TODO) {

      if (b.start < capoTreno) {
        const prev = pomoStatus.value.breaks[i - 1];
        if (prev && prev.status !== EPomodoroBreakStatus.DONE) {
          // JOIN
          prev.lenght = b.start - prev.start + b.lenght;
          pomoStatus.value.breaks.splice(i, 1);
          i--;
          saveStatus();
        } else {
          b.start = capoTreno;
          capoTreno = b.start + b.lenght;

          if (!pauseStartHit) {
            playSound(ESound.BreakStart);
            pauseStartHit = true;
            saveStatus();
          }
        }
      }
    }
  }
}

function generateBreaks(): PomodoroBreak[] {
  const totalBreakTime = breakLengthPercentage.value * settings.value.numberOfBreak;
  const leftTime = 100 - totalBreakTime;
  
  const studyTime = leftTime / (settings.value.numberOfBreak + 1);

  return new Array(settings.value.numberOfBreak).fill(0).map((_, i) => ({
    start: studyTime * (i + 1) + (breakLengthPercentage.value * i),
    lenght: breakLengthPercentage.value,
    status: EPomodoroBreakStatus.TODO
  }));
}

function nextStep() {
  pauseStartHit = false;
  pauseEndHIt = false;

  for (const b of pomoStatus.value.breaks) {
    if (b.status === EPomodoroBreakStatus.DOING) {
      b.lenght = percentage.value - b.start;
      b.status = EPomodoroBreakStatus.DONE;
      pomoStatus.value.isBreak = false;
      pomoStatus.value.status = 'STUDIA!';
      saveStatus();
      return;
    }

    if (b.status === EPomodoroBreakStatus.TODO) {
      b.start = percentage.value;
      b.status = EPomodoroBreakStatus.DOING;

      pomoStatus.value.isBreak = true;
      pomoStatus.value.status = 'Relax';
      saveStatus();
      return;
    }
  }

  // add a new pause if none found
  pomoStatus.value.breaks.push({
    start: percentage.value,
    lenght: 0,
    status: EPomodoroBreakStatus.DOING
  });
  pomoStatus.value.isBreak = true;
  pomoStatus.value.status = 'Relax';
  saveStatus();

}

function playSound(sound: ESound) {
  const audio = new Audio(`/sounds/${sound}`);
  audio.play();
}

// SETTINGS
function parseSettings(settings: PomodoroFlexSettings): FlexSettingsTemp {
  return {
    ...settings,
    totalLength: `${Math.floor(settings.totalLength / 60).toString().padStart(2, '0')}:${(settings.totalLength % 60).toString().padStart(2, '0')}`
  };
}
const tempSettings = ref<FlexSettingsTemp>( parseSettings(settings.value) );
const settingsOpen = ref(false);

function saveSettings() {
  console.log(tempSettings.value)
  const hm = tempSettings.value.totalLength.split(':').map(x => +x);
  settings.value = { 
    breakLength: +tempSettings.value.breakLength,
    numberOfBreak: +tempSettings.value.numberOfBreak,
    totalLength: hm[0] * 60 + hm[1]
  };
  settingsOpen.value = false;
  state.setPomodoroFlexSettings(settings.value);
}

function closeSettings() {
  tempSettings.value = parseSettings(settings.value);
  settingsOpen.value = false;
}


</script>


<style lang="scss" scoped>
$bar-height: 1.2em;

.pomodoro {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  display: flex;
  width: 100%;
  align-items: center;

  .controls, .progress-bar {
    border-radius: calc($bar-height / 2);
    overflow: hidden;
    margin: 0.4em 0.5em;
  }

  .controls {
    display: flex;
    width: calc(256px - 2em);
    margin: 0.3em 1em;
    align-items: center;

    .status {
      flex-grow: 1;
      padding: 0 1em;
    }

  }
  
  .progress-bar {
    height: $bar-height;
    background-color: #222;
    filter: drop-shadow(0 0 0.2em #000);
    flex-grow: 1;

    .blocks-container {
      display: flex;
      align-items: center;

      .breaks-container {
        display: flex;
        justify-content: space-between;
      }


      .break, .progress {
        height: $bar-height;
        border-radius: 0.6em;
        line-height: 1em;
      }

      .break {
        position: absolute;
        opacity: 0.7;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .progress {
        text-align: right;
        line-height: $bar-height;
      }


      .progress-text {
        opacity: 0;
        position: absolute;
        right: 0;
        line-height: $bar-height;
        padding: 0 0.5em;
        transition: 0.15s opacity ease-in-out;
      }
      &:hover {
        .progress-text {
          opacity: 1;
        }
      }
    }

  }
}
</style>