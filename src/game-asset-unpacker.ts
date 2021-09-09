import { Sprite } from '@/sprite-maker/sprite.model';
import { SpriteTile } from '@/sprite-maker/sprite-tile.model';
import { Song } from '@/sound/song.model';
import { Track } from '@/sound/track.model';
import { NotePosition } from '@/sound/note-position.model';
import { BackgroundLayer } from '@/backgrounds/background-layer';
import { SoundEffect } from '@/sound-effects/sound-effect.model';
import { Level } from '@/level-editor/level';
import { EnemyWave } from '@/level-editor/enemy-wave';
import { StraightEnemy } from '@/level-editor/straight-enemy';
import { PauseEnemy } from '@/level-editor/pause-enemy';
import { WaveEnemy } from '@/level-editor/wave-enemy';

interface UnpackedAsset {
  data: any;
  finalByteIndex: number;
}

export function unpackGameAssets(arrayBuffer: ArrayBuffer) {
  const paletteAsset = bytesToPalettes(arrayBuffer, 0);
  const tileAsset = bytesToTiles(arrayBuffer, paletteAsset.finalByteIndex);
  const spriteAsset = bytesToSprites(arrayBuffer, tileAsset.finalByteIndex);
  const backgroundAsset = bytesToBackgrounds(arrayBuffer, spriteAsset.finalByteIndex);
  const songsAsset = bytesToSongs(arrayBuffer, backgroundAsset.finalByteIndex);
  const soundEffectsAsset = bytesToSoundEffects(arrayBuffer, songsAsset.finalByteIndex);
  const levelAsset = bytesToLevels(arrayBuffer, soundEffectsAsset.finalByteIndex);

  return {
    paletteAsset,
    tileAsset,
    spriteAsset,
    backgroundAsset,
    songsAsset,
    soundEffectsAsset,
    levelAsset,
  };
}

function bytesToPalettes(arrayBuffer: ArrayBuffer, startingOffset = 0): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfPalettes = dataView.getUint8(0);
  const paletteSplitIndex = dataView.getUint8(1);
  const sixteenColorPaletteSize = 16 * 3 * paletteSplitIndex; // sixteen colors, three bytes per color
  const eightColorPaletteSize = 8 * 3 * (numberOfPalettes - paletteSplitIndex);
  const totalPalettesByteSize = sixteenColorPaletteSize + eightColorPaletteSize + 2;

  const sixteenBitPalettes = [];
  let byteOffset = 2;

  while (byteOffset < sixteenColorPaletteSize) {
    const byte0 = dataView.getUint8(byteOffset);
    const byte1 = dataView.getUint8(byteOffset + 1);
    const byte2 = dataView.getUint8(byteOffset + 2);

    const byte0String = byte0.toString(16).padStart(2, '0');
    const byte1String = byte1.toString(16).padStart(2, '0');
    const byte2String = byte2.toString(16).padStart(2, '0');

    sixteenBitPalettes.push('#' + byte0String + byte1String + byte2String);
    byteOffset += 3;
  }

  const paletteData = chunkArrayInGroups(sixteenBitPalettes, 16);

  const eightBitPalettes = [];

  while (byteOffset < totalPalettesByteSize) {
    const byte0 = dataView.getUint8(byteOffset);
    const byte1 = dataView.getUint8(byteOffset + 1);
    const byte2 = dataView.getUint8(byteOffset + 2);

    const byte0String = byte0.toString(16).padStart(2, '0');
    const byte1String = byte1.toString(16).padStart(2, '0');
    const byte2String = byte2.toString(16).padStart(2, '0');

    eightBitPalettes.push('#' + byte0String + byte1String + byte2String);
    byteOffset += 3;
  }

  const eightBitPaletteData = chunkArrayInGroups(eightBitPalettes, 8);

  paletteData.push(...eightBitPaletteData);

  return {
    data: { paletteData, paletteSplitIndex },
    finalByteIndex: startingOffset + totalPalettesByteSize,
  };
}

