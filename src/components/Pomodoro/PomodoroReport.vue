<script lang="ts" setup>
import type { PomoReport } from '@/types';
import { usePomodoroStore } from "@/stores/pomodoro";

const pomodoro = usePomodoroStore();
const props = defineProps<{
  report: PomoReport,
}>();
</script>

<template>
  <div class="report font-press" v-if="report">
    <div class="grid-container">
      <p>{{ $t("pause.studyTime") }}</p>
      <p class="report-value">{{ pomodoro.parseTime(report.timeStudy) }}</p>
      <p>{{ $t("pause.pauseTime") }}</p>
      <p class="report-value">{{ pomodoro.parseTime(report.timeBreak) }}</p>
      <p>{{ $t("pause.totalTime") }}</p>
      <p class="report-value">{{ pomodoro.parseTime(report.timeTotal) }}</p>
      <p>{{ $t("pause.pauseNumber") }}</p>
      <p class="report-value">{{ report.nrBreaks }}</p>
      <p class="report-total">{{ $t("pause.score") }}</p>
      <p class="report-value report-total">{{ pomodoro.parsePoints(report.points) }}%</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.report {
  background: rgb(var(--v-theme-background));
  border: 1px solid rgb(var(--v-theme-primary));
  padding: 0.8rem 1.5rem 1rem;
  margin-top: 0 ;
  border-radius: 1rem;

  .grid-container {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.2rem 1.2rem;
    h2 {
      grid-column: 1 / span 2;
      text-align: center;
      margin-bottom: 0.3rem;
      font-size: 1.5rem;
    }
    p {
      text-align: left;
    }

    .report-value {
      text-align: right;
    }
    .report-total {
      margin-top: 1rem;

    }
  }
}
</style>