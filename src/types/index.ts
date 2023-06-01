export enum EStudyView {
  Dashboard, Exam, Chapter
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
  notes?: string,
  deadline?: string,
  done: boolean,
  isDeadline?: boolean,
}

export type WithLink = {
  links?: Link[];
}

export type WithPostIt = {
  postIts?: PostIt[];
}

export type WithTask = {
  tasks?: Task[];
  showTasks?: boolean;
}

export type StudyElement = {
  name: string;
} & WithLink & WithPostIt & WithTask;


export type Chapter = {
} & StudyElement;	


export type Exam = {
  icon: string;
  chapters?: Chapter[];
  color?: string;
  deadline?: string;
  tutorial?: boolean;
} & StudyElement;

export type Event = {
  title: string;
  description: string;
  color?: string;
  start: {
    hour: number;
    minute: number;
  },
  length: number;
}
export type Deadline = {
  name: string;
  deadline: string;
  type: DeadlineType;
  color?: string;
}
export enum DeadlineType { Exam, Task }

// ---------- POMODORO ----------
export enum EPomodoroBreakStatus {
  DONE,
  DOING,
  TODO,
}
export type PomodoroBreak = {
  start: number;
  lenght: number;
  status: EPomodoroBreakStatus;
}
export type PomodoroFlexStatus = {
  isBreak: boolean,
  status:string,
  breaks: PomodoroBreak[],
  startMs: number,
  interval: number | null,
}
export enum EPomodoroStatus {
  Study,
  ShortBreak,
  LongBreak,
}
export type PomodotoStatus = {
  pomodoroRunning: boolean,
  msPassed: number,
  msStarted: number,
  paused: boolean,
  status: EPomodoroStatus,
  studyDone: number,
  pomodoriDone: number,
}

// ---------- SETTINGS ----------
export type PomodoroSettings = {
  studyLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  nrStudy: number;
}
export type PomodoroFlexSettings = {
  numberOfBreak: number;
  breakLength: number;
  totalLength: string;
}
export type UserSettings = {
  username: string;
  theme: string;
  icon: string;
  lang: string;
}


export type Settings = {
  pomodoro?: {
    pomodoroSettings?: PomodoroSettings;
    pomodoroFlexSettings?: PomodoroFlexSettings;
  };
  user?: UserSettings;
}


export type State = {
  data: {
    exams: Exam[];
    dashboard: StudyElement;
    events: { [key: string]: Event[] },
  },
  pomodoro: {
    pomodoroStatus?: PomodotoStatus;
    pomodoroFlexStatus?: PomodoroFlexStatus;
  }
}
