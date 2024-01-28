<script setup lang="ts">
import { ref } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import type { PomodoroRecord } from '@/types';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';

const pomodoro = usePomodoroStore();
</script>
<template>
  <div v-for="p in pomodoro.pomodoroRecords">
    <p>Pomodoro del {{ p.datetime }}</p>
    <PomodoroFlex
      class="pomo-flex"
      :percentage="p.percentage ?? 100"
      :displayBreaks="p.displayBreaks ?? []"
      :displayStudy="[]"
    />
  </div>
</template>

<style lang="scss" scoped>
.pomo-flex {
  height: 1rem;
  margin: 0.5rem;
}
</style>
