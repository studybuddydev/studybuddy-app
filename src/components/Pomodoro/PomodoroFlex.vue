<template>
  <div :class="`pomodoro ${mainPomo ? 'pomodoro-main' : ''}`">
    <div class="progress-bar">
      <div :class="`progress ${pomodoro.countdownRunning ? 'timer-animation' : ''}`" v-if="!dailyPomo" :style="{
        backgroundColor: theme.current.value.colors.snake,
        color: theme.current.value.colors.surface,
        width: progressPercentage,
      }"> <v-icon class="mx-1" size="x-small" icon="mdi-circle-double" v-if="mainPomo" /> </div>
      <div v-for="b in displayBreaks" :key="b.index" class="break"
        :style="{
          backgroundColor: getBackgroundColor(),
          marginLeft: `${b.startPerc}%`,
          width: `${b.lengthPerc}%`,
        }"><v-icon v-if="!b.small && mainPomo" size="x-small" icon="mdi-food-apple" class="icon-apple" /></div>

      <div class="time-indicator time-indicator-break" v-for="b in displayBreaks" :key="b.index" v-if="!dailyPomo"
        :style="{ marginLeft: `${b.startPerc + (b.lengthPerc / 2)}%` }"><p>{{b.lengthTime}}</p></div>

      <div class="time-indicator time-indicator-study" v-for="s in displayStudy" :key="s.index" v-if="!dailyPomo"
        :style="{ marginLeft: `${s.startPerc + (s.lengthPerc / 2)}%` }"><p>{{s.lengthTime}}</p></div>

      <div v-for="t in ticks" :key="t.h" class="hour-idicator" :style="{ marginLeft: `${t.position}%` }" v-if="dailyPomo"></div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { DisplaySession } from '@/types';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useSettingsStore } from '@/stores/settings';
import { computed } from 'vue';
const pomodoro = usePomodoroStore();
const settings = useSettingsStore();

const theme = useTheme();
const props = withDefaults(defineProps<{
  percentage: number,
  displayBreaks: DisplaySession[],
  displayStudy: DisplaySession[],
  dailyPomo?: boolean
  mainPomo?: boolean
}>(), {
  percentage: 0,
  displayBreaks: () => [],
  displayStudy: () => [],
  dailyPomo: false,
  mainPomo: false
});

const ticks = computed(() => {
  const ticks: { position: number, h: number }[] = [];

  const end = settings.generalSettings.dayStartEndHours[1];
  const start = settings.generalSettings.dayStartEndHours[0];
  const delta = end - start;
  for (let i = 1; i < (delta); i++) {
    ticks.push({
      position: (i / delta) * 100,
      h: start + i
    });
  }
  return ticks;
});



function getBackgroundColor() {
  if (props.dailyPomo) return theme.current.value.colors.snake;
  return theme.current.value.colors.apple ?? theme.current.value.colors.error;
}

const snakeHeadPercent = 3;
const ratioProgressLeft = (100 - snakeHeadPercent) / 100;
const progressPercentage = computed(() => {
  return `${snakeHeadPercent + (pomodoro.countdownRunning ? 0 : props.percentage * ratioProgressLeft)}%`;
});

</script>


<style lang="scss" scoped>


.pomodoro {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 1rem;
  margin: 0.5em 0;
  height: 100%;
  background-color: #2222220A;
  // background-color: rgba(var(--v-theme-surface));
  filter: drop-shadow(0 0 0em #000);
  flex-grow: 1;

  &.pomodoro-main {
    background-color: #222222;
  }
  .progress-bar {
    display: flex;
    align-items: center;
    width: 100%;
    flex-grow: 1;
    position: relative;

    .time-indicator {
      height: 100%;
      align-items: center;
      justify-content: center;
      display: none;
      position: absolute;
      left: 0;
      bottom: 0;
      transform: translateX(-50%);
      overflow: hidden;
      color: rgba(var(--v-theme-on-success));
      font-style: italic;
      p {
        padding: 2px;
      }
    }

    &:hover {
      .icon-apple {
        display: none;
      }
      .time-indicator {
        display: flex;
      }
    }

    .hour-idicator {
      position: absolute;
      bottom: 0;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 1px;
      background-color: rgba(var(--v-theme-primary), 0.15);
    }

    .break,
    .progress {
      height: 100%;
      border-radius: 1em;
      display: flex;
      justify-content: end;
      align-items: center;
      transition: width 0.1s linear;
      overflow: hidden;

      &.timer-animation {
        transition: width 3s linear;
      }
    }

    .break {
      position: absolute;
      opacity: 0.7;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: margin 0.1s linear, width 0.1s linear;
    }

    .progress {
      text-align: right;
    }
  }

}
</style>