import { defineStore } from 'pinia'
import { type PomoReport, type Break, PomodoroState, type PomodotoStatus, type DisplaySession } from '@/types';
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { computed, ref, watch } from 'vue';

const TICK_TIME = 100;
const SECONDS_MULTIPLIER = 1000;
const MINUTE_MULTIPLIER = 60 * SECONDS_MULTIPLIER;
const POMO_VERSION = 3;

enum ESound {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

export const usePomodoroStore = defineStore('pomodoro', () => {

  // ---------- PROPERTIES ----------
  const settingsStore = useSettingsStore();
  const stateStore = useStateStore();

  watch(settingsStore.pomoSettings, () => {
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
    const settings = settingsStore.pomoSettings;

    const free = !!settings.freeMode;
    const totalLength   = free ? 0 : settings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength  = free ? 0 : settings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks    = free ? 0 : settings.numberOfBreak;

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
    let pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.TERMINATED) {
      createPomodoro();
    }
    pomo = getCurrentPomo();
    pomo!.startedAt = Date.now();
    pomo!.state = PomodoroState.STUDY;
    interval = setInterval(tick, TICK_TIME);
    saveStatus();
  }

  // when you press stop you set the end time of the pomodoro and sets the state to terminated
  function stopPomodoro() {
    const pomo = getCurrentPomo();
    if (pomo) {
      pomo.state = PomodoroState.TERMINATED;
      pomo.endedAt = getNow(pomo.startedAt);
    }
    report.value = getPomoReport();
    saveStatus();
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
    adjustPomo();

    const now = getNow(pomo.startedAt);
    pomo.state = PomodoroState.STUDY; // set state to study

    const lastBreak = pomo.breaksDone[pomo.breaksDone.length - 1];        // get last break and set the end 
    lastBreak.end = now;

    // const breakTimeDone = pomo.breaksDone.reduce((acc, curr) => acc + (curr.end ?? curr.start) - curr.start, 0);    // get total break time done
    // const nrOfBreaksDone = pomo.breaksDone.filter(b => (b.end ?? b.start) - b.start > 60*1000).length;               // get number of breaks done
    
    // generate new breaks using the remaining time, the length of the breaks and the number of breaks left
    // pomo.breaksTodo = generateBreaks(
    //   pomo.end - now,
    //   (settingsStore.pomodoroFlexSettings.breaksLength * MINUTE_MULTIPLIER) - breakTimeDone,
    //   settingsStore.pomodoroFlexSettings.numberOfBreak - nrOfBreaksDone
    // );

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
      pomo.end = now;
      if (!pomo.soundEnd) {
        pomo.soundEnd = true;
        playSound(ESound.PomodoroDone);
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
            playSound(ESound.BreakDone);                                // play sound 
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

    } else if (pomo.state === PomodoroState.STUDY) {                                    // STUDY
      let nextBreak = pomo.breaksTodo[0];
      let curEndProgress = now

      if (nextBreak && curEndProgress > nextBreak.start && !nextBreak.soundStart) {
        nextBreak.soundStart = true;
        playSound(ESound.BreakStart);
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

  function parseDisplaySession(l: { start: number, end?: number, done?: boolean }[]): DisplaySession[] {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    const now = getNow(pomo.startedAt);

    return l.filter(b => b.end).map((b, i) => {
      const startPerc = Math.min(100, 100 * b.start / pomo.end);
      const end = b.end ?? now;
      const lengthPerc = Math.min(100 - startPerc, (100 * (end / pomo.end)) - startPerc);
      return {
        startPerc, lengthPerc,
        lengthTime: timeFormatted((end - b.start) / SECONDS_MULTIPLIER, false),
        done: b.done,
        index: i
      }
    }).filter(b => b.lengthPerc >= 0.2)
  }

  function getDisplayBreaks(): DisplaySession[] {
    return parseDisplaySession(getBreaks());
  }

  function getDisplayStudy(): DisplaySession[] {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.CREATED) return [];
    const now = getNow(pomo.startedAt);

    const res: { start: number, end?: number }[] = [{ start: 0 }];
    for (const b of pomo.breaksDone) {
      res.at(-1)!.end = b.start;
      if (b.end && b.end + 5000 < now) res.push({ start: b.end });
    }
    if (res.at(-1)!.end === undefined) res.at(-1)!.end = now;
    return parseDisplaySession(res);
  }

  function getNowInPercentage() {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.CREATED)
      return 0;
    return 100 * getNow(pomo.startedAt) / pomo.end;
  }

  function getPomoReport(): PomoReport {
    const pomo = getCurrentPomo();
    if (!pomo) return { timeTotal: '', timeStudy: '', timeBreak: '', nrBreaks: '', points: '' };
    const timeBreak = pomo.breaksDone.reduce((acc, curr) => acc + ((curr.end ?? curr.start) - curr.start), 0);
    const timeStudy = (pomo.endedAt ?? pomo.end) - timeBreak;
    const points = Math.max( ((timeStudy - timeBreak) / timeStudy * 100), 0 );

    return {
      timeTotal: timeFormatted((pomo.endedAt ?? pomo.end) / SECONDS_MULTIPLIER, false),
      timeStudy: timeFormatted(timeStudy / SECONDS_MULTIPLIER, false),
      timeBreak: timeFormatted(timeBreak / SECONDS_MULTIPLIER, false),
      nrBreaks: pomo.breaksDone.length.toString(),
      points: points.toFixed(1)
    };
  }

  function saveStatus() {
    stateStore.save();
  }

  function breakLength(b: Break) {
    return (b.end ?? b.start) - b.start;
  }

  async function playSound(sound: ESound) {
    const audio = new Audio(`/sounds/${sound}`);
    let volume = settingsStore.pomoSettings.soundVolume;
    if (volume === undefined) volume = 0.5;
    audio.volume = volume / 100;
    audio.play();
  }

  function timeFormatted(seconds: number, html: boolean = true) {
    let secondsLeft = seconds; // Math.floor(time  / MINUTE_MULTIPLIER * 60);
    const h = Math.floor(secondsLeft / 3600);
    secondsLeft -= h * 3600;
    const m = Math.floor(secondsLeft / 60);
    secondsLeft -= m * 60;
    const s = Math.floor(secondsLeft);

    const sStr = `${s.toString().padStart(2, '0')}`;
    const mStr = `${h > 0 ? m.toString().padStart(2, '0') : m.toString()}`;
    const hStr = h > 0 ? `${h}:` : '';
    const cssClass = h > 0 ? 'small seconds' : 'seconds';

    return html ? 
      `${hStr}${mStr}<span class="${cssClass}">:${sStr}</span>`
      : `${hStr}${mStr}:${sStr}`;
  }

  function timeSinceStartFormatted() {
    const pomo = getCurrentPomo()
    if (!pomo) return '0:00';
    const start = pomo.startedAt ? Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER) : 0;
    return timeFormatted( start );
  }

  function timeInCurrentBreakFormatted() {
    const pomo = getCurrentPomo()
    const startLastPause = pomo?.breaksDone.at(-1)?.start;
    if (!pomo || !startLastPause) return '0:00';
    const startS = Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER)
    const startLastPauseS = Math.floor(startLastPause / SECONDS_MULTIPLIER)
    return timeFormatted( startS - startLastPauseS );
  }
  function timeInCurrentStudyFormatted() {
    const pomo = getCurrentPomo()
    if (!pomo) return '0:00';
    const startLastStudy = pomo?.breaksDone.at(-1)?.end ?? 0;
    const startS = Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER)
    const startLastStudyS = Math.floor(startLastStudy / SECONDS_MULTIPLIER)
    return timeFormatted( startS - startLastStudyS );
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

    return (now - lastPoint) / (nextPoint - lastPoint);
  }


