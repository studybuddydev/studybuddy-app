import { defineStore } from 'pinia'
import { useAPIBaseStore } from './api-base';
import axios from 'axios';
import type { ExamDBO } from '@/types';

export const useExamsAPIStore = defineStore('exams-api', () => {
  const api = useAPIBaseStore();
  const API_ENDPOINT = `${api.endpoint}/exams`;

  async function getExams(): Promise<string> {
    return (await axios.get(`${API_ENDPOINT}`, await api.getOptions())).data;
  }

  async function getExamUpdates(fromDate: Date): Promise<ExamDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/updates/${fromDate.toISOString()}`, await api.getOptions())).data
  }
  return { getExams, getExamUpdates };
})
