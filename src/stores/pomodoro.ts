import { defineStore } from 'pinia'
import { type PomodoroFlexSettings, type PomodoroFlexStatus, type PomodoroBreak, EPomodoroBreakStatus } from '@/types';
import { useStateStore } from "@/stores/state";
import { computed, ref } from 'vue';

let _state = null as any;
function getState() {
  if (_state === null)
    _state = useStateStore();

  return _state;
}


enum ESound {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

export const usePomodoroStore = defineStore('pomodoro', () => {

  const MINUTE_MULTIPLIER = 0.2;
  let pauseStartHit = false;
  let pauseEndHIt = false;

  const breakLengthPercentage = computed(() => (settings.value.breakLength * MINUTE_MULTIPLIER) / (settings.value.totalLength * MINUTE_MULTIPLIER) * 100);
  const going = computed(() => status.value.interval !== null);

  const settings = ref<PomodoroFlexSettings>(getState().getPomodoroFlexSettings() ?? {
    totalLength: 120,
    numberOfBreak: 3,
    breakLength: 5,
  });
  const status = ref<PomodoroFlexStatus>(
    getState().getPomodoroFlexStatus() ?? {
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
    status.value.isBreak = false;
    status.value.status = 'STUDIA!';
    status.value.breaks = generateBreaks();
    percentage.value = 0;
    status.value.startMs = Date.now();
  
    saveStatus();
    status.value.interval = startInterval();
  }

  function stopPomodoro() {
    if (status.value.interval !== null) {
      clearInterval(status.value.interval);
      status.value.interval = null;
    }
  
    status.value.status = 'Reinizia!';
    saveStatus();
  }

  function startInterval() {
    if (status.value.interval !== null)
      clearInterval(status.value.interval);
  
    return setInterval(() => {
      const now = Date.now();
      percentage.value = (now - status.value.startMs) / (settings.value.totalLength * MINUTE_MULTIPLIER *  10);
      if (percentage.value > 100) {
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
  
    for (const b of status.value.breaks) {
      if (b.status === EPomodoroBreakStatus.DOING) {
        b.lenght = percentage.value - b.start;
        b.status = EPomodoroBreakStatus.DONE;
        status.value.isBreak = false;
        status.value.status = 'STUDIA!';
        saveStatus();
        return;
      }
  
      if (b.status === EPomodoroBreakStatus.TODO) {
        b.start = percentage.value;
        b.status = EPomodoroBreakStatus.DOING;
  
        status.value.isBreak = true;
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
  
    return new Array(settings.value.numberOfBreak).fill(0).map((_, i) => ({
      start: studyTime * (i + 1) + (breakLengthPercentage.value * i),
      lenght: breakLengthPercentage.value,
      status: EPomodoroBreakStatus.TODO
    }));
  }

  function saveStatus() {
    getState().setPomodoroFlexStatus(status.value);
  }

  function playSound(sound: ESound) {
    const audio = new Audio(`/sounds/${sound}`);
    audio.play();
  }


  return {
    MINUTE_MULTIPLIER,
    breakLengthPercentage, going,
    settings, percentage, status,
    startPomodoro, stopPomodoro, nextStep
  }

})