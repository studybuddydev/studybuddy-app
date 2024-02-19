import { defineStore } from 'pinia'
import { type PomoReport, type Break, PomodoroState, type PomodotoStatus, type DisplaySession, type PomodoroRecord, type Pomodoro } from '@/types';
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { computed, ref, watch } from 'vue';
import { openDB, type IDBPDatabase } from 'idb';

const TICK_TIME = 100;
const SECONDS_MULTIPLIER = 1000;
const MINUTE_MULTIPLIER = 60 * SECONDS_MULTIPLIER;
const POMO_VERSION = 3;

const SHORT_POMO_THRESHOLD =  5 * MINUTE_MULTIPLIER;
const LONG_BREAK_THRESHOLD = 15 * MINUTE_MULTIPLIER;

enum ENotification {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

export const usePomodoroStore = defineStore('pomodoro', () => {

  // ---------- PROPERTIES ----------
  const settings = useSettingsStore();
  const stateStore = useStateStore();

  watch(settings.pomoSettings, () => {
    if (getCurrentPomo()?.state === PomodoroState.CREATED)
      createPomodoro();
  });


  // const currentPomodoro = ref(stateStore.getPomodoroStatus());
  // const pomo = computed(() => stateStore.getPomodoroStatus())
  function getCurrentPomo() {
    return stateStore.getPomodoroStatus();
  }
  let interval: number | undefined;
  let report = ref<PomoReport | null>(null);
  let now = ref(Date.now());
  init();


  // ---------- INIT ----------
  function init() {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.version !== POMO_VERSION || pomo.state === PomodoroState.TERMINATED || pomo.state === PomodoroState.CREATED) {
      createPomodoro();
    } else {
      interval = setInterval(tick, TICK_TIME);
    }
  }

  // ---------- STATE ----------

  // set up pomodoro ( a study session using the data from the settings), this method modify the currentPomodoro object
  function createPomodoro() {
    clearStuff();
    const free = !!settings.pomoSettings.freeMode;
    const totalLength   = free ? 0 : settings.pomoSettings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength  = free ? 0 : settings.pomoSettings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks    = free ? 0 : settings.pomoSettings.numberOfBreak;

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
    stateStore.setPomodoroStatus(pomo);
    saveStatus();
  }

  // when you first press start you set the start time of the pomodoro and sets the state to study
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

  // when you press stop you set the end time of the pomodoro and sets the state to terminated
  function stopPomodoro() {
    const pomo = getCurrentPomo();
    if (countdownRunning.value) {
      clearTimeout(countDownTimerout);
      countdownRunning.value = false;
      return;
    }

    if (pomo) {
      pomo.onLongBreak = false;
      pomo.endedAt = getNow(pomo.startedAt);
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

      report.value = getPomoReport(pomo);
      if (pomo.endedAt > SHORT_POMO_THRESHOLD) {
        addPomodoroToRecords();
      } else {
        report.value.shortPomo = true;
      }
      saveStatus();
    }
  }
  // between start and stop you alternate between study and pause, this method is called when you press the pause/play button during a pomdoo
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

  // start the pause 
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

  // start the study ending a pause 
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

    const lastBreak = pomo.breaksDone[pomo.breaksDone.length - 1];        // get last break and set the end 
    lastBreak.end = now;
    
    saveStatus();
  }
  
