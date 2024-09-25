<template>
  <div class="px-6">
    <div v-if="pomodoro.going">
      <v-alert variant="tonal" class="mb-5" type="warning">
        <div class="pomo-running-alert">
          <p>{{ $t('pause.timer.stopFirst') }}</p>
          <v-btn @click="pomodoro.stopPomodoro()" color="error" class="stop-btn">{{ $t('pause.timer.stopNow') }}</v-btn>
        </div>
      </v-alert>
    </div>

    <div v-if="!pomodoro.going">
      <v-window v-model="step">
        <v-window-item :value="1" class="timer-settings">
          <div class="header">
            <div class="header-title">
              <p class="text-h6">{{ $t('pause.timer.chooseTimer') }}</p>
              <Info :text="$t('info.timer')" class="info-settings" />
            </div>
            <v-btn @click="setupNewTimer()" color="primary" variant="text" prepend-icon="mdi-plus">{{ $t('pause.timer.createNew') }}</v-btn>
          </div>

          <PomodoroPresets :deletable="true" />
          
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title class="bg-background advance-panel-closed">{{ $t('advanced') }}</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="9">
                    <p class="advance-settings-label">
                      {{ $t("pause.timer.sessionOf") }}
                      {{ Math.floor(settingsStore.settings!.pomodoro!.totalLength / 60) }} {{ $t("pause.timer.hours") }}
                      {{
                        settingsStore.settings!.pomodoro!.totalLength % 60 }} {{ $t("pause.timer.minutes") }}
                    </p>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="endsAt" type="time" variant="underlined" dense
                      :label='$t("pause.timer.endTime")' :disabled="freeMode" />
                  </v-col>
                </v-row>

                <v-slider v-model="settingsStore.settings!.pomodoro!.totalLength" :min="0" :max="240" :step="5" color="primary" 
                  thumb-label :disabled="freeMode" class="pr-4 primary-thumb" prepend-icon="mdi-timer">
                  <template v-slot:thumb-label>
                    {{ Math.floor(settingsStore.settings!.pomodoro!.totalLength / 60) }}h{{
                      settingsStore.settings!.pomodoro!.totalLength % 60 }}m
                  </template>
                </v-slider>

                <p class="advance-settings-label">{{ settingsStore.settings!.pomodoro!.breaksLength }} {{
                  $t("pause.timer.breaksLength")
                }}
                </p>
                <v-slider v-model="settingsStore.settings!.pomodoro!.breaksLength" :min="1" :max="60" :step="1"
                  thumb-label :disabled="freeMode" class="pr-4 primary-thumb" prepend-icon="mdi-coffee" color="primary"  />

                <p class="advance-settings-label">{{ settingsStore.settings!.pomodoro!.numberOfBreak }}
                  {{ $t("pause.timer.breaksNumber") }}</p>
                <v-slider v-model="settingsStore.settings!.pomodoro!.numberOfBreak" :min="0" :max="10" :step="1"
                  thumb-label :disabled="freeMode" show-ticks="always" class="pr-4 primary-thumb" prepend-icon="mdi-tally-mark-5" color="primary" /> 
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

        </v-window-item>
        <v-window-item :value="2" class="timer-settings">
          <div class="header">
            <v-btn @click="step = 1" color="primary" variant="text" prepend-icon="mdi-arrow-left">{{ $t('back') }}</v-btn>
            <v-btn @click="saveTimer()" color="primary">{{ $t('pause.timer.saveTimer') }}</v-btn>
          </div>

          <div v-if="newTimer" class="mt-6">

            <v-text-field :label="newTimerTitle" v-model="newTimer.title" />

            <div class="text-h6">{{ newTimer.studyLength }} {{ $t('pause.timer.studyLength') }}</div>
            <v-row align="center" class="mb-2">
              <v-col cols="9" >
                <v-slider v-model="newTimer.studyLength" :min="1" :max="60" :step="1" thumb-label hide-details
                  prepend-icon="mdi-timer" color="primary" class="primary-thumb" />
              </v-col>
              <v-col cols="3">
                <v-text-field v-model="newTimer.studyLength" :min="1" :max="60" type="number" hide-details />
              </v-col>
            </v-row>

            <div class="text-h6">{{ newTimer.breakLength }} {{ $t('pause.timer.breakLength') }}</div>
            <v-row align="center" class="mb-2">
              <v-col cols="9" >
                <v-slider v-model="newTimer.breakLength" :min="1" :max="30" :step="1" thumb-label hide-details
                  prepend-icon="mdi-coffee" color="primary" class="primary-thumb" />
              </v-col>
              <v-col cols="3">
                <v-text-field v-model="newTimer.breakLength" :min="1" :max="30" type="number" hide-details />
              </v-col>
            </v-row>

            <div class="text-h6">{{ newTimer.repetitions }} {{ $t('pause.timer.repetitions') }}</div>
            <v-row align="center" class="mb-2">
              <v-col cols="9">
                <v-slider v-model="newTimer.repetitions" :min="1" :max="8" :step="1" thumb-label hide-details
                  prepend-icon="mdi-tally-mark-5" color="primary" class="primary-thumb" />
              </v-col>
              <v-col cols="3">
                <v-text-field v-model="newTimer.repetitions" :min="1" :max="8" type="number" hide-details />
              </v-col>
            </v-row>
          </div>
        </v-window-item>
      </v-window>
    </div>

  </div>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import Info from '@/components/common/Info.vue'
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSettingsStore } from "@/stores/settings";
import { useTimerStore } from "@/stores/db/timer";
import type { Timer } from '@/types';
import PomodoroPresets from '@/components/Pomodoro/PomodoroPresets.vue';

