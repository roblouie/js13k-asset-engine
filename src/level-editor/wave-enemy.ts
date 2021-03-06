import { Enemy } from './enemy';

export class WaveEnemy extends Enemy {
  isMovingLeft = false;
  type: string;
  typeNum: number;

  constructor(gridPosition: number, colorNum: number, isMovingLeft?: boolean) {
    super(gridPosition, 16, colorNum);
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }

    this.type = `Wave ${this.isMovingLeft ? 'Left' : 'Right'}`;
    this.typeNum = isMovingLeft ? 2 : 3;
  }
}
