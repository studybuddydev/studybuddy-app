import { defineStore } from 'pinia'
import { type PomoReport, type Break, PomodoroState, type PomodotoStatus } from '@/types';
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { computed, ref } from 'vue';

const TICK_TIME = 200;
const MINUTE_MULTIPLIER = 60 * 1000;
enum ESound {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

export const usePomodoroStore = defineStore('pomodoro', () => {

  const settingsStore = useSettingsStore();
  const stateStore = useStateStore();

  const currentPomodoro = ref(stateStore.getPomodoroStatus());
  let interval: number | null = null;
  let _report: PomoReport | undefined;

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

  function tick() {
    const pomo = currentPomodoro.value
    if (pomo && (pomo.state === PomodoroState.BREAK || pomo.state === PomodoroState.STUDY)) {
      adjustPomo();
    } else {
      if (interval)
        clearInterval(interval);
    }
  }

  function startPomodoro() {
    if (interval) {
      clearInterval(interval);
    }

    _report = undefined;
    const settings = settingsStore.pomodoroFlexSettings;

    const now = Date.now();
    const totalLength = settings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength = settings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks = settings.numberOfBreak;
    const studyPeriod = (totalLength - (nrOfBreaks * breaksLength)) / (nrOfBreaks + 1);

    currentPomodoro.value = {
      start: now,
      end: now + totalLength,
      breaksDone: [],
      breaksTodo: generateBreaks(studyPeriod, breaksLength, nrOfBreaks),
      state: PomodoroState.STUDY
    }

    interval = setInterval(tick, TICK_TIME);
  }

  function stopPomodoro() {
    if (currentPomodoro.value) {
      currentPomodoro.value.state = PomodoroState.FINISHED;
    }
  }

  function togglePauseStudy() {
    const pomo = currentPomodoro.value;
    if (!pomo) return;
    if (pomo.state === PomodoroState.STUDY) {
      pause();
    } else if (pomo.state === PomodoroState.BREAK) {
      study();
    }
  }

  function pause() {
    const pomo = currentPomodoro.value;
    if (!pomo) {
      stopPomodoro();
      return;
    }
    adjustPomo();

    const now = Date.now();
    pomo.state = PomodoroState.BREAK;

    const breaksLength = settingsStore.pomodoroFlexSettings.breaksLength * MINUTE_MULTIPLIER;
    const nextPause = pomo.breaksTodo.shift();
    if (nextPause && nextPause?.start - breaksLength > now) {
      pomo.breaksDone.push(nextPause);
    } else {
      pomo.breaksDone.push({ start: now, end: now, soundStart: true });
    }

  }

  function study() {
    const pomo = currentPomodoro.value;
    if (!pomo) {
      stopPomodoro();
      return;
    }
    adjustPomo();

    const now = Date.now();
    pomo.state = PomodoroState.STUDY;

    const lastBreak = pomo.breaksDone[pomo.breaksDone.length - 1];
    lastBreak.end = now;

    const breakTimeDone = pomo.breaksDone.reduce((acc, curr) => acc + (curr.end ?? curr.start) - curr.start, 0);
    const nrOfBreaksDone = pomo.breaksDone.filter(b => (b.end ?? b.start) - b.start > 60*1000).length;

    pomo.breaksTodo = generateBreaks(
      pomo.end - now,
      (settingsStore.pomodoroFlexSettings.breaksLength * MINUTE_MULTIPLIER) - breakTimeDone,
      settingsStore.pomodoroFlexSettings.numberOfBreak - nrOfBreaksDone
    );

  }

  function adjustPomo() {
    const pomo = currentPomodoro.value;
    if (!pomo) {
      stopPomodoro();
      return;
    }
    const now = Date.now();

    if (pomo.end > now) {
      pomo.end = now;
      if (!pomo.soundEnd) {
        pomo.soundEnd = true;
        playSound(ESound.PomodoroDone);
      }
    }

    if (pomo.state = PomodoroState.BREAK) {                                             // PAUSE
      const currBreak = pomo.breaksDone[pomo.breaksDone.length - 1];
      if (currBreak.end) {
        let toSteal = now - currBreak.end;
        if (toSteal > 0) {
          currBreak.end = now;
          if (!currBreak.soundEnd) {
            currBreak.soundEnd = true;
            playSound(ESound.BreakDone);
          }
        }
        while (toSteal > 0) {
          const nextPause = pomo.breaksTodo[0];
          if (!nextPause) break;
          nextPause.start += toSteal;
          if (nextPause.end && nextPause.start > nextPause.end) {
            toSteal = nextPause.start - nextPause.end;
            pomo.breaksTodo.shift();
          } else {
            toSteal = 0;
          }
        }
      } else {
        currBreak.end = now;
      }

    } else if (pomo.state = PomodoroState.STUDY) {                                    // STUDY
      let i = 0;
      let nextBreak = pomo.breaksTodo[i++];
      let curEnd = now

      if (curEnd > nextBreak.start && !nextBreak.soundStart) {
        nextBreak.soundStart = true;
        playSound(ESound.BreakStart);
      }

      while (nextBreak) {
        if (curEnd <= nextBreak.start)
          break;
        nextBreak.end = nextBreak.end ? now + (nextBreak.end - nextBreak.start) : now + (settingsStore.pomodoroFlexSettings.breaksLength * MINUTE_MULTIPLIER);
        nextBreak.start = now;
        curEnd = nextBreak.end;
        nextBreak = pomo.breaksTodo[i++]
      }
    }

  }

  function getPomodoroStatus() {
    return currentPomodoro.value;
  }
  function getBreaks() {
    if (!currentPomodoro.value) return [];
    return [...(currentPomodoro.value?.breaksDone ?? []) , ...(currentPomodoro.value?.breaksTodo ?? [])];
  }

  const breaksInPercentage = computed(getBreaksInPercentage);
  function getBreaksInPercentage() {
    const pomo = currentPomodoro.value;
    const now = Date.now();
    if (!pomo) return [];
    return getBreaks().map(b => {
      const total = pomo.end - pomo.start;
      return {
        start: (b.start - pomo.start) / total,
        end: ((b.end ?? now) - pomo.start) / total
      }
    })
  }

  const percentage = computed(getNowInPercentage);
  function getNowInPercentage() {
    const pomo = currentPomodoro.value;
    if (!pomo || pomo.state === PomodoroState.CREATED)
      return 0;
    return (Date.now() - pomo.start) / (pomo.end - pomo.start);
  }

  function getPomoReport() {
    const pomo = currentPomodoro.value;
    if (!pomo) {
      _report = undefined;
      return null;
    }
    if (_report) return _report;
    const total = pomo.end - pomo.start;
    const study = pomo.breaksDone.reduce((acc, curr) => acc + (curr.end ?? curr.start) - curr.start, 0);
    const breakTime = pomo.breaksDone.reduce((acc, curr) => acc + (curr.end ?? curr.start) - curr.start, 0);
    _report = {
      timeTotal: total,
      timeStudy: study,
      timeBreak: breakTime
    };
    return _report;
  
  }

  function saveStatus() {
    stateStore.save();
  }

  async function playSound(sound: ESound) {
    const audio = new Audio(`/sounds/${sound}`);
    let volume = settingsStore.pomodoroFlexSettings.soundVolume;
    if (volume === undefined) volume = 0.5;
    audio.volume = volume / 100;
    audio.play();
  }

  return {
    startPomodoro, stopPomodoro, togglePauseStudy, pause, study,
    getPomodoroStatus, getBreaks,
    percentage, breaksInPercentage, getPomoReport
  }

})