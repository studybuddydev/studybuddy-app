import { defineStore } from 'pinia'
import { EntitiesEnum, useDBStore } from "./db";
import { ref } from 'vue';
import { useAPIStore } from '../api';

export const useExamsStore = defineStore('sync-db', () => {
  const db = useDBStore();
  const api = useAPIStore().api;

  const synced = ref<boolean>(false);

  async function sync() {

    const synching = [
      syncExams(),
      syncPomodori(),
    ];

    await Promise.all(synching);
    synced.value = true;
  }

  async function syncExams() {
    const lastUpdated = await db.getLastUpdated(EntitiesEnum.exams);
    const newUpdatedDate = new Date();
    const newExams = await api.exams.getExamUpdates(lastUpdated);
    for (const exam of newExams) {
      // update exams
    }
    await db.setLastUpdated(EntitiesEnum.exams, newUpdatedDate);
  }

  async function syncPomodori() {
    const lastUpdated = await db.getLastUpdated(EntitiesEnum.pomodori);
    const newUpdatedDate = new Date();
    const newPomodori = await api.pomodori.getPomodoriUpdates(lastUpdated);
    for (const pomodoro of newPomodori) {
      // update pomodori
    }
    await db.setLastUpdated(EntitiesEnum.pomodori, newUpdatedDate);
  }

  return { sync, synced };
});