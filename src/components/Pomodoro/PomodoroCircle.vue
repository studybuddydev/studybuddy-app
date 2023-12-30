<template>
  <div class="pomodoro-circle">

    <div class="progress-bar" :style="{
      background: `conic-gradient(
        ${pomodoro.studing ? theme.current.value.colors.primary : theme.current.value.colors.warning} 0deg,
        ${pomodoro.studing ? theme.current.value.colors.primary : theme.current.value.colors.warning} ${pomodoro.percInCurrentState * 360}deg,
        transparent ${(pomodoro.percInCurrentState * 360) + 0.2}deg,
        transparent 360deg)`
    }"></div>
    <div class="progress-bar-content">
      <div v-if="pomodoro.going">
        <p class="timer timer-inpause font-casio" v-if="pomodoro.studing">{{ pomodoro.timeInCurrentStudy }}</p>

        <div v-else-if="pomodoro.pauseing" class="pause-text">
          <p class="font-press pause-p">{{ $t("pause.youare") }}</p>
          <h1 class="text-primary font-press">{{ $t("pause.break") }}</h1>
          <p class="font-press pause-p">da <span class="text-primary font-casio">{{ pomodoro.timeInCurrentBreak
          }}</span></p>
        </div>
      </div>

      <div class="buttons">
        <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start mt-5' v-if="!pomodoro.studing"
          @click="pomodoro.going ? pomodoro.study() : pomodoro.startPomodoro()">
          <v-icon class="icon">mdi-play</v-icon>
        </v-btn>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { usePomodoroStore } from "@/stores/pomodoro";
const pomodoro = usePomodoroStore();
const theme = useTheme();

</script>


<style lang="scss" scoped>
.pomodoro-circle {
  position: relative;

  .progress-bar {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    // background: conic-gradient(transparent 0deg,
    //     orange 2deg,
    //     orange 90deg,
    //     transparent 90deg,
    //     transparent 360deg);
    // clip-path: circle(46% at center);
    -webkit-mask-image: radial-gradient(transparent 54%, black 54.3%);
    mask-image: radial-gradient(transparent 54%, black 54.3%);
  }

  .progress-bar-content {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .pause-text {
      margin-top: 4em;
    }

    .pause-p {
      font-size: min(2.5vh, 4vw);
    }

    h1 {
      font-size: min(5vh, 8vw);
    }

    .buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;

      .btn {
        font-size: min(2vh, 3vw);
        height: min(6vh, 8vw);
        font-weight: bold;
        font-size: min(4vh, 5vw);
      }
    }

    .timer {
      font-size: min(5vh, 7vw);
      color: rgb(var(--v-theme-secondary));
      padding: 0.7em 1em;
      border-radius: 0.5em;

      &.timer-inpause {
        color: rgb(var(--v-theme-primary));
      }
    }
  }
}
</style>