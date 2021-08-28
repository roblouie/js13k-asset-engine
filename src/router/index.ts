import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import TilePage from '../TilePage.vue';
import Music from '../Music.vue';
import SpriteMaker from '@/sprite-maker/SpriteMaker.vue';
import SoundEffects from '@/sound-effects/SoundEffectMaker.vue';
import BackgroundMaker from '@/backgrounds/BackgroundMaker.vue';
import LevelEditor from '@/level-editor/LevelEditor.vue';

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
    path: '/backgrounds',
    name: 'Backgrounds',
    component: BackgroundMaker,
  },
  {
    path: '/music',
    name: 'Music',
    component: Music,
  },
  {
    path: '/sound-effects',
    name: 'SoundEffects',
    component: SoundEffects,
  },
  {
    path: '/level-editor',
    name: 'LevelEditor',
    component: LevelEditor,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
