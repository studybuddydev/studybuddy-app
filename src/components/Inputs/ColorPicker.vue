<template>
  <v-select :label="$t('color')"
    :items="colorList" item-title="title" item-value="color"
    :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" >
  <template v-slot:item="{ props: item }">
    <v-icon class="ma-1 pa-2" v-bind="(item as any)" :color="item.value">mdi-circle</v-icon>
  </template>
  <template v-slot:prepend>
    <v-icon :color="modelValue">mdi-circle</v-icon>
  </template>
</v-select>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string | undefined,
}>(), {})
const emit = defineEmits(['update:modelValue'])

const colorList = [
  { color: 'purple', title: 'Purple' },
  { color: 'pink', title: 'Pink' },
  { color: 'indigo', title: 'Indigo' },
  { color: 'blue', title: 'Blue' },
  { color: 'teal', title: 'Teal' },
  { color: 'green', title: 'Green' },
  { color: 'orange', title: 'Orange' },
  { color: 'deep-orange', title: 'Deep Orange' },
  { color: 'brown', title: 'Brown' },
  { color: 'grey', title: 'Grey' },
  { color: 'blue-grey', title: 'Blue Grey' },
  { color: 'black', title: 'Black' },
  { color: 'white', title: 'White' },
];


</script>