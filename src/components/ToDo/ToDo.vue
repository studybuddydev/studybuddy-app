<template>
  <v-card>
    <v-toolbar dark color="primary">
      <v-toolbar-title>TODOs</v-toolbar-title>
      <v-text-field density="compact" v-model="newTodo" label="New Task" type="text" required :hide-details="true" :bg-color="'surface'" />
      <v-toolbar-items> <v-btn variant="text" @click="addTodo()" > Add </v-btn> </v-toolbar-items>
    </v-toolbar>
    <v-list select-strategy="classic">

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
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Task, WithTask } from '@/types';
import ToDoListItem from './ToDoListItem.vue'
import { useStateStore } from "@/stores/state";
const state = useStateStore();

const newTodo = ref('')
const props = defineProps<{
  element: WithTask,
}>();

const todoTasks = computed(() => props.element.tasks?.filter(t => !t.done) ?? [])
const doneTasks = computed(() => props.element.tasks?.filter(t => t.done) ?? [])

function addTodo() {
  if (newTodo.value) {
    if (!props.element.tasks) {
      props.element.tasks = [];
    }
    props.element.tasks.push({
      name: newTodo.value,
      done: false,
    });
  }
  newTodo.value = '';
  save();
}

function removeTask(task: Task) {
  if (!props.element.tasks) return;

  const toRemoveIndex = props.element.tasks.findIndex(t => t === task);
  if (toRemoveIndex >= 0) {
    props.element.tasks.splice(toRemoveIndex, 1);
  }
  save();
}

function toggle(task: Task, value: boolean) {
  task.done = value;
  save();
}

function save() {
  state.save()
}



</script>

<style scoped lang="scss">
.done {
  text-decoration: line-through;
}
</style>