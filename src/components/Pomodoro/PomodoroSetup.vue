<template>
  <div class="blur setup">
    <v-icon class="close-icon" icon="mdi-close" @click="emits('exit-setup')" />
    <h3 class="title text-primary">Setup Pomodoro</h3>
    <PomodoroDetails v-if="timerStatus.pomodoroStatus" :pomo="timerStatus.pomodoroStatus" />
  </div>
</template>

<script setup lang="ts">
import PomodoroDetails from '../Pomodoro/PomodoroDetails.vue';
import { useTimerStatusStore } from "@/stores/api/timerStatus";
const timerStatus = useTimerStatusStore();
const emits = defineEmits<{ (e: 'exit-setup'): void }>();
</script>

<style scoped lang="scss">
.setup {
  border-radius: 1rem;
  padding: 1rem;
  position: relative;

  .close-icon {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1em;
  }

  .title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
  }
}
</style>