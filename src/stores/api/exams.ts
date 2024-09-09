import axios from 'axios';
import type { ExamDBO } from '@/types';

export function getExamsAPI(endpoint: string, getOptions: () => Promise<{ headers: { Authorization: string; }; }>) {
  const API_ENDPOINT = `${endpoint}/exams`;

  async function getExams(): Promise<string> {
    return (await axios.get(API_ENDPOINT, await getOptions())).data;
  }

  async function getExamUpdates(fromDate: Date): Promise<ExamDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/updates/${fromDate.toISOString()}`, await getOptions())).data
  }
  return { getExams, getExamUpdates }
}