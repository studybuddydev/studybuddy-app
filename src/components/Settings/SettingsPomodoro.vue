<template>
  <div>
    <Info text="il testo sostanzioso per le info del timer" class="info-settings" />
    <div v-if="pomodoro.going">
      <v-alert variant="tonal" class="mb-5" type="warning">
        <div class="pomo-running-alert">
          <p>To modify the timer properties you must stop it first</p>
          <v-btn @click="pomodoro.stopPomodoro()" color="error" class="stop-btn">{{ $t("stop now") }}</v-btn>
        </div>
      </v-alert>
    </div>

    <div v-if="!pomodoro.going">
      <div class="pomo-presets">
        <div v-for="t in timerStore.timers"
          :class="`preset-box ${timerSelected === t.id ? 'bg-primary' : 'bg-background'}`" v-ripple @click="setTimerPreset(t)">
          {{ t.title }}</div>
      </div>

      <div class="text-h6">{{ selectedTimer.repetitions }} ripetizioni</div>
      <v-slider v-model="selectedTimer.repetitions" :min="1" :max="8" :step="1" thumb-label class="pr-4" :disabled="selectedTimer.freeMode"
        prepend-icon="mdi-tally-mark-5" />

      <div v-if="creatingPreset">
        <div class="text-h6">{{ creatingPreset.studyLength }} minuti di studio</div>
        <v-slider v-model="creatingPreset.studyLength" :min="1" :max="60" :step="1" thumb-label class="pr-4"
          prepend-icon="mdi-timer" />

        <div class="text-h6">{{ creatingPreset.breakLength }} minuti di pausa</div>
        <v-slider v-model="creatingPreset.breakLength" :min="1" :max="30" :step="1" thumb-label class="pr-4"
          prepend-icon="mdi-coffee" />



        <v-card-actions>
          <v-spacer />
          <v-btn variant="flat" color="primary" @click="savePreset()">Aggiungi</v-btn>
        </v-card-actions>

      </div>

      <v-expansion-panels>
        <v-expansion-panel title="Advanced">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="9">
                <div class="text-h6 text-bottom">
                  {{ $t("pause.timer.sessionOf") }}
                  {{ Math.floor(settingsStore.settings!.pomodoro!.totalLength / 60) }} {{ $t("pause.timer.hours") }} {{
                    settingsStore.settings!.pomodoro!.totalLength % 60 }} {{ $t("pause.timer.minutes") }}
                </div>
              </v-col>
              <v-col cols="3">
                <v-text-field v-model="endsAt" type="time" variant="underlined" dense :label='$t("pause.timer.endTime")'
                  :disabled="freeMode" />
              </v-col>
            </v-row>

            <v-slider v-model="settingsStore.settings!.pomodoro!.totalLength" :min="0" :max="240" :step="5" thumb-label
              :disabled="freeMode" class="pr-4" prepend-icon="mdi-timer">
              <template v-slot:thumb-label>
                {{ Math.floor(settingsStore.settings!.pomodoro!.totalLength / 60) }}h{{
                  settingsStore.settings!.pomodoro!.totalLength % 60 }}m
              </template>
            </v-slider>

            <div class="text-h6">{{ settingsStore.settings!.pomodoro!.breaksLength }} {{ $t("pause.timer.breaksLength")
            }}
            </div>
            <v-slider v-model="settingsStore.settings!.pomodoro!.breaksLength" :min="1" :max="60" :step="1" thumb-label
              :disabled="freeMode" class="pr-4" prepend-icon="mdi-coffee" />

            <div class="text-h6">{{ settingsStore.settings!.pomodoro!.numberOfBreak }}
              {{ $t("pause.timer.breaksNumber") }}</div>
            <v-slider v-model="settingsStore.settings!.pomodoro!.numberOfBreak" :min="0" :max="10" :step="1" thumb-label
              :disabled="freeMode" show-ticks="always" class="pr-4" prepend-icon="mdi-tally-mark-5" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
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


// creating preset
const creatingPreset = ref<Timer | null>(null);
function setCreatingPreset() {
  creatingPreset.value = {
    title: 'New preset',
    studyLength: 25,
    breakLength: 5,
    repetitions: 4,
    freeMode: false
  };
}
// watch(creatingPreset, (newValue) => {
//   if (newValue)
//     setTimer(newValue)
// }, { deep: true });
function savePreset() {
  if (creatingPreset.value) {
    timerStore.addTimer(creatingPreset.value);
    creatingPreset.value = null;
  }
}



const timerSelected = computed(() =>
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
  setTimer();
}
watch(selectedTimer, () => {
  setTimer();
}, { deep: true });

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
.pomo-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  place-items: center;
  margin: 1.5rem 0;
  cursor: pointer;

  .preset-box {
    display: grid;
    place-items: center;
    padding: 1rem;
    width: 100%;
    border-radius: 1rem;
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
}</style>