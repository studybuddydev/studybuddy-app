import { defineStore } from 'pinia'
import { type PomoReport, type Break, PomodoroState, type PomodotoStatus, type DisplayBreak } from '@/types';
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { computed, ref } from 'vue';

const TICK_TIME = 15;
const SECONDS_MULTIPLIER = 1000;
const MINUTE_MULTIPLIER = 0.1 * SECONDS_MULTIPLIER;
enum ESound {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

export const usePomodoroStore = defineStore('pomodoro', () => {

  // ---------- PROPERTIES ----------
  const settingsStore = useSettingsStore();
  const stateStore = useStateStore();

  // const currentPomodoro = ref(stateStore.getPomodoroStatus());
  // const pomo = computed(() => stateStore.getPomodoroStatus())
  function getCurrentPomo() {
    return stateStore.getPomodoroStatus();
  }
  let interval: number | undefined;
  let _report: PomoReport | undefined;
  let now = ref(Date.now());
  init();


  // ---------- INIT ----------
  function init() {
    const pomo = getCurrentPomo();
    if (!pomo || pomo.state === PomodoroState.TERMINATED) {
      createPomodoro();
      console.log('creating pomo')
    } else {
      interval = setInterval(tick, TICK_TIME);
    }
  }

  // ---------- STATE ----------

  // set up pomodoro ( a study session using the data from the settings), this method modify the currentPomodoro object
  function createPomodoro() {
    clearStuff();
    const settings = settingsStore.pomodoroFlexSettings;

    const totalLength = settings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength = settings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks = settings.numberOfBreak;

    // currentPomodoro.value = {
    const pomo: PomodotoStatus = {
      end: totalLength,
      breaksDone: [],
      breaksTodo: generateBreaks(totalLength, breaksLength, nrOfBreaks),
      state: PomodoroState.CREATED
    }
    stateStore.setPomodoroStatus(pomo);
    saveStatus();
  }

  // when you first press start you set the start time of the pomodoro and sets the state to study
  function startPomodoro() {
    console.log('start')
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
    console.log('stop')
    const pomo = getCurrentPomo();
    if (pomo) {
      pomo.state = PomodoroState.TERMINATED;
      pomo.endedAt = getNow(pomo.startedAt);
    }
    saveStatus();
  }
  // between start and stop you alternate between study and pause, this method is called when you press the pause/play button during a pomdoo
  function togglePauseStudy() {
    console.log('toggle')
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
    console.log('pause')
    const pomo = getCurrentPomo();
    if (!pomo) {
      stopPomodoro();
      return;
    }
    console.log(pomo)
    adjustPomo();
    
    const now = getNow(pomo.startedAt);
    pomo.state = PomodoroState.BREAK;

    const nextBreak = pomo.breaksTodo[0]; // get next break
    if (nextBreak && 2 * nextBreak.start - (nextBreak.end ?? now) < now) {  // if next break is close to now (within one break distance)
      nextBreak.end = now + ((nextBreak.end ?? now) - nextBreak.start); // shift break
      nextBreak.start = now;
      pomo.breaksDone.push(pomo.breaksTodo.shift()!); // Move break from todo to done
    } else {
      pomo.breaksDone.push({ start: now, end: now, soundStart: true });     // create new break
    }
    saveStatus();
  }

  // start the study ending a pause 
  function study() {
    console.log('study')
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

      if (curEndProgress > nextBreak.start) {
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
    _report = undefined;
  }

  function getBreaks() {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    return [
      ...(pomo?.breaksDone.map(x => ({...x, done: true})) ?? []) ,
      ...(pomo?.breaksTodo.map(x => ({...x, done: false})) ?? [])
    ];
  }

  function getDisplayBreaks(): DisplayBreak[] {
    const pomo = getCurrentPomo();
    if (!pomo) return [];
    const now = getNow(pomo.startedAt);
    return getBreaks().map(b => {
      const startPerc = 100 * b.start / pomo.end;
      const end = b.end ?? now;
      const lengthPerc = (100 * (end / pomo.end)) - startPerc;
      return {
        startPerc, lengthPerc,
        lengthTime: timeFormatted(end - b.start),
        done: b.done
      }
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

  function breakLength(b: Break) {
    return (b.end ?? b.start) - b.start;
  }

  async function playSound(sound: ESound) {
    const audio = new Audio(`/sounds/${sound}`);
    let volume = settingsStore.pomodoroFlexSettings.soundVolume;
    if (volume === undefined) volume = 0.5;
    audio.volume = volume / 100;
    audio.play();
  }

  function timeFormatted(seconds: number) {
    let secondsLeft = seconds; // Math.floor(time  / MINUTE_MULTIPLIER * 60);
    const h = Math.floor(secondsLeft / 3600);
    secondsLeft -= h * 3600;
    const m = Math.floor(secondsLeft / 60);
    secondsLeft -= m * 60;
    const s = Math.floor(secondsLeft);

    const sStr = s.toString().padStart(2, '0');
    const mStr = `${h > 0 ? m.toString().padStart(2, '0') : m.toString()}:`;
    const hStr = h > 0 ? `${h}:` : '';
    return `${hStr}${mStr}${sStr}`;
  }

  function timeSinceStartFormatted() {
    const pomo = getCurrentPomo()
    if (!pomo) return '0:00';
    const start = Math.floor(getNow(pomo.startedAt) / SECONDS_MULTIPLIER)
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


  // ---------- COMPUTED ----------
  const created    = computed(() => getCurrentPomo()?.state === PomodoroState.CREATED);
  const studing    = computed(() => getCurrentPomo()?.state === PomodoroState.STUDY);
  const pauseing   = computed(() => getCurrentPomo()?.state === PomodoroState.BREAK);
  const terminated = computed(() => getCurrentPomo()?.state === PomodoroState.TERMINATED);
  const going      = computed(() => studing.value || studing.value);

  const displayBreaks = computed(getDisplayBreaks);
  const percentage = computed(getNowInPercentage);
  const timeSinceStart = computed(() => timeSinceStartFormatted());
  const timeInCurrentBreak = computed(() => timeInCurrentBreakFormatted());
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
    created, going, studing, pauseing, terminated, done,
    timeSinceStart, timeInCurrentBreak
  }

})