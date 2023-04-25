<template>
  <div>
    <v-list-item @click.prevent.stop="toggleExpanded()" :class="expanded ? 'bg-background' : ''">
      <template v-slot:prepend>
        <v-list-item-action start>
          <v-checkbox-btn :model-value="task.done" @click.prevent.stop="toggle()"></v-checkbox-btn>
        </v-list-item-action>
      </template>
      <template v-slot:append>
        <v-btn color="grey-lighten-1" :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" variant="text"></v-btn>
      </template>
      <v-list-item-title :class="task.done ? 'done' : ''">{{ task.name }} <span v-if="task.isDeadline" class="text-medium-emphasis">({{ task.deadline }})</span></v-list-item-title>
    </v-list-item>

    <v-card class="ma-0 pa-5" v-if="expanded">

      <v-row>
        <v-col cols="12">
          <v-text-field :rows="2" label="Nome" v-model="task.name" @update:model-value="state.save()" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="9">
          <v-text-field clearable label="Deadline" type="date" v-model="task.deadline" @update:model-value="state.save()" @click:clear="task.isDeadline = false" />
        </v-col>
        <v-col cols="3">
          <v-btn :disabled="!task.deadline" variant="tonal" color="primary" height="58" @click="task.isDeadline = !task.isDeadline">
            <span style="white-space: normal;"> {{ task.isDeadline ? $t('Remove from Deadline') : $t('Move to Deadline') }} </span>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-textarea :rows="2" label="Note" v-model="task.notes" @update:model-value="state.save()" />
        </v-col>
      </v-row>

      <!-- delete buttons -->
      <v-card-actions class="justify-end">
        <v-btn color="error" @click="remove()" > {{ $t('delete') }} </v-btn>
      </v-card-actions>
      <v-divider />
    </v-card>
            
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@/types';
import { computed, ref } from 'vue';
import { useStateStore } from "@/stores/state";
const state = useStateStore();

const expanded = computed(() => props.modelValue === props.i);

const props = defineProps<{
  i: number
  modelValue: number
  task: Task
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: number): void	
  (e: 'toggle'): void
  (e: 'remove'): void
}>()

function toggleExpanded() {
  emits('update:modelValue', props.modelValue === props.i ? -1 : props.i)
}


function toggle() {
  emits('toggle')
}
function remove() {
  emits('update:modelValue', -1)
  emits('remove')
}
</script>

<style scope lang="scss">
.expanded {
  height: 20em;
}

</style>