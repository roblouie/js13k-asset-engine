import { palettesToBytes } from '@/palette-maker/palette.composable';
import { useTiles } from '@/tile-draw/tile.composable';
import { Sprite } from '@/sprite-maker/sprite.model';
import { useSprites } from '@/sprite-maker/sprite.composable';
import { useSound } from '@/sound/sound.composable';
import { Song } from '@/sound/song.model';
import { useBackgrounds } from '@/backgrounds/backgrounds.composable';
import { BackgroundLayer } from '@/backgrounds/background-layer';

export function packGameAssets(palettes: string[][], tiles: number[][], sprites: Sprite[], backgrounds: BackgroundLayer[][], songs: Song[]): ArrayBuffer {
  const { tilesToBytes } = useTiles();
  const { spritesToBytes } = useSprites();
  const { songsToBytes } = useSound();
  const { backgroundsToBytes } = useBackgrounds();

  const palettesBuffer = palettesToBytes(palettes);
  const tilesBuffer = tilesToBytes(tiles);
  const spriteBuffer = spritesToBytes(sprites);
  const backgroundsBuffer = backgroundsToBytes(backgrounds);
  const songsBuffer = songsToBytes(songs);

  const palettesBytes = new Uint8Array(palettesBuffer);
  const tilesBytes = new Uint8Array(tilesBuffer);
  const spriteBytes = new Uint8Array(spriteBuffer);
  const backgroundsBytes = new Uint8Array(backgroundsBuffer);
  const songsBytes = new Uint8Array(songsBuffer);
  const combinedBytes = new Uint8Array(
    palettesBytes.byteLength
    + tilesBytes.byteLength
    + spriteBytes.byteLength
    + backgroundsBytes.byteLength
    + songsBytes.byteLength,
  );

  combinedBytes.set(palettesBytes);
  combinedBytes.set(tilesBytes, palettesBytes.byteLength);
  combinedBytes.set(spriteBytes, palettesBytes.byteLength + tilesBytes.byteLength);
  combinedBytes.set(backgroundsBytes, palettesBytes.byteLength + tilesBytes.byteLength + spriteBytes.byteLength);

  combinedBytes.set(songsBytes, palettesBytes.byteLength + tilesBytes.byteLength + spriteBytes.byteLength + backgroundsBytes.byteLength);

  return combinedBytes.buffer;
}
