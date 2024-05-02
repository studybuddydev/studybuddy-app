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
  minutes: number;
  done?: boolean;
  index: number;
  small?: boolean;
  color?: string;
  deepWork?: boolean;
}

export type PomoReport = {
  timeTotal: number;
  timeStudy: number;
  timeBreak: number;
  nrBreaks: number;
  points: number;
  shortPomo?: boolean;
}

export type PomodoroBase = {
  end: number;
  endedAt?: number;
  breaksDone: Break[];
  freeMode: boolean;
  tasks?: PomodoroTask[];
  deepWork: boolean;
  tag?: string;
  rating?: number;
  report?: PomoReport;
  id?: number;
  name?: string;
}

export interface PomodotoStatus extends PomodoroBase {
  // lastTick: number;
  version: number;
  startedAt?: number;
  state: PomodoroState;
  breaksTodo: Break[];
  soundEnd?: boolean;
  onLongBreak?: boolean;
  originalEnd?: number;
  timestamp?: number;
}

export interface PomodoroRecord extends PomodoroBase {
  datetime: Date;
  displayBreaks?: DisplaySession[];
  displayStudy?: DisplaySession[];
  // percentage?: number;
}


export interface PomodoroTask {
  task: string;
  done?: boolean;
}

// ---------- SETTINGS ----------
export type PomodoroSettings = {
  freeMode?: boolean;
  numberOfBreak: number;
  breaksLength: number;
  totalLength: number;
}
export type GeneralSettings = {
  lang: string;
  hideTime: boolean;
  disableCountdown: boolean;
  hideSetup: boolean;
  soundMute: boolean;
  soundVolume: number;
  videoMute: boolean;
  videoVolume: number;
  pulsingPause: boolean;
  showSeconds: boolean;
  startPipped: boolean;
  dayStartEndHours: [number, number];
}
export type ThemeSettings = {
  palette: string;
  icon: string;
  backgroundColor?: string;
  backgroundImg?: string;
  backgroundVideo?: string;
  showOnlyMusic?: boolean;
}

export type Settings = {
  pomodoro: PomodoroSettings;
  general: GeneralSettings;
  theme: ThemeSettings;
}

// ---- DBs ----
export interface Theme {
  id?: number;
  title?: string;
  palette?: string;
  category?: string;
  backgroundColor?: string;
  backgroundImg?: string;
  previewImg?: string;
  backgroundVideo?: string;
  showOnlyMusic?: boolean;
}
export interface Timer {
  id?: number;
  title: string;
  studyLength: number;
  breakLength: number;
  repetitions: number;
  freeMode?: boolean;
}

export interface PomodoroDBO extends PomodoroBase {
  id?: number;
  datetime: Date;
  tag?: string;
  rating?: number;
  deepWork: boolean;
  tasks?: PomodoroTask[];
}


export type State = {
  data: {
    exams: Exam[];
    dashboard: StudyElement;
    events: { [key: string]: Event[] },
  },
  pomodoro?: PomodotoStatus;
}