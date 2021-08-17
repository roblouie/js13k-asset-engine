import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Graphics from '../graphics.vue'
import Music from '../Music.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/graphics',
    name: 'Graphics',
    component: Graphics
  },
  {
    path: '/music',
    name: 'Music',
    component: Music
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
