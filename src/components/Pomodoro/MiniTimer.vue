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
          <svg-icon type="mdi" class="btn-icon" :path="pomodoro.studing ? mdiPause : mdiPause"></svg-icon>
        </v-btn>
      </div>
    </div>
    <div class="info info-study" v-if="pomodoro.studing">
      <p class="study-time font-casio" v-html="pomodoro.timeInCurrentStudy"></p>
    </div>
    <div class="info info-pause" v-else-if="pomodoro.pauseing">
      <p class="font-press text-primary">{{ $t("pause.break") }}</p>
      <p class="font-casio"> <span v-html="pomodoro.timeInCurrentBreak"></span></p>
    </div>
    <div class="pomodoro-bar">
      <PomodoroFlex class="pomo-flex" :percentage="pomodoro.created ? 100 : pomodoro.percentage"
        :displayBreaks="pomodoro.displayBreaks" :displayStudy="pomodoro.displayStudy" :main-pomo="true" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
import { useTheme } from 'vuetify'
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPause, mdiPlay } from '@mdi/js'

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

<style lang="scss" scoped>
.mini {
  display: grid;
  grid-template-columns: 1fr 50vw;
  grid-template-rows: 1fr 4rem;
  width: 100%;
  height: 100%;
  align-content: center;
}

.pomodoro-bar {
  grid-column-start: 1;
  grid-column-end: span 2;
  margin: 1rem;
}

.clock {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  height: 100%;

  @media screen and (max-height: 150px) {
    padding: 0.1rem;
  }
}

.progress-bar {
  height: min(100%, 33vw);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  display: grid;
  place-items: center;

  .btn-toggle {
    width: 61.8% !important;
    height: 61.8% !important;

    ::v-deep(.v-btn__content) {
      width: 100%;
      height: 100%;
    }

    .btn-icon {
      width: 66%;
      height: 100%;
    }
  }
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .study-time {
    font-size: min(10vw, 28vh);
  }

  &.info-pause p {
    font-size: min(8vw, 23vh);
  }
}

@mixin small {
  .mini {
    grid-template-columns: 1fr 50vw;
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


@media screen and (orientation: portrait) and (max-width: 400px) {
  .mini {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 2fr;
  }

  .progress-bar {
    height: min(calc(100vw - 2rem), 66vh);
  }

  .info {
    grid-row: 1;
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
