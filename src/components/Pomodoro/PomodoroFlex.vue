<template>
  <div class="pomodoro">
    <div class="progress-bar">
      <div class="progress" :style="{
        backgroundColor: theme.current.value.colors.snake,
        color: theme.current.value.colors.surface,
        width: `${pomodoro.percentage}%`,
      }"> <v-icon class="mx-1" size="x-small" icon="mdi-circle-double" /> </div>
      <div v-for="b in pomodoro.displayBreaks" :key="b.index" class="break"
        :style="{
          backgroundColor: b.done ? theme.current.value.colors.warning : (theme.current.value.colors.apple ?? theme.current.value.colors.error),
          marginLeft: `${b.startPerc}%`,
          width: `${b.lengthPerc}%`,
        }"><v-icon size="x-small" icon="mdi-food-apple" class="icon-apple" /></div>

      <div class="time-indicator time-indicator-break" v-for="b in pomodoro.displayBreaks" :key="b.index"
        :style="{ marginLeft: `${b.startPerc + (b.lengthPerc / 2)}%` }"><p>{{b.lengthTime}} </p></div>

      <div class="time-indicator time-indicator-study" v-for="s in pomodoro.displayStudy" :key="s.index"
        :style="{ marginLeft: `${s.startPerc + (s.lengthPerc / 2)}%` }"><p>{{s.lengthTime}}</p></div>

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


.pomodoro {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 1rem;
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
    }

    &:hover {
      .icon-apple {
        display: none;
      }
      .time-indicator {
        display: flex;
      }
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