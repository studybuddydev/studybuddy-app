import { defineStore } from 'pinia'
import { useDataAPIStore } from './data'
import { useExamsAPIStore } from './exams'
import { useSettingsAPIStore } from './settings'
import { useTimerStatusStore } from './timerStatus'
import { useUsersAPIStore } from './users'

export type { UserOnboarding } from './users'
export type { DataUniversity, DataCourse } from './data'

export const useAPIStore = defineStore('api', () => {
  return { 
    data: useDataAPIStore(),
    exams: useExamsAPIStore(),
    settings: useSettingsAPIStore(),
    timerStatus: useTimerStatusStore(),
    users: useUsersAPIStore()
  }
})