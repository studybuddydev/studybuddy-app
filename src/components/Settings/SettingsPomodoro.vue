<template>
  <div>
    <Info :text="$t('todo', 'il testo sostanzioso per le info del timer')" class="info-settings" />
    <div v-if="pomodoro.going">
      <v-alert variant="tonal" class="mb-5" type="warning">
        <div class="pomo-running-alert">
          <p>To modify the timer properties you must stop it first</p>
          <v-btn @click="pomodoro.stopPomodoro()" color="error" class="stop-btn">{{ $t("stop now") }}</v-btn>
        </div>
      </v-alert>
    </div>

    <div v-if="!pomodoro.going">
      <v-row>
        <v-col cols="12" sm="6" class="d-flex justify-space-around">
          <v-btn-toggle color="primary" group rounded="xl" variant="flat" v-model="modeSwitch">
            <v-btn value="free" class="bg-background">{{ $t("pause.timer.free") }}</v-btn>
            <v-btn value="classic" class="bg-background">{{ $t("pause.timer.classic") }}</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-space-around">
          <v-btn-toggle color="primary" group variant="flat" v-model="selectedPreset" :disabled="freeMode">
            <v-btn value="115-15-3" class="bg-background">25/5</v-btn>
            <v-btn value="110-10-1" class="bg-background">50/10</v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

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
    </div>

    <div class="text-h6 mt-10">{{ $t("pause.timer.volume") }}</div>
    <v-slider v-model="settingsStore.settings!.pomodoro!.soundVolume" :min="0" :max="100" :step="1" thumb-label
      class="pr-4" :prepend-icon="volumeIcon(settingsStore.settings!.pomodoro!.soundVolume)" />

  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import Info from '@/components/common/Info.vue'
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSettingsStore } from "@/stores/settings";
const settingsStore = useSettingsStore();
const pomodoro = usePomodoroStore();

//// ---- Volume
const volumeIcon = computed(() => ((volume: number) => {
  if (!volume) return 'mdi-volume-off';
  if (volume < 33) return 'mdi-volume-low';
  if (volume < 66) return 'mdi-volume-medium';
  return 'mdi-volume-high';
}))

// ----- ENDS AT
const time = ref(new Date().getTime());
setInterval(() => time.value = new Date().getTime(), 1000 * 60);
const endsAt = computed({
  get () {
    const date = new Date(time.value + settingsStore.settings!.pomodoro!.totalLength*60000);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },
  set (newValue) {
    const date = new Date();
    const [h, m] = newValue.split(':');
    date.setHours(+h);
    date.setMinutes(+m);

    const res = Math.floor((date.getTime() - Date.now()) / 1000 / 60);
    settingsStore.settings!.pomodoro!.totalLength = res < 0 ? res + (24 * 60) : res;
  }
});


// ----- PRESET
function presetPomo(totalLength = 2, breaksLength = 15, numberOfBreak = 3) {
  settingsStore.settings!.pomodoro!.totalLength = totalLength;
  settingsStore.settings!.pomodoro!.breaksLength = breaksLength;
  settingsStore.settings!.pomodoro!.numberOfBreak = numberOfBreak;
}
const selectedPreset = computed({
  get() { 
    return `${settingsStore.settings!.pomodoro!.totalLength}-${settingsStore.settings!.pomodoro!.breaksLength}-${settingsStore.settings!.pomodoro!.numberOfBreak}`;
  },
  set(value) {
    if (value) {
      const [totalLength, breaksLength, numberOfBreak] = value.split('-');
      presetPomo(+totalLength, +breaksLength, +numberOfBreak);
    }
    
  }
})


// ----- MODE
const modeSwitch = computed({
  get() { return settingsStore.settings!.pomodoro!.freeMode ? 'free' : 'classic'; },
  set(value) {
    if (value) settingsStore.settings!.pomodoro!.freeMode = value === 'free';
  }
});
const freeMode = computed(() => settingsStore.settings!.pomodoro!.freeMode);
</script>
<style lang="scss" scoped>

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