import { defineStore } from 'pinia'
import { type PomodoroFlexSettings, type PomodoroFlexStatus, type PomodoroBreak, EPomodoroBreakStatus } from '@/types';
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { computed, ref } from 'vue';

enum ESound {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

type PomodoroReport = {
  reportDone: boolean;
  studyLength: number;
  breakLength: number;
}

export const usePomodoroStore = defineStore('pomodoro', () => {

  const settingsStore = useSettingsStore();
  const stateStore = useStateStore();


  const currentReport = ref<PomodoroReport>({
    reportDone: false,
    studyLength: 0,
    breakLength: 0,
  });
  
  let breakStartTime: number | null = null;
  const MINUTE_MULTIPLIER = 60;
  let pauseStartHit = false;
  let pauseEndHIt = false;
  const timeToBreak = ref(false);
  const finished = ref(false);
  const stopped = ref(false);
  const itsTimeToBreak = computed(() => timeToBreak.value);
  const itsFinished = computed(() => finished.value);
  const itsStopped = computed(() => stopped.value);
  const getReport = computed(() => currentReport.value);

  const totalLength = computed(() => {
    const hm = settings.value.totalLength.split(':').map(x => +x);
    return hm[0] * 60 + hm[1];
  });
  const breakLengthPercentage = computed(() => (settings.value.breakLength * MINUTE_MULTIPLIER) / (totalLength.value * MINUTE_MULTIPLIER) * 100);
  const going = computed(() => status.value.interval !== null);

  const tutorialPomodoroSettings: PomodoroFlexSettings = {
    totalLength: '00:15',
    breakLength: 1,
    numberOfBreak: 3,
  }
  const settings = computed<PomodoroFlexSettings>(() => stateStore.isInTutorial ? tutorialPomodoroSettings : settingsStore.pomodoroFlexSettings);
  const status = ref<PomodoroFlexStatus>(
    stateStore.getPomodoroFlexStatus() ?? {
      isBreak: false,
      status: 'Inizia!',
      breaks: generateBreaks(),
      startMs: Date.now(),
      interval: null,
  });
  const percentage = ref<number>(0);

  if (status.value.interval !== null) {
    startInterval();
  } else {
    status.value.breaks = generateBreaks();
  }


  function startPomodoro() {
    currentReport.value = {
      reportDone: false,
      studyLength: 0,
      breakLength: 0,
    }
    breakStartTime = null;
    timeToBreak.value = false;
    finished.value = false;
    status.value.isBreak = false;
    status.value.status = 'STUDIA!';
    status.value.breaks = generateBreaks();
    percentage.value = 0;
    status.value.startMs = Date.now();
    status.value.interval = startInterval();
    stopped.value = false;
    saveStatus();
  }

  function stopPomodoro() {
    if (status.value.interval !== null) {
      clearInterval(status.value.interval);
      status.value.interval = null;
    }

    currentReport.value.studyLength += Date.now() - (status.value.startMs ?? Date.now());
    if (status.value.isBreak) {
      currentReport.value.breakLength += Date.now() - (breakStartTime ?? Date.now());
    }
    currentReport.value.reportDone = true;
  
    status.value.status = 'Reinizia!';
    stopped.value = true;
    saveStatus();
  }

  function startInterval() {
    if (status.value.interval !== null)
      clearInterval(status.value.interval);
  
    return setInterval(() => {
      const now = Date.now();
      percentage.value = (now - status.value.startMs) / (totalLength.value * MINUTE_MULTIPLIER *  10);
      if (percentage.value > 100) {
        finished.value = true;
        percentage.value = 100;
        if (status.value.interval !== null) {
          clearInterval(status.value.interval);
          status.value.interval = null;
          playSound(ESound.PomodoroDone);
        }
      }
      updateBreaks();
    }, 16);
  }

  function nextStep() {
    if (status.value.interval === null) return;

    pauseStartHit = false;
    pauseEndHIt = false;
    timeToBreak.value = false;

  
    for (const b of status.value.breaks) {
      if (b.status === EPomodoroBreakStatus.DOING) {
        b.lenght = percentage.value - b.start;
        b.status = EPomodoroBreakStatus.DONE;
        status.value.isBreak = false;
        currentReport.value.breakLength += Date.now() - (breakStartTime ?? Date.now());
        breakStartTime = null;
        status.value.status = 'STUDIA!';
        saveStatus();
        return;
      }
  
      if (b.status === EPomodoroBreakStatus.TODO) {
        b.start = percentage.value;
        b.status = EPomodoroBreakStatus.DOING;
  
        status.value.isBreak = true;
        breakStartTime = Date.now();
        status.value.status = 'Relax';
        saveStatus();
        return;
      }
    }
  
    // add a new pause if none found
    status.value.breaks.push({
      start: percentage.value,
      lenght: 0,
      status: EPomodoroBreakStatus.DOING
    });
    status.value.isBreak = true;
    breakStartTime = Date.now();
    status.value.status = 'Relax';
    saveStatus();
  
  }

  function updateBreaks() {

    let capoTreno = percentage.value;
  
    for (let i = 0; i < status.value.breaks.length; i++) {
      const b = status.value.breaks[i];
      if (b.status === EPomodoroBreakStatus.DOING) {
  
        const itHasBeingGoingFor = percentage.value - b.start;
        if (b.lenght < itHasBeingGoingFor) {
          b.lenght = itHasBeingGoingFor;
          if (!pauseEndHIt) {
            playSound(ESound.BreakDone);
            pauseEndHIt = true;
            saveStatus();
          }
        } else {
          capoTreno = b.start + b.lenght;
        }
  
      } else if (b.status === EPomodoroBreakStatus.TODO) {
  
        if (b.start < capoTreno) {
          const prev = status.value.breaks[i - 1];
          if (prev && prev.status !== EPomodoroBreakStatus.DONE) {
            // JOIN
            prev.lenght = b.start - prev.start + b.lenght;
            status.value.breaks.splice(i, 1);
            i--;
            saveStatus();
          } else {
            b.start = capoTreno;
            capoTreno = b.start + b.lenght;
            if (!timeToBreak.value) timeToBreak.value = true;
  
            if (!pauseStartHit) {
              playSound(ESound.BreakStart);
              pauseStartHit = true;
              saveStatus();
            }
          }
        }
      }
    }
  }

  function generateBreaks(): PomodoroBreak[] {
    const totalBreakTime = breakLengthPercentage.value * settings.value.numberOfBreak;
    const leftTime = 100 - totalBreakTime;
    
    const studyTime = leftTime / (settings.value.numberOfBreak + 1);
  
    const res = new Array(settings.value.numberOfBreak).fill(0).map((_, i) => ({
      start: studyTime * (i + 1) + (breakLengthPercentage.value * i),
      lenght: breakLengthPercentage.value,
      status: EPomodoroBreakStatus.TODO
    }));
    return res;
  }

  function saveStatus() {
    stateStore.setPomodoroFlexStatus(status.value);
  }

  function playSound(sound: ESound) {
    const audio = new Audio(`/sounds/${sound}`);
    audio.play();
  }


  return {
    MINUTE_MULTIPLIER,
    breakLengthPercentage, going, totalLength, itsTimeToBreak, itsFinished, getReport, itsStopped,
    settings, percentage, status,
    startPomodoro, stopPomodoro, nextStep
  }

})