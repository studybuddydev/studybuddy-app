<template>
  <v-list-item @click.prevent.stop="toggle()">
    <template v-slot:prepend>
      <v-list-item-action start>
        <v-checkbox-btn :model-value="task.done"></v-checkbox-btn>
      </v-list-item-action>
    </template>
    <template v-slot:append>
      <v-btn color="grey-lighten-1" icon="mdi-delete" variant="text" @click.prevent.stop="remove()"></v-btn>
    </template>
    <v-list-item-title :class="task.done ? 'done' : ''">{{ task.name }}</v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import type { Task } from '@/types';


const props = defineProps<{
  task: Task
}>()
// emits with done and remove
const emits = defineEmits<{
  (e: 'toggle'): void
  (e: 'remove'): void
}>()


function toggle() {
  emits('toggle')
}
function remove() {
  emits('remove')
}
</script>