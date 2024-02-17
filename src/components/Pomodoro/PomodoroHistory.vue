<script setup lang="ts">
import { computed } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSettingsStore } from "@/stores/settings";
import type { DisplaySession, PomodoroRecord } from '@/types';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomodoroReport from '@/components/Pomodoro/PomodoroReport.vue';
import { ref } from 'vue';
import { useAuth0 } from "@auth0/auth0-vue";

const { isAuthenticated, loginWithRedirect } = useAuth0();
const pomodoro = usePomodoroStore();
const settings = useSettingsStore();
const openDetailsPomoId = ref(-1);
const openDay = ref('');
const deletePomoDialog = ref(false);
const deletingPomoId = ref(-1);

const timeFormat = { html: false, showSeconds: false, format: 'hms' as 'hms' }

defineEmits(['startPomodoro']);

const hStart = computed(() => settings.settings.general.dayStartEndHours[0]);
const hEnd = computed(() => settings.settings.general.dayStartEndHours[1]);

type DayGroup = {
  date: string,
  dailySummary: DisplaySession[],
  pomos: PomodoroRecord[],
  points: number,
  totalTime: number,
  maxLength: number
}

const dailyPomodoriGroups = computed(() => {
  const groups: Record<string, DayGroup> = {};
  const monthGroup: Record<string, Record<string, DayGroup>> = {};

  pomodoro.pomodoroRecords.forEach((pomodoroRecord) => {
    const dateKey = new Date(pomodoroRecord.datetime).toLocaleDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: pomodoroRecord.datetime.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
        dailySummary: [],
        pomos: [],
        points: 0,
        totalTime: 0,
        maxLength: 0
      };
    }
    groups[dateKey].pomos.unshift(pomodoroRecord);
  });
  for (const gKey in groups) {
    const g = groups[gKey];
    const month = new Date(g.pomos[0].datetime).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!monthGroup[month]) monthGroup[month] = {};
    monthGroup[month][gKey] = g;
  }

  const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60000;
  const DAY_IN_MS = 24 * 60 * 60000;
  const DAY_START = ((hStart.value * 60) + 0) * 60000 + TIMEZONE_OFFSET;
  const DAY_END = ((hEnd.value * 60) + 0) * 60000 + TIMEZONE_OFFSET;
  const DAY_LENGTH = DAY_END - DAY_START;

  for (const key in groups) {
    const group = groups[key];
    group.points = group.pomos.reduce((m, p) => m + (p.report?.points ?? 0), 0) / group.pomos.length;
    group.totalTime = group.pomos.reduce((m, p) => m + (p.endedAt ?? 0), 0);
    group.maxLength = group.pomos.reduce((m, p) => Math.max(p.end, m), 0);
    group.dailySummary = group.pomos.map((p, i) => {
      const startMs = ((p.datetime.getTime() % DAY_IN_MS) - DAY_START) / DAY_LENGTH;
      const endMs = ((p.endedAt ?? 0) % DAY_IN_MS) / DAY_LENGTH;
      return {
        startPerc: startMs * 100,
        lengthPerc: endMs * 100,
        lengthTime: pomodoro.timeFormatted(p.endedAt ?? 0, { html: false }),
        index: i
      } as DisplaySession
    })
  }
  return monthGroup;
});

