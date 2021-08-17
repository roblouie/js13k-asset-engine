import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Graphics from '../graphics.vue';
import Music from '../music.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
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
