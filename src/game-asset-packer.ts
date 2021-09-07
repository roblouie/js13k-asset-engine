import { palettesToBytes } from '@/palette-maker/palette.composable';
import { useTiles } from '@/tile-draw/tile.composable';
import { Sprite } from '@/sprite-maker/sprite.model';
import { useSprites } from '@/sprite-maker/sprite.composable';
import { useSound } from '@/sound/sound.composable';
import { Song } from '@/sound/song.model';
import { useBackgrounds } from '@/backgrounds/backgrounds.composable';
import { BackgroundLayer } from '@/backgrounds/background-layer';
import { useSoundEffects } from '@/sound-effects/sound-effects.composable';
import { SoundEffect } from '@/sound-effects/sound-effect.model';
import { useLevel } from "@/level-editor/level.composable";
import { Level } from "@/level-editor/level";

export function packGameAssets(palettes: string[][], paletteSplitIndex: number, tiles: number[][], tileSplitIndex: number, sprites: Sprite[], backgrounds: BackgroundLayer[][], songs: Song[], soundEffects: SoundEffect[], levels: Level[]): ArrayBuffer {
  const { tilesToBytes } = useTiles();
  const { spritesToBytes } = useSprites();
  const { songsToBytes } = useSound();
  const { soundEffectsToBytes } = useSoundEffects();
  const { backgroundsToBytes } = useBackgrounds();
  const { levelsToBytes } = useLevel();

  const palettesBuffer = palettesToBytes(palettes, paletteSplitIndex);
  const tilesBuffer = tilesToBytes(tiles, tileSplitIndex);
  const spriteBuffer = spritesToBytes(sprites);
  const backgroundsBuffer = backgroundsToBytes(backgrounds);
  const songsBuffer = songsToBytes(songs);
  const soundEffectsBuffer = soundEffectsToBytes(soundEffects);
  const levelsBuffer = levelsToBytes(levels);

  const palettesBytes = new Uint8Array(palettesBuffer);
  const tilesBytes = new Uint8Array(tilesBuffer);
  const spriteBytes = new Uint8Array(spriteBuffer);
  const backgroundsBytes = new Uint8Array(backgroundsBuffer);
  const songsBytes = new Uint8Array(songsBuffer);
  const soundEffectsBytes = new Uint8Array(soundEffectsBuffer);
  const levelsBytes = new Uint8Array(levelsBuffer);

  const combinedBytes = new Uint8Array(
    palettesBytes.byteLength
    + tilesBytes.byteLength
    + spriteBytes.byteLength
    + backgroundsBytes.byteLength
    + songsBytes.byteLength
    + soundEffectsBytes.byteLength
    + levelsBytes.byteLength,
  );

  combinedBytes.set(palettesBytes);
  combinedBytes.set(tilesBytes, palettesBytes.byteLength);
  combinedBytes.set(spriteBytes, palettesBytes.byteLength + tilesBytes.byteLength);
  combinedBytes.set(backgroundsBytes, palettesBytes.byteLength + tilesBytes.byteLength + spriteBytes.byteLength);

  combinedBytes.set(songsBytes, palettesBytes.byteLength + tilesBytes.byteLength + spriteBytes.byteLength + backgroundsBytes.byteLength);
  combinedBytes.set(soundEffectsBytes, songsBytes.byteLength + palettesBytes.byteLength + tilesBytes.byteLength + spriteBytes.byteLength + backgroundsBytes.byteLength);
  combinedBytes.set(levelsBytes, songsBytes.byteLength + palettesBytes.byteLength + tilesBytes.byteLength + spriteBytes.byteLength + backgroundsBytes.byteLength + soundEffectsBytes.byteLength);

  return combinedBytes.buffer;
}
