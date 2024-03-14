<template>
  <div class="pomopause">

    <v-btn class='btn bg-primary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.going"
      @click="emit('show-history')">
      <v-icon class="icon" icon="mdi-folder-clock-outline" />
    </v-btn>

    <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start'
      v-if="!pomodoro.going && !pomodoro.finishedPomoRecord?.shortPomo" @click="pomodoro.startPomodoro()">
      <span>{{ $t("pause.study") }}</span>
      <v-icon class="icon" icon="mdi-play" />
    </v-btn>

    <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start'
      v-if="!pomodoro.going && pomodoro.finishedPomoRecord?.shortPomo" @click="pomodoro.createPomodoro()">
      <span>{{ $t("backHome") }}</span>
      <v-icon class="icon" icon="mdi-home" />
    </v-btn>

  </div>
</template>
<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
const pomodoro = usePomodoroStore();

const emit = defineEmits<{
  (e: 'show-history'): void
}>();
</script>
<style scoped lang="scss">
.pomopause {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
}

.btn {
  font-size: 0.8rem;
  font-weight: bold;
}

.btn-main-start {
  width: auto;
  margin-left: 1em;
}
</style>