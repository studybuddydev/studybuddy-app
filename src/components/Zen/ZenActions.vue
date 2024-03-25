<template>
  <div class="pomopause">

    <v-badge v-if="sink.itemsCount > 0" :content="sink.itemsCount" color="secondary">
      <v-btn class='btn bg-primary pomo-btn pomo-box btn-main-start'
        v-if="!pomodoro.going"
        @click="sink.toggleSink()">
        <v-icon class="icon" icon="mdi-faucet" />
      </v-btn>
    </v-badge>

    <v-btn class='btn bg-primary pomo-btn pomo-box font-press btn-main-start'
      v-if="!pomodoro.going && !pomodoro.settingUp"
      @click="emit('show-history')">
      <v-icon class="icon" icon="mdi-folder-clock-outline" />
    </v-btn>

    <v-btn class='btn bg-accent pomo-btn pomo-box font-press btn-main-start'
      v-if="!pomodoro.going && !pomodoro.finishedPomoRecord?.shortPomo && !pomodoro.settingUp" @click="pomodoro.createPomodoro(); pomodoro.setup()">
      <span>{{ $t("pause.study") }}</span>
      <v-icon class="icon" icon="mdi-play" />
    </v-btn>

    <v-btn class='btn bg-accent pomo-btn pomo-box font-press btn-main-start'
      v-if="pomodoro.settingUp" @click="pomodoro.startPomodoro()">
      <span>{{ $t("pause.study") }}</span>
      <v-icon class="icon" icon="mdi-play" />
    </v-btn>

    <v-btn class='btn bg-accent pomo-btn pomo-box font-press btn-main-start'
      v-if="!pomodoro.going && pomodoro.finishedPomoRecord?.shortPomo" @click="pomodoro.createPomodoro()">
      <span>{{ $t("backHome") }}</span>
      <v-icon class="icon" icon="mdi-home" />
    </v-btn>

  </div>
</template>
<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSinkStore } from "@/stores/sink";
const pomodoro = usePomodoroStore();
const sink = useSinkStore();

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