import axios from 'axios';
import type { PomodoroDBO } from '@/types/dbo';

export function getPomodoriAPI(endpoint: string, getOptions: () => Promise<{ headers: { Authorization: string; }; }>) {
  const API_ENDPOINT = `${endpoint}/pomodori`;

  async function getPomodoro(pomoId: string): Promise<PomodoroDBO> {
    return (await axios.get(`${API_ENDPOINT}/${pomoId}`, await getOptions())).data;
  }

  async function getPomodoriUpdates(fromDate: Date): Promise<PomodoroDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/updates/${fromDate.toISOString()}`, await getOptions())).data
  }

  async function postPomodoro(pomodoro: PomodoroDBO) {
    await axios.post(API_ENDPOINT, pomodoro, await getOptions());
  }

  async function updatePomodoro(pomodoro: PomodoroDBO) {
    await axios.put(`${API_ENDPOINT}/${pomodoro._id}`, pomodoro, await getOptions());
  }

  return { getPomodoro, getPomodoriUpdates, postPomodoro, updatePomodoro }
}