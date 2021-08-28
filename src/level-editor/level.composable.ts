import { Level } from '@/level-editor/level';
import { ref } from 'vue';

const levels = ref<Level[]>([]);

export function useLevel() {
  return {
    levels,
  };
}