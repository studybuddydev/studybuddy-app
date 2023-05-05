<template>
  <div class="pomodoro">

    <div class="controls bg-primary">
      <div class="status">{{status}}</div>
      <v-btn
        :icon="isBreak ? 'mdi-play' : 'mdi-pause'"
        variant="text" size="small"
        @click="nextStep()"
      ></v-btn>
    </div>

    <div class="progress-bar">

      <div class="blocks-container">
        <div class="progress" :style="{
          backgroundColor: theme.current.value.colors.secondary,
          color: theme.current.value.colors.surface,
          width: `${percentage}%`,
        }"> <v-icon icon="mdi-school" size="x-small" /> ⦿ </div>
        <div v-for="b in breaks" :key="b.start" class="break" :style="{
          backgroundColor: theme.current.value.colors.error,
          marginLeft: `${b.start}%`,
          width: `${b.lenght}%`,
        }"><v-icon size="x-small" icon="mdi-food-apple" /></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify'
const theme = useTheme();

type FlexSettings = {
  numberOfBreak: number;
  breakLength: number;
  totalLength: number;
}

const settings = ref<FlexSettings>({
  numberOfBreak: 3,
  breakLength: 2,
  totalLength: 1 * 30,
});


enum EBreakStatus {
  DONE,
  DOING,
  TODO,
}

type Break = {
  start: number;
  lenght: number;
  status: EBreakStatus;
}

const startMs = Date.now();
const breakLengthPercentage = computed(() => settings.value.breakLength / settings.value.totalLength * 100);

const isBreak = ref(false);
const status = ref('STUDIA!');
const breaks = ref<Break[]>(generateBreaks());
const percentage = ref(0);
setInterval(() => {
  const now = Date.now();
  percentage.value = (now - startMs) / (settings.value.totalLength * 10);
  if (percentage.value > 100)
    percentage.value = 100;
  updateBreaks();
}, 15);


function updateBreaks() {

  let capoTreno = percentage.value;

  for (let i = 0; i < breaks.value.length; i++) {
    const b = breaks.value[i];
    if (b.status === EBreakStatus.DOING) {

      const itHasBeingGoingFor = percentage.value - b.start;
      if (b.lenght < itHasBeingGoingFor) {
        b.lenght = itHasBeingGoingFor;
      } else {
        capoTreno = b.start + b.lenght;
      }

    } else if (b.status === EBreakStatus.TODO) {

      if (b.start < capoTreno) {
        const prev = breaks.value[i - 1];
        if (prev && prev.status !== EBreakStatus.DONE) {
          // JOIN
          prev.lenght = b.start - prev.start + b.lenght;
          breaks.value.splice(i, 1);
          i--;
        } else {
          b.start = capoTreno;
          capoTreno = b.start + b.lenght;
        }
      }
    }
  }
}


function generateBreaks(): Break[] {
  const totalBreakTime = breakLengthPercentage.value * settings.value.numberOfBreak;
  const leftTime = 100 - totalBreakTime;
  
  const studyTime = leftTime / (settings.value.numberOfBreak + 1);

  return new Array(settings.value.numberOfBreak).fill(0).map((_, i) => ({
    start: studyTime * (i + 1) + (breakLengthPercentage.value * i),
    lenght: breakLengthPercentage.value,
    status: EBreakStatus.TODO
  }));
}

function nextStep() {
  for (const b of breaks.value) {
    if (b.status === EBreakStatus.DOING) {
      b.lenght = percentage.value - b.start;
      b.status = EBreakStatus.DONE;
      isBreak.value = false;
      status.value = 'STUDIA!';
      return;
    }

    if (b.status === EBreakStatus.TODO) {
      b.start = percentage.value;
      b.status = EBreakStatus.DOING;

      isBreak.value = true;
      status.value = 'Relax';
      return;
    }
  }
}


</script>


<style lang="scss">
.pomodoro {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  display: flex;
  width: 100%;
  align-items: center;

  .controls, .progress-bar {
    border-radius: 0.5em;
    overflow: hidden;
    margin: 0.4em 0.5em;
  }

  .controls {
    display: flex;
    width: calc(256px - 2em);
    margin: 0.3em 1em;
    align-items: center;

    .status {
      flex-grow: 1;
      padding: 0 1em;
    }

    .control {
    }

  }
  
  .progress-bar {
    height: 1em;
    background-color: #222;
    filter: drop-shadow(0 0 0.2em #000);
    flex-grow: 1;

    .blocks-container {
      display: flex;
      align-items: center;

      .breaks-container {
        display: flex;
        justify-content: space-between;
      }


      .break, .progress {
        height: 1em;
        border-radius: 0.5em;
        line-height: 1em;
      }

      .break {
        position: absolute;
        opacity: 0.7;
        text-align: center;
      }
      
      .progress {
        text-align: right;
      }

    }

  }
}
</style>