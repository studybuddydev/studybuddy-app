import { ref } from 'vue';
import { type PomodotoStatus, type PomodoroSettings, type Break, PomodoroState } from '.';

const TICK_TIME = 100;
const SECONDS_MULTIPLIER = 1000;
const MINUTE_MULTIPLIER = 60 * SECONDS_MULTIPLIER;
const POMO_VERSION = 3;
const SHORT_POMO_THRESHOLD = 5 * MINUTE_MULTIPLIER;
const LONG_BREAK_THRESHOLD = 15 * MINUTE_MULTIPLIER;

export enum ENotification {
  BreakStart = 'pomo.wav',
  BreakDone = 'break.wav',
  PomodoroDone = 'pomodoro.wav',
}

export default class Pomodoro {


  private now = ref(Date.now());

  private pomo: PomodotoStatus;
  private settings: PomodoroSettings;
  private newSettings: PomodoroSettings | null = null;
  private interval: number | null = null;
  private sendNotification = (type: ENotification) => { };
  private sendInteraction = () => { };

  constructor(pomoSettings: PomodoroSettings, prevPomo?: PomodotoStatus) {
    this.settings = { ...pomoSettings };
    this.pomo = prevPomo ?? this.getNewPomodoro();
  }

  public settingsUpdated(newPomoSettings: PomodoroSettings) {
    this.newSettings = newPomoSettings;
    if (this.isCreated()) {
      this.pomo = this.getNewPomodoro();
    }
  }

  public reset() {
    this.pomo = this.getNewPomodoro();
    this.sendInteraction();
  }

  public setNotificationSubscriber(subscriber: (type: ENotification) => void) {
    this.sendNotification = subscriber;
  }
  public setSendInteraction(subscriber: () => void) {
    this.sendInteraction = subscriber;
  }


  public getCurrentStatePercentage() {
    const now = this.getNow();
    let lastPoint = 0;
    let nextPoint = this.pomo.end;

    if (this.pomo.state === PomodoroState.STUDY) {
      lastPoint = this.pomo.breaksDone.at(-1)?.end ?? 0;
      nextPoint = this.pomo.breaksTodo[0]?.start ?? this.pomo.end;
    } else if (this.pomo.state === PomodoroState.BREAK) {
      const currBreak = this.pomo.breaksDone.at(-1);
      lastPoint = currBreak?.start ?? 0;
      nextPoint = currBreak?.end ?? now;
    }
    return Math.min((now - lastPoint) / (nextPoint - lastPoint), 100);
  }

  public getNowInSeconds() {
    return this.getNow() / SECONDS_MULTIPLIER;
  }
  public getStartLastPauseInSeconds() {
    const s = this.pomo.breaksDone.at(-1)?.start
    return s ? s / SECONDS_MULTIPLIER : null;
  }
  public getStartLastStudyInSeconds() {
    return this.pomo.breaksDone.at(-1)?.end ?? 0  / SECONDS_MULTIPLIER;
  }
  public static toSeconds(time: number) {
    return time / SECONDS_MULTIPLIER
  }

  public isShortPomo() {
    if (this.isTerminated() && this.pomo.endedAt)
      return this.pomo.endedAt <= SHORT_POMO_THRESHOLD;
    return false;
  }

  public isCreated() {
    return this.pomo.state === PomodoroState.CREATED;
  }
  public isStuding() {
    return this.pomo.state === PomodoroState.STUDY;
  }
  public isPausing() {
    return this.pomo.state === PomodoroState.BREAK;
  }
  public isTerminated() {
    return this.pomo.state === PomodoroState.TERMINATED;
  }
  public isGoing() {
    return this.pomo.state === PomodoroState.STUDY || this.pomo.state === PomodoroState.BREAK;
  }
  public isOnLongBreak() {
    return this.pomo.onLongBreak ?? false;
  }
  public isTimeToBreak() {
    if (!this.isStuding()) return false;
    const nextStart = this.pomo.breaksTodo[0]?.start;
    if (!nextStart) return false;
    return nextStart - 500 < this.getNow();
  }
  public isTimeToStudy() {
    if (!this.isPausing()) return false;
    const nextStop = this.pomo.breaksDone.at(-1)?.end;
    if (!nextStop) return false;
    return nextStop - 500 < this.getNow();
  }
  public isDone() {
    return this.pomo.end <= this.getNow();
  }
  public isFreeMode() {
    return this.pomo.freeMode ?? false;
  }

