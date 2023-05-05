<template>
  <div class="footer-wrapper">
    <div class="footer">

      <div class="blocks-container" @click="nextStep()">
        <div class="progress" :style="{
          backgroundColor: theme.current.value.colors.secondary,
          color: theme.current.value.colors.surface,
          width: `${percentage}%`,
        }"> ⦿ </div>
        <div v-for="b in breaks" :key="b.start" class="break" :style="{
          backgroundColor: theme.current.value.colors.error,
          marginLeft: `${b.start}%`,
          width: `${b.lenght}%`,
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
  breakLength: number;
  totalLength: number;
}

const settings = ref<FlexSettings>({
  numberOfBreak: 3,
  breakLength: 5,
  totalLength: 2 * 60,
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
      return;
    }

    if (b.status === EBreakStatus.TODO) {
      b.start = percentage.value;
      b.status = EBreakStatus.DOING;
      return;
    }
  }
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
    border-radius: 0.5em;
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
        border-radius: 0.5em;
        text-align: right;
        line-height: 1em;
      }

      .break {
        position: absolute;
        opacity: 0.7;
      }

    }

  }
}
</style>