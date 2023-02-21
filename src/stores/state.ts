import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { State, Exam } from '@/types'


export const useStateStore = defineStore('state', () => {
  const lsState = JSON.parse(localStorage.getItem('state') || '{}') as State ?? {};
  if (!lsState.exams) lsState.exams = [];
  if (!lsState.username) lsState.username = 'Anonymous';
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
  function addExam(exam: Exam) {
    state.value.exams?.push(exam);
    save();
  }


  return {
    state,
    save,
    getUsername,
    getExams, addExam,
  };

})
