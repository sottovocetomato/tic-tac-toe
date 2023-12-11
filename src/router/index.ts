import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/MainPage.vue')
    }
  ]
})

export default router
