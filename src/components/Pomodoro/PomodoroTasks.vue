<template>
  <div class="pomodoro-tasks">
    <v-text-field v-on:keyup.enter="() => addTask()" append-inner-icon="mdi-send" density="compact" label="Add Task"
      class="input-add-task" variant="solo" hide-details single-line v-model="task"
      @click:append-inner="() => addTask()" />
    <div class="task-list">
      <div class="task" v-for="t in (pomo.tasks ?? [])" @click="t.done = !t.done; updateTask()" v-ripple>
        <v-checkbox class="task-checkbox" clearable v-model="t.done" hide-details density="compact" />
        <p>{{ t.task }}</p>
        <v-icon class="btn-remove" size="x-small" @click.stop="removeTask(t)">mdi-delete</v-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { usePomodoroDBStore } from "@/stores/db/pomodoroDB";
import type { PomodoroBase, PomodoroTask } from '@/types';
const pomoDB = usePomodoroDBStore();

const props = defineProps<{ pomo: PomodoroBase }>();

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
.pomodoro-tasks {
  display: flex;
  flex-direction: column;
  // align-items: center;
  // justify-content: center;
  padding: 1rem;
  max-height: 15rem;
  overflow-y: auto;
  overflow-x: hidden;
  width: 15rem;



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
</style>