import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
// import HomeView from '@/views/HomeView.vue'
// import ExamView from '@/views/ExamView.vue'
// import ChapterView from '@/views/ChapterView.vue'
import StudyView from '@/views/StudyView.vue'
import LoginView from '@/views/LoginView.vue'
import UserProfile from '@/views/UserProfile.vue'
import { EStudyView } from '@/types'

const router = createRouter({
  history: createWebHashHistory(),  
  
  routes: [
    {
      path: '/',
      name: 'home',
      component: StudyView,
      meta: { type: EStudyView.Dashboard }
    },

    {
      path: '/exam/:exam',
      name: 'exam',
      component: StudyView,
      meta: { type: EStudyView.Exam }
    },

    {
      path: '/exam/:exam/:chapter',
      name: 'chapter',
      component: StudyView,
      meta: { type: EStudyView.Chapter }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfile,
    },
  ]
})

export default router
