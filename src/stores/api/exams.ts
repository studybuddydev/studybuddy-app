import { defineStore } from 'pinia'
import { useAPIBaseStore } from './api-base';
import axios from 'axios';

export const useExamsAPIStore = defineStore('exams-api', () => {
  const api = useAPIBaseStore();
  const API_ENDPOINT = `${api.endpoint}/exams`;

  async function getExams(): Promise<string> {
    return (await axios.get(`${API_ENDPOINT}`, await api.getOptions())).data;
  }

  return { getExams };
})
