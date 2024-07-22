import { defineStore } from 'pinia'
import { useAPIStore } from './api';
import axios from 'axios';

export type DataUniversity = {
  id: string;
  name: string;
  uni: string;
  courses: { name: string, code: string }[]
}
export type DataCourse = {
  id: string;
  name: string;
  uni: string;
  exams: { title: string, id: string, url: string, year: number }[];
}

export const useDataAPIStore = defineStore('data-api', () => {
  const api = useAPIStore();
  const API_ENDPOINT = `${api.endpoint}/data`;

  async function getUniversities(): Promise<DataUniversity[]> {
    return (await axios.get(`${API_ENDPOINT}/universities`, await api.getOptions())).data;
  }

  async function getCourse(courseId: string): Promise<DataCourse> {
    return (await axios.get(`${API_ENDPOINT}/course/${courseId}`, await api.getOptions())).data;
  }

  return { getUniversities, getCourse };
})
