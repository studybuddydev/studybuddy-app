export type MenuElement = {
  name: string;
  to: string;
  icon?: string;
  color?: string;
}

// ---------- EXAM ----------
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
  nrShortBreaks: number;
}
export type UserSettings = {
  username: string;
  theme: string;
  icon: string;
}

export type State = {
  username: string;
  exams: Exam[];

  settings: {
    pomodoro?: PomodoroSettings;
    user?: UserSettings;
  }
}
