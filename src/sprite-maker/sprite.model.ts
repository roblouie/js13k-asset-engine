import { SpriteTile } from '@/sprite-maker/sprite-tile.model';

export class Sprite {
  spriteTiles: SpriteTile[];
  paletteNumber: number;
  size: number;

  static FromJson(jsonObject: any) {
    const sprite = new Sprite(jsonObject.paletteNumber, jsonObject.size);
    sprite.spriteTiles = jsonObject.spriteTiles;
    return sprite;
  }

  constructor(paletteNumber: number, size: number) {
    this.paletteNumber = paletteNumber;
    this.size = size;
    if (this.width === 2 && this.height === 2) {
      this.spriteTiles = new Array(4);
    } else {
      this.spriteTiles = new Array(this.width + this.height - 1);
    }
  }

  get width() {
    if (this.size === 0 || this.size === 1) {
      return 1;
    } else {
      return 2;
    }
  }

  get height() {
    if (this.size === 0 || this.size === 2) {
      return 1;
    } else {
      return 2;
    }
  }
}
