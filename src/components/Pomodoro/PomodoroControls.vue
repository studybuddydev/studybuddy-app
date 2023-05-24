<template>
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
      icon="mdi-skip-next"
      variant="text" size="small"
      @click="pomodoro.startPomodoro()"
    />
  </div>
</template>

<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
const pomodoro = usePomodoroStore();
</script>

<style lang="scss" scoped>
  .controls {
    border-radius: 0.6rem;
    overflow: hidden;
    margin: 0.4em 0.5em;
    display: flex;
    width: calc(256px - 2em);
    margin: 0.3em 1em;
    align-items: center;

    .status {
      flex-grow: 1;
      padding: 0 1em;
    }

  }
</style>