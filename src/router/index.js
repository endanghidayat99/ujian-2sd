import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/exam/:subjectId', name: 'exam', component: () => import('../views/ExamView.vue') },
    { path: '/result', name: 'result', component: () => import('../views/ResultView.vue') },
  ],
})

export default router
