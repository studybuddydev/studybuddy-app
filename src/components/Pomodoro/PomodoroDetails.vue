<template>
  <div class="pomo-details">
    <!-- <div>
      <PomodoroTasks :pomo="pomo" />
    </div> -->
    <div class="details">

      <v-chip v-if="pomo.tag" variant="flat" closable size="large" @click:close="pomoDB.updateTag(pomo, undefined)"
        :color="pomo.tag ? pomoDB.tagColors[pomo.tag] : null">{{ pomo.tag }}</v-chip>

      <v-combobox v-else class="tags" label="Tag" hide-details :items="pomoDB.tags" v-model="pomo.tag"
        @update:modelValue="(newTag: any) => { newTag && pomoDB.updateTag(pomo, newTag) }">
        <template v-slot:selection="data"><v-chip :key="data.item.title">{{ data.item.title }}</v-chip></template>
        <template #item="{ props, item }">
          <v-list-item v-bind="props">
            <template #prepend>
              <v-icon :color="pomoDB.tagColors[item.value]">mdi-circle</v-icon>
            </template>
          </v-list-item>
        </template>
      </v-combobox>

      <v-rating v-model="pomo.rating" length="3" size="x-large" color="accent" clearable
        @update:modelValue="(newRating: any) => { pomo.id && newRating && pomoDB.updateRating(pomo.id, newRating) }" />
      <v-switch label="Deep work" color="primary" inset hide-details v-model="pomo.deepWork"
        @update:modelValue="(deep: any) => { pomo.id && deep && pomoDB.updateDeepWork(pomo.id, deep) }" />

    </div>
    <div class="report-wrapper">
      <PomodoroReport :report="pomo.report" v-if="pomo.report" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import PomodoroReport from '@/components/Pomodoro/PomodoroReport.vue';
import PomodoroTasks from '@/components/Pomodoro/PomodoroTasks.vue';
import { usePomodoroDBStore } from "@/stores/db/pomodoroDB";
import type { PomodoroRecord } from '@/types';
defineProps<{ pomo: PomodoroRecord }>();
const pomoDB = usePomodoroDBStore();
</script>

<style scoped lang="scss">
.pomo-details {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;

  border-radius: 1rem;
  padding: 1rem;

  .report-wrapper {
    border-top: 1px solid rgb(var(--v-theme-primary));
  }


  @media (min-width: 1000px) {
    flex-direction: row;

    .report-wrapper {
      border-top: none;
      border-left: 1px solid rgb(var(--v-theme-primary));
    }
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
      width: 15rem;
    }
  }
}
</style>