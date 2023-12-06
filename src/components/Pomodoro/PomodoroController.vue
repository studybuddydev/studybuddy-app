<template>
  <v-btn :class="pomodoro.itsTimeToBreak || pomodoro.itsFinished
    ? 'btn bg-secondary'
    : 'btn bg-secondary small'
    " icon="mdi-check-circle" @click="btnClick()">
    <div class="btn-content">
      <!-- end pomo-->

      <v-icon v-if="pomodoro.itsFinished" class="icon">mdi-stop</v-icon>

      <!-- start first time-->
      <div v-else-if="pomodoro.status.interval === null" class="icon-text">
        <span>{{ $t("pause.study") }}</span>
        <v-icon class="icon">mdi-skip-next</v-icon>
      </div>

      <!-- study -->
      <div v-else-if="pomodoro.status.isBreak && pomodoro.status.interval" class="icon-text">
        <span>{{ $t("pause.study") }}</span>
        <v-icon class="icon">mdi-play</v-icon>

      </div>

      <!-- pause-->
      <v-icon v-else class="icon">mdi-pause</v-icon>
    </div>
  </v-btn>
</template>

<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
const pomodoro = usePomodoroStore();
const emit = defineEmits(['pause-clicked'])

function btnClick() {
  console.log(pomodoro.itsFinished);
  if (pomodoro.itsFinished) {
    console.log("stop");
    pomodoro.stopPomodoro();
  } else if (pomodoro.status.interval === null) {
    console.log("start pomodoro");
    pomodoro.startPomodoro();
    pomodoro.first = false;
  } else {
    console.log("next");
    pomodoro.nextStep();
  }
  pomodoro.pro = false;

}
</script>

<style lang="scss" scoped>
.icon-text {
  display: flex;
  align-items: center;
}

.btn {
  border-radius: 1em;
  transition: height 0.2s ease-in-out;

  .btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .icon {
      font-size: 7em;
      transition: font-size 0.2s ease-in-out;
    }

    .text {
      margin-top: 0.2em;
    }
  }

  &.small {
    height: 3em;
    .icon {
      font-size: 2em;
    }
  }
}
</style>