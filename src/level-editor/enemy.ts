export abstract class Enemy {
  gridPosition: number;
  size: number;
  colorNum: number;
  abstract type: string;
  abstract typeNum: number;

  static Colors = [
    '#0000ff',
    '#00ff00',
    '#ffff00',
    '#ff00ff',
  ];

  protected constructor(gridPosition: number, size: number, colorNum: number) {
    this.gridPosition = gridPosition;
    this.size = size;
    this.colorNum = colorNum;
  }
}