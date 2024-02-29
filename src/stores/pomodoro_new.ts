import { defineStore } from 'pinia'
import type { PomodoroBase, PomoReport, Break, DisplaySession, PomodoroRecord, PomodoroDBO } from '@/types';
import { useSettingsStore } from "@/stores/settings";
import { computed, ref, watch } from 'vue';
import { useDBStore } from "@/stores/db";
import Pomodoro, { ENotification } from '@/types/Pomodoro';
import Report from '@/types/Report';

export const usePomodoroStore = defineStore('pomodoro', () => {

  // Stores
  const settings = useSettingsStore();
  const db = useDBStore();

  // Last interaction
  const lastInteraction = ref(+(localStorage.getItem('lastInteraction') ?? Date.now()));
  const longAwaitPopup = ref(false);
  let longAwaitLastInteraction = 0;
  setInterval(() => interaction(), 1000 * 10);

  // Countdown
  const countdownRunning = ref(false);
  let countDownTimerout = -1;

  // INIT
  const pomo = new Pomodoro(settings.pomoSettings);
  pomo.setNotificationSubscriber(playNotification);
  pomo.setSendInteraction(interaction);
  watch(settings.pomoSettings, () => { pomo.settingsUpdated(settings.pomoSettings) });
  const report = ref<PomoReport | null>(null);

  // Pomodoro
  function createPomodoro() {
    pomo.reset();
  }
  function resumePomodoro() {
    pomo.resume();
  }
  function stopAtLastInteraction() {
    pomo.stop(longAwaitLastInteraction);
  }
  function startPomodoro() {
    if (countdownRunning.value) {
      clearTimeout(countDownTimerout);
      countdownRunning.value = false;
      pomo.start();
    } else {
      startCountdown(() => pomo.start());
    }
  }

  function stopPomodoro() {
    if (countdownRunning.value) {
      clearTimeout(countDownTimerout);
      countdownRunning.value = false;
      return;
    }
    pomo.stop();

    report.value = getPomoReport(pomo.getPomo());
    if (pomo.isShortPomo()) {
      addPomodoroToRecords();
    } else {
      report.value.shortPomo = true;
    }
  }

  function togglePauseStudy() {
    pomo.togglePauseStudy();
  }

  function pause() {
    pomo.pause();
  }

  function study() {
    pomo.study();
  }

  function getBreaks() {
    return pomo.getBreaks();
  }

  // Time
  function parseDisplaySession(pomo: PomodoroBase, l: { start: number, end?: number, done?: boolean }[], now: number): DisplaySession[] {
    const showSeconds = settings.generalSettings.showSeconds;
    return l.filter(b => b.end).map((b, i) => {
      const startPerc = Math.min(100, 100 * b.start / pomo.end);
      const end = b.end ?? now;
      const lengthPerc = Math.min(100 - startPerc, (100 * (end / pomo.end)) - startPerc);
      return {
        startPerc, lengthPerc,
        lengthTime: timeFormatted(Pomodoro.toSeconds(end - b.start), { html: false, showSeconds }),
        done: b.done,
        index: i,
        small: lengthPerc < 3
      }
    })
  }

  // Report
  function getPomoReport(pomo: PomodoroBase | undefined) {
    return new Report(pomo).getReport();
  }

  // Time
  function getDisplayBreaksCurrent(): DisplaySession[] {
    return parseDisplaySession(pomo.getPomo(), pomo.getBreaks(), pomo.getNow());
  }
  function getDisplayStudyCurrent(): DisplaySession[] {
    if (pomo.isCreated()) return [];
    return getDisplayStudyRecord(pomo.getPomo(), pomo.getNow());
  }
  function getDisplayBreaksRecord(pomo: PomodoroRecord): DisplaySession[] {
    const breaks = pomo.breaksDone.map(x => ({ ...x, done: true })) ?? [];
    return parseDisplaySession(pomo, breaks, 0);
  }
  function timeSinceStartFormatted() {
    const start = pomo.getPomo().startedAt ? Math.floor(pomo.getNowInSeconds()) : 0;
    return timeFormatted( start );
  }
  function timeInCurrentBreakFormatted(html: boolean = true, showSeconds: boolean = true) {
    const startLastPause = pomo.getStartLastPauseInSeconds();
    if (!startLastPause) return '0:00';
    const startS = Math.floor(pomo.getNowInSeconds())
    const startLastPauseS = Math.floor(startLastPause)
    return timeFormatted( startS - startLastPauseS, { html, showSeconds });
  }
  function timeInCurrentStudyFormatted(html: boolean = true, showSeconds: boolean = true) {
    const startLastStudy = pomo.getStartLastStudyInSeconds();
    const startS = Math.floor(pomo.getNowInSeconds())
    const startLastStudyS = Math.floor(startLastStudy)
    return timeFormatted( startS - startLastStudyS, { html, showSeconds });
  }
  function getCurrentStatePercentage() {
    const now = pomo.getNow();
    const pState = pomo.getPomo();
    let lastPoint = 0;
    let nextPoint = pState.end;

    if (pomo.isStuding()) {
      lastPoint = pState.breaksDone.at(-1)?.end ?? 0;
      nextPoint = pState.breaksTodo[0]?.start ?? pState.end;
    } else if (pomo.isPausing()) {
      const currBreak = pState.breaksDone.at(-1);
      lastPoint = currBreak?.start ?? 0;
      nextPoint = currBreak?.end ?? now;
    }

    return Math.min((now - lastPoint) / (nextPoint - lastPoint), 100);
  }

  // Utils
  const defaultOptions = { html: true, showSeconds: true, format: 'semicolon' as 'hms' | 'semicolon' }
  function timeFormatted(seconds: number, options: {
    html?: boolean,
    showSeconds?: boolean,
    format?: 'hms' | 'semicolon'
  } = {}) {
    options = { ...defaultOptions, ...options };
    seconds = Math.max(0, Math.floor(seconds));

    let secondsLeft = seconds; // Math.floor(time  / MINUTE_MULTIPLIER * 60);
    let h = Math.floor(secondsLeft / 3600);
    secondsLeft -= h * 3600;
    let m = options.showSeconds ? Math.floor(secondsLeft / 60) : Math.round(secondsLeft / 60);
    secondsLeft -= m * 60;
    let s = Math.floor(secondsLeft);

    if (m >= 60) {
      m = 0;
      h++;
    }

    const sStr = `${s.toString().padStart(2, '0')}`;
    const mStr = `${h > 0 ? m.toString().padStart(2, '0') : m.toString()}`;

    if (options.format === 'semicolon') {
      const sss = options.html ? `<span class="${h > 0 ? 'small seconds' : 'seconds'}">:${sStr}</span>` : `:${sStr}`;
      const hhh = h > 0 ? `${h}:` : '';
      return `${hhh}${mStr}${options.showSeconds ? sss : ''}`;
    } else if (options.format === 'hms') {
      return `${h > 0 ? ` ${h}h ` : ''}${mStr}m${options.showSeconds ? ` ${sStr}s` : ''}`;
    }
    return '';
  }
  function getDisplayStudyRecord(pomo: PomodoroBase, now: number = -1): DisplaySession[] {
    const res: { start: number, end?: number }[] = [{ start: 0 }];
    for (const b of pomo.breaksDone) {
      res.at(-1)!.end = b.start;
      if (b.end && (now === -1 || b.end + 5000 < now)) res.push({ start: b.end });
    }
    if (res.at(-1)!.end === undefined) res.at(-1)!.end = now === -1 ? (pomo.end ?? pomo.endedAt) : now;
    return parseDisplaySession(pomo, res, now);
  }
  function getNowInPercentage() {
    if (pomo.isCreated()) return 0;
    return 100 * Math.min(pomo.getNow() / pomo.getPomo().end, 1);
  }
  function parsePoints(points: number) {
    return (points * 100).toFixed(1);
  }
  function parseTime(time: number) {
    return timeFormatted(Pomodoro.toSeconds(time), { html: false });
  }
  function breakLength(b: Break) {
    return (b.end ?? b.start) - b.start;
  }

  // Notifications
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

  // Countdown
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

  // Interaction
  function interaction() {
    lastInteraction.value = Date.now();
    localStorage.setItem('lastInteraction', lastInteraction.value.toString());
  }

  // DB
  const pomodoroRecords = ref<PomodoroRecord[]>([]);
  function parsePomodorDbo(p: PomodoroDBO): PomodoroRecord {
    return {
      ...p,
      displayBreaks: getDisplayBreaksRecord(p),
      displayStudy: getDisplayStudyRecord(p),
      report: getPomoReport(p),
    }
  }
  async function updatePomodoroRecords() {
    pomodoroRecords.value = (
      await db.pomodori.orderBy('datetime')
        .reverse()
        .limit(500)
        .toArray()
    ).map(p => parsePomodorDbo(p));
  }
  async function addPomodoroToRecords() {
    const pState = pomo.getPomo();
    if (!pState) return -1;

    const p: PomodoroDBO = {
      end: pState.end,
      endedAt: pState.endedAt,
      breaksDone: pState.breaksDone.map(b => ({ start: b.start, end: b.end ?? b.start })),
      freeMode: pState.freeMode,
      datetime: new Date(pState.startedAt ?? Date.now())
    }
    const parsed = parsePomodorDbo(p);
    parsed.id = await db.pomodori.add(p);
    pomodoroRecords.value.unshift(parsed);
  }
  async function deletePomodoroRecord(id: number) {
    pomodoroRecords.value = pomodoroRecords.value.filter(p => p.id !== id);
    await db.pomodori.delete(id);
  }

  // Computed
  const created     = computed(() => pomo.isCreated());
  const studing     = computed(() => pomo.isStuding());
  const pauseing    = computed(() => pomo.isPausing());
  const terminated  = computed(() => pomo.isTerminated());
  const going       = computed(() => pomo.isGoing());
  const onLongPause = computed(() => pomo.isOnLongBreak());
  const timeToBreak = computed(() => pomo.isTimeToBreak());
  const timeToStudy = computed(() => pomo.isTimeToStudy());
  const done        = computed(() => pomo.isDone());
  const freeMode    = computed(() => pomo.isFreeMode());

  const displayBreaks = computed(getDisplayBreaksCurrent);
  const displayStudy = computed(getDisplayStudyCurrent);
  const percentage = computed(getNowInPercentage);
  const timeSinceStart = computed(() => timeSinceStartFormatted());
  const timeInCurrentBreak = computed(() => timeInCurrentBreakFormatted());
  const timeInCurrentStudy = computed(() => timeInCurrentStudyFormatted());
  const percInCurrentState = computed(() => getCurrentStatePercentage());
  const timeInTitle = computed(() => {
    if (!going.value) return 'StudyBuddy';
    return  pauseing.value ? `StudyBuddy | ⏸ ${timeInCurrentBreakFormatted(false, true)}` : `StudyBuddy | ▶ ${timeInCurrentStudyFormatted(false, true)}`;
  })

  function getCurrentPomo() {
    return pomo.getPomo();
  }


  return {
    createPomodoro, startPomodoro, stopPomodoro, togglePauseStudy, pause, study, resumePomodoro, stopAtLastInteraction,
    getCurrentPomo, getBreaks,
    percentage, displayBreaks, displayStudy, report,
    created, going, studing, pauseing, terminated, done, freeMode, timeToBreak, timeToStudy, onLongPause,
    timeSinceStart, timeInCurrentBreak, timeInCurrentStudy, percInCurrentState,
    pomodoroRecords, timeFormatted, timeInTitle,
    startCountdown, countdownRunning, longAwaitPopup,
    parseTime, parsePoints,
    deletePomodoroRecord
  }
})