import { defineStore } from 'pinia'
import { EntitiesEnum, useDBStore } from "./db";
import { ref } from 'vue';
import { useAPIStore } from '../api';

export const useSyncDBStore = defineStore('sync-db', () => {
  const db = useDBStore();
  const api = useAPIStore().api;

  const synced = ref<boolean>(false);

  async function sync() {


    const synching = [
      // syncExams(),
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
    await syncPomodoriToRemote();
    await syncPomodoriFromRemote();
  }

  async function syncPomodoriToRemote() {
    const pomi = await db.pomodori.where('remoteUpdated').notEqual(1)
        .limit(500)
        .toArray()
    for (const pomodoro of pomi) {
      if (pomodoro._id) {
        await api.pomodori.updatePomodoro(pomodoro);
      } else {
        await api.pomodori.postPomodoro(pomodoro);
      }
      pomodoro.remoteUpdated = 1;
      await db.pomodori.put(pomodoro, pomodoro.id);
    }
  }

  async function syncPomodoriFromRemote() {
    const lastUpdated = await db.getLastUpdated(EntitiesEnum.pomodori);
    const newUpdatedDate = new Date();
    const newPomodori = await api.pomodori.getPomodoriUpdates(lastUpdated);
    for (const pomodoro of newPomodori) {
      if (pomodoro.id) {
        await db.pomodori.put(pomodoro, pomodoro.id);
      } else {
        await db.pomodori.add(pomodoro);
      }
    }
    await db.setLastUpdated(EntitiesEnum.pomodori, newUpdatedDate);
  }

  return { sync, synced };
});