  private getNewPomodoro(): PomodotoStatus {
    this.clear();
    if (this.newSettings) {
      this.settings = this.newSettings;
      this.newSettings = null;
    }

    const free = this.settings.freeMode;
    const totalLength = free ? 0 : this.settings.totalLength * MINUTE_MULTIPLIER;
    const breaksLength = free ? 0 : this.settings.breaksLength * MINUTE_MULTIPLIER;
    const nrOfBreaks = free ? 0 : this.settings.numberOfBreak;

    return {
      version: POMO_VERSION,
      end: totalLength,
      breaksDone: [],
      breaksTodo: this.generateBreaks(totalLength, breaksLength, nrOfBreaks),
      state: PomodoroState.CREATED,
      soundEnd: totalLength <= 1000,
      freeMode: !!free
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

  public resume() {
    this.clear();
    this.interval = setInterval(() => this.tick(), TICK_TIME);
    this.sendInteraction();
  }

  public start() {
    if (this.pomo.state === PomodoroState.TERMINATED) {
      this.pomo = this.getNewPomodoro();
    }
    this.pomo.startedAt = Date.now();
    this.pomo.state = PomodoroState.STUDY;
    this.pomo.originalEnd = this.pomo.end;
    this.resume();
  }

  public stop(lastInteraction: number | undefined = undefined) {
    this.clear()

    const now = lastInteraction === undefined ? this.getNow() : lastInteraction - (this.pomo.startedAt ?? 0);
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
    this.sendInteraction();
  }

  public togglePauseStudy() {
    if (this.pomo.state === PomodoroState.STUDY) {
      this.pause();
    } else if (this.pomo.state === PomodoroState.BREAK) {
      this.study();
    }
  }

  public pause() {
    this.adjustPomo();

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
    this.sendInteraction();
  }

  public study() {
    if (this.pomo.onLongBreak) {
      this.stop();
      this.start();
      return;
    }
    
    this.adjustPomo();

    const now = this.getNow();
    this.pomo.state = PomodoroState.STUDY; // set state to study

    const lastBreak = this.pomo.breaksDone[this.pomo.breaksDone.length - 1]; // get last break and set the end 
    lastBreak.end = now;
    this.sendInteraction();
  }

  public getNow() {
    return this.now.value - (this.pomo.startedAt ?? 0);
  }
  public getPomo() {
    return this.pomo;
  }

  private tick() {
    if (
      this.pomo.state === PomodoroState.BREAK ||
      this.pomo.state === PomodoroState.STUDY) {
      this.adjustPomo();
    } else {
      this.clear()
    }
    
    this.now.value = Date.now(); // TOMOVE
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

  private adjustPomo() {
    const now = this.getNow();

    if (this.pomo.end < now) {
      // add next slot
      if (!this.settings.freeMode && this.pomo.state === PomodoroState.BREAK) {
        const pauseLength = (this.settings.breaksLength * MINUTE_MULTIPLIER) / this.settings.numberOfBreak;
        const studyLength = ((this.settings.totalLength - this.settings.breaksLength) * MINUTE_MULTIPLIER) / (this.settings.numberOfBreak + 1);

        const currBreak = this.pomo.breaksDone[this.pomo.breaksDone.length - 1];
        const currBreakLength = (currBreak.end ?? currBreak.start) - currBreak.start;
        if (currBreakLength < pauseLength) {
          currBreak.end = currBreak.start + pauseLength;
        }
        this.pomo.end = (currBreak.end ?? currBreak.start) + studyLength;
      } else {
        this.pomo.end = now;
        if (!this.pomo.soundEnd) {
          this.pomo.soundEnd = true;
          this.sendNotification(ENotification.PomodoroDone);
        }
      }
    }


    if (this.pomo.state === PomodoroState.BREAK) {                           // PAUSE
      const currBreak = this.pomo.breaksDone[this.pomo.breaksDone.length - 1];    // get current break
      if (currBreak.end) {                                              // if break is done
        let toSteal = now - currBreak.end;                              // time to steal from next break
        if (toSteal > 0) {                                              // if there is time to stea
          currBreak.end = now;                                          // set current break end to now ( if you are in a new break you are moving the break end every second)
          if (!currBreak.soundEnd) {                                    // if sound is not played yet
            currBreak.soundEnd = true;                                  // set sound played to true
            this.sendNotification(ENotification.BreakDone);                  // play sound 
          }
        }
        while (toSteal > 0) {                                          // while there is time to steal
          const nextPause = this.pomo.breaksTodo[0];                        // get next break
          if (!nextPause) break;
          nextPause.start += toSteal;

          if (nextPause.end && nextPause.start > nextPause.end) {
            toSteal = nextPause.start - nextPause.end;
            this.pomo.breaksTodo.shift();
          } else {
            toSteal = 0;
          }

        }
      } else {
        currBreak.end = now;
      }

      // check pausa lunga
      if (this.pomo.onLongBreak || currBreak.end - currBreak.start > LONG_BREAK_THRESHOLD) {
        this.pomo.onLongBreak = true;
        this.pomo.breaksTodo = [];
        this.pomo.end = now;
      }

    } else if (this.pomo.state === PomodoroState.STUDY) {                                    // STUDY
      let nextBreak = this.pomo.breaksTodo[0];
      let curEndProgress = now

      if (nextBreak && curEndProgress > nextBreak.start && !nextBreak.soundStart) {
        nextBreak.soundStart = true;
        this.sendNotification(ENotification.BreakStart);
      }

      if (nextBreak && curEndProgress > nextBreak.start) {
        nextBreak.end = curEndProgress + ((nextBreak.end ?? now) - nextBreak.start)
        nextBreak.start = now;
        curEndProgress = nextBreak.end;

        let nextNextBreak: Break | null = this.pomo.breaksTodo[1];
        while (nextNextBreak) {
          if (curEndProgress > nextNextBreak.start) {
            nextBreak.end = (nextBreak.end ?? nextBreak.start) + ((nextBreak.end ?? nextBreak.start) - nextBreak.start);
            this.pomo.breaksTodo.splice(1, 1);
            nextNextBreak = this.pomo.breaksTodo[1];
          } else {
            nextNextBreak = null;
          }
        }
      }
    }
  }
}