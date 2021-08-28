import { Enemy } from '@/level-editor/enemy';

export class ScreenEdgeBounceEnemy extends Enemy {
  type: string;
  isMovingLeft = false;

  constructor(gridPosition: number, color: string, isMovingLeft?: boolean) {
    super(gridPosition, 16, color);
    this.type = `Screen Bounce ${this.isMovingLeft ? 'Left' : 'Right'}`;

    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }
}
