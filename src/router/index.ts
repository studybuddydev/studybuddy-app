import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import StudyView from '@/views/ExamView.vue'
import ChapterView from '@/views/ChapterView.vue'

const router = createRouter({
  history: createWebHashHistory(),  
  
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },

    {
      path: '/exam/:exam',
      name: 'exam',
      component: StudyView
    },

    {
      path: '/exam/:exam/:chapter',
      name: 'chapter',
      component: ChapterView
    }
  ]
})

export default router
