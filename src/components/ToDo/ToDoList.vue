<template>
  <v-list select-strategy="classic">
    <v-list-group v-if="doneTasks.length > 0">
      <template v-slot:activator="{ props }">
        <v-list-item
          v-bind="props"
          prepend-icon="mdi-check-bold"
          :title="`Done (${doneTasks.length})`" />
      </template>
      <ToDoListItem
        v-for="t in doneTasks"
        :task="t"
        @toggle="toggle(t, false)"
        @remove="removeTask(t)" />
    </v-list-group>
  </v-list>
</template>

<script setup lang="ts">
import type { Task } from '@/types';
import ToDoListItem from './ToDoListItem.vue'
import { useStateStore } from "@/stores/state";
const state = useStateStore();

const props = defineProps<{
  tasks: Task[],
  title: string,
}>();

function removeTask(task: Task) {
  if (!props.tasks) return;

  const toRemoveIndex = props.tasks.findIndex(t => t === task);
  if (toRemoveIndex >= 0) {
    props.tasks.splice(toRemoveIndex, 1);
  }
  state.save();
}

function toggle(task: Task, value: boolean) {
  task.done = value;
  state.save();
}

</script>

<style scoped lang="scss">
.done {
  text-decoration: line-through;
}
</style>