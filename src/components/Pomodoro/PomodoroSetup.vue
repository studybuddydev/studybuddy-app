<template>
  <div class="blur blur-strong setup">
    <div class="top-icon back-icon"  @click="emits('exit-setup')"><v-icon icon="mdi-arrow-left" /></div>
    <Info class="top-icon info-icon" :text="$t('info.setup')" />

    <!-- <v-icon class="top-icon info" icon="mdi-arrow-left" @click="emits('exit-setup')" /> -->
    <h3 class="title text-primary">Setup Pomodoro</h3>
    <PomodoroPresets :top3="true" class="presets"
     @open-settings-tab="emits('open-settings-tab', $event)"
    />
    <PomodoroDetails class="details" v-if="timerStatus.pomodoroStatus" :pomo="timerStatus.pomodoroStatus" />
  </div>
</template>

<script setup lang="ts">
import PomodoroDetails from '../Pomodoro/PomodoroDetails.vue';
import { useTimerStatusStore } from "@/stores/api/timerStatus";
import Info from '@/components/common/Info.vue';
import PomodoroPresets from '@/components/Pomodoro/PomodoroPresets.vue';

const timerStatus = useTimerStatusStore();
const emits = defineEmits<{
  (e: 'exit-setup'): void,
  (e: 'open-settings-tab', value: string): void
}>();
</script>

<style scoped lang="scss">
.setup {
  border-radius: 1rem;
  padding: 1rem;
  position: relative;
  width: 500px;

  @media (max-width: 850px) {
    width: 100%;
  }

  .details {
    width: 100%;
  }
  .presets {
    margin: 2rem 1rem 1rem;
  }

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
    position: absolute;
    right: 0;
  }

  .title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
  }
}
</style>