  function tick() {
    const pomo = getCurrentPomo()
    if (pomo && (pomo.state === PomodoroState.BREAK || pomo.state === PomodoroState.STUDY)) {
      adjustPomo();
    } else {
      if (interval)
        clearInterval(interval);
    }

    now.value = Date.now();
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

    if (pomo.state === PomodoroState.BREAK) {                                             // PAUSE
      const currBreak = pomo.breaksDone[pomo.breaksDone.length - 1];    // get current break
      if (currBreak.end) {                                              // if break is done       
        let toSteal = now - currBreak.end;                              // time to steal from next break    
        if (toSteal > 0) {                                              // if there is time to stea
          currBreak.end = now;                                          // set current break end to now ( if you are in a new break you are moving the break end every second)
          if (!currBreak.soundEnd) {                                    // if sound is not played yet   
            currBreak.soundEnd = true;                                  // set sound played to true     
            playNotification(ENotification.BreakDone);                                // play sound 
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

  // ---------- METHODS ----------
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

  function clearStuff() {
    if (interval) {
      clearInterval(interval);
    }
    report.value = null;
  }

  function getBreaks() {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    return [
      ...(pomo?.breaksDone.map(x => ({...x, done: true})) ?? []) ,
      ...(pomo?.breaksTodo.map(x => ({...x, done: false})) ?? [])
    ];
  }

  function parseDisplaySession(pomo: Pomodoro, l: { start: number, end?: number, done?: boolean }[], now: number): DisplaySession[] {
    const showSeconds = settings.generalSettings.showSeconds;
    return l.filter(b => b.end).map((b, i) => {
      const startPerc = Math.min(100, 100 * b.start / pomo.end);
      const end = b.end ?? now;
      const lengthPerc = Math.min(100 - startPerc, (100 * (end / pomo.end)) - startPerc);
      return {
        startPerc, lengthPerc,
        lengthTime: timeFormatted((end - b.start) / SECONDS_MULTIPLIER, { html: false, showSeconds }),
        done: b.done,
        index: i,
        small: lengthPerc < 3
      }
    })
  }

  function getDisplayBreaksCurrent(): DisplaySession[] {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    const breaks = getBreaks();
    const now = getNow(pomo.startedAt);
    return parseDisplaySession(pomo, breaks, now);
  }

  function getDisplayBreaksRecord(pomo: PomodoroRecord): DisplaySession[] {
    const breaks = pomo.breaksDone.map(x => ({...x, done: true})) ?? [];
    return parseDisplaySession(pomo, breaks, 0);
  }

  function getDisplayStudyCurrent(): DisplaySession[] {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.CREATED) return [];
    const now = getNow(pomo.startedAt);

    const res: { start: number, end?: number }[] = [{ start: 0 }];
    for (const b of pomo.breaksDone) {
      res.at(-1)!.end = b.start;
      if (b.end && b.end + 5000 < now) res.push({ start: b.end });
    }
    if (res.at(-1)!.end === undefined) res.at(-1)!.end = now;

    return parseDisplaySession(pomo, res, now);
  }

  function getNowInPercentage() {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.CREATED)
      return 0;
    return 100 * Math.min(getNow(pomo.startedAt) / pomo.end, 1);
  }


  const WEIGHT_EFFICIENCY = 0.7;
  const WEIGHT_DURATION = 0.3;
  const OPTIMAL_STUDY_RATIO = 5/6;

  function getPomoReport(pomo: Pomodoro | undefined): PomoReport {
    if (!pomo) return { timeTotal: 0, timeStudy: 0, timeBreak: 0, nrBreaks: 0, points: 0 };
    const timeBreak = pomo.breaksDone.reduce((acc, curr) => acc + ((curr.end ?? curr.start) - curr.start), 0);
    const timeTotal = pomo.endedAt ?? pomo.end;
    const timeStudy = timeTotal - timeBreak;

    const durataPomelli: number[] = [];
    let prevBreakEnd = 0;
    for (let i = 0; i < pomo.breaksDone.length; i++) {
      durataPomelli.push(pomo.breaksDone[i].start - prevBreakEnd);
      prevBreakEnd = pomo.breaksDone[i].end ?? 0;
    }
    const scorePomelli = durataPomelli.reduce((acc, curr) => acc + (curr < 20 ? (curr / 20) : ( curr > 50 ? (50 / curr) : 1 )), 0) / durataPomelli.length;
    const score = 
      (WEIGHT_EFFICIENCY * ( 1 - Math.abs((timeStudy / timeTotal) - (OPTIMAL_STUDY_RATIO)) ) )
      + (WEIGHT_DURATION * scorePomelli)

    return {
      timeTotal: timeTotal,
      timeStudy: timeStudy,
      timeBreak: timeBreak,
      nrBreaks: pomo.breaksDone.length,
      points: Math.max(Math.min(score, 1), 0)
    };
  }

  function parsePoints(points: number) {
    return (points * 100).toFixed(1);
  }
  function parseTime(time: number) {
    return timeFormatted(time / SECONDS_MULTIPLIER, { html: false });
  }

  function saveStatus() {
    stateStore.save();
  }

  function breakLength(b: Break) {
    return (b.end ?? b.start) - b.start;
  }

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

  const defaultOptions = {
    html: true,
    showSeconds: true,
    format: 'semicolon' as 'hms' | 'semicolon'
  }
  function timeFormatted(seconds: number, options: {
    html?: boolean,
    showSeconds?: boolean,
    format?: 'hms' | 'semicolon'
  } = {}) {
    options = { ...defaultOptions, ...options };
    seconds = Math.max(0, Math.floor(seconds));

    let secondsLeft = seconds; // Math.floor(time  / MINUTE_MULTIPLIER * 60);
    const h = Math.floor(secondsLeft / 3600);
    secondsLeft -= h * 3600;
    const m = options.showSeconds ? Math.floor(secondsLeft / 60) : Math.round(secondsLeft / 60);
    secondsLeft -= m * 60;
    const s = Math.floor(secondsLeft);

    const sStr = `${s.toString().padStart(2, '0')}`;
    const mStr = `${h > 0 ? m.toString().padStart(2, '0') : m.toString()}`;

    if (options.format === 'semicolon') {
      const sss = options.html ? `<span class="${h > 0 ? 'small seconds' : 'seconds'}">:${sStr}</span>` : `:${sStr}`;
      const hhh = h > 0 ? `${h}:` : '';
      return `${hhh}${mStr}${options.showSeconds ? sss : ''}`;
    } else if (options.format === 'hms') {
      return `${h > 0 ? ` ${h}h ` : ''}${mStr}m${options.showSeconds ? ` ${sStr}s` : ''}` ;
    }
    return '';
  }

  function timeSinceStartFormatted() {
    const pomo = getCurrentPomo()
    if (!pomo) return '0:00';
    const start = pomo.startedAt ? Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER) : 0;
    return timeFormatted( start );
  }

  function timeInCurrentBreakFormatted(html: boolean = true, showSeconds: boolean = true) {
    const pomo = getCurrentPomo()
    const startLastPause = pomo?.breaksDone.at(-1)?.start;
    if (!pomo || !startLastPause) return '0:00';
    const startS = Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER)
    const startLastPauseS = Math.floor(startLastPause / SECONDS_MULTIPLIER)
    return timeFormatted( startS - startLastPauseS, { html, showSeconds });
  }
  function timeInCurrentStudyFormatted(html: boolean = true, showSeconds: boolean = true) {
    const pomo = getCurrentPomo()
    if (!pomo) return '0:00';
    const startLastStudy = pomo?.breaksDone.at(-1)?.end ?? 0;
    const startS = Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER)
    const startLastStudyS = Math.floor(startLastStudy / SECONDS_MULTIPLIER)
    return timeFormatted( startS - startLastStudyS, { html, showSeconds });
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


  // ---------- COMPUTED ----------
  const created    = computed(() => getCurrentPomo()?.state === PomodoroState.CREATED);
  const studing    = computed(() => getCurrentPomo()?.state === PomodoroState.STUDY);
  const pauseing   = computed(() => getCurrentPomo()?.state === PomodoroState.BREAK);
  const terminated = computed(() => getCurrentPomo()?.state === PomodoroState.TERMINATED);
  const going      = computed(() => studing.value || pauseing.value || countdownRunning.value);
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
    return  pauseing.value ? `StudyBuddy | ⏸ ${timeInCurrentBreakFormatted(false, true)}` : `StudyBuddy | ▶ ${timeInCurrentStudyFormatted(false, true)}`;
  })
  const done = computed(() => {
    const pomo = getCurrentPomo();
    if (!pomo) return false;
    return pomo.end <= getNow(pomo.startedAt);
  });
  const freeMode = computed(() => getCurrentPomo()?.freeMode ?? false);

  // ---------- HISTORY ----------
  const pomodoroRecords = ref<PomodoroRecord[]>([]);

  let _db: IDBPDatabase | null = null;
  async function getDb(): Promise<IDBPDatabase> {
    if (!_db) {
      _db = await openDB('sb-db', 1, {
        upgrade (db) {
          if (!db.objectStoreNames.contains('pomodori')) {
            const pomodori = db.createObjectStore('pomodori', { keyPath: 'id', autoIncrement: true });
            pomodori.createIndex('datetime', 'datetime', { unique: false });
            
          }
        }
      });
    }
    return _db;
  }

  async function addPomodoroToRecords() {
    const pomo = getCurrentPomo();
    if (!pomo) return;

    const record: PomodoroRecord = {
      end: pomo.end,
      endedAt: pomo.endedAt,
      breaksDone: pomo.breaksDone.map(b => ({ start: b.start, end: b.end ?? b.start })),
      freeMode: pomo.freeMode,
      datetime: new Date(pomo.startedAt ?? Date.now()),
      percentage: percentage.value
    }

    await (await getDb()).add('pomodori', record);

    updatePomodoroRecords();
  }

  async function getPomodoroRecords(): Promise<PomodoroRecord[]> {
    // get pomodori in the last 10 days
    const pomodori = await (await getDb())
      .getAllFromIndex('pomodori', 'datetime',
        IDBKeyRange.lowerBound(new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)))
      )
    return pomodori.sort((a, b) => b.datetime.getTime() - a.datetime.getTime());
  }

  async function updatePomodoroRecords() {
    const pomos = await getPomodoroRecords();
    pomos.forEach(p => {
      p.displayBreaks = getDisplayBreaksRecord(p);
      p.report = getPomoReport(p);
    });

    pomodoroRecords.value = pomos
  }
  updatePomodoroRecords();

  function deletePomodoroRecord(id: number) {
    (async () => {
      await (await getDb()).delete('pomodori', id);
      pomodoroRecords.value = pomodoroRecords.value.filter(p => p.id !== id);
    })();
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

  // ---------- RETURN ----------
  return {
    createPomodoro, startPomodoro, stopPomodoro, togglePauseStudy, pause, study,
    getCurrentPomo, getBreaks,
    percentage, displayBreaks, displayStudy, report,
    created, going, studing, pauseing, terminated, done, freeMode, timeToBreak, timeToStudy, onLongPause,
    timeSinceStart, timeInCurrentBreak, timeInCurrentStudy, percInCurrentState,
    getPomodoroRecords, pomodoroRecords, timeFormatted, timeInTitle,
    startCountdown, countdownRunning,
    parseTime, parsePoints,
    deletePomodoroRecord
  }

})