import { defineStore } from 'pinia'
import type { Timer } from '@/types';
import { ref } from 'vue';
import { useDBStore } from "./db";

export const useTimerStore = defineStore('timerStore', () => {

  const db = useDBStore()
  const timers = ref<Timer[] >([]);
  const selectedTimerId = ref<number | null>(null);

  async function getAllTimers() {
    return await db.timers.toArray();
  }

  async function addTimer(timer: Timer) {
    const toAddTimer: Timer = {
      title: timer.title,
      breakLength: timer.breakLength,
      repetitions: timer.repetitions,
      studyLength: timer.studyLength,
      freeMode: timer.freeMode
    }
    const res = await db.timers.add(toAddTimer);
    update();
    return res;
  }

  async function update() {
    timers.value = await getAllTimers();
  }
  update();

  async function deleteTimer(id?: number) {
    if (id !== undefined) {
      await db.timers.delete(id);
      update();
    }
  }

  return {
    getAllTimers, addTimer, deleteTimer, timers, selectedTimerId
  };
});
