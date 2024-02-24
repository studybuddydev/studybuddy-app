<template>
  <v-dialog>
    <v-card>
      <v-card-title>
        <v-icon>mdi-clock-time-four-outline</v-icon>
        <span>Still Watching?</span>
      </v-card-title>
      <v-card-text>
        <p>Are you still watching?</p>
      </v-card-text>
      <v-card-actions>
        <v-btn>Yes</v-btn>
        <v-btn>No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup lang="ts">
import { usePomodoroStore } from '@/stores/pomodoro';
const pomodoro = usePomodoroStore();
</script>