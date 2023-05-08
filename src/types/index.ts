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
  chapters: Chapter[];
  color?: string;
  deadline?: string;
  tutorial?: boolean;
} & StudyElement;

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
export type FlexSettings = {
  numberOfBreak: number;
  breakLength: number;
  totalLength: number;
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

export enum DeadlineType { Exam, Task }

export type Deadline = {
  name: string;
  deadline: string;
  type: DeadlineType;
  color?: string;
}

export type State = {
  username: string;
  stats: Stats;

  data: {
    exams: Exam[];
    dashboard: StudyElement;
    events: { [key: string]: Event[] }
  }

  settings: {
    pomodoro?: {
      pomodoroSettings?: PomodoroSettings;
      pomodoroFlexSettings?: FlexSettings;
      currentPomodoro?: CurrentPomodoro;
    };
    user?: UserSettings;
  }
}
