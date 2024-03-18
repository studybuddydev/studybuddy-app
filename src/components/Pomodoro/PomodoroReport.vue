<script lang="ts" setup>
import type { PomoReport } from '@/types';
import { usePomodoroStore } from "@/stores/pomodoro";
import * as reportUtils from '@/utils/report';

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
      <p class="report-value report-total">{{ reportUtils.parsePoints(report.points) }}%</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.report {
  padding: 0.8rem 1.5rem 1rem;

  .grid-container {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.2rem 1.2rem;
    p {
      text-align: left;
      @media (max-width: 600px) {
        font-size: 0.7em;
      }
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