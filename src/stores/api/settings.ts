
import axios from 'axios';
import type { Settings } from '@/types';
import * as common from '@/utils/common';

export function getSettingsAPI(endpoint: string, getOptions: () => Promise<{ headers: { Authorization: string; }; }>) {
  const API_ENDPOINT = `${endpoint}/settings`;

  async function getSettings() {
    return (await axios.get(API_ENDPOINT, await getOptions())).data as Settings;
  }

  async function getSettingsIfNew(time: number) {
    return (await axios.get(`${API_ENDPOINT}/${time}`, await getOptions())).data as (Settings | null);
  }

  function upsertSettings(settings: Settings) {
    common.debounce('settings-upsert', async () => {
      await axios.post(API_ENDPOINT, settings, await getOptions())
    }, 1000);
  }

  return { getSettings, upsertSettings, getSettingsIfNew }
}
