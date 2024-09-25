import { defineStore } from 'pinia'
import { useAuth0 } from "@auth0/auth0-vue";
import config from '@/config/config';
import { getDataAPI } from './data';
import { getExamsAPI } from './exams';
import { getSettingsAPI } from './settings';
import { getUsersAPI } from './users';
import { getPomodoriAPI } from './pomodori';

export const useAPIStore = defineStore('api', () => {

  const endpoint = config.api.endpoint;
  
  const { getAccessTokenSilently } = useAuth0();
  async function getOptions() {
    return {
      headers: { Authorization: `Bearer ${await getAccessTokenSilently()}` }
    }
  }

  const data = getDataAPI(endpoint, getOptions);
  const exams = getExamsAPI(endpoint, getOptions);
  const settings = getSettingsAPI(endpoint, getOptions);
  const users = getUsersAPI(endpoint, getOptions);
  const pomodori = getPomodoriAPI(endpoint, getOptions);

  const api = { data, exams, settings, users, pomodori };

  return { getOptions, endpoint, api }
})
