<template>
  <div :class="`pomo-info ${openDetails ? 'pomo-info-open' : ''}`">
    <div class="pomo-line" v-ripple @click="model = (pomo.id === model ? 0 : (pomo.id ?? 0))">
      <v-chip size="small" :color="pomo.tag ? pomoDB.tagColors[pomo.tag] : '#FFFFFF00'" variant="flat" class="time">
        <div :class="pomo.tag ? '' : 'text-tag-chip'">
          <p> {{ getStartTime(pomo) }}</p>
          <p v-if="openDetails"> {{ getEndTime(pomo) }}</p>
        </div>
      </v-chip>

      <div class="pomo-wrapper">
        <div class="pomo-width" :style="{ width: `${((pomo.endedAt ?? maxLength) / maxLength) * 100}%` }">
          <PomodoroFlex :class="pomo.deepWork ? 'pomo-flex' : 'pomo-flex pomo-flex-shallow'" :percentage="100"
            :displayBreaks="pomo.displayBreaks ?? []" :displayStudy="pomo.displayStudy ?? []"
            :always-show-time="openDetails" />
        </div>
      </div>
      <p class="lenght">{{ pomodoro.timeFormatted((pomo.endedAt ?? 0) / 1000, timeFormat) }}</p>
      <p :class="reportUtils.getPointsColorClass(pomo.report?.points ?? 0, pomo.deepWork)">{{
    reportUtils.parsePoints(pomo.report?.points ?? 0)
  }}%
      </p>
    </div>
    <div v-if="openDetails">
      <PomodoroDone :pomo="pomo" :hide-sink="true" />
      <div class="pomo-actions">
        <div class="pomo-edit-inputs" v-if="editingStartEnd">
          <v-text-field label="Start Time" v-model="startTimeForEdit" type="time" class="pa-0" variant="underlined"
            dense v-on:click.stop hide-details />
          <v-text-field label="End Time" v-model="endTimeForEdit" type="time" class="pa-0" variant="underlined" dense
            v-on:click.stop hide-details />
        </div>
        <v-btn color="primary" class="pomo-edit-btn" @click="updateTime()"><v-icon
            :icon="editingStartEnd ? 'mdi-floppy' : 'mdi-pencil'" /></v-btn>
        <v-btn color="error" class="pomo-delete-btn"
          @click="deletingPomoId = pomo.id ?? -1; deletePomoDialog = true;"><v-icon icon="mdi-delete" /></v-btn>
      </div>
      <v-dialog v-model="deletePomoDialog" width="auto">
        <v-card :text="$t('zen.confirm')">
          <v-card-actions>
            <v-spacer />
            <v-btn @click="deletePomoDialog = false; deletingPomoId = -1">{{ $t("no") }}</v-btn>
            <v-btn color="primary" @click="pomoDB.deletePomodoroRecord(deletingPomoId); deletePomoDialog = false">{{
    $t("yes") }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
import { usePomodoroDBStore } from "@/stores/db/pomodoroDB";
import type { PomodoroRecord } from '@/types';
import { ref, computed } from 'vue';
import * as reportUtils from '@/utils/report';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomodoroDone from '@/components/Pomodoro/PomodoroDone/PomodoroDone.vue';


const model = defineModel<number>()
const openDetails = computed(() => model.value === props.pomo.id)

const deletePomoDialog = ref(false);
const deletingPomoId = ref(-1);

const pomodoro = usePomodoroStore();
const pomoDB = usePomodoroDBStore();

const props = defineProps<{
  pomo: PomodoroRecord,
  maxLength: number
}>();
const emits = defineEmits<{
  (e: 'pomoLenghUpdated'): void
}>();

const editingStartEnd = ref(false);

const endTimeForEdit = ref(
  new Date(props.pomo.datetime.getTime() + (props.pomo.endedAt ?? 0))
    .toLocaleTimeString('en-gb', { hour: '2-digit', minute: '2-digit', hour12: false, hourCycle: "h23" })
);
const startTimeForEdit = ref(
  props.pomo.datetime.toLocaleTimeString('en-gb', { hour: '2-digit', minute: '2-digit', hour12: false, hourCycle: "h23" })
);
let originalEndTime = endTimeForEdit.value;
let originalStartTime = startTimeForEdit.value;

const timeFormat = { html: false, showSeconds: false, format: 'hms' as 'hms' }
function getTime(d: Date) {
  return d.toLocaleTimeString('en-gb', { hour: 'numeric', minute: '2-digit', hour12: false, hourCycle: "h23" })
}
function getStartTime(p: PomodoroRecord) {
  return getTime(p.datetime);
}
function getEndTime(p: PomodoroRecord) {
  if (!p.endedAt) return '';
  return getTime(new Date(p.datetime.getTime() + p.endedAt));
}

async function updateTime() {
  if (!editingStartEnd.value) {
    editingStartEnd.value = true;
    return;
  }
  editingStartEnd.value = false;
  if (!props.pomo.id) return;

  if (endTimeForEdit.value === originalEndTime && startTimeForEdit.value === originalStartTime) return;

  if (startTimeForEdit.value !== originalStartTime) {
    const orStart = props.pomo.datetime.getTime();
    const [hStart, mStart] = startTimeForEdit.value.split(':').map(x => +x);
    props.pomo.datetime.setHours(+hStart);
    props.pomo.datetime.setMinutes(+mStart);
    const startDiff = orStart - props.pomo.datetime.getTime();

    if (props.pomo.endedAt) props.pomo.endedAt += startDiff;
    props.pomo.end += startDiff;
    props.pomo.breaksDone.forEach(b => {
      b.start += startDiff;
      if (b.end) b.end += startDiff;
    });
  }

  if (endTimeForEdit.value !== originalEndTime) {
    const [hEnd, mEnd] = endTimeForEdit.value.split(':').map(x => +x);
    const end = (hEnd * 60) + mEnd;
    const start = props.pomo.datetime.getMinutes() + props.pomo.datetime.getHours() * 60;
    const diff = end < start ? end + (24 * 60) - start : end - start;
    props.pomo.endedAt = diff * 60 * 1000;
  }

  originalStartTime = startTimeForEdit.value;
  originalEndTime = endTimeForEdit.value;
  await pomoDB.updatePomodoro(props.pomo.id, (p) => {
    p.endedAt = props.pomo.endedAt;
    p.end = props.pomo.end;
    p.datetime = props.pomo.datetime;
    p.breaksDone = [ ...props.pomo.breaksDone.map(b => ({ ...b })) ];
    const newPomo = pomoDB.parsePomodorDbo(p);
    Object.assign(props.pomo, newPomo);
    return p;
  });
}

</script>

<style scoped lang="scss">
.shallow-work {
  opacity: 0.7;
}
.pomo-info-open {
  .pomo-flex {
    height: 2rem;
  }
}

.pomo-wrapper {
  width: 100%;
  position: relative;

  .pomo-cutter {
    .pomo-cut-handle {
      background-color: #F00;
      border-radius: 0.15rem;
      position: absolute;
      top: 0.5rem;
      bottom: 0.5rem;
      left: 50%;
      width: 3rem;
      translate: -50%;
    }

    .pomo-cut {
      position: absolute;
      left: 50%;
      top: 0.5rem;
      right: 0.5rem;
      bottom: 0.5rem;
      border-radius: 0 1em 1em 0;
      background-color: #000C;
    }
  }

  .pomo-width {
    display: flex;
  }
}

.pomo-info {
  margin: 0.5rem;
  border-radius: 1em;
  position: relative;

  &.pomo-info-open {
    background-color: rgba(var(--v-theme-on-surface), 0.05);

    .pomo-line {
      background-color: rgba(var(--v-theme-on-surface), 0.05);
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
      background-color: rgba(var(--v-theme-on-surface), 0.05);
    }
  }
}

.text-tag-chip {
  color: rgb(var(--v-theme-on-background));
}

.pomo-flex {
  height: 1rem;
  margin: 0.5rem;
  transition: height 0.1s ease-in-out;

  &.pomo-flex-shallow {
    opacity: 0.5;
  }
}

.lenght {
  width: 6em;
  text-align: right;
}

.time {
  width: 5em;
  text-align: right;
  transition: height 0.1s ease-in-out;
}

.pomo-info-open {
  .time {
    height: 2.5rem;
    border-radius: 0.7rem;
  }
}

.pomo-actions {
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  padding: 0 1.5rem 0.5rem 1.5rem;
  gap: 1rem;
  height: 4rem;

  .pomo-edit-inputs {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

}
</style>
