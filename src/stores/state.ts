import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { State, Exam, PomodoroSettings, Chapter, UserSettings, CurrentPomodoro, WithLink, Link, StudyElement, Event, Deadline } from '@/types'

const defaultData: State = {
  username: 'Anonymous',
  data: {
    exams: [],
    dashboard: { name: 'StudyBuddy', links: [], postIts: [], showTasks: false, tasks: [] },
    events: {},
  },
  settings: {},
  stats: {}
}

export const useStateStore = defineStore('state', () => {
  const lsState = JSON.parse(localStorage.getItem('state') || '{}') as State ?? {};
  if (!lsState.username) lsState.username = defaultData.username;
  if (!lsState.data) lsState.data = defaultData.data;
  if (!lsState.data.exams) lsState.data.exams = defaultData.data.exams;
  if (!lsState.data.dashboard) lsState.data.dashboard = defaultData.data.dashboard;
  if (!lsState.data.events) lsState.data.events = defaultData.data.events;
  if (!lsState.settings) lsState.settings = defaultData.settings;
  const state = ref(lsState);

  // ========= Generic =========
  function save() {
    console.log('Saving localstorage')
    localStorage.setItem('state', JSON.stringify(state.value));
  }

  function saveLanguage(lang: string) {
    localStorage.setItem('lang', lang);
  }

  function getLanguage() {
    return localStorage.getItem('lang') ?? 'en';
  }
  
  // ========= Username =========
  function getUsername() {
    return state.value.username ?? 'Anonymous';
  }

  // ========= Exam =========
  function getStudyElement(examName?: string, chapterName?: string): StudyElement {
    if (examName) {
      const exam = getExam(examName);
      if (chapterName) {
        const chapter = exam?.chapters.find(c => c.name === chapterName);
        if (chapter) return chapter;
      }
      if (exam) return exam;
    }

    return state.value.data.dashboard;
  }

  function getExams() {
    return state.value.data.exams ?? [];
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
  function addChapter(exam: Exam, chapter: Chapter) {
    exam.chapters.push(chapter);
    save();
  }
  function editChapter(exam: Exam, i: number, chapter: Chapter) {
    const ch = exam.chapters[i];
    if (!ch) return;
    ch.name = chapter.name;
    save();
  }
  function removeChapter(exam: Exam, i: number) {
    exam.chapters.splice(i, 1);
    save();
  }

  function checkValidExamName(name: string, index: number) {
    if (!name) return false;
    if (state.value.data.exams?.find((e, i) => i !== index && e.name === name)) return false;
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

  function getDeadlines(days: string[]) {
    const deadlinesMap: { [id: string]: Deadline[] } = {}
    for (const d of days) {
      deadlinesMap[d] = [];
    }

    state.value.data.exams.map(e => [
      ...e.tasks?.filter(t => t.isDeadline) ?? [],
      ...e.chapters.map(c => c.tasks?.filter(t => t.isDeadline) ?? [])
    ]).flat(2).forEach(d => {
      if (d.deadline && deadlinesMap[d.deadline] !== undefined) {
        deadlinesMap[d.deadline].push({ name: d.name })
      }
    });

    return deadlinesMap;
  }

  // ========= Settings =========

  // Pomodoro
  function getPomodoroSettings(): PomodoroSettings {
    return state.value.settings?.pomodoro?.pomodoroSettings ?? {
      studyLength: 25,
      shortBreakLength: 5,
      longBreakLength: 15,
      nrStudy: 4,
    }
  }
  function setPomodoroSettings(pSettings: PomodoroSettings) {
    if (!state.value.settings) state.value.settings = {};
    if (!state.value.settings.pomodoro) state.value.settings.pomodoro = {};
    state.value.settings.pomodoro.pomodoroSettings = { ...pSettings };
    save();
  }
  function getCurrentPomodoro(): CurrentPomodoro | undefined {
    return state.value.settings?.pomodoro?.currentPomodoro;
  }
  function setCurrentPomodoro(pomodoro: CurrentPomodoro) {
    if (!state.value.settings) state.value.settings = {};
    if (!state.value.settings.pomodoro) state.value.settings.pomodoro = {};
    state.value.settings.pomodoro.currentPomodoro = { ...pomodoro };
    save();
  }
  function removeCurrentPomodoro() {
    if (state.value?.settings?.pomodoro?.currentPomodoro)
      state.value.settings.pomodoro.currentPomodoro = undefined;
    save();
  }

  // User
  function getUserSettings(): UserSettings {
    return state.value.settings?.user ?? {
      icon: 'mdi-account',
      theme: 'dark',
      username: 'Anonymous'
    }
  }
  function setUserSettings(uSettings: UserSettings) {
    if (!state.value.settings) state.value.settings = {};
    state.value.settings.user = { ...uSettings };
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

  return {
    state,
    save,
    saveLanguage, getLanguage,
    getUsername,
    getStudyElement, getExams, getExam, addExam, editExam, removeExam,
    addChapter, editChapter, removeChapter,
    checkValidExamName,
    getEvents, saveEvents, getDeadlines,
    getPomodoroSettings, setPomodoroSettings, getCurrentPomodoro, setCurrentPomodoro, removeCurrentPomodoro,
    getUserSettings, setUserSettings,
    downloadData, uploadData
  };

});
