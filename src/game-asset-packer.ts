import { palettesToBytes } from "@/palette-maker/palette.composable";
import { useTiles } from "@/tile-draw/tile.composable";
import {useSound} from "@/sound/sound.composable";
import {Song} from "@/sound/song.model";

export function packGameAssets(palettes: string[][], tiles: number[][], songs: Song[]): ArrayBuffer {
  const { tilesToBytes } = useTiles();
  const palettesBuffer = palettesToBytes(palettes);
  const { songsToBytes } = useSound();
  const tilesBuffer = tilesToBytes(tiles);
  const songsBuffer = songsToBytes(songs);

  const palettesBytes = new Uint8Array(palettesBuffer);
  const tilesBytes = new Uint8Array(tilesBuffer);
  const songsBytes = new Uint8Array(songsBuffer);
  const combinedBytes = new Uint8Array(palettesBytes.byteLength + tilesBytes.byteLength + songsBytes.byteLength);

  combinedBytes.set(palettesBytes);
  combinedBytes.set(tilesBytes, palettesBytes.byteLength);
  combinedBytes.set(songsBytes, palettesBytes.byteLength + tilesBytes.byteLength);

  return combinedBytes.buffer;
}
