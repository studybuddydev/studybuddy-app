<template>
  <div class="pomo-details">

    <div class="pomo-details-props">
      <div class="title">

        <v-chip v-if="pomo.tag" variant="flat" closable size="large" @click:close="deleteTag()"
          :color="pomo.tag ? pomoDB.tagColors[pomo.tag] : undefined">{{ pomo.tag }}</v-chip>
        <v-combobox v-else class="text-box text-boxt-tag" label="Tag" hide-details :items="pomoDB.tags" v-model="pomo.tag"
          @update:modelValue="(newTag: any) => { newTag && addTag(newTag) }">
          <template v-slot:selection="data"><v-chip :key="data.item.title">{{ data.item.title }}</v-chip></template>
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon :color="pomoDB.tagColors[item.value]">mdi-circle</v-icon>
              </template>
            </v-list-item>
          </template>
        </v-combobox>

        <v-text-field v-model="pomo.name" label="Nome" hide-details dense class="text-box text-boxt-title"
          @update:modelValue="(newName: any) => { pomo.id && pomoDB.updateName(pomo.id, newName) }" />

      </div>

      <PomodoroTasks class="tasks" :pomo="pomo" />

      <div class="details">

        <v-rating v-if="pomo.id" v-model="pomo.rating" length="3" size="x-large" color="accent" clearable
          @update:modelValue="(newRating: any) => { pomo.id && newRating && pomoDB.updateRating(pomo.id, newRating) }" />

        <v-switch label="Deep work" color="primary" inset hide-details v-model="pomo.deepWork"
          @update:modelValue="(deep: any) => { pomo.id && deep && pomoDB.updateDeepWork(pomo.id, deep) }" />

      </div>

    </div>
    <PomodoroReport class="report" :report="pomo.report" v-if="pomo.report" />
  </div>
</template>

<script lang="ts" setup>
import PomodoroReport from '@/components/Pomodoro/PomodoroReport.vue';
import PomodoroTasks from '@/components/Pomodoro/PomodoroTasks.vue';
import { usePomodoroDBStore } from "@/stores/db/pomodoroDB";
import type { PomodoroBase } from '@/types';
const props = defineProps<{ pomo: PomodoroBase }>();
const pomoDB = usePomodoroDBStore();

async function deleteTag() {
  props.pomo.tag = undefined
  if (props.pomo.id) pomoDB.updateTag(props.pomo.id, undefined)
}

function addTag(tag: string) {
  props.pomo.tag = tag
  if (props.pomo.id) pomoDB.updateTag(props.pomo.id, tag)
}

</script>

<style scoped lang="scss">
.pomo-details {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 1rem;

  @media (min-width: 1000px) {
    flex-direction: row;
  }
  .report {
    border: 1px solid rgb(var(--v-theme-primary));
    border-radius: 1rem;
  }

  .pomo-details-props {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }

  .title {
    grid-column: 1 / span 2;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    margin: 1rem;
    align-items: center;
    
  }

  .tasks {
    margin: 1rem;
  }

  .details {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
    margin: 1rem;
  }


}

</style>