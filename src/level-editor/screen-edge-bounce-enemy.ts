import { Enemy } from '@/level-editor/enemy';

export class ScreenEdgeBounceEnemy extends Enemy {
  isMovingLeft = false;
  type: string;
  typeNum: number;

  constructor(gridPosition: number, colorNum: number, isMovingLeft?: boolean) {
    super(gridPosition, 16, colorNum);
    this.type = `Screen Bounce ${this.isMovingLeft ? 'Left' : 'Right'}`;
    this.typeNum = isMovingLeft ? 4 : 5;

    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }
}
