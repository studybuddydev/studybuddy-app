<template>
  <div class="pomodoro">

    <div class="controls bg-secondary">
      <div class="status">{{pomodoro.status.status}}</div>

      <v-btn v-if="pomodoro.status.interval !== null && pomodoro.status.isBreak"
        icon="mdi-stop"
        variant="text" size="x-small"
        @click="pomodoro.stopPomodoro()"
      />
      <v-btn v-if="pomodoro.status.interval !== null"
        :icon="pomodoro.status.isBreak ? 'mdi-play' : 'mdi-pause'"
        variant="text" size="small"
        @click="pomodoro.nextStep()"
      />
      <v-btn v-if="pomodoro.status.interval === null"
        icon="mdi-cog"
        variant="text" size="x-small"
        @click="settingsOpen = true"
      />
      <v-btn v-if="pomodoro.status.interval === null"
        icon="mdi-skip-next"
        variant="text" size="small"
        @click="pomodoro.startPomodoro()"
      />
    </div>

    <div class="progress-bar">

      <div class="blocks-container">
        <div class="progress" :style="{
          backgroundColor: theme.current.value.colors.secondary,
          color: theme.current.value.colors.surface,
          width: `${pomodoro.percentage}%`,
        }"> ⦿ </div>
        <div v-for="b in pomodoro.status.breaks"
          :title="getMinutesFromPercentage(b.lenght)"
          :key="b.start"
          class="break"
          :style="{
            backgroundColor: theme.current.value.colors.error,
            marginLeft: `${b.start}%`,
            width: `${b.lenght}%`,
        }"><v-icon size="x-small" icon="mdi-food-apple" /></div>
        <p class="text-primary progress-text">	{{getMinutesFromPercentage(pomodoro.percentage)}} </p>
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
import { ref } from 'vue';
import { useTheme } from 'vuetify'
import { useStateStore } from "@/stores/state";
import { usePomodoroStore } from "@/stores/pomodoro";
import type { PomodoroFlexSettings } from '@/types';
const state = useStateStore();
const pomodoro = usePomodoroStore();
const theme = useTheme();

function getMinutesFromPercentage(n: number) {
  const min = n * pomodoro.settings.totalLength / 100;
  const sec = Math.round(min * pomodoro.MINUTE_MULTIPLIER);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec / 60) % 60).toString().padStart(h > 0 ? 2 : 1, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${h > 0 ? h + ':' : ''}${m}:${s}`;
}

// SETTINGS
interface FlexSettingsTemp extends Omit<PomodoroFlexSettings, 'totalLength'> {
  totalLength: string
}

function parseSettings(settings: PomodoroFlexSettings): FlexSettingsTemp {
  return {
    ...settings,
    totalLength: `${Math.floor(settings.totalLength / 60).toString().padStart(2, '0')}:${(settings.totalLength % 60).toString().padStart(2, '0')}`
  };
}
const tempSettings = ref<FlexSettingsTemp>( parseSettings(pomodoro.settings) );
const settingsOpen = ref(false);

function saveSettings() {
  console.log(tempSettings.value)
  const hm = tempSettings.value.totalLength.split(':').map(x => +x);
  pomodoro.settings = { 
    breakLength: +tempSettings.value.breakLength,
    numberOfBreak: +tempSettings.value.numberOfBreak,
    totalLength: hm[0] * 60 + hm[1]
  };
  settingsOpen.value = false;
  state.setPomodoroFlexSettings(pomodoro.settings);
}

function closeSettings() {
  tempSettings.value = parseSettings(pomodoro.settings);
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
  z-index: 6000;
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