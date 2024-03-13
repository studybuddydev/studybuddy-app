<template>
  <div :class="`pomo-info ${openDetails ? 'pomo-info-open' : ''}`">
    <div class="pomo-line" v-ripple @click="model = pomo.id ?? 0">
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
            :always-show-time="openDetails"/>
        </div>
      </div>
      <p class="lenght">{{ pomodoro.timeFormatted((pomo.endedAt ?? 0) / 1000, timeFormat) }}</p>
      <p :class="reportUtils.getPointsColorClass(pomo.report?.points ?? 0)">{{ reportUtils.parsePoints(pomo.report?.points ?? 0)
        }}%
      </p>
    </div>
    <div class="pomo-details" v-if="openDetails" >
      <div class="details">
        <p class="text-h6">Rate your study</p>
        <v-rating v-model="pomo.rating" length="3" size="x-large" color="warning" clearable
          @update:modelValue="(newRating: number) => { pomo.id && pomoDB.updateRating(pomo.id, newRating) }" />
        <v-switch label="Deep work" color="primary" inset hide-details v-model="pomo.deepWork"
          @update:modelValue="(deep: boolean) => { pomo.id && pomoDB.updateDeepWork(pomo.id, deep) }" />
        <v-combobox class="tags" label="Tag" hide-details :items="pomoDB.tags" v-model="pomo.tag"
          @update:modelValue="(newTag: string) => { pomoDB.updateTag(pomo, newTag) }">
          <template v-slot:selection="data">
            <v-chip :key="data.item.title" v-bind="data.attrs" :disabled="data.disabled" :model-value="data.selected"
              size="small" @click:close="pomoDB.updateTag(pomo, undefined)" :color="pomoDB.tagColors[data.item.value]"
              variant="flat" closable>
              {{ data.item.title }}
            </v-chip>
          </template>
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon :color="pomoDB.tagColors[item.value]">mdi-circle</v-icon>
              </template>
            </v-list-item>
          </template>
        </v-combobox>
      </div>
      <PomodoroReport class="report" :report="pomo.report" v-if="pomo.report" />
      <v-btn color="error" class="pomo-delete-btn"
        @click="deletingPomoId = pomo.id ?? -1; deletePomoDialog = true;"><v-icon icon="mdi-delete" /></v-btn>
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
import PomodoroReport from '@/components/Pomodoro/PomodoroReport.vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import { usePomodoroDBStore } from "@/stores/db/pomodoroDB";
import type { PomodoroRecord } from '@/types';
import { ref,computed } from 'vue';
import * as reportUtils from '@/utils/report';
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';

const deletePomoDialog = ref(false);
const deletingPomoId = ref(-1);
const model = defineModel<number>()
const openDetails = computed(() => model.value === props.pomo.id)

const pomodoro = usePomodoroStore();
const pomoDB = usePomodoroDBStore();

const props = defineProps<{
  pomo: PomodoroRecord,
  maxLength: number
}>();

const timeFormat = { html: false, showSeconds: false, format: 'hms' as 'hms' }

function getTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: false })
}
function getStartTime(p: PomodoroRecord) {
  return getTime(p.datetime);
}
function getEndTime(p: PomodoroRecord) {
  if (!p.endedAt) return '';
  return getTime(new Date(p.datetime.getTime() + p.endedAt));
}
</script>

<style scoped lang="scss">
.pomo-info-open {
  .pomo-flex {
    height: 2rem;
  }
}
.pomo-wrapper {
  width: 100%;
  .pomo-width {
    display: flex;
  }
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

.day {
  width: 3.5em;
}

.pomo-details {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-direction: column;

  @media (min-width: 1000px) {
    flex-direction: row;
  }

  .details {
    margin: 1em;
    min-width: 20rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;

    .tags {
      margin-top: 0.3rem;
      width: 100%;
    }
  }

  .report {
    margin: 1em;
  }

  .pomo-delete-btn {
    position: absolute;
    bottom: 1em;
    right: 1em;
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
</style>
