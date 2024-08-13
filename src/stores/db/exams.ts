import { defineStore } from 'pinia'
import { useDBStore } from "./db";

export const useExamsStore = defineStore('exams', () => {
  const db = useDBStore();

  const exams = null; //ref(db.exams.toArray());

  return { exams };
})
