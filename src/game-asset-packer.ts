import { palettesToBytes } from "@/palette-maker/palette.composable";
import { useTiles } from "@/tile-draw/tile.composable";

export function packGameAssets(palettes: string[][], tiles: number[][]): ArrayBuffer {
  const { tilesToBytes } = useTiles();
  const palettesBuffer = palettesToBytes(palettes);
  const tilesBuffer = tilesToBytes(tiles);

  const palettesBytes = new Uint8Array(palettesBuffer);
  const tilesBytes = new Uint8Array(tilesBuffer);
  const combinedBytes = new Uint8Array(palettesBytes.byteLength + tilesBytes.byteLength);

  combinedBytes.set(palettesBytes);
  combinedBytes.set(tilesBytes, palettesBytes.byteLength);

  return combinedBytes.buffer;
}
