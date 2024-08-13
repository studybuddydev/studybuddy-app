import { defineStore } from 'pinia'
import { useDBStore } from "./db";
import { ref } from 'vue';

export const useExamsStore = defineStore('exams', () => {
  const db = useDBStore();

  const examNames = ref<string[]>([]);

  async function load() {
    const examNames = (await db.exams.orderBy('examName').keys());
    const lastUpdate = (await db.exams.orderBy('lastupdate').last())?.lastupdate;
  }

  load();

  return { examNames };
})