const settingsStore = useSettingsStore();
const pomodoro = usePomodoroStore();
const timerStore = useTimerStore();

const step = ref(1);
const emit = defineEmits<{
  (e: 'hideDone', hide: boolean): void
}>()
watch(step, (val) => {
  emit('hideDone', val === 2);
});

// creating preset
const newTimer = ref<Timer | null>(null);
function setupNewTimer() {
  step.value = 2;
  newTimer.value = {
    title: '',
    studyLength: 25,
    breakLength: 5,
    repetitions: 4,
    freeMode: false
  };
}
function saveTimer() {
  if (newTimer.value) {
    if (!newTimer.value.title)
      newTimer.value.title = newTimerTitle.value;
    timerStore.addTimer(newTimer.value);
    // setTheme(newPreset.value);
    newTimer.value = null;
    step.value = 1;
  }
}

const newTimerTitle = computed(() =>
  newTimer.value?.title ? 'Title' : `${newTimer.value?.studyLength}/${newTimer.value?.breakLength}`
);

// ----- ENDS AT
const time = ref(new Date().getTime());
setInterval(() => time.value = new Date().getTime(), 1000 * 60);
const endsAt = computed({
  get() {
    const date = new Date(time.value + settingsStore.settings!.pomodoro!.totalLength * 60000);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },
  set(newValue) {
    const date = new Date();
    const [h, m] = newValue.split(':');
    date.setHours(+h);
    date.setMinutes(+m);

    const res = Math.floor((date.getTime() - Date.now()) / 1000 / 60);
    settingsStore.settings!.pomodoro!.totalLength = res < 0 ? res + (24 * 60) : res;
  }
});



const freeMode = computed(() => settingsStore.settings!.pomodoro!.freeMode);

</script>
<style lang="scss" scoped>
.timer-settings {
  .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.4em
    }
  }
}

.advance-panel-closed {
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.6);
}

.advance-settings-label {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0.5rem 0;
  line-height: 2rem;
  @media (max-width: 600px) {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

.pomo-running-alert {
  display: grid;

  .stop-btn {
    width: 9em;
    justify-self: right;
  }
}
</style>