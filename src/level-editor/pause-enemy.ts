import { Enemy } from '@/level-editor/enemy';

export class PauseEnemy extends Enemy {
  type = 'pause';

  constructor(gridPosition: number, color: string) {
    super(gridPosition, 16, color);
  }
}
