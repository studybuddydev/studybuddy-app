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
export type PostIt = {
  color: string;
  content: string;
}
export type Task = {
  name: string,
  done: boolean,
}


export type WithLink = {
  links?: Link[];
}

export type WithPostIt = {
  postIts?: PostIt[];
}

export type WithTask = {
  tasks?: Task[];
}


export type Chapter = {
  name: string;
} & WithLink & WithPostIt & WithTask;

export type Exam = {
  name: string;
  icon: string;
  chapters: Chapter[];
  color?: string;
}  & WithLink & WithPostIt & WithTask;

// ---------- STATS ----------
export type Stats = {
  
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
  stats?: Stats;

  settings?: {
    pomodoro?: {
      pomodoroSettings?: PomodoroSettings;
      currentPomodoro?: CurrentPomodoro;
    };
    user?: UserSettings;
  }
}
