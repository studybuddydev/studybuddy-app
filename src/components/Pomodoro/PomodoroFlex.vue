<template>
  <div class="pomodoro">
    <div class="progress-bar">
      <div class="progress" :style="{
        backgroundColor: theme.current.value.colors.secondary,
        color: theme.current.value.colors.surface,
        width: `${pomodoro.percentage}%`,
      }"> ⦿ </div>
      <div v-for="b in pomodoro.status.breaks" :title="getMinutesFromPercentage(b.lenght)" :key="b.start" class="break"
        :style="{
          backgroundColor: theme.current.value.colors.error,
          marginLeft: `${b.start}%`,
          width: `${b.lenght}%`,
        }"><v-icon size="x-small" icon="mdi-food-apple" /></div>
      <p class="text-primary progress-text"> {{ getMinutesFromPercentage(pomodoro.percentage) }} </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { usePomodoroStore } from "@/stores/pomodoro";
const pomodoro = usePomodoroStore();
const theme = useTheme();

function getMinutesFromPercentage(n: number) {
  const min = n * pomodoro.totalLength / 100;
  const sec = Math.round(min * pomodoro.MINUTE_MULTIPLIER);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec / 60) % 60).toString().padStart(h > 0 ? 2 : 1, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${h > 0 ? h + ':' : ''}${m}:${s}`;
}

</script>


<style lang="scss" scoped>
$bar-height: 1.2em;

.pomodoro {
  z-index: 2000;
  display: flex;
  align-items: center;
  border-radius: calc($bar-height / 2);
  overflow: hidden;
  margin: 0.4em 0.5em;
  height: $bar-height;
  background-color: #222;
  filter: drop-shadow(0 0 0.2em #000);
  flex-grow: 1;


  .progress-bar {
    display: flex;
    align-items: center;
    width: 100%;

    .breaks-container {
      display: flex;
      justify-content: space-between;
    }


    .break,
    .progress {
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
</style>