<script setup lang="ts">
import { computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import type { DisplaySession, PomodoroRecord } from '@/types';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomodoroReport from '@/components/Pomodoro/PomodoroReport.vue';
import { ref } from 'vue';

const pomodoro = usePomodoroStore();
const openDetailsPomoId = ref(-1);
const deletePomoDialog = ref(false);
const deletingPomoId = ref(-1);

defineEmits(['startPomodoro']);



const dailyPomodoriGroups = computed(() => {
  const groups: Record<string, {
    dailySummary: DisplaySession[], 
    pomos: PomodoroRecord[]
  }> = {};
  pomodoro.pomodoroRecords.forEach((pomodoroRecord) => {
    const dateKey = new Date(pomodoroRecord.datetime).toLocaleDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = {
        dailySummary: [],
        pomos: []
      };
    }
    groups[dateKey].pomos.push(pomodoroRecord);
  });

  const hStart = 16;
  const mStart = 0;
  const hEnd = 18;
  const mEnd = 0;

  const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60000;
  const DAY_IN_MS = 24 * 60 * 60000;
  const DAY_START = ((hStart * 60) + mStart) * 60000 + TIMEZONE_OFFSET;
  const DAY_END = ((hEnd * 60) + mEnd) * 60000 + TIMEZONE_OFFSET;
  const DAY_LENGTH = DAY_END - DAY_START;

  for (const key in groups) {
    const group = groups[key];
    group.dailySummary = group.pomos.map((p, i) => {
      const startMs = ((p.datetime.getTime() % DAY_IN_MS) - DAY_START) / DAY_LENGTH;
      const endMs = ((p.endedAt ?? 0) % DAY_IN_MS) / DAY_LENGTH;
      return {
        startPerc: startMs * 100,
        lengthPerc: endMs * 100,
        lengthTime: pomodoro.timeFormatted(p.endedAt ?? 0, false),
        index: i
      } as DisplaySession
    })
  }

  return groups;
});
const longestPomodoro = computed(() =>
  pomodoro.pomodoroRecords.reduce((m, p) => Math.max(p.end, m), 0)
);

function toggleReport(id: number | undefined) {
  if (id !== undefined)
  openDetailsPomoId.value = openDetailsPomoId.value === id ? -1 : id;
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
    <div v-if="pomodoro.pomodoroRecords.length === 0" class="no-history">
      <p class="text-center text-medium-emphasis">Non hai ancora fatto un pomodoro di almeno 5 minuti</p>
      <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going"
        @click="$emit('startPomodoro')">
        <span>Inizia ora</span>
        <v-icon class="icon" icon="mdi-play" />
      </v-btn>
    </div>

    <div v-for="(g, key) in dailyPomodoriGroups">
      <h3 class="text-center">{{ key }}</h3>

      <PomodoroFlex class="pomo-flex" :dailyPomo="true" :displayBreaks="g.dailySummary" :displayStudy="[]" :percentage="100" />

      <div v-for="p in g.pomos" :class="`pomo-info ${p.id === openDetailsPomoId ? 'pomo-info-open' : ''}`">
        <div class="pomo-line" v-ripple @click="toggleReport(p.id)">
          <p class="time">{{ p.datetime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: false }) }}</p>
          <div class="pomo-wrapper">
            <div class="pomo-width" :style="{ width: `${(p.end / longestPomodoro) * 100}%` }">
              <PomodoroFlex class="pomo-flex" :percentage="p.percentage ?? 100" :displayBreaks="p.displayBreaks ?? []"
                :displayStudy="[]" />
            </div>
          </div>
          <p class="lenght"> {{ pomodoro.timeFormatted((p.endedAt ?? 0) / 1000, false) }}</p>
          <p :class="getPointsColorClass(p.report?.pointsValue ?? 0)">{{ p.report?.points }}%</p>
        </div>

        <div class="pomo-details" v-if="p.id === openDetailsPomoId">
          <PomodoroReport class="report" :report="p.report" v-if="p.report" />
          <v-btn color="error" class="pomo-delete-btn"  @click="deletingPomoId = p.id; deletePomoDialog = true;"><v-icon icon="mdi-delete" /></v-btn>
        </div>
      </div>
    </div>


    <v-dialog v-model="deletePomoDialog" width="auto">
      <v-card :text="$t('zen.confirm')">
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deletePomoDialog = false; deletingPomoId = -1">{{ $t("no") }}</v-btn>
          <v-btn color="primary" @click="pomodoro.deletePomodoroRecord(deletingPomoId); deletePomoDialog = false">{{ $t("yes") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.pomo-flex {
  height: 1rem;
  margin: 0.5rem;
}

.no-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  .btn {
    margin: 1em;
  }
}

.pomo-wrapper {
  width: 100%;

  .pomo-width {
    display: flex;
  }
}

.pomo-history {
  overflow-y: auto;
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

  .pomo-details {
    display: flex;
    justify-content: center;
    position: relative;

    .report {
      margin: 1em;
    }
    .pomo-delete-btn {
      position: absolute;
      bottom: 1em;
      right: 1em;
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
