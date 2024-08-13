
import { defineStore } from 'pinia'
import { useAPIBaseStore } from './api-base';
import axios from 'axios';
import type { Settings } from '@/types';
import * as common from '@/utils/common';

export const useSettingsAPIStore = defineStore('settings-api', () => {
  const api = useAPIBaseStore();

  async function getSettings() {
    return (await axios.get(`${api.endpoint}/settings`, await api.getOptions())).data as Settings;
  }

  async function getSettingsIfNew(time: number) {
    return (await axios.get(`${api.endpoint}/settings/${time}`, await api.getOptions())).data as (Settings | null);
  }

  function upsertSettings(settings: Settings) {
    common.debounce('settings-upsert', async () => {
      await axios.post(`${api.endpoint}/settings`, settings, await api.getOptions())
    }, 1000);
  }

  return { getSettings, upsertSettings, getSettingsIfNew }
});
