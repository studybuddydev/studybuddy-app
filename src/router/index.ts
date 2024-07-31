import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
// import HomeView from '@/views/HomeView.vue'
// import ExamView from '@/views/ExamView.vue'
// import ChapterView from '@/views/ChapterView.vue'
import AppView from '@/views/AppView.vue'
import ExamView from '@/views/ExamView.vue'
import WelcomeView from '@/views/WelcomeView.vue'
import { EStudyView } from '@/types'

const router = createRouter({
  history: createWebHashHistory(),  
  
  routes: [
    {
      path: '/welcome',
      name: 'welcome',
      component: WelcomeView,
    },
    {
      path: '/',
      name: 'home',
      component: AppView,
      meta: { type: EStudyView.Dashboard },
      children: [
        { path: 'exam/:exam',           component: ExamView, meta: { type: EStudyView.Exam } },
        { path: 'exam/:exam/:chapter',  component: ExamView, meta: { type: EStudyView.Chapter } }
      ]
    },

  ]
})

export default router
