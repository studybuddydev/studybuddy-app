<template>
  <v-card class="todo" v-if="element.showTasks">
    <v-toolbar dark color="primary">
      <v-toolbar-title>TODOs</v-toolbar-title>
      <v-text-field density="compact" v-model="newTodo" label="New Task" type="text" required :hide-details="true" :bg-color="'surface'" />
      <v-toolbar-items> <v-btn variant="text" @click="addTodo()" > Add </v-btn> </v-toolbar-items>
    </v-toolbar>
    <div class="list-container" v-if="element.tasks">
      <ToDoList
        v-for="e in columns"
        :tasks="e.tasks"
        :title="e.title"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Task, WithTask } from '@/types';
import ToDoList from './ToDoList.vue'
import { useStateStore } from "@/stores/state";
const state = useStateStore();

defineExpose({
  showHideTodo
})

const newTodo = ref('')
const props = defineProps<{
  element: WithTask,
}>();

type ColumnData = {
  title: string,
  tasks: Task[],
}

const deadlineTasks = computed(() => props.element.tasks?.filter(t => t.isDeadline) ?? [])
const noDeadlineTasks = computed(() => props.element.tasks?.filter(t => !t.isDeadline) ?? [])
const columns = computed(() => {
  const result: ColumnData[] = []
  if (deadlineTasks.value.length > 0) {
    result.push({
      title: 'Deadline',
      tasks: deadlineTasks.value,
    })
  }
  if (noDeadlineTasks.value.length > 0) {
    result.push({
      title: 'Tasks',
      tasks: noDeadlineTasks.value,
    })
  }
  return result
})

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
  state.save()
}

function showHideTodo(value: boolean) {
  props.element.showTasks = value;
  state.save()
}


</script>

<style scoped lang="scss">
.done {
  text-decoration: line-through;
}

.list-container {
  display: flex;
  width: 100%;
  flex-direction: row;
  > div {
    flex: 1;
  } 
}
</style>