function bytesToTiles(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfTiles = dataView.getUint8(0);
  const tileSplitIndex = dataView.getUint8(1);

  const sixteenColorTileSize = 128 * tileSplitIndex; // 256 pixels with half a byte per color === 128
  const eightColorTileSize = 96 * (numberOfTiles - tileSplitIndex);
  const totalTilesByteSize = sixteenColorTileSize + eightColorTileSize + 2;

  const rawTileValues: number[] = [];
  let byteOffset = 2;

  while (byteOffset < (sixteenColorTileSize + 2)) {
    const byte = dataView.getUint8(byteOffset);
    byteOffset++;
    const firstValue = byte & 0xf;
    const secondValue = (byte >> 4) & 0xf;
    rawTileValues.push(firstValue, secondValue);
  }

  const test = [];

  while (byteOffset < totalTilesByteSize) {
    const eightPixelData = dataView.getUint32(byteOffset, true);
    byteOffset += 3;

    const firstPixel = eightPixelData & 0b111;
    const secondPixel = (eightPixelData >> 3) & 0b111;
    const thirdPixel = (eightPixelData >> 6) & 0b111;
    const fourthPixel = (eightPixelData >> 9) & 0b111;

    const fifthPixel = (eightPixelData >> 12) & 0b111;
    const sixthPixel = (eightPixelData >> 15) & 0b111;
    const seventhPixel = (eightPixelData >> 18) & 0b111;
    const eighthPixel = (eightPixelData >> 21) & 0b111;

    test.push(firstPixel, secondPixel, thirdPixel, fourthPixel, fifthPixel, sixthPixel, seventhPixel, eighthPixel);

    rawTileValues.push(firstPixel, secondPixel, thirdPixel, fourthPixel, fifthPixel, sixthPixel, seventhPixel, eighthPixel);
  }

  const tileData = chunkArrayInGroups(rawTileValues, 256);

  return {
    data: { tileData, tileSplitIndex },
    finalByteIndex: startingOffset + totalTilesByteSize,
  };
}

function bytesToSprites(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  if (startingOffset >= arrayBuffer.byteLength) {
    return {
      data: [],
      finalByteIndex: startingOffset,
    };
  }
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfSprites = dataView.getUint8(0);

  let spritesParsed = 0;
  let bytePosition = 1;
  const sprites: Sprite[] = [];

  while (spritesParsed < numberOfSprites) {
    const spriteHeaderByte = dataView.getUint8(bytePosition);
    const paletteNumber = spriteHeaderByte & 63;
    const size = spriteHeaderByte >> 6;
    bytePosition++;

    const sprite = new Sprite(paletteNumber, size);

    for (let i = 0; i < sprite.spriteTiles.length; i++) {
      const tileNumber = dataView.getUint8(bytePosition);
      bytePosition++;
      const flippedBits = dataView.getUint8(bytePosition);
      bytePosition++;

      const isFlippedY = (flippedBits & 1) === 1;
      const isFlippedX = (flippedBits >> 1) === 1;
      sprite.spriteTiles[i] = new SpriteTile(isFlippedX, isFlippedY, tileNumber);
    }

    sprites.push(sprite);
    spritesParsed++;
  }

  return {
    data: sprites,
    finalByteIndex: startingOffset + bytePosition,
  };
}

