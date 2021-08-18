import { palettesToBytes } from "@/palette-maker/palette.composable";
import { useTiles } from "@/tile-draw/tile.composable";
import { Sprite } from "@/sprite-maker/sprite.model";
import { useSprites } from "@/sprite-maker/sprite.composable";

export function packGameAssets(palettes: string[][], tiles: number[][], sprites: Sprite[]): ArrayBuffer {
  const { tilesToBytes } = useTiles();
  const { spritesToBytes } = useSprites();

  const palettesBuffer = palettesToBytes(palettes);
  const tilesBuffer = tilesToBytes(tiles);
  const spriteBuffer = spritesToBytes(sprites);

  const palettesBytes = new Uint8Array(palettesBuffer);
  const tilesBytes = new Uint8Array(tilesBuffer);
  const spriteBytes = new Uint8Array(spriteBuffer);
  const combinedBytes = new Uint8Array(palettesBytes.byteLength + tilesBytes.byteLength + spriteBytes.byteLength);

  combinedBytes.set(palettesBytes);
  combinedBytes.set(tilesBytes, palettesBytes.byteLength);
  combinedBytes.set(spriteBytes, palettesBytes.byteLength + tilesBytes.byteLength);

  return combinedBytes.buffer;
}
