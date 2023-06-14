<template>
  <div class="day-box">

    <p class="day">{{ date.getDate() }}</p>

    <div>
      <p v-for="d in deadlines">{{ d.name }}</p>
      <p v-for="e in events">{{ e.title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deadline, Event } from '@/types'
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useStateStore } from "@/stores/state";
const state = useStateStore();

const props = defineProps<{
  modelValue: string,
  dayId: string,
  date: Date,
  events: Event[]
  deadlines: Deadline[]
}>();
const emit = defineEmits(['update:modelValue'])

function updateModelValue(value: string) {
  emit('update:modelValue', value)
}

</script>
<style lang="scss" scoped>
.day-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 6em;
  border: 1px solid rgba($color: #FFFFFF, $alpha: 0.5);
  padding: 5px;
  overflow-y: auto;

  .day {
    background-color: #FFFFFF10;
    border-radius: 50%;
    width: 2em;
    height: 2em;
    text-align: center;
    line-height: 2em;

  }
}
</style>