function bytesToBackgrounds(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  if (startingOffset >= arrayBuffer.byteLength) {
    return {
      data: [],
      finalByteIndex: startingOffset,
    };
  }

  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfBackgrounds = dataView.getUint8(0);
  const numberOfBackgroundLayers = numberOfBackgrounds * 3;

  let backgroundsParsed = 0;
  let bytePosition = 1;
  const backgroundLayers: BackgroundLayer[] = [];

  while (backgroundsParsed < numberOfBackgroundLayers) {
    const numberOfSpritesInBackground = dataView.getUint8(bytePosition);
    bytePosition++;

    const metadata = dataView.getUint8(bytePosition);
    const spriteStartIndex = metadata & 127;
    const isSemiTransparent = metadata >> 7;
    bytePosition++;

    const backgroundLayer = new BackgroundLayer();
    backgroundLayer.spriteStartOffset = spriteStartIndex;
    backgroundLayer.isSemiTransparent = isSemiTransparent === 1;

    for (let i = 0; i < numberOfSpritesInBackground; i++) {
      const spriteByte = dataView.getUint8(bytePosition);
      bytePosition++;

      const position = spriteByte >> 3;
      const spriteIndex = spriteByte & 0b111;
      backgroundLayer.sprites.push({ position, spriteIndex });
    }

    backgroundLayers.push(backgroundLayer);

    backgroundsParsed++;
  }

  const groupedByLayer = chunkArrayInGroups(backgroundLayers, 3);

  groupedByLayer.forEach(layer => {
    if (layer.length === 1) {
      layer.push(new BackgroundLayer(), new BackgroundLayer());
    } else if (layer.length === 2) {
      layer.push(new BackgroundLayer());
    }
  });

  return {
    data: groupedByLayer,
    finalByteIndex: startingOffset + bytePosition,
  };
}

const waves = [
  'sawtooth',
  'sine',
  'square',
  'triangle',
] as any;


function bytesToSongs(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  if (startingOffset >= arrayBuffer.byteLength) {
    return {
      data: [],
      finalByteIndex: startingOffset,
    };
  }
  
  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfSongs = dataView.getUint8(0);

  let bytePosition = 1;
  let songsParsed = 0;
  const songs: Song[] = [];

  while (songsParsed < numberOfSongs) {
    const tempo = dataView.getUint8(bytePosition);
    bytePosition++;
    const numberOfTracks = dataView.getUint8(bytePosition);
    bytePosition++;

    const tracks: Track[] = [];
    let tracksParsed = 0;
    while (tracksParsed < numberOfTracks) {
      const waveformAndPitches = dataView.getUint8(bytePosition);
      const waveformIndex = waveformAndPitches >> 4;
      const waveform = waves.find((wave: any, index: number) => index === waveformIndex);
      const numberOfPitches = (waveformAndPitches &15) + 1;
      bytePosition ++;

      let pitchesParsed = 0;
      const pitches = [];
      while (pitchesParsed < numberOfPitches) {
        pitches.push(dataView.getUint16(bytePosition));
        pitchesParsed++;
        bytePosition += 2;
      }

      const numberOfNotes = dataView.getUint8(bytePosition);
      bytePosition++;

      let notesParsed = 0;
      const notes: NotePosition[] = [];
      let currentStepPosition = 0;
      while (notesParsed < numberOfNotes) {
        const combinedInstruction = dataView.getUint8(bytePosition);
        const pitchIndex = combinedInstruction >> 4;
        const noteLength = (combinedInstruction & 15) + 1; // note length is stored 0-indexed

        if (pitchIndex !== 0) {
          const noteFrequency = pitches[pitchIndex];

          notes.push({
            frequency: noteFrequency,
            startPosition: currentStepPosition,
            duration: noteLength,
          });
        }
        currentStepPosition += noteLength;
        bytePosition++;
        notesParsed++;
      }

      tracks.push({ wave: waveform, notes: notes });
      tracksParsed++;
    }
    songs.push(new Song(tempo, tracks));
    songsParsed++;
  }

  return {
    data: songs,
    finalByteIndex: startingOffset + bytePosition,
  };
}

