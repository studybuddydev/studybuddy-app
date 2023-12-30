<template>
  <div class="pomodoro">
    <div class="progress-bar">
      <div class="progress" :style="{
        backgroundColor: theme.current.value.colors.snake,
        color: theme.current.value.colors.surface,
        width: `${pomodoro.percentage}%`,
      }"> <v-icon class="mx-1" size="x-small" icon="mdi-circle-double" /> </div>
      <div v-for="b in pomodoro.displayBreaks" :title="b.lengthTime" :key="b.index" class="break"
        :style="{
          backgroundColor: b.done ? theme.current.value.colors.warning : theme.current.value.colors.apple,
          marginLeft: `${b.startPerc}%`,
          width: `${b.lengthPerc}%`,
        }"><v-icon size="x-small" icon="mdi-food-apple" /></div>
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
$bar-height: 2em;

.pomodoro {
  display: flex;
  flex-direction: column;
  align-items: center;
  // border-radius: calc($bar-height / 2);
  border-radius: 1rem;
  overflow: hidden;
  margin: 0.5em 0;
  height: 100%;
  background-color: #222;
  filter: drop-shadow(0 0 0em #000);
  flex-grow: 1;


  .progress-bar {
    display: flex;
    align-items: center;
    width: 100%;
    flex-grow: 1;
    position: relative;

    .breaks-container {
      display: flex;
      justify-content: space-between;
    }


    .break,
    .progress {
      height: 100%;
      border-radius: 1em;
      display: flex;
      justify-content: end;
      align-items: center;
      transition: width 0.1s linear;
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