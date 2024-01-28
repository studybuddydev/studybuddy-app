<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useTheme } from 'vuetify'
import type { PomodoroRecord } from '@/types';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';

const pomodoro = usePomodoroStore();
const theme = useTheme();

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
  <div class="ma-5">
    <div v-for="(value, key) in dailyPomodoriGroups">
      <h3 class="text-center">{{ key }}</h3>
      <div v-for="p in value" class="pomodoro-line">
        <p class="lenght">{{ pomodoro.timeFormatted((p.endedAt ?? 0) / 1000, false) }}</p>
        <p class="time">{{ p.datetime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) }}</p>
        <PomodoroFlex class="pomo-flex" :percentage="p.percentage ?? 100" :displayBreaks="p.displayBreaks ?? []"
        :displayStudy="[]" />
        <p :class="getPointsColorClass(p.report?.pointsValue ?? 0)">{{ p.report?.points }}%</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pomo-flex {
  height: 1rem;
  margin: 0.5rem;
}


.pomodoro-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0.5rem;

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
</style>
