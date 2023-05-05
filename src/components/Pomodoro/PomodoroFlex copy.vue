<template>
  <div class="footer-wrapper">
    <div class="footer">

      <div class="blocks-container" @click="nextStep()">
        <div class="progress" :style="{
          backgroundColor: theme.current.value.colors.secondary,
          color: theme.current.value.colors.surface,
          width: `${percentage}%`,
        }"></div>
        <div v-for="b in pastBreaks" :key="b.start" class="break" :style="{
          backgroundColor: theme.current.value.colors.error,
          marginLeft: `${b.start}%`,
          width: `${b.lenght}%`,
        }"></div>
        <div v-for="index in settings.numberOfBreak" :key="index" class="break" :style="{
          backgroundColor: theme.current.value.colors.error,
          marginLeft: `${breaksMargins[index - 1]}%`,
          width: `${index === 1 ? settings.breakLenght + youAreTakingTooMuchBreak : settings.breakLenght}%`,
        }"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify'
const theme = useTheme();

const BREAKS_MOVES = false;

type FlexSettings = {
  numberOfBreak: number;
  breakLenght: number;
}

const settings = ref<FlexSettings>({
  numberOfBreak: 5,
  breakLenght: 5,
});

const percentage = ref(0);
const studyTime = ref(0);
const isBreak = ref<null | number>(null);
const studyPeriodStartedFrom = ref(0);
const youAreTakingTooMuchBreak = ref(0);
const breaskDone = ref(0);

const pastBreaks = ref<{ start: number, lenght: number }[]>([]);

// start
studyTime.value = getStudyTime();
setInterval(() => {
  if (percentage.value < 100)
    percentage.value += 0.05;

  if (isBreak.value) {
    const breakTime = percentage.value - isBreak.value - settings.value.breakLenght;
    if (breakTime > 0) {
      youAreTakingTooMuchBreak.value = breakTime;
    }
  }
}, 25);


const breaksMargins = computed(() => {
  if (BREAKS_MOVES) {
    // Breaks moves to have study time equally distributed
    return computeBreaksMargins()
  } else {
    const timeToFirtBreak = isBreak.value ?? Math.max(percentage.value, initialMargins[breaskDone.value]);
    const r = [ timeToFirtBreak ];

    let count = 1;
    for (let i = breaskDone.value + 1; i < settings.value.numberOfBreak + 1; i++) {
      if (isBreak.value === null) {
        const t = Math.max(percentage.value + (settings.value.breakLenght * (breaskDone.value + count++)), initialMargins[i])
        r.push(t)
      }
    }
    return r;
  }

})

function computeBreaksMargins() {
  const timeToFirstBreak = isBreak.value ?? Math.max(percentage.value, studyTime.value + studyPeriodStartedFrom.value)
  const r = [ timeToFirstBreak ];

  const usedTime = timeToFirstBreak + (settings.value.breakLenght * settings.value.numberOfBreak) + youAreTakingTooMuchBreak.value;
  const studyTimeRelative = (100 - usedTime) / (settings.value.numberOfBreak);

  for (let i = 1; i < settings.value.numberOfBreak + 1; i++) {
    r.push(timeToFirstBreak + (settings.value.breakLenght * i) + (studyTimeRelative * i) + youAreTakingTooMuchBreak.value)
  }
  return r;
}

const initialMargins = computeBreaksMargins();

function nextStep() {
  if (isBreak.value === null) {
    startBreak()
  } else {
    stopBreak();
  }
}

function startBreak() {
  isBreak.value = percentage.value;
}

function stopBreak() {

  pastBreaks.value.push({
    start: isBreak.value ?? 0,
    lenght: percentage.value - (isBreak.value ?? 0),
  });

  isBreak.value = null;
  settings.value.numberOfBreak -= 1;
  studyPeriodStartedFrom.value = percentage.value;
  youAreTakingTooMuchBreak.value = 0;
  breaskDone.value += 1;

  if (BREAKS_MOVES) studyTime.value = getStudyTime();
}

function getStudyTime() {
  return ((100 -  percentage.value) - (settings.value.breakLenght * settings.value.numberOfBreak)) / (settings.value.numberOfBreak + 1);
}


</script>


<style lang="scss">
.footer-wrapper {
  padding: 0.4em 0.5em;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  
  .footer {
    height: 1em;
    border-radius: 1em;
    background-color: #222;
    filter: drop-shadow(0 0 0.2em #000);
    overflow: hidden;

    .blocks-container {
      display: flex;
      align-items: center;

      .breaks-container {
        display: flex;
        justify-content: space-between;
      }


      .break, .progress {
        height: 1em;
      }

      .break {
        position: absolute;
        opacity: 0.7;
      }

    }

  }
}
</style>