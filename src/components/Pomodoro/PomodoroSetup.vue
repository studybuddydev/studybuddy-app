<template>
  <div class="blur blur-strong setup">
    <div class="top-icon back-icon"  @click="emits('exit-setup')"><v-icon icon="mdi-arrow-left" /></div>
    <Info class="top-icon info-icon" :text="$t('info.setup')" />

    <!-- <v-icon class="top-icon info" icon="mdi-arrow-left" @click="emits('exit-setup')" /> -->
    <h3 class="title text-primary">Setup Pomodoro</h3>
    <PomodoroDetails v-if="timerStatus.pomodoroStatus" :pomo="timerStatus.pomodoroStatus" />
  </div>
</template>

<script setup lang="ts">
import PomodoroDetails from '../Pomodoro/PomodoroDetails.vue';
import { useTimerStatusStore } from "@/stores/api/timerStatus";
import Info from '@/components/common/Info.vue';

const timerStatus = useTimerStatusStore();
const emits = defineEmits<{ (e: 'exit-setup'): void }>();
</script>

<style scoped lang="scss">
.setup {
  border-radius: 1rem;
  padding: 1rem;
  position: relative;

  .top-icon {
    position: absolute;
    top: 0;
    padding: 1em;
  }
  .back-icon {
    left: 0;
    padding: 1em;
    cursor: pointer;
  }
  .info-icon {
    right: 0;
  }

  .title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
  }
}
</style>