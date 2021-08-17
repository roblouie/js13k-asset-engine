import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import TilePage from '../TilePage.vue';
import Music from '../Music.vue';
import SpriteMaker from "@/sprite-maker/SpriteMaker.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: TilePage,
  },
  {
    path: '/tile-draw',
    name: 'TileDraw',
    component: TilePage,
  },
  {
    path: '/sprite-maker',
    name: 'SpriteMaker',
    component: SpriteMaker,
  },
  {
    path: '/music',
    name: 'Music',
    component: Music,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
