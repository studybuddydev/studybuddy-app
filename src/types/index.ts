export type Chapter = {
  id: string;
  name: string;
}

export type Exam = {
  name: string;
  icon: string;
  chapters: Chapter[];
}

export type State = {
  username: string;
  exams: Exam[];
}