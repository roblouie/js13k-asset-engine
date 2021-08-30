import { Enemy } from '@/level-editor/enemy';

export class PauseEnemy extends Enemy {
  type = 'pause';
  typeNum = 1;

  constructor(gridPosition: number, colorNum: number) {
    super(gridPosition, 16, colorNum);
  }
}
