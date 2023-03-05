import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import StudyView from '@/views/StudyView.vue'

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
    }
  ]
})

export default router