  // ---------- COMPUTED ----------
  const created    = computed(() => getCurrentPomo()?.state === PomodoroState.CREATED);
  const studing    = computed(() => getCurrentPomo()?.state === PomodoroState.STUDY);
  const pauseing   = computed(() => getCurrentPomo()?.state === PomodoroState.BREAK);
  const terminated = computed(() => getCurrentPomo()?.state === PomodoroState.TERMINATED);
  const going      = computed(() => studing.value || pauseing.value);

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
    const now = getNow(pomo?.startedAt);
    if (!pomo || !nextStop) return false;
    return nextStop - 500 < getNow(pomo?.startedAt);
  });

  const displayBreaks = computed(getDisplayBreaks);
  const displayStudy = computed(getDisplayStudy);
  const percentage = computed(getNowInPercentage);
  const timeSinceStart = computed(() => timeSinceStartFormatted());
  const timeInCurrentBreak = computed(() => timeInCurrentBreakFormatted());
  const timeInCurrentStudy = computed(() => timeInCurrentStudyFormatted());
  const percInCurrentState = computed(() => getCurrentStatePercentage());
  const done = computed(() => {
    const pomo = getCurrentPomo();
    if (!pomo) return false;
    return pomo.end <= getNow(pomo.startedAt);
  });
  const freeMode = computed(() => getCurrentPomo()?.freeMode ?? false);

  // ---------- RETURN ----------
  return {
    startPomodoro, stopPomodoro, togglePauseStudy, pause, study,
    getCurrentPomo, getBreaks,
    percentage, displayBreaks, displayStudy, report,
    created, going, studing, pauseing, terminated, done, freeMode, timeToBreak, timeToStudy,
    timeSinceStart, timeInCurrentBreak, timeInCurrentStudy, percInCurrentState
  }

})