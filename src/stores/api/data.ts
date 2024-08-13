import { defineStore } from 'pinia'
import { useAPIBaseStore } from './api-base';
import axios from 'axios';

export type DataUniversity = {
  id: string;
  name: string;
  courses: { name: string, code: string, type: string }[]
}
export type DataCourse = {
  id: string;
  name: string;
  uni: string;
  exams: { title: string, id: string, url: string, year: number }[];
}

export const useDataAPIStore = defineStore('data-api', () => {
  const api = useAPIBaseStore();
  const API_ENDPOINT = `${api.endpoint}/data`;

  async function getUniversities(): Promise<DataUniversity[]> {
    const x = (await axios.get(`${API_ENDPOINT}/universities`, await api.getOptions())).data;
    return x
  }

  async function getCourse(courseId: string): Promise<DataCourse> {
    return (await axios.get(`${API_ENDPOINT}/course/${courseId}`, await api.getOptions())).data;
  }

  return { getUniversities, getCourse };
})
