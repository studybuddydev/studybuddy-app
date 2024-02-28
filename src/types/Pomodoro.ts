import { type PomodotoStatus, type PomodoroSettings, type Break, PomodoroState } from '.';

const TICK_TIME = 100;
const SECONDS_MULTIPLIER = 1000;
const MINUTE_MULTIPLIER = 60 * SECONDS_MULTIPLIER;
const POMO_VERSION = 3;

const SHORT_POMO_THRESHOLD = 5 * MINUTE_MULTIPLIER;
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
    const totalLength = free ? 0 : pomoSettings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength = free ? 0 : pomoSettings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks = free ? 0 : pomoSettings.numberOfBreak;

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
      ...(this.pomo?.breaksDone.map(x => ({ ...x, done: true })) ?? []),
      ...(this.pomo?.breaksTodo.map(x => ({ ...x, done: false })) ?? [])
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

  public stopPomodoro(lastInteraction: number | undefined = undefined) {
    const now = lastInteraction === undefined ? this.getNow() : this.getNow(lastInteraction);
    this.pomo.onLongBreak = false;
    this.pomo.endedAt = now;
    if (this.pomo.state === PomodoroState.BREAK) {
      const lastBreak = this.pomo.breaksDone.pop();
      if (lastBreak) {
        this.pomo.endedAt = lastBreak.start;
        if (!((this.pomo.originalEnd ?? 0) > this.pomo.end)) {
          this.pomo.end = Math.max(this.pomo.originalEnd ?? 0, lastBreak.start)
        }
      }
    }
    this.pomo.state = PomodoroState.TERMINATED;
  }

  public togglePauseStudy() {
    if (this.pomo.state === PomodoroState.STUDY) {
      this.pause();
    } else if (this.pomo.state === PomodoroState.BREAK) {
      this.study();
    }
  }

  private pause() {
    // adjustPomo();
    
    const now = this.getNow();
    this.pomo.state = PomodoroState.BREAK;

    const nextBreak = this.pomo.breaksTodo[0]; // get next break
    if (nextBreak && 2 * nextBreak.start - (nextBreak.end ?? now) < now) {  // if next break is close to now (within one break distance)
      nextBreak.end = now + ((nextBreak.end ?? now) - nextBreak.start); // shift break
      nextBreak.start = now;
      this.pomo.breaksDone.push(this.pomo.breaksTodo.shift()!); // Move break from todo to done
    } else {
      this.pomo.breaksDone.push({ start: now, end: now, soundStart: true, soundEnd: true });     // create new break
    }
  }

    // start the study ending a pause 
    private study() {
      // adjustPomo();
  
      const now = this.getNow(this.pomo.startedAt);
      this.pomo.state = PomodoroState.STUDY; // set state to study
  
      const lastBreak = this.pomo.breaksDone[this.pomo.breaksDone.length - 1]; // get last break and set the end 
      lastBreak.end = now;
    }

  private getNow(now: number = Date.now()) {
    return now - (this.pomo.startedAt ?? 0);
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

  public getPercentage() {
    if (this.pomo.state === PomodoroState.CREATED) return 0;
    return 100 * Math.min(this.getNow() / this.pomo.end, 1);
  }

}