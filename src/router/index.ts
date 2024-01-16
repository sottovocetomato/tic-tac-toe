import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/MainPage.vue')
    },
    {
      path: '/wordle',
      name: 'wordle',
      // which is lazy-loaded when the route is visited.
      component: () => import('../components/WordleGame.vue')
    },
    {
      path: '/tictactoe',
      name: 'tictactoe',
      // which is lazy-loaded when the route is visited.
      component: () => import('../components/TicTacToe.vue')
    },
    {
      path: '/snake',
      name: 'snake',
      // which is lazy-loaded when the route is visited.
      component: () => import('../components/Snake.vue')
    }
  ]
})

export default router
