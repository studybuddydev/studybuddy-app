import { defineStore } from 'pinia'
import { type PomoReport, type Break, PomodoroState, type PomodotoStatus, type DisplaySession, type PomodoroRecord, type PomodoroDBO } from '@/types';
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { computed, ref, watch } from 'vue';
import { usePomodoroDBStore } from "@/stores/db/pomodoroDB";
import * as timeUtils from '@/utils/time';
import * as reportUtils from '@/utils/report';

const TICK_TIME = 100;
const SECONDS_MULTIPLIER = 1000;
const MINUTE_MULTIPLIER = 60 * SECONDS_MULTIPLIER;
const POMO_VERSION = 3;

const SHORT_POMO_THRESHOLD = 5 * MINUTE_MULTIPLIER;
const LONG_BREAK_THRESHOLD = 15 * MINUTE_MULTIPLIER;

const STOPPOMODORO_TIMEOUT = 60 * MINUTE_MULTIPLIER;

enum ENotification {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

export const usePomodoroStore = defineStore('pomodoro', () => {

  // ---------- STORES ----------
  const settings = useSettingsStore();
  const state = useStateStore();
  const pomoDB = usePomodoroDBStore();

  // ---------- Last interaction ----------
  const lastInteraction = ref(+(localStorage.getItem('lastInteraction') ?? Date.now()));
  const longAwaitPopup = ref(false);
  let longAwaitLastInteraction = 0;

  // ---------- Countdown ----------
  // ---------- Settings ----------
  watch(settings.pomoSettings, () => { // TODO
    if (getCurrentPomo()?.state === PomodoroState.CREATED)
      createPomodoro();
  });

  // ---------- Init ----------
  let interval: number | undefined;
  const report = ref<PomoReport | null>(null);
  const now = ref(Date.now());
  init();
  function init() {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.version !== POMO_VERSION || pomo.state === PomodoroState.TERMINATED || pomo.state === PomodoroState.CREATED) {
      createPomodoro();
    } else {
      const lastInteractionDelta = Date.now() - lastInteraction.value;
      if (lastInteractionDelta > STOPPOMODORO_TIMEOUT) {
        longAwaitPopup.value = true;
        longAwaitLastInteraction = lastInteraction.value;
      } else {
        resumePomodoro();
      }
    }
  }
  function saveStatus() {
    state.save();
  }

  // ---------- POMODORO ----------
  function getNow(startTime: number | undefined) {
    return now.value - (startTime ?? 0);
  }
  function getCurrentPomo() {
    return state.getPomodoroStatus();
  }
  function resumePomodoro() {
    interval = setInterval(tick, TICK_TIME);
  }
  function stopAtLastInteraction() {
    stopPomodoro(longAwaitLastInteraction);
  }
  function createPomodoro() { 
    clearStuff();
    const free = !!settings.pomoSettings.freeMode;
    const totalLength = free ? 0 : settings.pomoSettings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength = free ? 0 : settings.pomoSettings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks = free ? 0 : settings.pomoSettings.numberOfBreak;

    // currentPomodoro.value = {
    const pomo: PomodotoStatus = {
      version: POMO_VERSION,
      end: totalLength,
      breaksDone: [],
      breaksTodo: generateBreaks(totalLength, breaksLength, nrOfBreaks),
      state: PomodoroState.CREATED,
      soundEnd: totalLength <= 1000,
      freeMode: free
    }
    state.setPomodoroStatus(pomo);
    saveStatus();
  }
  function startPomodoro() {
    clearStuff();
    if (countdownRunning.value) {
      clearTimeout(countDownTimerout);
      countdownRunning.value = false;
      _startPomodoro()
    } else {
      startCountdown(() => _startPomodoro());
    }
  }
  function _startPomodoro() { 
    let pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.TERMINATED) {
      createPomodoro();
    }
    pomo = getCurrentPomo();
    pomo!.startedAt = Date.now();
    pomo!.state = PomodoroState.STUDY;
    pomo!.originalEnd = pomo!.end;
    interval = setInterval(tick, TICK_TIME);
    saveStatus();
  }
  function stopPomodoro(lastInteraction: number | undefined = undefined) {
    const pomo = getCurrentPomo();
    if (countdownRunning.value) {
      clearTimeout(countDownTimerout);
      countdownRunning.value = false;
      return;
    }

    if (pomo) {
      const now = lastInteraction === undefined ? getNow(pomo.startedAt) : lastInteraction - (pomo.startedAt ?? 0)
      pomo.onLongBreak = false;
      pomo.endedAt = now;
      if (pomo.state === PomodoroState.BREAK) {
        const lastBreak = pomo.breaksDone.pop();
        if (lastBreak) {
          pomo.endedAt = lastBreak.start;
          if (!((pomo.originalEnd ?? 0) > pomo.end)) {
            pomo.end = Math.max(pomo.originalEnd ?? 0, lastBreak.start)
          }
        }
      }
      pomo.state = PomodoroState.TERMINATED;

      report.value = reportUtils.getPomoReport(pomo);
      if (pomo.endedAt > SHORT_POMO_THRESHOLD) {
        pomoDB.addPomodoroToRecords(pomo);
      } else {
        report.value.shortPomo = true;
      }
      saveStatus();
    }
  }
  function togglePauseStudy() {
    const pomo = getCurrentPomo();
    if (!pomo) return;
    if (pomo.state === PomodoroState.STUDY) {
      pause();
    } else if (pomo.state === PomodoroState.BREAK) {
      study();
    }
    saveStatus();
  }
  function pause() {
    const pomo = getCurrentPomo();
    if (!pomo) {
      stopPomodoro();
      return;
    }
    adjustPomo();

    const now = getNow(pomo.startedAt);
    pomo.state = PomodoroState.BREAK;

    const nextBreak = pomo.breaksTodo[0]; // get next break
    if (nextBreak && 2 * nextBreak.start - (nextBreak.end ?? now) < now) {  // if next break is close to now (within one break distance)
      nextBreak.end = now + ((nextBreak.end ?? now) - nextBreak.start); // shift break
      nextBreak.start = now;
      pomo.breaksDone.push(pomo.breaksTodo.shift()!); // Move break from todo to done
    } else {
      pomo.breaksDone.push({ start: now, end: now, soundStart: true, soundEnd: true });     // create new break
    }
    saveStatus();
  }
  function study() {
    const pomo = getCurrentPomo();
    if (!pomo) {
      stopPomodoro();
      return;
    }
    if (pomo.onLongBreak) {
      stopPomodoro();
      startPomodoro();
      return;
    }
    adjustPomo();

    const now = getNow(pomo.startedAt);
    pomo.state = PomodoroState.STUDY; // set state to study

    const lastBreak = pomo.breaksDone[pomo.breaksDone.length - 1]; // get last break and set the end 
    lastBreak.end = now;

    saveStatus();
  }
  function tick() { 
    interaction();
    const pomo = getCurrentPomo()
    if (pomo && (pomo.state === PomodoroState.BREAK || pomo.state === PomodoroState.STUDY)) {
      adjustPomo();
    } else {
      if (interval)
        clearInterval(interval);
    }
    now.value = Date.now(); // TOMOVE
  }
  function adjustPomo() {
    const pomo = getCurrentPomo();
    if (!pomo) {
      stopPomodoro();
      return;
    }
    const now = getNow(pomo.startedAt);

    if (pomo.end < now) {

      // add next slot
      if (!freeMode.value && pomo.state === PomodoroState.BREAK) {
        const pSettings = settings.pomoSettings;
        const pauseLength = (pSettings.breaksLength * MINUTE_MULTIPLIER) / pSettings.numberOfBreak;
        const studyLength = ((pSettings.totalLength - pSettings.breaksLength) * MINUTE_MULTIPLIER) / (pSettings.numberOfBreak + 1);

        const currBreak = pomo.breaksDone[pomo.breaksDone.length - 1];
        const currBreakLength = (currBreak.end ?? currBreak.start) - currBreak.start;
        if (currBreakLength < pauseLength) {
          currBreak.end = currBreak.start + pauseLength;
        }
        pomo.end = (currBreak.end ?? currBreak.start) + studyLength;
      } else {
        pomo.end = now;
        if (!pomo.soundEnd) {
          pomo.soundEnd = true;
          playNotification(ENotification.PomodoroDone);
        }
      }
    }

    if (pomo.state === PomodoroState.BREAK) {                           // PAUSE
      const currBreak = pomo.breaksDone[pomo.breaksDone.length - 1];    // get current break
      if (currBreak.end) {                                              // if break is done
        let toSteal = now - currBreak.end;                              // time to steal from next break
        if (toSteal > 0) {                                              // if there is time to stea
          currBreak.end = now;                                          // set current break end to now ( if you are in a new break you are moving the break end every second)
          if (!currBreak.soundEnd) {                                    // if sound is not played yet
            currBreak.soundEnd = true;                                  // set sound played to true
            playNotification(ENotification.BreakDone);                  // play sound 
          }
        }
        while (toSteal > 0) {                                          // while there is time to steal
          const nextPause = pomo.breaksTodo[0];                        // get next break
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

      // check pausa lunga
      if (pomo.onLongBreak || currBreak.end - currBreak.start > LONG_BREAK_THRESHOLD) {
        pomo.onLongBreak = true;
        pomo.breaksTodo = [];
        pomo.end = now;
      }

    } else if (pomo.state === PomodoroState.STUDY) {                                    // STUDY
      let nextBreak = pomo.breaksTodo[0];
      let curEndProgress = now

      if (nextBreak && curEndProgress > nextBreak.start && !nextBreak.soundStart) {
        nextBreak.soundStart = true;
        playNotification(ENotification.BreakStart);
      }

      if (nextBreak && curEndProgress > nextBreak.start) {
        nextBreak.end = curEndProgress + ((nextBreak.end ?? now) - nextBreak.start)
        nextBreak.start = now;
        curEndProgress = nextBreak.end;

        let nextNextBreak: Break | null = pomo.breaksTodo[1];
        while (nextNextBreak) {
          if (curEndProgress > nextNextBreak.start) {
            nextBreak.end = (nextBreak.end ?? nextBreak.start) + breakLength(nextNextBreak);
            pomo.breaksTodo.splice(1, 1);
            nextNextBreak = pomo.breaksTodo[1];
          } else {
            nextNextBreak = null;
          }
        }
      }
    }
  }
  function clearStuff() {
    if (interval) {
      clearInterval(interval);
    }
    report.value = null;
  }
  function getNowInPercentage() {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.CREATED)
      return 0;
    return 100 * Math.min(getNow(pomo.startedAt) / pomo.end, 1);
  }

  // ---------- Utils ----------
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
  function getBreaks() {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    return [
      ...(pomo?.breaksDone.map(x => ({ ...x, done: true })) ?? []),
      ...(pomo?.breaksTodo.map(x => ({ ...x, done: false })) ?? [])
    ];
  }
  function breakLength(b: Break) {
    return (b.end ?? b.start) - b.start;
  }
  function getCurrentStatePercentage() {
    const pomo = getCurrentPomo();
    if (!pomo) return 0;

    const now = getNow(pomo.startedAt);
    let lastPoint = 0;
    let nextPoint = pomo.end;

    if (pomo.state === PomodoroState.STUDY) {
      lastPoint = pomo.breaksDone.at(-1)?.end ?? 0;
      nextPoint = pomo.breaksTodo[0]?.start ?? pomo.end;
    } else if (pomo.state === PomodoroState.BREAK) {
      const currBreak = pomo.breaksDone.at(-1);
      lastPoint = currBreak?.start ?? 0;
      nextPoint = currBreak?.end ?? now;
    }

    return Math.min((now - lastPoint) / (nextPoint - lastPoint), 100);
  }

  // ---------- Time ----------
  function getDisplayBreaksCurrent(): DisplaySession[] {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    const breaks = getBreaks();
    const now = getNow(pomo.startedAt);
    return timeUtils.parseDisplaySession(pomo, breaks, now, settings.generalSettings.showSeconds);
  }
  function getDisplayStudyCurrent(): DisplaySession[] {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.CREATED) return [];
    return timeUtils.getDisplayStudyRecord(
      pomo,
      settings.generalSettings.showSeconds,
      getNow(pomo.startedAt)
    );
  }
  function timeSinceStartFormatted() {
    const pomo = getCurrentPomo()
    if (!pomo) return '0:00';
    const start = pomo.startedAt ? Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER) : 0;
    return timeUtils.timeFormatted(start);
  }
  function timeInCurrentBreakFormatted(html: boolean = true, showSeconds: boolean = true) {
    const pomo = getCurrentPomo()
    const startLastPause = pomo?.breaksDone.at(-1)?.start;
    if (!pomo || !startLastPause) return '0:00';
    const startS = Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER)
    const startLastPauseS = Math.floor(startLastPause / SECONDS_MULTIPLIER)
    return timeUtils.timeFormatted(startS - startLastPauseS, { html, showSeconds });
  }
  function timeInCurrentStudyFormatted(html: boolean = true, showSeconds: boolean = true) {
    const pomo = getCurrentPomo()
    if (!pomo) return '0:00';
    const startLastStudy = pomo?.breaksDone.at(-1)?.end ?? 0;
    const startS = Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER)
    const startLastStudyS = Math.floor(startLastStudy / SECONDS_MULTIPLIER)
    return timeUtils.timeFormatted(startS - startLastStudyS, { html, showSeconds });
  }
  function timeFormatted(seconds: number, options: {
    html?: boolean,
    showSeconds?: boolean,
    format?: 'hms' | 'semicolon'
  } = {}) {
    return timeUtils.timeFormatted(seconds, options);
  }
  function parseTime(t: number) {
    return timeUtils.parseTime(t);
  }

  // ---------- Notification ----------
  let oneSoundLimit = false;
  async function playNotification(type: ENotification) {
    if (Notification.permission === "granted") {
      let text = '';
      if (ENotification.BreakStart === type) text = 'Time to break';
      else if (ENotification.BreakDone === type) text = 'Time to study';
      else if (ENotification.PomodoroDone === type) text = 'Nice job!';

      let body = '';
      if (ENotification.BreakStart === type) text = 'You studied enough, take a break!';
      else if (ENotification.BreakDone === type) text = 'Your break is over, get back to work!';
      else if (ENotification.PomodoroDone === type) text = 'You completed your pomodoro!';

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(text, { body });
      });
    }

    // sound
    if (!oneSoundLimit) {
      const audio = new Audio(`/sounds/${type}`);
      let volume = settings.generalSettings.soundVolume;
      if (volume === undefined) volume = 0.5;
      audio.volume = volume / 100;
      audio.play();
      oneSoundLimit = true;
      setTimeout(() => oneSoundLimit = false, 1000);
    }
  }

  // ---------- COUNTDOWN ----------
  const countdownRunning = ref(false);
  let countDownTimerout = -1;
  function startCountdown(callback: () => void, ms: number = 3000) {
    if (countdownRunning.value) return;
    if (settings.generalSettings.disableCountdown) {
      callback();
    } else {
      countdownRunning.value = true;
      countDownTimerout = setTimeout(() => {
        countdownRunning.value = false;
        callback();
        countDownTimerout = -1;
      }, ms);
    }
  }

  // ---------- STILL WATCHING ----------
  function interaction() {
    lastInteraction.value = Date.now();
    localStorage.setItem('lastInteraction', lastInteraction.value.toString());
  }

  // ---------- COMPUTED ----------
  const created = computed(() => getCurrentPomo()?.state === PomodoroState.CREATED);
  const studing = computed(() => getCurrentPomo()?.state === PomodoroState.STUDY);
  const pauseing = computed(() => getCurrentPomo()?.state === PomodoroState.BREAK);
  const terminated = computed(() => getCurrentPomo()?.state === PomodoroState.TERMINATED);
  const going = computed(() => studing.value || pauseing.value || countdownRunning.value);
  const onLongPause = computed(() => getCurrentPomo()?.onLongBreak ?? false);
  const timeToBreak = computed(() => {
    if (!studing.value) return false;
    const pomo = getCurrentPomo();
    const nextStart = pomo?.breaksTodo[0]?.start;
    if (!pomo || !nextStart) return false;
    return nextStart - 500 < getNow(pomo?.startedAt);
  });
  const timeToStudy = computed(() => {
    if (!pauseing.value) return false;
    const pomo = getCurrentPomo();
    const nextStop = pomo?.breaksDone.at(-1)?.end;
    if (!pomo || !nextStop) return false;
    return nextStop - 500 < getNow(pomo?.startedAt);
  });
  const displayBreaks = computed(getDisplayBreaksCurrent);
  const displayStudy = computed(getDisplayStudyCurrent);
  const percentage = computed(getNowInPercentage);
  const timeSinceStart = computed(() => timeSinceStartFormatted());
  const timeInCurrentBreak = computed(() => timeInCurrentBreakFormatted());
  const timeInCurrentStudy = computed(() => timeInCurrentStudyFormatted());
  const percInCurrentState = computed(() => getCurrentStatePercentage());
  const timeInTitle = computed(() => {
    if (!going.value) return 'StudyBuddy';
    return pauseing.value ? `StudyBuddy | ⏸ ${timeInCurrentBreakFormatted(false, true)}` : `StudyBuddy | ▶ ${timeInCurrentStudyFormatted(false, true)}`;
  })
  const done = computed(() => {
    const pomo = getCurrentPomo();
    if (!pomo) return false;
    return pomo.end <= getNow(pomo.startedAt);
  });
  const freeMode = computed(() => getCurrentPomo()?.freeMode ?? false);

  // ---------- RETURN ----------
  return {
    createPomodoro, startPomodoro, stopPomodoro, togglePauseStudy, pause, study, resumePomodoro, stopAtLastInteraction,
    getCurrentPomo, getBreaks,
    percentage, displayBreaks, displayStudy, report,
    created, going, studing, pauseing, terminated, done, freeMode, timeToBreak, timeToStudy, onLongPause,
    timeSinceStart, timeInCurrentBreak, timeInCurrentStudy, percInCurrentState,
    timeFormatted, timeInTitle,
    startCountdown, countdownRunning, longAwaitPopup,
    parseTime
  }

})