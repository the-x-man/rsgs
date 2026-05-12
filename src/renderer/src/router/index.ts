import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/auth',
      component: () => import('../layouts/AuthLayout.vue'),
      children: [
        { path: 'login', name: 'login', component: () => import('../pages/auth/LoginPage.vue') },
        { path: 'register', name: 'register', component: () => import('../pages/auth/RegisterPage.vue') },
        { path: '', redirect: '/auth/login' },
      ],
    },
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('../pages/dashboard/DashboardPage.vue') },
        { path: 'workstreams', name: 'workstreams', component: () => import('../pages/workstreams/WorkstreamsPage.vue') },
        { path: 'workstreams/:id', name: 'workstream-detail', component: () => import('../pages/workstreams/WorkstreamDetailPage.vue') },
        { path: 'activities/:id', name: 'activity-detail', component: () => import('../pages/activities/ActivityDetailPage.vue') },
        { path: 'tasks/:id', name: 'task-detail', component: () => import('../pages/tasks/TaskDetailPage.vue') },
        { path: 'reports', name: 'reports', component: () => import('../pages/reports/ReportsPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.init()

  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'login' }
  }
  if (to.path.startsWith('/auth') && auth.user) {
    return { name: 'dashboard' }
  }
})

export default router
