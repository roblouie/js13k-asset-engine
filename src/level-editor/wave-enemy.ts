import { Enemy } from './enemy';

export class WaveEnemy extends Enemy {
  isMovingLeft = false;
  type: string;

  constructor(gridPosition: number, color: string, isMovingLeft?: boolean) {
    super(gridPosition, 16, color);
    this.type = `Wave ${this.isMovingLeft ? 'Left' : 'Right'}`;
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }
  }
}
