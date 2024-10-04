<template>
  <div class="pomo-details-props">
    <div class="title">
      <v-chip v-if="pomo.tag" variant="flat" closable size="large" @click:close="deleteTag()"
        :color="examDB.examsMapping[pomo.tag].color">{{ examDB.examsMapping[pomo.tag].name }}</v-chip>
      <v-combobox v-else class="text-box text-boxt-tag" :label="$t('setup.exam')" hide-details :items="examDB.exams"
        v-model="pomo.tag" item-title="name" item-value="_id" @update:modelValue="(e: ExamDBO) => { e && addExam(e) }">
        <template v-slot:selection="data"><v-chip :key="data.item.title">{{ data.item.title }}</v-chip></template>
        <template #item="{ props, item }">
          <v-list-item v-bind="props">
            <template #prepend>
              <v-icon :color="examDB.examsMapping[item.value].color" :icon="examDB.examsMapping[item.value].icon ?? 'mdi-circle'" />
            </template>
          </v-list-item>
        </template>
      </v-combobox>

      <v-text-field v-model="pomo.name" :label="$t('setup.name')" hide-details dense class="text-box text-boxt-title"
        @update:modelValue="(newName: any) => { updateName(pomo.id, newName) }" />
    </div>

    <div class="tasks" v-show="false">
      <v-text-field v-on:keyup.enter="() => addTask()" append-inner-icon="mdi-send" density="compact"
        :label="$t('setup.addTask')" class="input-add-task" variant="solo" hide-details single-line v-model="task"
        @click:append-inner="() => addTask()" />
      <div class="task-list" v-if="pomo.tasks?.length ?? 0 > 0">
        <div class="task" v-for="t in (pomo.tasks ?? [])" @click="t.done = !t.done; updateTask()" v-ripple>
          <v-checkbox class="task-checkbox" clearable v-model="t.done" hide-details density="compact" />
          <p>{{ t.task }}</p>
          <v-icon class="btn-remove" size="x-small" @click.stop="removeTask(t)">mdi-delete</v-icon>
        </div>
      </div>
    </div>

    <div class="details">
      <v-rating v-if="pomo.id" v-model="pomo.rating" length="3" size="x-large" color="accent" clearable
        @update:modelValue="(newRating: any) => { updateRating(pomo.id, newRating) }" />

      <div v-show="false">
        <v-tooltip activator="parent" location="top">{{ pomo.deepWork ? 'Deep Work' : 'Shallow Work' }}</v-tooltip>
        <v-switch color="primary" inset hide-details v-model="pomo.deepWork"
          @update:modelValue="(deep: any) => updateDeepWork(pomo.id, deep)" true-icon="mdi-brain" false-icon="mdi-duck">
        </v-switch>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { usePomodoroDBStore } from "@/stores/db/pomodoro";
import { useExamsStore } from "@/stores/db/exams";
import type { PomodoroBase, PomodoroTask, ExamDBO } from '@/types';
import { useTimerStatusStore } from "@/stores/api/timerStatus";

const props = defineProps<{ pomo: PomodoroBase }>();
const pomoDB = usePomodoroDBStore();
const examDB = useExamsStore();
const timerStatus = useTimerStatusStore();

async function updateDeepWork(pomoId: number | undefined, deep: boolean) {
  if (pomoId) await pomoDB.updateDeepWork(pomoId, deep);
  else timerStatus.saveStatus()
}
async function updateName(pomoId: number | undefined, name: string) {
  if (pomoId) await pomoDB.updateName(pomoId, name);
  else timerStatus.saveStatus()
}
async function updateRating(pomoId: number | undefined, rating: number) {
  if (pomoId) await pomoDB.updateRating(pomoId, rating);
  else timerStatus.saveStatus()
}
async function deleteTag() {
  props.pomo.tag = undefined
  if (props.pomo.id) pomoDB.updateTag(props.pomo.id, undefined)
}
function addExam(e: ExamDBO) {
  console.log(e)
  props.pomo.tag = e._id
  if (props.pomo.id) pomoDB.updateTag(props.pomo.id, e._id)
}

const task = ref('');
async function addTask() {
  if (task.value) {
    if (!props.pomo.tasks) props.pomo.tasks = [];
    props.pomo.tasks.push({ task: task.value });
  }
  task.value = '';
  await updateTask();
}
async function removeTask(task: PomodoroTask) {
  props.pomo.tasks?.splice(props.pomo.tasks?.indexOf(task), 1);
  await updateTask();
}
async function updateTask() {
  if (props.pomo.id) await pomoDB.updateTasks(props.pomo.id, props.pomo.tasks);
}
</script>
<style scoped lang="scss">
.pomo-details-props {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto auto auto;
  width: calc(100vw - 4rem);
  align-items: center;

  .title {
    grid-column: 1;
    grid-template-columns: auto;
    display: grid;
    gap: 1rem;
    margin: 1rem;
    align-items: center;

    .text-boxt-tag {
      min-width: 8rem;
    }

  }

  .tasks {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 25rem;
    align-self: center;
    min-width: unset;

    .input-add-task {
      min-width: 10rem;
      top: 0;
      right: 0;
      left: 0;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      max-height: 13rem;
      overflow-y: auto;
      overflow-x: hidden;

      .task {
        width: 100%;
        cursor: pointer;
        border-radius: 0.1rem;
        flex-direction: row;
        display: flex;
        align-items: center;

        .task-checkbox {
          flex-shrink: 0;
        }

        p {
          text-overflow: ellipsis;
          overflow: hidden;
          flex-grow: 1;
          padding: 0 0.5rem;
          white-space: nowrap;
        }

        .btn-remove {
          padding: 0 1rem;
        }
      }
    }
  }

  .details {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
  }
}

</style>