function toggleReport(id: number | undefined) {
  if (id !== undefined)
    openDetailsPomoId.value = openDetailsPomoId.value === id ? -1 : id;
}
function toggleOpenDay(day: string) {
  openDay.value = openDay.value === day ? '' : day;
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
    <div v-if="!isAuthenticated" class="no-history">
      <p class="text-center text-medium-emphasis">Effettua il login per visualizzare la cronologia dei tuoi pomodori</p>
      <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' @click="loginWithRedirect()">
        <span>Login</span>
      </v-btn>
    </div>

    <div v-else-if="pomodoro.pomodoroRecords.length === 0" class="no-history">
      <p class="text-center text-medium-emphasis">Non hai ancora fatto un pomodoro di almeno 5 minuti</p>
      <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going"
        @click="$emit('startPomodoro')">
        <span>Inizia ora</span>
        <v-icon class="icon" icon="mdi-play" />
      </v-btn>
    </div>

    <div v-else>
      <div v-for="(m, mKey) in dailyPomodoriGroups">
        <p class="text-center text-h5">{{ mKey }}</p>
        <div v-for="(g, key) in m" :class="`day-info  ${openDay === key ? 'day-info-open' : ''}`">

          <div class="day-line" @click="toggleOpenDay(key)">
            <h3 class="day">{{ g.date }}</h3>
            <PomodoroFlex class="pomo-flex pomo-flex-day" :dailyPomo="true" :displayBreaks="g.dailySummary"
              :displayStudy="[]" :percentage="100" />
            <p class="lenght"> {{ pomodoro.timeFormatted((g.totalTime ?? 0) / 1000, timeFormat) }}</p>
            <p :class="getPointsColorClass(g.points)">{{ pomodoro.parsePoints(g.points) }}%</p>
          </div>

          <div class="pomo-infos" v-if="openDay === key">
            <div v-for="p in g.pomos" :class="`pomo-info ${p.id === openDetailsPomoId ? 'pomo-info-open' : ''}`">
              <div class="pomo-line" v-ripple @click="toggleReport(p.id)">
                <p class="time">{{ p.datetime.toLocaleTimeString(undefined, {
                  hour: 'numeric', minute: '2-digit', hour12: false
                }) }}</p>
                <div class="pomo-wrapper">
                  <div class="pomo-width" :style="{ width: `${(p.end / g.maxLength) * 100}%` }">
                    <PomodoroFlex class="pomo-flex" :percentage="p.percentage ?? 100"
                      :displayBreaks="p.displayBreaks ?? []" :displayStudy="[]" />
                  </div>
                </div>
                <p class="lenght"> {{ pomodoro.timeFormatted((p.endedAt ?? 0) / 1000, timeFormat) }}</p>
                <p :class="getPointsColorClass(p.report?.points ?? 0)">{{ pomodoro.parsePoints(p.report?.points ?? 0) }}%
                </p>
              </div>

              <div class="pomo-details" v-if="p.id === openDetailsPomoId">
                <PomodoroReport class="report" :report="p.report" v-if="p.report" />
                <v-btn color="error" class="pomo-delete-btn"
                  @click="deletingPomoId = p.id; deletePomoDialog = true;"><v-icon icon="mdi-delete" /></v-btn>
              </div>
            </div>
          </div>
        </div>

      </div>

      <v-dialog v-model="deletePomoDialog" width="auto">
        <v-card :text="$t('zen.confirm')">
          <v-card-actions>
            <v-spacer />
            <v-btn @click="deletePomoDialog = false; deletingPomoId = -1">{{ $t("no") }}</v-btn>
            <v-btn color="primary" @click="pomodoro.deletePomodoroRecord(deletingPomoId); deletePomoDialog = false">{{
              $t("yes") }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pomo-flex {
  height: 1rem;
  margin: 0.5rem;

  &.pomo-flex-day {
    height: 1.5rem;
  }
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

.points {
  width: 4em;
  text-align: center;
  border-radius: 0.5em;
  margin-left: 0.4em;
}

.lenght {
  width: 4em;
  text-align: right;
}

.time {
  width: 5em;
  text-align: right;
}

.day {
  width: 3.5em;
}

.pomo-history {
  overflow-y: auto;

  .day-info {
    border: 1px solid #00000000;
    border-radius: 1rem;

    &.day-info-open {
      border: 1px solid rgb(var(--v-theme-primary));

      .day-line {
        background-color: #FFFFFF10;
      }
    }

    .day-line {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 1rem;
      cursor: pointer;
      transition: background-color 0.1s ease-in-out, height 0.1s ease-in-out;
      padding: 0.2rem 1rem;

      &:hover {
        background-color: #FFFFFF10;
      }

    }
  }

  .pomo-infos {
    padding: 0 1rem;
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
    }
  }
}
</style>
