import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuth0 } from "@auth0/auth0-vue";
import { ref, watch } from 'vue';
import { PomodoroState, type PomodotoStatus } from '@/types';
import { usePomodoroStore } from "@/stores/pomodoro";

export const useTimerStatusStore = defineStore('timer-status', () => {

  const { user, getAccessTokenSilently } = useAuth0();
  const pomodoro = usePomodoroStore();

  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT
  const LOCALSTORAGE_KEY = 'timer-status'

  async function getOptions() {
    return {
      headers: { Authorization: `Bearer ${await getAccessTokenSilently()}` }
    }
  }

  const pomodoroStatus = ref<PomodotoStatus | null>(
    getStatusLocalStorage()
  );

  watch(user, () => {
    if(user.value?.email) {
      getStatusAPI()
    }
  })

  async function createStatus(status: PomodotoStatus) {
    pomodoroStatus.value = { ...status };
    await saveStatus();
  }

  async function saveStatus() {
    if (pomodoroStatus.value) {
      if (pomodoroStatus.value.state === PomodoroState.TERMINATED) {
        localStorage.removeItem(LOCALSTORAGE_KEY);
        await deleteStatusAPI();
      } else if (pomodoroStatus.value.state === PomodoroState.CREATED) {
        localStorage.removeItem(LOCALSTORAGE_KEY);
      } else {
        setStatusLocalStorage(pomodoroStatus.value);
        await setStatusAPI(pomodoroStatus.value);
      }
    }
  }

  function getStatusLocalStorage(): PomodotoStatus | null {
    const status = localStorage.getItem(LOCALSTORAGE_KEY)
    return status ? JSON.parse(status) as PomodotoStatus : null 
  }

  async function setStatusLocalStorage(status: PomodotoStatus) {
    status.timestamp = Date.now();
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(status))
  }

  async function getStatusAPI() {
    const status = await axios.get(`${API_ENDPOINT}/status`, await getOptions());
    if (status.data.timestamp > (pomodoroStatus.value?.timestamp ?? 0)) {
      pomodoroStatus.value = status.data;
      pomodoro.init();
    }
  }

  let debounceTimeout: number | undefined = undefined;
  async function setStatusAPI(status: PomodotoStatus) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      status.timestamp = Date.now();
      await axios.post(`${API_ENDPOINT}/status`, status, await getOptions());
    }, 500)
  }

  async function deleteStatusAPI() {
    await axios.delete(`${API_ENDPOINT}/status`, await getOptions());
  }



  return {
    pomodoroStatus, saveStatus, createStatus
  }
});
