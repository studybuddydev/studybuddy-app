<template>
  <div v-if="state.isInTutorial" class="tutorial-discalimer bg-background">
    <b class="text-error">Sei nel Tutorial</b>
    <p>Niente verrá salvato</p>
    <p>Per uscire premi ESC e "Exit Tutorial"</p>
  </div>
  <div class="controls">
    <!-- <div class="status">
      {{pomodoro.status.status}}
      {{ pomodoro.itsTimeToBreak }}
    </div> -->

    <v-btn
      :class="pomodoro.itsTimeToBreak || pomodoro.itsFinished ? 'btn bg-secondary' : 'btn bg-secondary small'"
      icon="mdi-check-circle"
      @click="btnClick()"
      text="CIAO"
    >
      <div class="btn-content">
        <v-icon v-if="pomodoro.itsFinished" class="icon" >mdi-stop</v-icon>
        <v-icon v-else-if="pomodoro.status.interval === null" class="icon" >mdi-skip-next</v-icon>
        <v-icon v-else-if="pomodoro.status.isBreak" class="icon">mdi-play</v-icon>
        <v-icon v-else class="icon">mdi-pause</v-icon>
      </div>
    </v-btn>

    <!-- <v-btn v-if="pomodoro.status.interval !== null && pomodoro.status.isBreak"
      class="btn"
      icon="mdi-stop"
      variant="text" size="x-large"
      @click="pomodoro.stopPomodoro()"
    />
    <v-btn v-if="pomodoro.status.interval !== null"
      class="btn"
      :icon="pomodoro.status.isBreak ? 'mdi-play' : 'mdi-pause'"
      variant="text" size="x-large"
      @click="pomodoro.nextStep()"
    />
    <v-btn v-if="pomodoro.status.interval === null"
      class="btn"
      icon="mdi-skip-next"
      variant="text" size="x-large"
      @click="pomodoro.startPomodoro()"
    /> -->
  </div>
</template>

<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
import { useStateStore } from "@/stores/state";
const pomodoro = usePomodoroStore();
const state = useStateStore();

function btnClick() {
  if (pomodoro.itsFinished) {
    pomodoro.stopPomodoro()
  } else if (pomodoro.status.interval === null) {
    pomodoro.startPomodoro()
  } else {
    pomodoro.nextStep()
  }

}
</script>

<style lang="scss" scoped>
  .tutorial-discalimer {
    min-width: 200px;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem;
    text-align: center;
    border: 1px solid rgb(var(--v-theme-error));
    p {
      margin: 0.5rem 0;
    }
  }
  .controls {
    z-index: 2000;
    border-radius: 0.6rem;
    overflow: hidden;
    margin: 0.4em 0.5em;
    display: flex;
    width: calc(256px - 2em);
    margin: 0.3em 1em;
    align-items: center;

    .status {
      flex-grow: 1;
      padding: 0 1em;
    }

    .btn {
      border-radius: 1em;
      width: calc(256px - 2em);
      height: 10em;
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

  }
</style>