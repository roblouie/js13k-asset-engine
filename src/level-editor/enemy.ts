export abstract class Enemy {
  gridPosition: number;
  size: number;
  color = '#000000';
  abstract type: string;

  protected constructor(gridPosition: number, size: number, color: string) {
    this.gridPosition = gridPosition;
    this.size = size;
    this.color = color;
  }
}