
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { type State, type Exam, type PomodoroSettings, type Chapter, type PomodotoStatus, type WithLink, type Link, type StudyElement, type Event, type Deadline, DeadlineType, type PomodoroFlexSettings, type PomodoroFlexStatus, type Settings } from '@/types'
import defaultState from '@/assets/defaultState.json';
import tutorialState from '@/assets/tutorialState.json';

const defaultData: State = {
  data: {
    exams: defaultState.exams ??  [],
    dashboard: defaultState.dashboard ?? { name: 'StudyBuddy', links: [], postIts: [], showTasks: false, tasks: [] },
    events: defaultState.events ?? {},
  },
  pomodoro: {},
}
const defaulDataCopy = JSON.parse(JSON.stringify(defaultData)) as State;

export const useStateStore = defineStore('state', () => {


  const state = ref(loadState());
  const isTutorial = ref(false);
  const isInTutorial = computed(() => isTutorial.value);

  function loadState(): State {
    const lsState = JSON.parse(localStorage.getItem('state') || '{}') as State ?? {};
    if (!lsState.data) lsState.data = defaulDataCopy.data;
    if (!lsState.data.exams) lsState.data.exams = defaulDataCopy.data.exams;
    if (!lsState.data.dashboard) lsState.data.dashboard = defaulDataCopy.data.dashboard;
    if (!lsState.data.events) lsState.data.events = defaulDataCopy.data.events;
    if (!lsState.pomodoro) lsState.pomodoro = defaulDataCopy.pomodoro;

    return lsState;
  }


  // ========= Generic =========
  function save() {
    if (isTutorial.value) return;
    console.log('Saving localstorage')
    localStorage.setItem('state', JSON.stringify(state.value));
  }

  function resetTutorial() {
    const tutorial = defaultData.data?.exams?.find(e => e.tutorial);
    if (!tutorial) {
      return;
    }
    const tutorialCopy = JSON.parse(JSON.stringify(tutorial)) as Exam;
    const tutorialIndex = state.value.data.exams.findIndex(e => e.tutorial);
    if (tutorialIndex === -1) {
      state.value.data.exams.unshift(tutorialCopy);
    } else {
      state.value.data.exams[tutorialIndex] = tutorialCopy;
    }
  }

  // ========= Exam =========
  function getStudyElement(examName?: string, chapterName?: string): StudyElement {
    if (examName) {
      const exam = getExam(examName);
      if (chapterName) {
        const chapter = exam?.chapters?.find(c => c.name === chapterName);
        if (chapter) return chapter;
      }
      if (exam) return exam;
    }

    return state.value.data.dashboard;
  }

  function getExams() {
    return state.value.data.exams ?? [];
  }
  function updateExams(exams: Exam[]) {
    state.value.data.exams = exams;
    save();
  }
  function getExam(name: string) {
    return state.value.data.exams?.find(e => e.name === name);
  }
  function addExam(exam: Exam) {
    if (!state.value.data.exams) state.value.data.exams = [exam];
    else state.value.data.exams?.push(exam);
    save();
  }
  function editExam(i: number, name: string, icon: string, color: string | undefined) {
    if (!state.value.data.exams) return;
    const exam = state.value.data.exams[i];
    if (!exam) return;
    exam.color = color;
    exam.name = name;
    exam.icon = icon;
    save();
  }
  function removeExam(i: number) {
    state.value.data.exams?.splice(i, 1);
    save();
  }
  function updateChapters(exam: Exam, chapters: Chapter[]) {
    exam.chapters = chapters;
    save();
  }
  function addChapter(exam: Exam, chapter: Chapter) {
    if (!exam.chapters) exam.chapters = [];
    exam.chapters.push(chapter);
    save();
  }
  function editChapter(exam: Exam, i: number, chapter: Chapter) {
    const ch = exam.chapters?.[i];
    if (!ch) return;
    ch.name = chapter.name;
    save();
  }
  function removeChapter(exam: Exam, i: number) {
    exam.chapters?.splice(i, 1);
    save();
  }

  function checkValidExamName(name: string, original?: Exam | Chapter) {
    if (!name) return false;
    if (state.value.data.exams?.find(e => e !== original && e.name === name)) return false;
    return true;
  }

  // ========= Events =========
  function getEvents(days: string[]): { [key: string]: Event[] } {
    return days.reduce((acc, day) => {
      const events = state.value.data.events[day];
      if (events) {
        if (events.length > 0) {
          acc[day] = events;
        } else {
          delete state.value.data.events[day]
        }
      }
      return acc;
    }, {} as { [key: string]: Event[] });
  }

  function saveEvents(events: { [key: string]: Event[] }) {
    Object.keys(events).forEach(day => {
      if (events[day].length > 0 && !state.value.data.events[day]) 
        state.value.data.events[day] = events[day];
    });
    save();
  }

  function mapDeadlines(deadlines: Deadline[], days: string[]): { [id: string]: Deadline[] } {
    const deadlinesMap: { [id: string]: Deadline[] } = {}
    for (const d of days) {
      deadlinesMap[d] = [];
    }

    deadlines.forEach(d => {
      if (d.deadline && deadlinesMap[d.deadline] !== undefined) {
        deadlinesMap[d.deadline].push(d)
      }
    });

    return deadlinesMap;
  }

  function getDeadlines(days: string[]): { [id: string]: Deadline[] } {
    const deadlinesTasks = state.value.data.exams.map(e => [
      ...e.tasks?.filter(t => t.isDeadline) ?? [],
      ...(e.chapters?.map(c => c.tasks?.filter(t => t.isDeadline) ?? []) ?? [])
    ]).flat(2)
      .filter(d => d.deadline)
      .map(d => ({
        name: d.name,
        deadline: d.deadline as string,
        type: DeadlineType.Task
      }));

    const deadlinesExams = state.value.data.exams
      .filter(e => e.deadline)
      .map(e => ({
        name: e.name,
        deadline: e.deadline as string,
        type: DeadlineType.Exam,
        color: e.color ?? 'red',
      }));

    return mapDeadlines([ ...deadlinesTasks, ...deadlinesExams ], days);
  }

  // Pomodoro
  function getPomodoroStatus(): PomodotoStatus | undefined {
    return state.value.pomodoro.pomodoroStatus;
  }
  function setPomodoroStatus(pomodoro: PomodotoStatus) {
    state.value.pomodoro.pomodoroStatus = { ...pomodoro };
    save();
  }
  function removePomodoroStatus() {
    if (state.value.pomodoro.pomodoroStatus)
      delete state.value.pomodoro.pomodoroStatus;
    save();
  }

  function getPomodoroFlexStatus(): PomodoroFlexStatus | undefined {
    return state.value.pomodoro.pomodoroFlexStatus;
  }
  function setPomodoroFlexStatus(flexStatus: PomodoroFlexStatus) {
    state.value.pomodoro.pomodoroFlexStatus = { ...flexStatus };
    save();
  }

  function downloadData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.value.data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `studybuddy_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function uploadData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        const data = JSON.parse(e.target?.result as string);
        state.value.data = data;
        save();
        window.location.reload();
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function startTutorial() {
    save();
    state.value.data = tutorialState;
    isTutorial.value = true;
  }

  function closeTutorial() {
    state.value.data = loadState().data;
    isTutorial.value = false;
  }

  return {
    state,
    save,
    resetTutorial,
    getStudyElement, getExams, updateExams, getExam, addExam, editExam, removeExam,
    updateChapters, addChapter, editChapter, removeChapter,
    checkValidExamName,
    getEvents, saveEvents, getDeadlines,
    getPomodoroStatus, setPomodoroStatus, removePomodoroStatus, getPomodoroFlexStatus, setPomodoroFlexStatus,
    downloadData, uploadData,
    startTutorial, closeTutorial, isInTutorial
  };

});
