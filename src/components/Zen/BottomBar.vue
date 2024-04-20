<template>
  <div class="bottom-bar">
    <div class="quick-settings" v-if="zenMode">
      <div class="volume-controls" v-if="settings.themeSettings.backgroundVideo">
        <v-slider v-model="settings.generalSettings.videoVolume"
          hide-details class="volume-slider" :min="0" :max="100" />
        <v-icon @click="settings.generalSettings.videoMute = !settings.generalSettings.videoMute" class="volume-icon"
          :icon="settings.generalSettings.videoMute ? 'mdi-volume-off' : 'mdi-volume-high'" />

      </div>
      <v-btn density="comfortable" class="btn-edit btn-edit-main bg-surface" icon="mdi-cog" size="large"
        @click="emit('openSettingsTab', pomodoro.going ? 'theme' : 'pomodoro')">
        <v-icon class="icon" icon="mdi-cog" size="large" />
      </v-btn>
    </div>
    <div :class="`pull-up-panel blur ${zenMode ? '' : 'pull-up-panel-zenmode'} ${showPomoHistory ? 'no-frost' : ''}`">
      <div class="handle" v-ripple @click="emit('setShowPomoHistory', false)" v-if="showPomoHistory">
        <v-icon icon="mdi-close" />
      </div>
      <div class="handle handle-zen" v-ripple @click="toggleZenMode()" v-else>
        <v-icon :icon="zenMode ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
      </div>

      <div class="pomodoro-bar">
        <div class="button-wrapper font-press pomo-left" v-if="pomodoro.going">
          <div>
            <v-btn class='btn bg-accent pomo-btn pomo-box' @click="pomodoro.startPomodoro()"
              v-if="pomodoro.created || pomodoro.terminated">
              <v-icon class="icon" icon="mdi-play" />
            </v-btn>
            <v-btn class='btn bg-accent pomo-btn pomo-box' @click="() => pausePomodoro()" v-else-if="pomodoro.studing">
              <v-icon class="icon" icon="mdi-pause" />
            </v-btn>
            <v-btn class='btn bg-accent pomo-btn pomo-box' @click="() => pausePomodoro()"
              v-else-if="pomodoro.timeToStudy">
              <v-icon class="icon" icon="mdi-play" />
            </v-btn>
            <v-btn class='btn bg-accent pomo-btn pomo-box pomo-box-disabled' v-else>
              <v-icon class="icon coffee-cup" icon="mdi-coffee" />
            </v-btn>
            <!-- <PomodoroController class="pomo-box pomo-controller bottom-box" v-if="!pomodoro.getReport.reportDone && (!pomodoroGoing || !pomodoro.status.isBreak)"/>
            <v-btn class="btn bg-error btn-endsession bottom-box" @click="endSession()" v-if="pomodoroGoing && pomodoro.status.isBreak">{{ $t("pause.endSession") }}</v-btn> -->
          </div>
        </div>
        <PomodoroFlex class="pomo-flex" :percentage="pomodoro.created ? 100 : pomodoro.percentage"
          :displayBreaks="pomodoro.displayBreaks" :displayStudy="pomodoro.displayStudy" :main-pomo="true" />
        <div class="button-wrapper pomo-right" v-if="pomodoro.going">
          <div class="time-button-wrapper">
            <div class="pomo-box pomo-time font-casio">
              <p v-if="!settings.generalSettings.hideTime" v-html="pomodoro.timeSinceStart"></p>
            </div>
            <div
              :class="(pomodoro.terminated && !pomodoro.countdownRunning) ? 'pomo-box pomo-stop pomo-box-disabled' : 'pomo-box pomo-stop'"
              @click="(pomodoro.freeMode || !pomodoro.done) ? terminatePomoDialog = true : stopPomodoro()">
              <v-icon icon="mdi-stop" />
            </div>
          </div>
        </div>
      </div>
      <PomodoroHistory :open="showPomoHistory"
        @start-pomodoro="pomodoro.startPomodoro(); emit('setShowPomoHistory', false)" />
    </div>
    <v-dialog v-model="terminatePomoDialog" width="auto">
      <v-card :text="$t('zen.confirm')">
        <v-card-actions>
          <v-spacer />
          <v-btn @click="terminatePomoDialog = false">{{ $t("no") }}</v-btn>
          <v-btn color="primary" @click="stopPomodoro(); terminatePomoDialog = false">{{ $t("yes") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";
import PomodoroFlex from '@/components/Pomodoro/PomodoroFlex.vue';
import PomodoroHistory from '@/components/Pomodoro/PomodoroHistory.vue';
import { useSettingsStore } from "@/stores/settings";
import { watch } from 'vue';

const pomodoro = usePomodoroStore();
const settings = useSettingsStore();

const terminatePomoDialog = ref(false);

const props = defineProps<{
  zenMode: boolean;
  showPomoHistory: boolean;
}>();
const emit = defineEmits<{
  (e: 'setZenMode', value: boolean): void
  (e: 'setShowPomoHistory', value: boolean): void
  (e: 'openSettingsTab', value: string): void
}>();

function stopPomodoro() {
  pomodoro.stopPomodoro();
  emit('setZenMode', true);
}
function pausePomodoro() {
  pomodoro.togglePauseStudy();
  emit('setZenMode', true);
}
function toggleZenMode() {
  if (props.zenMode && pomodoro.pauseing) {
    pomodoro.togglePauseStudy();
  }
  emit('setZenMode', !props.zenMode);
}
</script>

<style lang="scss" scoped>
.coffee-cup {
  animation: cupOnButton 2s infinite;
}

@keyframes cupOnButton {
  0% {
    transform: translateY(0) rotate(0);
  }

  50% {
    transform: translateY(-5px) rotate(5deg);
  }

  100% {
    transform: translateY(0) rotate(0);
  }
}

.bottom-bar {
  pointer-events: none;
  position: fixed;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 1500;
  justify-content: flex-end;

  .quick-settings {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    pointer-events: auto;
    align-self: flex-end;
    margin: 1rem;

    .volume-controls {
      margin-right: 1rem;
      border-radius: 1rem;
      background-color: rgb(var(--v-theme-surface));
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 0.4rem;
      height: 32px;

      min-width: 0rem;
      transition: min-width 0.2s ease-in-out;

      ::v-deep(.v-input) {
        margin: 0;
        transition: margin 0.2s ease-in-out;
      }

      .volume-slider {
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        display: none;
      }

      &:hover {
        min-width: 10rem;

        ::v-deep(.v-input) {
          margin: 0 8px;
        }

        .volume-slider {
          display: block;
        }
      }
    }

  }


  .pull-up-panel {
    padding-top: 0.8rem;
    pointer-events: auto;
    width: 100vw;
    border-radius: 1em 1em 0 0;
    display: flex;
    flex-direction: column;

    .handle {
      align-self: center;
      margin: 0 0.8rem 0 0.8rem;
      cursor: pointer;
      width: calc(100% - 1rem);
      height: 1.6rem;
      border-radius: 0.8rem;
      display: flex;
      justify-content: center;
      background-color: #FFFFFF00;
      transition: background-color 0.1s ease-in-out, height 0.1s ease-in-out;

      &:hover {
        background-color: rgba(var(--v-theme-on-surface), 0.05);
      }
    }

    @media screen and (max-width: 600px) {
      .handle-zen {
        display: none;
      }
    }

    .pomodoro-bar {
      transition: padding 0.1s ease-in-out;
      display: flex;
      align-items: end;
      justify-content: space-between;
      padding: 0.5rem 1rem 1.5rem;

      @media (max-width: 600px) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;

        .pomo-left {
          grid-column: 1;
          grid-row: 1;
          justify-self: start;
        }

        .pomo-right {
          grid-column: 2;
          grid-row: 1;
          justify-self: end;
        }

        .pomo-flex {
          grid-column: 1 / span 2;
          grid-row: 2;
        }
      }

      .pomo-flex {
        height: 2rem;
        margin: 0.5rem 0;
      }

      .pomo-flex,
      .pomo-box {
        transition: height 0.1s ease-in-out, margin 0.1s ease-in-out;
      }

      .button-wrapper {
        width: 10rem;
        margin: 0 0.5rem;

        @media (max-width: 600px) {
          width: 100%;
          margin: 0;
          padding: 0.2rem;
        }

        .time-button-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .pomo-time {
        width: 70%;
        display: flex;
        background-color: rgb(var(--v-theme-secondary));
        border-radius: 1rem 0 0 1rem;

        p {
          width: 100%;
          text-align: center;
        }
      }

      .pomo-stop {
        width: 27%;
        border-radius: 0 1rem 1rem 0;
        background-color: rgb(var(--v-theme-error));
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 3%;
        font-size: 1.2rem;
        transition: background-color 0.1s ease-in-out;
        cursor: pointer;

        &:hover {
          background-color: rgba(var(--v-theme-error), 0.8);
        }
      }
    }

    &.pull-up-panel-zenmode {
      .handle {
        margin: 0.3rem 0.3rem 0 0.3rem;
        height: 1.2rem;
        border-radius: 0.4rem;
        font-size: 0.8rem;
      }

      .pomodoro-bar {
        padding: 0.5rem 1rem 0.5rem;
      }

      .pomodoro-bar {
        .pomo-box {
          height: 2rem !important;
          line-height: 2rem;
        }

        .pomo-flex {
          height: 1.4rem;
          margin: 0.3rem 0;
        }
      }
    }
  }
}
</style>