import { defineStore } from 'pinia'
import { useAPIBaseStore } from './api-base';
import axios from 'axios';
import * as DBO from '@/types/dbo';

export const useDataAPIStore = defineStore('data-api', () => {
  const api = useAPIBaseStore();
  const API_ENDPOINT = `${api.endpoint}/data`;

  async function getUniversities(): Promise<DBO.DataUniversityLiteDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/universities`, await api.getOptions())).data;
  }

  async function getUniversity(universityId: string): Promise<DBO.DataUniversityDBO> {
    return (await axios.get(`${API_ENDPOINT}/universities/${universityId}`, await api.getOptions())).data;
  }

  async function getCoursesByUniversity(universityId: string): Promise<DBO.DataCourseLiteDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/universities/${universityId}/courses`, await api.getOptions())).data;
  }

  async function getCourse(courseId: string): Promise<DBO.DataCourseDBO> {
    return (await axios.get(`${API_ENDPOINT}/courses/${courseId}`, await api.getOptions())).data;
  }

  async function getCourseExams(courseId: string): Promise<DBO.DataExamLiteDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/courses/${courseId}/exams`, await api.getOptions())).data;
  }

  async function getExam(examId: string): Promise<DBO.DataExamDBO> {
    return (await axios.get(`${API_ENDPOINT}/exams/${examId}`, await api.getOptions())).data;
  }

  return {
    getUniversities,
    getUniversity,
    getCoursesByUniversity,
    getCourse,
    getCourseExams,
    getExam
  }

})
