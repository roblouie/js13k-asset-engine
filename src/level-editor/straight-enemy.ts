import { Enemy } from "./enemy";

export class StraightEnemy extends Enemy {
  type = 'straight';

  constructor(gridPosition: number, color: string) {
    super(gridPosition, 16, color);
  }
}
