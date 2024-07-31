<template>
  <div :class="`pomo-presets ${top3 ? 'top3' : ''}`">
    <div class="arrow" v-ripple @click="decreasePage()" v-if="top3"><v-icon icon="mdi-chevron-left"
        :disabled="page === 0" /></div>
    <PomodoroPresetsTile :timers="timers" :deletable="deletable"
      @open-settings-tab="emit('open-settings-tab', $event)" />
    <div class="arrow" v-ripple @click="increasePage()" v-if="top3"><v-icon icon="mdi-chevron-right"
        :disabled="timerStore.timers?.length! <= (page + 1) * 3" /></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useTimerStore } from "@/stores/settings/timer";
import PomodoroPresetsTile from './PomodoroPresetsTile.vue';

const timerStore = useTimerStore();
const emit = defineEmits<{
  (e: 'open-settings-tab', value: string): void
}>();
const props = defineProps<{
  deletable?: boolean,
  top3?: boolean
}>()
const timers = computed(() => props.top3 ? timerStore.timers.slice(page.value * 3, (page.value + 1) * 3) : timerStore.timers);
const page = ref(0);

function increasePage() {
  if (timerStore.timers?.length! > (page.value + 1) * 3) {
    page.value++;
  }
}
function decreasePage() {
  if (page.value > 0) {
    page.value--;
  }
}
</script>
<style lang="scss" scoped>
.pomo-presets {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
  cursor: pointer;
  overflow-x: auto;
  overflow-y: hidden;


  &.top3 {
    grid-template-columns: 1.5rem 1fr 1fr 1fr 1.5rem;
  }

  .arrow {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:first-child {
      border-radius: 0.5rem;
    }

    &:last-child {
      border-radius: 0.5rem;
      grid-column-start: 5;
    }
  }

  @media screen and (max-width: 850px) {
    &.top3 {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .arrow {
      display: none;
    }

  }

}
</style>