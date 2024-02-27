import { type PomodotoStatus, type PomodoroSettings, type Break, PomodoroState } from '.';

const TICK_TIME = 100;
const SECONDS_MULTIPLIER = 1000;
const MINUTE_MULTIPLIER = 60 * SECONDS_MULTIPLIER;
const POMO_VERSION = 3;

const SHORT_POMO_THRESHOLD =  5 * MINUTE_MULTIPLIER;
const LONG_BREAK_THRESHOLD = 15 * MINUTE_MULTIPLIER;

const STOPPOMODORO_TIMEOUT = 60 * MINUTE_MULTIPLIER;

export default class Pomodoro {

  private pomo: PomodotoStatus;
  private interval: number | null = null;

  constructor(pomoSettings: PomodoroSettings) {
    this.pomo = this.getNewPomodoro(pomoSettings);
  }

  private getNewPomodoro(pomoSettings: PomodoroSettings): PomodotoStatus {
    const free = !!pomoSettings.freeMode;
    const totalLength   = free ? 0 : pomoSettings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength  = free ? 0 : pomoSettings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks    = free ? 0 : pomoSettings.numberOfBreak;

    return {
      version: POMO_VERSION,
      end: totalLength,
      breaksDone: [],
      breaksTodo: this.generateBreaks(totalLength, breaksLength, nrOfBreaks),
      state: PomodoroState.CREATED,
      soundEnd: totalLength <= 1000,
      freeMode: free
    }
  }

  public clear() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public getBreaks() {
    return [
      ...(this.pomo?.breaksDone.map(x => ({...x, done: true})) ?? []) ,
      ...(this.pomo?.breaksTodo.map(x => ({...x, done: false})) ?? [])
    ];
  }

  public startPomodoro(pomoSettings: PomodoroSettings) {
    if (this.pomo.state === PomodoroState.TERMINATED) {
      this.pomo = this.getNewPomodoro(pomoSettings);
    }
    this.pomo.startedAt = Date.now();
    this.pomo.state = PomodoroState.STUDY;
    this.pomo.originalEnd = this.pomo.end;
    this.interval = setInterval(() => this.tick(), TICK_TIME);
  }

  private tick() {
    if (
      this.pomo.state === PomodoroState.BREAK ||
      this.pomo.state === PomodoroState.STUDY) {
      // adjustPomo();
    } else {
      if (this.interval)
        clearInterval(this.interval);
    }
  }

  private generateBreaks(remainingLenght: number, breaksLength: number, nrOfBreaks: number) {
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
}