function bytesToSoundEffects(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  if (startingOffset >= arrayBuffer.byteLength) {
    return {
      data: [],
      finalByteIndex: startingOffset,
    };
  }

  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfSoundEffects = dataView.getUint8(0);

  let bytePosition = 1;
  let soundEffectsParsed = 0;
  const soundEffects: SoundEffect[] = [];

  while (soundEffectsParsed < numberOfSoundEffects) {
    const combinedInstructions = dataView.getUint8(bytePosition);
    const numberOfGainInstructions = combinedInstructions >> 4;
    const numberOfOtherInstructions = combinedInstructions & 0b1111;
    bytePosition++;

    let gainInstructionsParsed = 0;
    const gainInstructions = [];
    while (gainInstructionsParsed < numberOfGainInstructions) {
      const gainInstruction = dataView.getUint8(bytePosition);
      const gain = (gainInstruction >> 6) / 3;
      const isWhiteNoise = ((gainInstruction >> 5) & 0b1) === 1;
      const timeFromLastInstruction = (gainInstruction & 0b11111) / 20;
      gainInstructions.push({ gain, isWhiteNoise, timeFromLastInstruction });
      gainInstructionsParsed ++;
      bytePosition ++;
    }

    let otherInstructionsParsed = 0;
    const widthInstructions = [];
    const pitchInstructions = [];

    while (otherInstructionsParsed < numberOfOtherInstructions) {
      const otherInstruction = dataView.getUint8(bytePosition);
      const isWidth = otherInstruction >> 7 === 1;
      if (isWidth) {
        const timeFromLastInstruction = (otherInstruction & 0b11111) / 20;
        widthInstructions.push({ timeFromLastInstruction, isWidth });
      } else {
        const isLinearRampTo = ((otherInstruction >> 5) & 0b1) === 1;
        const durationInSeconds = (otherInstruction & 0b11111) / 20;
        bytePosition++;
        const pitchBytes = dataView.getUint8(bytePosition);
        const pitch = Math.round(Math.pow((pitchBytes + 9), 1.7));
        pitchInstructions.push({ pitch, durationInSeconds, isLinearRampTo });
      }
      otherInstructionsParsed++;
      bytePosition++;
    }
    soundEffects.push({ gainInstructions, widthInstructions, pitchInstructions });
    soundEffectsParsed++;
  }

  return {
    data: soundEffects,
    finalByteIndex: startingOffset + bytePosition,
  };
}

function bytesToLevels(arrayBuffer: ArrayBuffer, startingOffset: number): UnpackedAsset {
  if (startingOffset >= arrayBuffer.byteLength) {
    return {
      data: [],
      finalByteIndex: startingOffset,
    };
  }

  const dataView = new DataView(arrayBuffer, startingOffset);
  const numberOfLevels = dataView.getUint8(0);
  let bytePosition = 1;

  const levels: Level[] =[];

  for (let i = 0; i < numberOfLevels; i++) {
    const level = new Level([]);

    const numberOfWaves = dataView.getUint8(bytePosition);
    bytePosition++;

    for (let j = 0; j < numberOfWaves; j++) {
      const wave = new EnemyWave([]);

      const numberOfEnemies = dataView.getUint8(bytePosition);
      bytePosition++;

      for (let k = 0; k < numberOfEnemies; k++) {
        const combinedData = dataView.getUint8(bytePosition);
        bytePosition++;

        const colorNum = combinedData & 0b1111;
        const typeNum = combinedData >> 4;

        const position = dataView.getUint8(bytePosition);
        bytePosition++;

        switch (typeNum) {
        case 0:
          wave.enemies.push(new StraightEnemy(position, colorNum));
          break;
        case 1:
          wave.enemies.push(new PauseEnemy(position, colorNum));
          break;
        case 2:
          wave.enemies.push(new WaveEnemy(position, colorNum, true));
          break;
        case 3:
          wave.enemies.push(new WaveEnemy(position, colorNum, false));
          break;
        case 4:
          wave.enemies.push(new WaveEnemy(position, colorNum, true));
          break;
        case 5:
          wave.enemies.push(new WaveEnemy(position, colorNum, false));
          break;
        case 6:
          wave.enemies.push(new WaveEnemy(position, colorNum, true));
          break;
        case 7:
          wave.enemies.push(new WaveEnemy(position, colorNum, false));
          break;
        }
      }

      level.enemyWaves.push(wave);
    }
    levels.push(level);
  }

  return {
    data: levels,
    finalByteIndex: bytePosition,
  };
}

export function chunkArrayInGroups(array: any[] | Uint8ClampedArray, chunkSize: number): any[] | Uint8ClampedArray[] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
}
