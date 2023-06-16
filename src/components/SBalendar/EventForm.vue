<template>
  <v-card width="450" elevation="10" class="pa-4">
  <form class="pa-4">
    <v-row>
      <v-col cols="12" class="py-0 px-2"><v-text-field v-model="event.title" label="Nome" autofocus /></v-col>
    </v-row>
    <v-row>
      <v-col cols="3" class="py-0 px-2"><v-text-field v-model="event.start.hour" label="Ore" type="number" min="0" max="23" /></v-col>
      <v-col cols="3" class="py-0 px-2"><v-text-field v-model="event.start.minute" label="Minuti" type="number" step="15" min="0" max="59" /></v-col>
      <v-col cols="6" class="py-0 px-2"><v-text-field v-model="event.length" label="Durata [m]" type="number" step="15" min="0" max="1440" /></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="py-0 px-2"><ColorPicker v-model="event.color" /></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="py-0 px-2"><v-textarea  v-model="event.description" label="Note" rows="2" /></v-col>
    </v-row>
  </form>
    
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn color="error" variant="flat" @click="emits('delete')"> <v-icon icon="mdi-delete"/></v-btn>
  </v-card-actions>
</v-card>
</template>
<script setup lang="ts">
import type { Event } from '@/types';
import ColorPicker from '../Inputs/ColorPicker.vue';

const props = defineProps<{
  event: Event,
}>();
const emits = defineEmits<
  (e: 'delete') => void
>()
</script>