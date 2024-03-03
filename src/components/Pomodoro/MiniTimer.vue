<template>
  <div class="blur mini">
    <div class="clock">
      <div class="progress-bar" v-if="!pomodoro.countdownRunning" :style="{
        background: `conic-gradient(
        ${getCircleColor()} 0deg,
              ${getCircleColor()} ${pomodoro.percInCurrentState * 360}deg,
              transparent ${(pomodoro.percInCurrentState * 360) + 0.2}deg,
        transparent 360deg)`
      }">
        <v-btn icon="mdi-noicon" class="btn-toggle" @click="pomodoro.togglePauseStudy()">
          <v-icon class="btn-icon" :icon="pomodoro.studing ? 'mdi-pause' : 'mdi-play'" />
        </v-btn>
      </div>
    </div>
    <div class="info info-study" v-if="pomodoro.studing">
      <p class="study-time font-press" v-html="pomodoro.timeInCurrentStudy"></p>
    </div>
    <div class="info font-press info-pause" v-else-if="pomodoro.pauseing">
      <p><span class="text-primary">{{ $t("pause.break") }}</span></p>
      <p> <span v-html="pomodoro.timeInCurrentBreak"></span></p>
    </div>
    <div class="pomodoro-bar">
      <PomodoroFlex
        class="pomo-flex"
        :percentage="pomodoro.created ? 100 : pomodoro.percentage"
        :displayBreaks="pomodoro.displayBreaks"
        :displayStudy="pomodoro.displayStudy"
        :main-pomo="true"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
import { useTheme } from 'vuetify'
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';

const pomodoro = usePomodoroStore();
const theme = useTheme();

function getCircleColor() {
  if (pomodoro.studing) {
    return theme.current.value.colors.primary
  }
  if (pomodoro.onLongPause) {
    return '#000000'
  }
  return theme.current.value.colors.warning
}

</script>

<style lang="scss">
.mini {
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: 1fr 2em;
  width: 100%;
  height: 100%;
  min-width: 50vw;
  min-height: 30vh;
  align-content: center;
}

.pomodoro-bar {
  grid-column-start: 1;
  grid-column-end: span 2;
}

.clock {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: auto;
  max-height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  display: grid;
  place-items: center;

  .btn-toggle {
    width: 61.8% !important;
    height: 61.8% !important;

    .btn-icon {
      font-size: 13vw;
    }
  }
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .study-time {
    font-size: 7vw;
  }

  &.info-pause p {
    font-size: 7vw;
  }
}

@mixin small  {
  .mini {
    grid-template-columns: 1fr 2fr;
    grid-template-rows: 1fr;
  }
  
  .pomodoro-bar {
    display: none;
  }
}


@media screen and (max-width: 600px) {
  @include small;
}
@media screen and (max-height: 250px) {
  @include small;
}

@media screen and (max-height: 500px) {
}


@media screen and (orientation: portrait) and (max-width: 400px) {
  .mini {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 2fr;
  }

  .btn-icon {
    font-size: 30vw;
  }

  .info {
    grid-row: 1;

    .study-time {
      font-size: 11vw;
    }

    &.info-pause p {
      font-size: 11vw;
    }
  }
}

@media screen and (orientation: portrait) and (max-width: 400px) and (max-height: 350px) {
  .progress-bar {
    height: 100px;
    width: 100px;
  }
  .btn-icon {
    font-size: 20vw;
  }
}
</style>
