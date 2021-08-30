import { Enemy } from './enemy';

export class SwoopEnemy extends Enemy {
  isMovingLeft = false;
  type: string;
  typeNum: number;

  constructor(gridPosition: number, colorNum: number, isMovingLeft?: boolean) {
    super(gridPosition, 16, colorNum);
    if (isMovingLeft) {
      this.isMovingLeft = isMovingLeft;
    }

    this.type = `Swoop ${this.isMovingLeft ? 'Left' : 'Right'}`;
    this.typeNum = isMovingLeft ? 6 : 7;
  }
}
