import { Enemy } from './enemy';

export class SwoopEnemy extends Enemy {
  isMovingLeft = false;
  type: string;

  constructor(gridPosition: number, color: string, isMovingLeft?: boolean) {
    super(gridPosition, 16, color);
    this.type = `Swoop ${this.isMovingLeft ? 'Left' : 'Right'}`;

    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }
}
