<template>

  <v-list select-strategy="classic">
    <h3 class="text-center">{{ title }}</h3>
    <ToDoListItem v-for="t in todoTasks" :task="t" @toggle="toggle(t, true)" @remove="removeTask(t)" />
  <v-list-group v-if="doneTasks.length > 0">
    <template v-slot:activator="{ props }">
      <v-list-item
        v-bind="props"
        prepend-icon="mdi-check-bold"
        :title="`Done (${doneTasks.length})`"
        ></v-list-item>
      </template>
      <ToDoListItem v-for="t in doneTasks" :task="t" @toggle="toggle(t, false)" @remove="removeTask(t)" />
    </v-list-group>
  </v-list>

</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Task } from '@/types';
import ToDoListItem from './ToDoListItem.vue'
import { useStateStore } from "@/stores/state";
const state = useStateStore();

const props = defineProps<{
  tasks: Task[],
  title: string,
}>();

const todoTasks = computed(() => props.tasks?.filter(t => !t.done) ?? [])
const doneTasks = computed(() => props.tasks?.filter(t => t.done) ?? [])

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