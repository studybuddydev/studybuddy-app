<template>
  <div :class="inPip ? 'pomodoro-circle blur pip' : 'pomodoro-circle blur'" ref="el">

    <div class="progress-bar" :style="{
      background: `conic-gradient(
        ${pomodoro.studing ? theme.current.value.colors.primary : theme.current.value.colors.warning} 0deg,
        ${pomodoro.studing ? theme.current.value.colors.primary : theme.current.value.colors.warning} ${pomodoro.percInCurrentState * 360}deg,
        transparent ${(pomodoro.percInCurrentState * 360) + 0.2}deg,
        transparent 360deg)`
    }"></div>
    <div class="progress-bar-content">
      <div v-if="pomodoro.going">
        <p class="timer timer-inpause font-casio" v-if="pomodoro.studing"
          v-html="pomodoro.timeInCurrentStudy" :style="{ fontSize: `${width / 12}px` }"></p>

        <div v-else-if="pomodoro.pauseing" class="pause-text">
          <p :style="{ fontSize: `${width / 20}px` }" class="font-press pause-p">{{ $t("pause.youare") }}</p>
          <p :style="{ fontSize: `${width / 15}px` }" class="text-primary font-press">{{ $t("pause.break") }}</p>
          <p :style="{ fontSize: `${width / 20}px` }" class="font-press pause-p">{{ $t("pause.for") }} <span class="text-primary font-casio" v-html="pomodoro.timeInCurrentBreak"></span></p>
        </div>
      </div>

      <div class="buttons" >
        <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start mt-5' v-if="!pomodoro.studing"
          @click="pomodoro.going ? pomodoro.study() : pomodoro.startPomodoro()" :style="{ height: `${width / 10}px` }">
          <v-icon class="icon" :style="{ fontSize: `${width / 10}px` }" icon="mdi-play" />
        </v-btn>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { usePomodoroStore } from "@/stores/pomodoro";
import { useElementSize } from '@vueuse/core'
import { ref } from 'vue';

const el = ref(null)
const { width } = useElementSize(el)

const pomodoro = usePomodoroStore();
const theme = useTheme();

const props = withDefaults(defineProps<{ inPip: boolean }>(), { inPip: false  });
</script>


<style lang="scss" scoped>


.pomodoro-circle {
  position: relative;
  border-radius: 50%;

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
      // margin-top: 4em;
    }

    .buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;

      .btn {
        height: min(6vh, 8vw);
        font-weight: bold;
      }
    }

    .timer {
      color: rgb(var(--v-theme-secondary));
      padding: 0.7em 1em;
      border-radius: 0.5em;

      &.timer-inpause {
        color: rgb(var(--v-theme-primary));
      }
    }
  }
}

.breathing {
  animation: breathing 2s ease-out infinite normal;
}

@keyframes breathing {
  0% {
    -webkit-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1);
  }

  10% {
    -webkit-transform: scale(1.05);
    -ms-transform: scale(1.05);
    transform: scale(1.05);
  }

  15% {
    -webkit-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1);
  }

  25% {
    -webkit-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1);
  }

  35% {
    -webkit-transform: scale(1.05);
    -ms-transform: scale(1.05);
    transform: scale(1.05);
  }

  40% {
    -webkit-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1);
  }

  100% {
    -webkit-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1);
  }
}

</style>