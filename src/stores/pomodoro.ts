import { defineStore } from 'pinia'
import { type PomodotoStatus, type Break, PomodoroState, BreakState } from '@/types';
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { computed, ref } from 'vue';

export const usePomodoroStore = defineStore('pomodoro', () => {

  const settingsStore = useSettingsStore();
  const stateStore = useStateStore();

  const SHORT_BREAK_THRESHOLD = 60 * 1000;


  const currentPomodoro = ref(stateStore.getPomodoroStatus());
  let interval: number | null = null;


  function generateBreaks(remainingLenght: number, breaksLength: number, nrOfBreaks: number) {
    if (breaksLength <= 0) return [];

    const singleBreakLength = breaksLength / nrOfBreaks;
    const singleStudyPeriod = (remainingLenght - breaksLength) / (nrOfBreaks + 1);
    const breaks: Break[] = [];
    for (let i = 0; i < nrOfBreaks; i++) {
      const start = singleStudyPeriod + (i * (singleBreakLength + singleStudyPeriod));
      breaks.push({ start, end: start + singleBreakLength })
    }
    return breaks;

  }


  function startPomodoro() {
    const settings = settingsStore.pomodoroFlexSettings;

    const now = Date.now();
    const totalLength = settings.totalLength * 60 * 1000;
    const breaksLength = settings.breaksLength * 60 * 1000;
    const nrOfBreaks = settings.numberOfBreak;
    const studyPeriod = (totalLength - (nrOfBreaks * breaksLength)) / (nrOfBreaks + 1);

    currentPomodoro.value = {
      start: now,
      end: now + totalLength,
      breaksDone: [],
      breaksTodo: generateBreaks(studyPeriod, breaksLength, nrOfBreaks),
      state: PomodoroState.STUDY
    }
  }

  function stopPomodoro() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  }

  function pause() {
    const pomo = currentPomodoro.value;
    if (!pomo) {
      stopPomodoro();
      return;
    }
    const now = Date.now();
    pomo.state = PomodoroState.BREAK;

    pomo.breaksDone.push({ start: now, end: undefined });


  }

  function study() {
    const pomo = currentPomodoro.value;
    if (!pomo) {
      stopPomodoro();
      return;
    }
    const now = Date.now();
    pomo.state = PomodoroState.STUDY;

    const lastBreak = pomo.breaksDone[pomo.breaksDone.length - 1];
    lastBreak.end = now;
    const breakLength = lastBreak.end - lastBreak.start;

    


    const breakTimeDone = pomo.breaksDone.reduce((acc, curr) => acc + (curr.end ?? curr.start) - curr.start, 0);
    const nrOfBreaksDone = pomo.breaksDone.filter(b => (b.end ?? b.start) - b.start > 60*1000).length;

    pomo.breaksTodo = generateBreaks(
      pomo.end - now,
      (settingsStore.pomodoroFlexSettings.breaksLength * 60 * 1000) - breakTimeDone,
      settingsStore.pomodoroFlexSettings.numberOfBreak - nrOfBreaksDone
    );
  }

})