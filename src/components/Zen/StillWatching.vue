<template>
  <v-dialog v-model="pomodoro.longAwaitPopup">
    <v-card>
      <v-card-title>
        <v-icon>mdi-clock-time-four-outline</v-icon>
        <span>You left a timer running?</span>
      </v-card-title>
      <v-card-text>
        <p>Do you want to continue it?</p>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="continuePomodoro()">Continue</v-btn>
        <v-btn @click="stopPomodoro()">Don't continue</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script lang="ts" setup>
import { usePomodoroStore } from '@/stores/pomodoro';
const pomodoro = usePomodoroStore();

function continuePomodoro() {
  pomodoro.resumePomodoro();
  pomodoro.longAwaitPopup = false;
}

function stopPomodoro() {
  pomodoro.stopAtLastInteraction();
  pomodoro.longAwaitPopup = false;
}


</script>