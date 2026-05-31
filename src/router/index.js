import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { ADMIN_PASSWORD } from '../config'

const SESSION_KEY = 'ujian_sd_admin_auth'

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/exam/:subjectId', name: 'exam', component: () => import('../views/ExamView.vue') },
    { path: '/result', name: 'result', component: () => import('../views/ResultView.vue') },
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && sessionStorage.getItem(SESSION_KEY) !== ADMIN_PASSWORD) {
    return { name: 'home' }
  }
})

export default router
export { SESSION_KEY }
