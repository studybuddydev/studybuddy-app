<script setup lang="ts">
import { computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import type { PomodoroRecord } from '@/types';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomodoroReport from '@/components/Pomodoro/PomodoroReport.vue';
import { ref } from 'vue';

const pomodoro = usePomodoroStore();
const openReportId = ref(-1);

const dailyPomodoriGroups = computed(() => {
  const groups: Record<string, PomodoroRecord[]> = {};
  pomodoro.pomodoroRecords.forEach((pomodoroRecord) => {
    const dateKey = new Date(pomodoroRecord.datetime).toLocaleDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(pomodoroRecord);
  });
  return groups;
});
const longestPomodoro = computed(() =>
  pomodoro.pomodoroRecords.reduce((m, p) => Math.max(p.end, m), 0)
);

function toggleReport(id: number | undefined) {
  if (id !== undefined)
  openReportId.value = openReportId.value === id ? -1 : id;
}

function getPointsColorClass(points: number) {
  if (points < 0.6) {
    return 'points bg-error';
  }
  if (points < 0.85) {
    return 'points bg-warning';
  }
  return 'points bg-success';
}

</script>
<template>
  <div class="pomo-history">
    <div v-for="(value, key) in dailyPomodoriGroups">
      <h3 class="text-center">{{ key }}</h3>
      <div v-for="p in value" :class="`pomo-info ${p.id === openReportId ? 'pomo-info-open' : ''}`">
        <div class="pomo-line" v-ripple @click="toggleReport(p.id)">
          <p class="lenght">{{ pomodoro.timeFormatted((p.endedAt ?? 0) / 1000, false) }}</p>
          <p class="time">{{ p.datetime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) }}</p>
          <div class="pomo-wrapper">
            <div class="pomo-width" :style="{ width: `${(p.end / longestPomodoro) * 100}%` }">
              <PomodoroFlex class="pomo-flex" :percentage="p.percentage ?? 100" :displayBreaks="p.displayBreaks ?? []"
                :displayStudy="[]" />
            </div>
          </div>
          <p :class="getPointsColorClass(p.report?.pointsValue ?? 0)">{{ p.report?.points }}%</p>
        </div>

        <div class="report-wrapper" v-if="p.id === openReportId && p.report">
          <PomodoroReport class="report" :report="p.report" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pomo-flex {
  height: 1rem;
  margin: 0.5rem;
}

.pomo-wrapper {
  width: 100%;

  .pomo-width {
    display: flex;
  }
}

.pomo-history {
  overflow-y: autoz;
}

.pomo-info {
  margin: 0.5rem;
  border-radius: 1em;

  &.pomo-info-open {
    background-color: #FFFFFF10;

    .pomo-line {
      background-color: #FFFFFF10;
    }
  }

  .report-wrapper {
    display: flex;
    justify-content: center;

    .report {
      margin: 1em;
    }
  }

  .pomo-line {
    padding: 0.2rem 0.8rem;
    border-radius: 1em;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.1s ease-in-out, height 0.1s ease-in-out;

    &:hover {
      background-color: #FFFFFF10;
    }


    .lenght {
      width: 3em;
      text-align: right;
    }

    .time {
      width: 5em;
      text-align: right;
    }

    .points {
      width: 3.3em;
      text-align: center;
      border-radius: 0.5em;
      margin-left: 0.4em;
    }

  }
}
</style>
