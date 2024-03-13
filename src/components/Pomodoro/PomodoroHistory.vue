<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSettingsStore } from "@/stores/settings";
import type { DisplaySession, PomodoroRecord } from '@/types';
import { usePomodoroDBStore } from "@/stores/db/pomodoroDB";
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomodoroDetails from '@/components/Pomodoro/PomodoroDetails.vue';
import { useAuth0 } from "@auth0/auth0-vue";
import * as reportUtils from '@/utils/report';

const { isAuthenticated, loginWithRedirect } = useAuth0();
const pomodoro = usePomodoroStore();
const settings = useSettingsStore();
const pomoDB = usePomodoroDBStore();
const openDetailsPomoId = ref(-1);
const openDay = ref('');

const timeFormat = { html: false, showSeconds: false, format: 'hms' as 'hms' }
defineEmits(['startPomodoro']);

const hStart = computed(() => settings.settings.general.dayStartEndHours[0]);
const hEnd = computed(() => settings.settings.general.dayStartEndHours[1]);

const props = defineProps<{
  open: boolean,
}>();

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

  pomoDB.pomodoroRecords.forEach((pomodoroRecord) => {
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
    group.maxLength = group.pomos.reduce((m, p) => Math.max(p.endedAt ?? 0, m), 0);
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

function toggleOpenDay(day: string) {
  openDay.value = openDay.value === day ? '' : day;
}

// ---- ADJUST DAY -------
let endDayAfter = settings.settings.general.dayStartEndHours[1] >= 24;
const endDayH = ref(settings.settings.general.dayStartEndHours[1] % 24);

const startEndTime = computed({
  get() { return settings.settings!.general!.dayStartEndHours },
  set(newValue) {
    endDayAfter = newValue[1] >= 24;
    endDayH.value = newValue[1] - (endDayAfter ? 24 : 0);
    settings.settings!.general!.dayStartEndHours = newValue;
  }
})
const startTime = computed({
  get() { return settings.settings!.general!.dayStartEndHours[0] },
  set(newValue) {
    newValue = +newValue;
    if (newValue > 23) newValue = 23;
    if (newValue < 0) newValue = 0;
    if (newValue >= settings.settings.general.dayStartEndHours[1]) {
      newValue = settings.settings.general.dayStartEndHours[1] - 1;
    }
    settings.settings!.general!.dayStartEndHours[0] = +newValue;
  }
})
const endTime = computed({
  get() { return endDayH.value },
  set(newValue) {
    endDayH.value = +newValue;
    if (endDayH.value >= 24) {
      endDayAfter = true;
      endDayH.value = endDayH.value - 24;
    }
    if (endDayAfter && endDayH.value > 8) {
      endDayH.value = 8;
    }
    if (endDayH.value < 0 && endDayAfter) {
      endDayAfter = false;
      endDayH.value = endDayH.value + 24;
    }
    if (endDayH.value < 0) {
      endDayH.value = 0;
    }
    if (!endDayAfter && endDayH.value <= settings.settings.general.dayStartEndHours[0]) {
      endDayH.value = settings.settings.general.dayStartEndHours[0] + 1;
    }
    settings.settings!.general!.dayStartEndHours[1] = endDayH.value + (endDayAfter ? 24 : 0);
  }
})
</script>

<template>
  <div :class="`pomo-history ${open ? '' : 'hide-pomo-history'}`">
    <div v-if="!isAuthenticated" class="no-history">
      <p class="text-center text-medium-emphasis"> {{ $t('history.loginMsg') }}</p>
      <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' @click="loginWithRedirect()">
        <span>Login</span>
      </v-btn>
    </div>

    <div v-else-if="pomoDB.pomodoroRecords.length === 0" class="no-history">
      <p class="text-center text-medium-emphasis">{{ $t('history.noHistory') }}</p>
      <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going"
        @click="$emit('startPomodoro')">
        <span>{{ $t('history.startNow') }}</span>
        <v-icon class="icon" icon="mdi-play" />
      </v-btn>
    </div>

    <div class="scrollable-history" v-else>
      <div v-for="(m, mKey) in dailyPomodoriGroups">
        <p class="text-center text-h5">{{ mKey }}</p>
        <div v-for="(g, key) in m" :class="`day-info  ${openDay === key ? 'day-info-open' : ''}`">

          <div class="day-line" @click="toggleOpenDay(key)">
            <h3 class="day">{{ g.date }}</h3>
            <PomodoroFlex class="pomo-flex-day" :dailyPomo="true" :displayBreaks="g.dailySummary"
              :displayStudy="[]" :percentage="100" />
            <p class="lenght-header"> {{ pomodoro.timeFormatted((g.totalTime ?? 0) / 1000, timeFormat) }}</p>
            <p :class="reportUtils.getPointsColorClass(g.points)">{{ reportUtils.parsePoints(g.points) }}%</p>
          </div>

          <div class="pomo-infos" v-if="openDay === key">
            <div v-for="p in g.pomos">
              <PomodoroDetails
                v-model="openDetailsPomoId"
                :pomo="p"
                :max-length="g.maxLength"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="day-settings">
        <p class="text-center">{{ $t('history.sliderTitle') }}</p>
        <v-range-slider v-model="startEndTime" class="align-center slider" color="primary" :max="32" :min="0" :step="1"
          hide-details>
          <template v-slot:prepend>
            <v-text-field v-model="startTime" hide-details single-line type="number" variant="outlined"
              density="compact" class="day-h-input" />
          </template>
          <template v-slot:append>
            <v-text-field v-model="endTime" hide-details single-line type="number" variant="outlined" density="compact"
              class="day-h-input" />
          </template>
        </v-range-slider>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.day-settings {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  border-radius: 1rem 1rem 0 0;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background-color: rgba(var(--v-theme-surface), 0.8);

  .day-h-input {
    width: 4.5em;
    text-align: center;
  }
}

.hide-pomo-history .day-settings {
  display: none;
}

.pomo-flex-day {
  margin: 0.5rem;
  transition: height 0.1s ease-in-out;
  height: 1.5rem;
}
.no-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  .btn {
    margin: 1em;
    width: auto;
  }
}

.day {
  width: 3.5em;
}
::v-deep(.points) {
  width: 4em;
  text-align: center;
  border-radius: 0.5em;
  margin-left: 0.4em;
}

.lenght-header {
  width: 4em;
  text-align: right;
}

.pomo-history {
  height: 73vh;
  margin: 1em;
  transition: height 0.1s ease-in-out;
  overflow-y: auto;

  .scrollable-history {
    margin-bottom: 8rem;
  }

  &.hide-pomo-history {
    height: 0;
    overflow: hidden;
    margin: 0;
  }

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

}
</style>
