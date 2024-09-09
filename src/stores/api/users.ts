import { defineStore } from 'pinia'
import axios from 'axios';
import type { UserOnboarding } from '@/types/dbo';

export function getUsersAPI(endpoint: string, getOptions: () => Promise<{ headers: { Authorization: string; }; }>) {
  const API_ENDPOINT = `${endpoint}/users`;

  async function generateUsername(nickname?: string): Promise<string> {
    return (await axios.post(`${API_ENDPOINT}/generate-username`, { name: nickname ?? '' }, await getOptions())).data;
  }

  async function checkUsername(username: string): Promise<boolean> {
    if (!username) return false;
    return !!(await axios.get(`${API_ENDPOINT}/check-username/${username}`, await getOptions())).data;
  }

  async function saveOnboarding(userOnboarding: UserOnboarding): Promise<void> {
    await axios.post(`${API_ENDPOINT}/onboarding`, userOnboarding, await getOptions());
  }

  async function isOnboarded(): Promise<boolean> {
    return !!(await axios.get(`${API_ENDPOINT}/onboarding`, await getOptions())).data;
  }

  return { checkUsername, saveOnboarding, generateUsername, isOnboarded };
}
