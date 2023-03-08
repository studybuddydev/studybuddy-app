import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { State, Exam, PomodoroSettings, Chapter, UserSettings, CurrentPomodoro, WithLink, Link } from '@/types'


export const useStateStore = defineStore('state', () => {
  const lsState = JSON.parse(localStorage.getItem('state') || '{}') as State ?? {};
  if (!lsState.exams) lsState.exams = [];
  if (!lsState.username) lsState.username = 'Anonymous';
  if (!lsState.settings) lsState.settings = {};
  const state = ref(lsState);

  // ========= Generic =========
  function save() {
    localStorage.setItem('state', JSON.stringify(state.value));
  }
  
  // ========= Username =========
  function getUsername() {
    return state.value.username ?? 'Anonymous';
  }

  // ========= Exam =========
  function getExams() {
    return state.value.exams ?? [];
  }
  function getExam(name: string) {
    return state.value.exams?.find(e => e.name === name);
  }
  function addExam(exam: Exam) {
    if (!state.value.exams) state.value.exams = [exam];
    else state.value.exams?.push(exam);
    save();
  }
  function editExam(i: number, exam: Exam) {
    if (!state.value.exams) return;
    state.value.exams[i] = { ...exam };
    save();
  }
  function removeExam(i: number) {
    state.value.exams?.splice(i, 1);
    save();
  }
  function addChapter(exam: Exam, chapter: Chapter) {
    exam.chapters.push(chapter);
    save();
  }
  function editChapter(exam: Exam, i: number, chapter: Chapter) {
    exam.chapters[i] = { ...chapter };
    save();
  }
  function removeChapter(exam: Exam, i: number) {
    exam.chapters.splice(i, 1);
    save();
  }
  function addLink(obj: WithLink, link: Link) {
    if (!obj.links) obj.links = [];
    obj.links.push(link);
    save();
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
    getUsername,
    getExams, getExam, addExam, editExam, removeExam,
    addChapter, editChapter, removeChapter,
    addLink,
    getPomodoroSettings, setPomodoroSettings, getCurrentPomodoro, setCurrentPomodoro, removeCurrentPomodoro,
    getUserSettings, setUserSettings,
  };

});
