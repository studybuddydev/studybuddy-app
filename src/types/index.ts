import type { index } from 'realm';

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
export enum PomodoroState {
  CREATED = 0, STUDY = 1, BREAK = 2, TERMINATED = 3
}
export enum BreakState { NOTDONE = 0, DOING = 1, DONE = 2 };
export type Break = {
  start: number;
  end?: number;
  soundStart?: boolean;
  soundEnd?: boolean;
}
export type DisplaySession = {
  startPerc: number;
  lengthPerc: number;
  lengthTime: string;
  done?: boolean;
  index: number;
  small?: boolean;
}

export type PomoReport = {
  timeTotal: string;
  timeStudy: string;
  timeBreak: string;
  nrBreaks: string;
  points: string;
  pointsValue: number;
  shortPomo?: boolean;
}

export type Pomodoro = {
  end: number;
  endedAt?: number;
  breaksDone: Break[];
  freeMode: boolean;
}

export interface PomodotoStatus extends Pomodoro {
  // lastTick: number;
  version: number;
  startedAt?: number;
  state: PomodoroState;
  breaksTodo: Break[];
  soundEnd?: boolean;
  onLongBreak?: boolean;
}

export interface PomodoroRecord extends Pomodoro {
  id?: number;
  datetime: Date;
  displayBreaks?: DisplaySession[];
  displayStudy?: DisplaySession[];
  percentage?: number;
  report?: PomoReport;
}

// ---------- SETTINGS ----------
export type PomodoroSettings = {
  freeMode?: boolean;
  numberOfBreak: number;
  breaksLength: number;
  totalLength: number;
  soundVolume: number;
}
export type UserSettings = {
  lang: string;
  hideTime: boolean;
}
export type ThemeSettings = {
  theme: string;
  icon: string;
  backgroundColor?: string;
  backgroundImg?: string;
}

export type Settings = {
  pomodoro: PomodoroSettings;
  user: UserSettings;
  theme: ThemeSettings;
}


export type State = {
  data: {
    exams: Exam[];
    dashboard: StudyElement;
    events: { [key: string]: Event[] },
  },
  pomodoro?: PomodotoStatus;
}