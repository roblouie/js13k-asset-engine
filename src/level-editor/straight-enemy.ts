import { Enemy } from "./enemy";

export class StraightEnemy extends Enemy {
  type = 'straight';
  typeNum = 0;

  constructor(gridPosition: number, colorNum: number) {
    super(gridPosition, 16, colorNum);
  }
}
