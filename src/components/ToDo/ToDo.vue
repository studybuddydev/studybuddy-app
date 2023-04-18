<template>
  <v-card class="todo" v-if="element.showTasks">
    <v-toolbar dark color="primary">
      <v-toolbar-title>TODOs</v-toolbar-title>
      <v-text-field v-on:keyup.enter="addTodo()" density="compact" v-model="newTodo" label="New Task" type="text" required :hide-details="true" :bg-color="'surface'" />
      <v-toolbar-items> <v-btn variant="text" @click="addTodo()" > Add </v-btn> </v-toolbar-items>
    </v-toolbar>
    <div class="list-container">
      <v-list select-strategy="classic" v-if="deadlineTasks.length > 0" :opened="['deadlines']">
        <v-list-group value="deadlines">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-calendar-check" :title="`Deadlines (${deadlineTasks.length})`" />
          </template>
          <ToDoListItem
            v-for="t in deadlineTasks"
            :i="t.index" v-model="exapanedI"
            :task="t.task"
            @toggle="toggle(t.task, true)"
            @remove="removeTask(t.task)" />
          </v-list-group>
        </v-list>
      <v-list select-strategy="classic" v-if="noDeadlineTasks.length > 0" :opened="['tasks']">
        <v-list-group value="tasks">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-format-list-bulleted-triangle" :title="`Tasks (${noDeadlineTasks.length})`" />
          </template>
          <ToDoListItem
            v-for="t in noDeadlineTasks"
            :i="t.index" v-model="exapanedI"
            :task="t.task"
            @toggle="toggle(t.task, true)"
            @remove="removeTask(t.task)" />
        </v-list-group>
      </v-list>
    </div>

    <v-list select-strategy="classic" v-if="doneTasks.length > 0">
      <v-list-group value="done">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-check-bold"
            :title="`Done (${doneTasks.length})`" />
        </template>
        <ToDoListItem
          v-for="t in doneTasks"
          :i="t.index" v-model="exapanedI"
          :task="t.task"
          @toggle="toggle(t.task, false)"
          @remove="removeTask(t.task)" />
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

defineExpose({
  showHideTodo
})

const exapanedI = ref(-1)
const newTodo = ref('')
const props = defineProps<{
  element: WithTask,
}>();

type ColumnData = {
  title: string,
  tasks: Task[],
}

const taskNumbered = computed(() => props.element.tasks?.map((t, i) => ({ task: t, index: i })) ?? [])
const doneTasks = computed(() => taskNumbered.value.filter(t => t.task.done))
const deadlineTasks = computed(() => taskNumbered.value.filter(t => !t.task.done && t.task.isDeadline))
const noDeadlineTasks = computed(() => taskNumbered.value.filter(t => !t.task.done && !t.task.isDeadline))

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

function toggle(task: Task, value: boolean) {
  task.done = value;
  state.save();
}

function removeTask(task: Task) {
  if (!props.element.tasks) return;

  const toRemoveIndex = props.element.tasks.findIndex(t => t === task);
  if (toRemoveIndex >= 0) {
    props.element.tasks.splice(toRemoveIndex, 1);
  }
  state.save();
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
<style lang="scss">
.todo .v-list-group__items .v-list-item {
  padding-inline-start: 16px !important;
}
</style>