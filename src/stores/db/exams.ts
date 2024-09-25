import { defineStore } from 'pinia'
import { useDBStore, EntitiesEnum } from "./db";
import { useAPIStore } from '@/stores/api'
import { ref } from 'vue';
import type { ExamDBO } from '@/types';

export const useExamsStore = defineStore('exams', () => {
  const db = useDBStore();
  const api = useAPIStore().api;

  const examNames = ref<string[]>([]);

  async function load() {
    examNames.value = (await db.exams.orderBy('_id').keys()) as string[];
  }

  async function getExam(examId: string) {
    const exam = await db.exams.where('_id').equals(examId).first();
    return exam;
  }


  async function upsertExam(exam: ExamDBO) {
    console.log('upserting exam', exam);
    const exists = await db.exams.where('_id').equals(exam._id).first();
    // to undestand why update does not work
    if (exists) await db.exams.delete(exists.id!);
    await db.exams.add(exam);
  }

  async function updateLocalDB() {
    const lastUpdated = await db.getLastUpdated(EntitiesEnum.exams);
    const newUpdatedDate = new Date();
    const newExams = await api.exams.getExamUpdates(lastUpdated);
    for (const exam of newExams) {
      await upsertExam(exam);
    }
    await db.setLastUpdated(EntitiesEnum.exams, newUpdatedDate);

  }

  async function init() {
    await load();
    await updateLocalDB();
  }
  init();

  return { examNames, getExam };
})
