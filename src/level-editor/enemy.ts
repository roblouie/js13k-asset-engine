export abstract class Enemy {
  gridPosition: number;
  size: number;
  colorNum: number;
  abstract type: string;
  abstract typeNum: number;

  static Colors = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ff00ff',
  ];

  protected constructor(gridPosition: number, size: number, colorNum: number) {
    this.gridPosition = gridPosition;
    this.size = size;
    this.colorNum = colorNum;
  }
}