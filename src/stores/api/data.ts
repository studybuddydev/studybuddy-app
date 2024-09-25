import axios from 'axios';
import * as DBO from '@/types/dbo';

export function getDataAPI(endpoint: string, getOptions: () => Promise<{ headers: { Authorization: string; }; }>) {
  const API_ENDPOINT = `${endpoint}/data`;

  async function getUniversities(): Promise<DBO.DataUniversityLiteDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/universities`, await getOptions())).data;
  }

  async function getUniversity(universityId: string): Promise<DBO.DataUniversityDBO> {
    return (await axios.get(`${API_ENDPOINT}/universities/${universityId}`, await getOptions())).data;
  }

  async function getCoursesByUniversity(universityId: string): Promise<DBO.DataCourseLiteDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/universities/${universityId}/courses`, await getOptions())).data;
  }

  async function getCourse(courseId: string): Promise<DBO.DataCourseDBO> {
    return (await axios.get(`${API_ENDPOINT}/courses/${courseId}`, await getOptions())).data;
  }

  async function getCourseExams(courseId: string): Promise<DBO.DataExamLiteDBO[]> {
    return (await axios.get(`${API_ENDPOINT}/courses/${courseId}/exams`, await getOptions())).data;
  }

  async function getExam(examId: string): Promise<DBO.DataExamDBO> {
    return (await axios.get(`${API_ENDPOINT}/exams/${examId}`, await getOptions())).data;
  }

  return { getUniversities, getUniversity, getCoursesByUniversity, getCourse, getCourseExams, getExam }
}

