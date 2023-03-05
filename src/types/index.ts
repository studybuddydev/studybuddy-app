export type MenuElement = {
  name: string;
  to: string;
  icon?: string;
  color?: string;
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

export type PomodoroSettings = {
  studyLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  nrShortBreaks: number;
}

export type State = {
  username: string;
  exams: Exam[];

  settings: {
    pomodoro?: PomodoroSettings;
  }
}
