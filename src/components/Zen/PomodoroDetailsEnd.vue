<template>
  <div class="pomo-details-end blur blur-strong">
    <PomodoroDetails
      :pomo="pomo"
    />
    <div class="pomo-details-actions">
      <v-btn
        color="primary"
        class="pomo-edit-btn"
        variant="outlined"
        @click="emits('done')">Done</v-btn>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { type PomodoroRecord } from '@/types';
import PomodoroDetails from '../Pomodoro/PomodoroDetails.vue';
const props = defineProps<{ pomo: PomodoroRecord }>();
const emits = defineEmits<
  (e: 'done') => void
>()
</script>
<style scoped lang="scss">
.pomo-details-end {
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
}
.pomo-details-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin: 1rem 1rem 0 0;
}
</style>

