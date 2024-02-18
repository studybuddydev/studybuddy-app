<template>
  <div>
    <Info :text="$t('info.timer')" class="info-settings" />
    <div v-if="pomodoro.going">
      <v-alert variant="tonal" class="mb-5" type="warning">
        <div class="pomo-running-alert">
          <p>To modify the timer properties you must stop it first</p>
          <v-btn @click="pomodoro.stopPomodoro()" color="error" class="stop-btn">{{ $t("stop now") }}</v-btn>
        </div>
      </v-alert>
    </div>

    <div v-if="!pomodoro.going">
      <v-window v-model="step">
        <v-window-item :value="1" class="timer-settings">
          <div class="header">
            <div class="text-h6">Choose a timer</div>
            <v-btn @click="setupNewTimer()" color="primary" variant="text" prepend-icon="mdi-plus">Create new</v-btn>
          </div>

          <div class="pomo-presets">
            <div v-for="t in timerStore.timers"
              :class="`preset-box ${(timerSelected === t.id) ? 'bg-primary' : 'bg-background'}`" v-ripple
              @click="setTimerPreset(t)">
              <v-icon size="x-small" icon="mdi-delete" @click.stop="timerStore.deleteTimer(t.id)" class="btn-delete" />

              <div class="timer-card front">
                <p class="timer-title">{{ t.title }}</p>
              </div>
              <div class="timer-card back" v-if="!t.freeMode">
                <p class="timer-info">{{ t.studyLength }} min studio</p>
                <p class="timer-info">{{ t.breakLength }} min pausa</p>
                <p class="timer-info">{{ t.repetitions }} ripetizioni</p>
              </div>
              <div class="timer-card back" v-else>
                <p class="timer-info">Studia e riposati con i tuoi ritmi</p>
              </div>

            </div>
          </div>

          <v-expansion-panels>
            <v-expansion-panel title="Advanced">
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="9">
                    <div class="text-h6 text-bottom">
                      {{ $t("pause.timer.sessionOf") }}
                      {{ Math.floor(settingsStore.settings!.pomodoro!.totalLength / 60) }} {{ $t("pause.timer.hours") }}
                      {{
                        settingsStore.settings!.pomodoro!.totalLength % 60 }} {{ $t("pause.timer.minutes") }}
                    </div>
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

                <div class="text-h6">{{ settingsStore.settings!.pomodoro!.breaksLength }} {{
                  $t("pause.timer.breaksLength")
                }}
                </div>
                <v-slider v-model="settingsStore.settings!.pomodoro!.breaksLength" :min="1" :max="60" :step="1"
                  thumb-label :disabled="freeMode" class="pr-4 primary-thumb" prepend-icon="mdi-coffee" color="primary"  />

                <div class="text-h6">{{ settingsStore.settings!.pomodoro!.numberOfBreak }}
                  {{ $t("pause.timer.breaksNumber") }}</div>
                <v-slider v-model="settingsStore.settings!.pomodoro!.numberOfBreak" :min="0" :max="10" :step="1"
                  thumb-label :disabled="freeMode" show-ticks="always" class="pr-4 primary-thumb" prepend-icon="mdi-tally-mark-5" color="primary" /> 
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

        </v-window-item>
        <v-window-item :value="2" class="timer-settings">
          <div class="header">
            <v-btn @click="step = 1" color="primary" variant="text" prepend-icon="mdi-arrow-left">Back</v-btn>
            <v-btn @click="saveTimer()" color="primary">Save timer</v-btn>
          </div>

          <div v-if="newTimer" class="mt-6">

            <v-text-field :label="newTimerTitle" v-model="newTimer.title" />

            <div class="text-h6">{{ newTimer.studyLength }} minuti di studio</div>
            <v-row align="center" class="mb-2">
              <v-col cols="9" >
                <v-slider v-model="newTimer.studyLength" :min="1" :max="60" :step="1" thumb-label hide-details
                  prepend-icon="mdi-timer" color="primary" class="primary-thumb" />
              </v-col>
              <v-col cols="3">
                <v-text-field v-model="newTimer.studyLength" :min="1" :max="60" type="number" hide-details />
              </v-col>
            </v-row>

            <div class="text-h6">{{ newTimer.breakLength }} minuti di pausa</div>
            <v-row align="center" class="mb-2">
              <v-col cols="9" >
                <v-slider v-model="newTimer.breakLength" :min="1" :max="30" :step="1" thumb-label hide-details
                  prepend-icon="mdi-coffee" color="primary" class="primary-thumb" />
              </v-col>
              <v-col cols="3">
                <v-text-field v-model="newTimer.breakLength" :min="1" :max="30" type="number" hide-details />
              </v-col>
            </v-row>

            <div class="text-h6">{{ newTimer.repetitions }} ripetizioni</div>
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
import { useTimerStore } from "@/stores/settings/timer";
import type { Timer } from '@/types';
const settingsStore = useSettingsStore();
const pomodoro = usePomodoroStore();
const timerStore = useTimerStore();

const step = ref(1);


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
  newTimer.value?.title ? 'Title' : `${newTimer.value?.studyLength}\\${newTimer.value?.breakLength}`
);



const timerSelected = computed(() => selectedTimerId.value ??
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


// selection
const selectedTimerId = ref<number | null>(null);
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
  selectedTimerId.value = timer.id ?? null;
  setTimer();
}
// watch(selectedTimer, () => {
//   setTimer();
// }, { deep: true });

function setTimer() {
  const numberOfBreak = selectedTimer.value.repetitions - 1;
  const breaksLength = selectedTimer.value.breakLength * numberOfBreak;
  const totalLength = (selectedTimer.value.studyLength * selectedTimer.value.repetitions) + breaksLength;

  settingsStore.settings!.pomodoro!.totalLength = totalLength;
  settingsStore.settings!.pomodoro!.breaksLength = breaksLength;
  settingsStore.settings!.pomodoro!.numberOfBreak = numberOfBreak;
  settingsStore.settings!.pomodoro!.freeMode = selectedTimer.value.freeMode;
}
const freeMode = computed(() => settingsStore.settings!.pomodoro!.freeMode);

</script>
<style lang="scss" scoped>
.timer-settings {

  .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
}

.pomo-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  place-items: center;
  margin: 1.5rem 0;
  cursor: pointer;

  .preset-box {
    border-radius: 1rem;
    width: 100%;
    height: 5rem;
    position: relative !important;

    .btn-delete {
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

        .btn-delete {
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
}

.info-settings {
  top: 64px;
  right: 0;
  margin: 1rem;
}

.text-bottom {
  display: flex;
  align-items: center;
  height: 100%;
}

.pomo-running-alert {
  display: grid;

  .stop-btn {
    width: 9em;
    justify-self: right;
  }
}
</style>