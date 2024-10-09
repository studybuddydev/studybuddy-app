import { defineStore } from 'pinia'
import { useDBStore, EntitiesEnum } from "./db";
import { useAPIStore } from '@/stores/api'
import { ref } from 'vue';
import type { ExamDBO } from '@/types';

export const useExamsStore = defineStore('exams', () => {
  const db = useDBStore();
  const api = useAPIStore().api;

  const exams = ref<ExamDBO[]>([]);
  const examsMapping = ref<{ [id: string]: ExamDBO }>({})

  async function load() {
    exams.value = await db.exams.toArray()
    for (const e of exams.value) {
      examsMapping.value[e._id] = e
    }
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
    await load();
  }

  async function init() {
    await updateLocalDB();
  }
  init();

  return { exams, examsMapping, getExam, updateLocalDB };
})
