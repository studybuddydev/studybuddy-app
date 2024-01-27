<script setup lang="ts">
import { ref } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import type { PomodoroRecord } from '@/types';

const pomodoro = usePomodoroStore();
</script>
<template>
  <div v-for="p in pomodoro.pomodoroRecords">
    <p>{{ p }}</p>
  </div>
</template>