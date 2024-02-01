<template>
  <div :class="`pomodoro-circle blur ${inPip ? 'pip' : ''}  ${pomodoro.onLongPause ? 'long-pause' : ''} ${!pomodoro.freeMode && (pomodoro.timeToBreak || pomodoro.timeToStudy) && !pomodoro.onLongPause ? 'breathing' : ''}`" ref="el">

    <div class="progress-bar" :style="{
      background: `conic-gradient(
        ${getCircleColor()} 0deg,
        ${getCircleColor()} ${pomodoro.percInCurrentState * 360}deg,
        transparent ${(pomodoro.percInCurrentState * 360) + 0.2}deg,
        transparent 360deg)`
    }"></div>
    <div class="progress-bar-content">
      <div v-if="pomodoro.going">
        <p class="timer timer-inpause font-casio" v-if="pomodoro.studing"
          v-html="pomodoro.timeInCurrentStudy" :style="{ fontSize: `${width / 12}px` }"></p>

        <div v-else-if="pomodoro.pauseing" class="pause-text">
          <p :style="{ fontSize: `${width / 30}px` }" class="font-press pause-p">{{ $t("pause.youare") }}</p>
          <p :style="{ fontSize: `${width / 10}px` }" class="text-primary font-press">{{ $t("pause.break") }}</p>
          <p :style="{ fontSize: `${width / 30}px` }" class="font-press pause-p">{{ $t("pause.for") }}
            <span class="text-primary font-casio" v-html="pomodoro.timeInCurrentBreak"></span>
          </p>
          <Info :text="$t('todo', 'info per il break')" class="info-pause" />
        </div>

      </div>

      <div class="buttons" >
        <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start mt-5' v-if="!pomodoro.studing"
          @click="pomodoro.going ? pomodoro.study() : pomodoro.startPomodoro()" :style="{ height: `${width / 10}px` }">
          <v-icon class="icon" :style="{ fontSize: `${width / 10}px` }" icon="mdi-play" />
        </v-btn>
        <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start mt-5' v-if="inPip && pomodoro.studing"
          @click="pomodoro.togglePauseStudy()" :style="{ height: `${width / 10}px` }">
          <v-icon class="icon" :style="{ fontSize: `${width / 10}px` }" icon="mdi-pause" />
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
import Info from '@/components/common/Info.vue'

const el = ref(null)
const { width } = useElementSize(el)

const pomodoro = usePomodoroStore();
const theme = useTheme();
const props = withDefaults(defineProps<{ inPip: boolean }>(), { inPip: false  });


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
.pomodoro-circle {
  position: relative;
  border-radius: 50%;

  &.long-pause {
    background-color: #000000B0 !important
  }

  .info-pause {
    top: 0;
    right: 0;
  }
  .progress-bar {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
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