import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { State, Exam, PomodoroSettings, Chapter, UserSettings, CurrentPomodoro, WithLink, Link, StudyElement } from '@/types'

const defaultData: State = {
  username: 'Anonymous',
  data: {
    exams: [],
    dashboard: { name: 'StudyBuddy', links: [], postIts: [], showTasks: false, tasks: [] }
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

  function checkValidExamName(name: string) {
    if (!name) return false;
    if (state.value.data.exams?.find(e => e.name === name)) return false;
    return true;
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

  return {
    state,
    save,
    saveLanguage, getLanguage,
    getUsername,
    getStudyElement, getExams, getExam, addExam, editExam, removeExam,
    addChapter, editChapter, removeChapter,
    checkValidExamName,
    getPomodoroSettings, setPomodoroSettings, getCurrentPomodoro, setCurrentPomodoro, removeCurrentPomodoro,
    getUserSettings, setUserSettings,
  };

});
