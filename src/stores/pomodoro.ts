import { defineStore } from 'pinia'
import { type PomoReport, type Break, PomodoroState, type PomodotoStatus, type DisplayBreak } from '@/types';
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { computed, ref } from 'vue';

const TICK_TIME = 15;
const MINUTE_MULTIPLIER = 0.5 * 1000;
enum ESound {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

export const usePomodoroStore = defineStore('pomodoro', () => {

  // ---------- PROPERTIES ----------
  const settingsStore = useSettingsStore();
  const stateStore = useStateStore();

  const currentPomodoro = ref(stateStore.getPomodoroStatus());
  currentPomodoro.value = undefined
  let interval: number | undefined;
  let _report: PomoReport | undefined;
  let now = ref(Date.now());
  init();


  // ---------- INIT ----------
  function init() {
    if (!currentPomodoro.value) {
      createPomodoro();
    } else {
      interval = setInterval(tick, TICK_TIME);
    }
  }

  // ---------- METHODS ----------

  function getCurrentPomo() {
    return currentPomodoro.value;
  }
  function getNow(startTime: number | undefined) {
    return now.value - (startTime ?? 0);
  }

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
    console.log('tick')
    const pomo = getCurrentPomo()
    if (pomo && (pomo.state === PomodoroState.BREAK || pomo.state === PomodoroState.STUDY)) {
      adjustPomo();
    } else {
      if (interval)
        clearInterval(interval);
    }

    now.value = Date.now();
  }

  function clearStuff() {
    if (interval) {
      clearInterval(interval);
    }
    _report = undefined;
  }

  function createPomodoro() {
    clearStuff();
    const settings = settingsStore.pomodoroFlexSettings;

    const totalLength = settings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength = settings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks = settings.numberOfBreak;

    currentPomodoro.value = {
      end: totalLength,
      breaksDone: [],
      breaksTodo: generateBreaks(totalLength, breaksLength, nrOfBreaks),
      state: PomodoroState.CREATED
    }
    saveStatus();
  }

  function startPomodoro() {
    console.log('start')
    clearStuff();

    if (!currentPomodoro.value) {
      createPomodoro();
    }
    currentPomodoro.value!.startedAt = Date.now();
    currentPomodoro.value!.state = PomodoroState.STUDY;
    saveStatus();
    interval = setInterval(tick, TICK_TIME);
  }

  function stopPomodoro() {
    console.log('stop')
    const pomo = getCurrentPomo();
    if (pomo) {
      pomo.state = PomodoroState.TERMINATED;
      pomo.endedAt = getNow(pomo.startedAt);
    }
  }

  function togglePauseStudy() {
    console.log('toggle')
    const pomo = getCurrentPomo();
    if (!pomo) return;
    if (pomo.state === PomodoroState.STUDY) {
      pause();
    } else if (pomo.state === PomodoroState.BREAK) {
      study();
    }
  }

  function pause() {
    console.log('pause')
    const pomo = getCurrentPomo();
    if (!pomo) {
      stopPomodoro();
      return;
    }
    adjustPomo();

    const now = getNow(pomo.startedAt);
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
    console.log('study')
    const pomo = getCurrentPomo();
    if (!pomo) {
      stopPomodoro();
      return;
    }
    adjustPomo();

    const now = getNow(pomo.startedAt);
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
    console.log('adjust')
    const pomo = getCurrentPomo();
    if (!pomo) {
      stopPomodoro();
      return;
    }
    const now = getNow(pomo.startedAt);

    // if (pomo.end > now) {
    //   pomo.end = now;
    //   if (!pomo.soundEnd) {
    //     pomo.soundEnd = true;
    //     playSound(ESound.PomodoroDone);
    //   }
    // }

    if (pomo.state === PomodoroState.BREAK) {                                             // PAUSE
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

    } else if (pomo.state === PomodoroState.STUDY) {                                    // STUDY
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

  function getBreaks() {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    return [...(pomo?.breaksDone ?? []) , ...(pomo?.breaksTodo ?? [])];
  }

  function getBreaksInPercentage(): DisplayBreak[] {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    const now = getNow(pomo.startedAt);
    return getBreaks().map(b => {
      const startPerc = 100 * b.start / pomo.end;
      const end = b.end ?? now;
      const lengthPerc = (100 * (end / pomo.end)) - startPerc;
      return { startPerc, lengthPerc, lengthTime: timeAsString(end - b.start) }
    })
  }

  function getNowInPercentage() {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.CREATED)
      return 0;
    return 100 * getNow(pomo.startedAt) / pomo.end;
  }

  function getPomoReport() {
    const pomo = getCurrentPomo();
    if (!pomo) {
      _report = undefined;
      return null;
    }
    if (_report) return _report;
    const study = pomo.breaksDone.reduce((acc, curr) => acc + (curr.end ?? curr.start) - curr.start, 0);
    const breakTime = pomo.breaksDone.reduce((acc, curr) => acc + (curr.end ?? curr.start) - curr.start, 0);
    _report = {
      timeTotal: pomo.end,
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

  function timeAsString(time: number) {
    let leftTime = time;
    const h = Math.floor(leftTime / (60 * MINUTE_MULTIPLIER));
    leftTime -= h * 60 * MINUTE_MULTIPLIER;
    const m = Math.floor(leftTime / MINUTE_MULTIPLIER);
    leftTime -= m * MINUTE_MULTIPLIER;
    const s = Math.floor(leftTime / (MINUTE_MULTIPLIER / 60));
    return `${h > 0 ? h + ':' : ''}${m}:${s}`;
  }

  // ---------- COMPUTED ----------
  const created    = computed(() => getCurrentPomo()?.state === PomodoroState.CREATED);
  const studing    = computed(() => getCurrentPomo()?.state === PomodoroState.STUDY);
  const pauseing   = computed(() => getCurrentPomo()?.state === PomodoroState.BREAK);
  const terminated = computed(() => getCurrentPomo()?.state === PomodoroState.TERMINATED);
  const going      = computed(() => studing.value || studing.value);

  const displayBreaks = computed(getBreaksInPercentage);
  const percentage = computed(getNowInPercentage);
  const report = computed(getPomoReport);
  const done = computed(() => {
    const pomo = getCurrentPomo();
    if (!pomo) return false;
    return pomo.end <= getNow(pomo.startedAt);
  });

  // ---------- RETURN ----------
  return {
    startPomodoro, stopPomodoro, togglePauseStudy, pause, study,
    getCurrentPomo, getBreaks,
    percentage, displayBreaks, report,
    created, going, studing, pauseing, terminated, done
  }

})