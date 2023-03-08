export type MenuElement = {
  name: string;
  to: string;
  icon?: string;
  color?: string;
}

// ---------- EXAM ----------
export type Link = {
  name: string;
  url: string;
}

export type Chapter = {
  name: string;
}

export type Exam = {
  name: string;
  icon: string;
  chapters: Chapter[];
  color?: string;
}

// ---------- SETTINGS ----------
export type PomodoroSettings = {
  studyLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  nrStudy: number;
}
export enum EPomodoroStatus {
  Study,
  ShortBreak,
  LongBreak,
}
export type CurrentPomodoro = {
  pomodoroRunning: boolean,
  msPassed: number,
  msStarted: number,
  paused: boolean,
  status: EPomodoroStatus,
  studyDone: number,
  pomodoriDone: number,
}
export type UserSettings = {
  username: string;
  theme: string;
  icon: string;
}

export type State = {
  username?: string;
  exams?: Exam[];

  settings?: {
    pomodoro?: {
      pomodoroSettings?: PomodoroSettings;
      currentPomodoro?: CurrentPomodoro;
    };
    user?: UserSettings;
  }
}
