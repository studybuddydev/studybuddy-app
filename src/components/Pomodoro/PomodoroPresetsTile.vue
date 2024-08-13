<template>
  <div v-for="t in timers" :class="`preset-box ${(timerSelected === t.id) ? 'bg-primary' : 'bg-background'}`" v-ripple
    @mouseleave="deleteTimer(undefined)" @click="setTimerPreset(t)">
    <v-icon v-if="deletable" size="x-small" icon="mdi-delete" @click.stop="deleteTimer(t.id)" class="btn-card"
      :color="deletingTimer === t.id ? 'red' : undefined" />
    <v-icon v-else size="x-small" icon="mdi-cog" @click.stop="emit('open-settings-tab', 'pomodoro')" class="btn-card" />

    <div class="timer-card front">
      <p class="timer-title">{{ t.title }} </p>
    </div>
    <div class="timer-card back" v-if="!t.freeMode">
      <p class="timer-info">{{ t.studyLength }} {{ $t('pause.timer.studyMinShort') }}</p>
      <p class="timer-info">{{ t.breakLength }} {{ $t('pause.timer.breakMinShort') }}</p>
      <p class="timer-info">{{ t.repetitions }} {{ $t('pause.timer.repetitions') }}</p>
    </div>
    <div class="timer-card back" v-else>
      <p class="timer-info timer-info-freemode">{{ $t('pause.timer.freeMode') }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useTimerStore } from "@/stores/db/timer";
import { useSettingsStore } from "@/stores/settings";
import type { Timer } from '@/types';
const settingsStore = useSettingsStore();
const timerStore = useTimerStore();
const emit = defineEmits<{
  (e: 'open-settings-tab', value: string): void
}>();
const props = defineProps<{
  timers: Timer[],
  deletable?: boolean,
}>()


const timerSelected = computed(() => timerStore.selectedTimerId ??
  timerStore.timers.find(timer => {
    const numberOfBreak = timer.repetitions - 1;
    const breaksLength = timer.breakLength * numberOfBreak;
    const totalLength = (timer.studyLength * timer.repetitions) + breaksLength;

    return (
      settingsStore.settings!.pomodoro!.totalLength === totalLength
      && settingsStore.settings!.pomodoro!.breaksLength === breaksLength
      && settingsStore.settings!.pomodoro!.numberOfBreak === numberOfBreak
    );
  })?.id
);

const selectedTimer = ref<Timer>({
  title: '',
  studyLength: settingsStore.settings!.pomodoro!.totalLength - settingsStore.settings!.pomodoro!.breaksLength,
  breakLength: settingsStore.settings!.pomodoro!.breaksLength / settingsStore.settings!.pomodoro!.numberOfBreak,
  repetitions: settingsStore.settings!.pomodoro!.numberOfBreak + 1,
  freeMode: settingsStore.settings!.pomodoro!.freeMode
});
function setTimerPreset(timer: Timer) {
  selectedTimer.value.breakLength = timer.breakLength;
  selectedTimer.value.studyLength = timer.studyLength;
  selectedTimer.value.repetitions = timer.repetitions;
  selectedTimer.value.freeMode = timer.freeMode;
  timerStore.selectedTimerId = timer.id ?? null;
  setTimer();
}
function setTimer() {
  const numberOfBreak = selectedTimer.value.repetitions - 1;
  const breaksLength = selectedTimer.value.breakLength * numberOfBreak;
  const totalLength = (selectedTimer.value.studyLength * selectedTimer.value.repetitions) + breaksLength;

  settingsStore.settings!.pomodoro!.totalLength = totalLength;
  settingsStore.settings!.pomodoro!.breaksLength = breaksLength;
  settingsStore.settings!.pomodoro!.numberOfBreak = numberOfBreak;
  settingsStore.settings!.pomodoro!.freeMode = selectedTimer.value.freeMode;
}

const deletingTimer = ref<number | null>(null);
function deleteTimer(id: number | undefined) {
  if (id === undefined) {
    deletingTimer.value = null;
    return;
  }

  if (deletingTimer.value === id) {
    deletingTimer.value = null;
    timerStore.deleteTimer(id);
  } else {
    deletingTimer.value = id;
  }
}
</script>
<style lang="scss" scoped>
.preset-box {
  border-radius: 1rem;
  width: 100%;
  height: 5rem;
  position: relative !important;

  .btn-card {
    display: none;
    position: absolute;
    bottom: 5px;
    right: 5px;
    opacity: 0.7;
  }

  .timer-card {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .front {
    display: flex;
  }

  .back {
    display: none;

  }

  @media (hover: hover) {
    &:hover {
      border: 2px solid rgb(var(--v-theme-primary));

      .front {
        display: none;
      }

      .back {
        display: flex;
      }

      .btn-card {
        display: block;

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  p {
    text-align: center;
    width: 100%;

    &.timer-title {
      font-size: 1.1rem;
      line-height: 1.1rem;
      font-weight: 500;
    }

    &.timer-info {
      font-size: 0.8rem;
      text-wrap: nowrap;

      &.timer-info-freemode {
        text-wrap: wrap;
      }
    }
  }
}

.add-box {
  grid-column-start: 1;
  grid-column-end: 4;
  padding: 0;

  .add-btn {
    width: 100%;
    height: 3rem;
    border-radius: 1rem;
  }
}
</style>