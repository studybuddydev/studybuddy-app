import { defineStore } from 'pinia'
import type { Timer } from '@/types';
import { ref } from 'vue';
import { useDBStore } from "@/stores/db";

export const useTimerStore = defineStore('timerStore', () => {

  const db = useDBStore()
  const timers = ref<Timer[] >([]);

  async function getAllTimers() {
    return await db.timers.toArray();
  }

  async function addTimer(theme: Timer) {
    const res = await db.timers.add(theme);
    update();
    return res;
  }

  async function update() {
    timers.value = await getAllTimers();
  }
  update();

  return {
    getAllTimers, addTimer, timers
  };
});
