import { defineStore } from 'pinia'
import { useAPIStore } from './api';
import axios from 'axios';

export type UserOnboarding = {
  username: string;
  university?: string | null;
  course?: string | null;
  exams?: string[];
}

export const useUsersAPIStore = defineStore('users-api', () => {
  const api = useAPIStore();
  const API_ENDPOINT = `${api.endpoint}/users`;

  async function generateUsername(nickname?: string): Promise<string> {
    return (await axios.post(`${API_ENDPOINT}/generate-username`, { name: nickname ?? '' }, await api.getOptions())).data;
  }

  async function checkUsername(username: string): Promise<boolean> {
    if (!username) return false;
    return !!(await axios.get(`${API_ENDPOINT}/check-username/${username}`, await api.getOptions())).data;
  }

  async function saveOnboarding(userOnboarding: UserOnboarding): Promise<void> {
    await axios.post(`${API_ENDPOINT}/onboarding`, userOnboarding, await api.getOptions());
  }

  async function isOnboarded(): Promise<boolean> {
    return !!(await axios.get(`${API_ENDPOINT}/onboarding`, await api.getOptions())).data;
  }

  return { checkUsername, saveOnboarding, generateUsername, isOnboarded };
})
