<template>
  <div :class="`pomodoro ${mainPomo ? 'pomodoro-main' : ''}`">
    <div :class="`progress-bar ${alwaysShowTime ? 'always-show-time' : ''}`" @click="infoTextStudy = true">

      <div :class="`progress ${pomodoro.countdownRunning ? 'timer-animation' : ''}`" v-if="!dailyPomo" :style="{
        backgroundColor: theme.current.value.colors.snake ?? theme.current.value.colors.primary,
        color: theme.current.value.colors.surface,
        width: parsePercentage(percentage),
      }">
        <v-icon class="mx-1" size="x-small" icon="mdi-circle-double" v-if="mainPomo" />
      </div>

      <div v-for="b in displayBreaks" :key="b.index" class="break" :style="{
        backgroundColor: b.color ?? getBackgroundColor(),
        marginLeft: parsePercentage(b.startPerc),
        width: parsePercentage(b.lengthPerc, true),
        opacity: mainPomo ? (b.startPerc < percentage ? 0.6 : 1) : (b.deepWork === false ? 0.5 : 1)
      }" @click.stop="infoTextStudy = false">
        <v-icon v-if="!b.small && mainPomo" size="x-small" icon="mdi-egg-easter" class="icon-apple" />
      </div>

      <div class="time-indicator time-indicator-break" v-for="b in displayBreaks" :key="b.index" v-if="!dailyPomo"
        @click.stop="infoTextStudy = false"
        :style="{ marginLeft: parsePercentage(b.startPerc + (b.lengthPerc / 2)) }">
        <v-tooltip activator="parent" location="top" v-if="mainPomo">{{ b.lengthTime }} minutes</v-tooltip>
        <p>{{ b.lengthTime }} </p>
      </div>

      <div class="time-indicator time-indicator-study" v-for="s in displayStudy" :key="s.index" v-if="!dailyPomo"
        :style="{ marginLeft: parsePercentage(s.startPerc + (s.lengthPerc / 2)) }">
        <v-tooltip activator="parent" location="top" v-if="mainPomo">{{ s.lengthTime }} minutes</v-tooltip>
        <p>{{ s.lengthTime }} </p>
      </div>

      <!-- <div v-for="t in ticks" :key="t.h" class="hour-idicator" :style="{ marginLeft: parsePercentage(t.position) }" v-if="dailyPomo"></div> -->
      <div class="hour-idicator-wrapper" v-if="dailyPomo">
        <div v-for="t in ticks" :key="t" class="hour-idicator" ></div>
      </div>

    </div>
    <v-dialog :width="500" v-model="showInfoSnake" v-if="mainPomo">
      <v-card>
        <v-card-text> study{{ infoTextStudy }}
          {{ infoTextStudy ? $t('info.snake'): $t('info.snakePause') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="flat" color="primary" @click="showInfoSnake = false">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { DisplaySession } from '@/types';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useSettingsStore } from '@/stores/settings';
import { computed, ref } from 'vue';
const pomodoro = usePomodoroStore();
const settings = useSettingsStore();

const _infoTextStudy = ref(true);
const showInfoSnake = ref(false);
const infoTextStudy = computed({
  get() { return _infoTextStudy.value },
  set(v) { _infoTextStudy.value = v; showInfoSnake.value = true; }
})

const theme = useTheme();
const props = withDefaults(defineProps<{
  percentage: number,
  displayBreaks: DisplaySession[],
  displayStudy: DisplaySession[],
  dailyPomo?: boolean
  mainPomo?: boolean
  alwaysShowTime?: boolean
}>(), {
  percentage: 0,
  displayBreaks: () => [],
  displayStudy: () => [],
  dailyPomo: false,
  mainPomo: false
});


const ticks = computed(() => {
  const hours = [];
  const start = settings.generalSettings.dayStartEndHours[0] + 1;
  const end = settings.generalSettings.dayStartEndHours[1];
  for (let i = start; i < end; i++) hours.push(i % 24);
  return hours;
})



function getBackgroundColor() {
  if (props.dailyPomo) return theme.current.value.colors.primary;
  return theme.current.value.colors.secondary;
}

// const snakeHeadPercent = 3;
// const ratioProgressLeft = (100 - snakeHeadPercent) / 100;

function parsePercentage(percentage: number, skipHead: boolean = false) {
  return `${percentage}%`;

  // if (props.dailyPomo) {
  //   return `${percentage}%`;
  // } else {
  //   return `${(skipHead ? 0 : snakeHeadPercent) + (pomodoro.countdownRunning ? 0 : percentage * ratioProgressLeft)}%`;
  // }
}

</script>


<style lang="scss" scoped>
.pomodoro {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 1rem;
  height: 100%;
  background-color: #2222220A;
  // background-color: rgba(var(--v-theme-surface));
  filter: drop-shadow(0 0 0em #000);
  flex-grow: 1;

  &.pomodoro-main {
    background-color: #222222;
  }

  .progress-bar {
    display: flex;
    align-items: center;
    width: 100%;
    flex-grow: 1;
    position: relative;

    .time-indicator {
      height: 100%;
      align-items: center;
      justify-content: center;
      display: none;
      position: absolute;
      left: 0;
      bottom: 0;
      transform: translateX(-50%);
      overflow: hidden;
      font-style: italic;

      p {
        padding: 2px;
      }
    }

    &:hover,
    &.always-show-time {
      .icon-apple {
        display: none;
      }

      .time-indicator {
        display: flex;
      }
    }

    .hour-idicator-wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
    }

    .hour-idicator {
      width: 1px;
      background-color: rgba(var(--v-theme-primary), 0.3);
    }

    .break,
    .progress {
      height: 100%;
      border-radius: 1em;
      display: flex;
      justify-content: end;
      align-items: center;
      transition: width 0.1s linear;
      overflow: hidden;

      &.timer-animation {
        transition: width 3s linear;
      }
    }

    .break {
      position: absolute;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: margin 0.1s linear, width 0.1s linear;
    }

    .progress {
      text-align: right;
    }
  }

}
</style>