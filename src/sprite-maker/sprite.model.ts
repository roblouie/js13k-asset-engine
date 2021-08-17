import { SpriteTile } from "@/sprite-maker/sprite-tile.model";

export class Sprite {
  spriteTiles: SpriteTile[];
  paletteNumber: number;
  size: { width: number, height: number };

  constructor(paletteNumber: number, width: number, height: number) {
    this.paletteNumber = paletteNumber;
    this.size = { width, height };
    if (width === 2 && height === 2) {
      this.spriteTiles = new Array(4);
    } else {
      this.spriteTiles = new Array(width + height - 1);
    }
  }
}
