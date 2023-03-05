import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { State, Exam, PomodoroSettings, Chapter } from '@/types'


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
    state.value.exams?.push(exam);
    save();
  }
  function editExam(i: number, exam: Exam) {
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


  // ========= Settings =========

  // Pomodoro
  function getPomodoroSettings(): PomodoroSettings {
    return state.value.settings?.pomodoro ?? {
      studyLength: 25,
      shortBreakLength: 5,
      longBreakLength: 15,
      nrShortBreaks: 4,
    }
  }

  function setPomodoroSettings(pSettings: PomodoroSettings) {
    console.log(state.value)
    state.value.settings.pomodoro = { ...pSettings };
    save();
  }


  return {
    state,
    save,
    getUsername,
    getExams, getExam, addExam, editExam, removeExam,
    addChapter, editChapter, removeChapter,
    getPomodoroSettings, setPomodoroSettings
  };

})
