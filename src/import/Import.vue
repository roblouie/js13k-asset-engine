<template>
  <label>
    Convert Bitmap
    <input type="file" multiple accept="image/bmp" @change="convertBitmaps"/>

    <canvas ref="canvas" width="32" height="32"></canvas>

    <div v-for="log in convertLog" :key="log" class="convert-log">
      {{ log }}
    </div>
  </label>
</template>

<script setup lang="ts">

import { fileToArrayBuffer } from '@/shared/file-helpers';
import { onMounted, ref } from 'vue';
import {
  headerStruct,
  HeaderStructData,
  infoHeaderStruct,
  InfoHeaderStructData,
  pixelDataStruct, PixelStructData,
} from '@/import/bitmap-struct-data';
import { usePalettes } from "@/palette-maker/palette.composable";
import { Sprite } from "@/sprite-maker/sprite.model";
import { chunkArrayInGroups } from "@/game-asset-unpacker";
import { useTiles } from "@/tile-draw/tile.composable";
import { SpriteTile } from "@/sprite-maker/sprite-tile.model";
import { useSprites } from "@/sprite-maker/sprite.composable";

const convertLog = ref<string[]>([]);
const canvas = ref<HTMLCanvasElement | null>(null);
let context: CanvasRenderingContext2D;

onMounted(() => {
  context = canvas.value!.getContext('2d');
});

async function convertBitmaps(event: any) {
  const bitmapArrayBuffers = await loadBitmaps(event);

  bitmapArrayBuffers.forEach(convertBitmap);
}

const { palettes } = usePalettes();
const { tiles } = useTiles();
const { sprites } = useSprites();

function convertBitmap(bitmapArrayBuffer: ArrayBuffer, fileNumber: number) {
  const header = headerStruct.createObject<HeaderStructData>(bitmapArrayBuffer , 0, true);
  const infoHeader = infoHeaderStruct.createObject<InfoHeaderStructData>(bitmapArrayBuffer , header.byteLength, true);
  const pixels = pixelDataStruct.createArray<PixelStructData[]>(bitmapArrayBuffer , header.offsetToStartOfBitmapData, infoHeader.imageWidth * infoHeader.imageHeight, true);

  const imageData = new ImageData(infoHeader.imageWidth, infoHeader.imageHeight);

  // Bitmaps are stored upside down, so flip the pixels
  const flippedPixels = flipBitmap(pixels, infoHeader.imageWidth);

  flippedPixels.forEach((pixel, index) => {
    const imageDataIndex = index * 4;
    imageData.data[imageDataIndex] = pixel.red;
    imageData.data[imageDataIndex + 1] = pixel.green;
    imageData.data[imageDataIndex + 2] = pixel.blue;
    imageData.data[imageDataIndex + 3] = 255;
  });

  context.putImageData(imageData, 0, 0);

  if ((infoHeader.imageHeight !== 16 && infoHeader.imageHeight !== 32) || infoHeader.imageWidth !== 16 && infoHeader.imageWidth !== 32) {
    convertLog.value.push(`Error in file ${fileNumber}: Image must have both its height and width as either 16px or 32px`);
    return;
  }

  const pixelStrings = flippedPixels.map(pixel => '#' + ((pixel.red << 16) + (pixel.green << 8) + pixel.blue).toString(16).padStart(6, '0'));
  const uniqueColors = [...new Set(pixelStrings)];

  if (uniqueColors.length > 16) {
    convertLog.value.push(`Error in file ${fileNumber}: Image may only have 16 colors max`);
    return;
  }

  // Fill palette with black if there aren't 16 colors
  while (uniqueColors.length < 16) {
    uniqueColors.push('#000000');
  }

  // Do any existing palettes contain all the same colors?
  const matchingPaletteIndex = palettes.value.findIndex(palette => {
    return uniqueColors.every((color, index) => {
      if (color === '#ff00ff') {
        return palette[0] === '#000000';
      } else {
        return palette.includes(color);
      }
    });
  });

  // Either set the matching palette number, or push unique colors onto the palette array, and set palette number
  // to the index of the newly pushed palette. Make sure to adjust for transparency logic
  let paletteNumber = 0;
  if (matchingPaletteIndex !== -1) {
    paletteNumber = matchingPaletteIndex;
  } else {
    const transparentColorPosition = uniqueColors.findIndex(color => color === '#ff00ff');
    if (transparentColorPosition !== -1) {
      uniqueColors.splice(transparentColorPosition, 1);
      uniqueColors.unshift('#000000');
      palettes.value.push(uniqueColors);
      paletteNumber = palettes.value.length - 1;
    }
  }

  convertLog.value.push(`File ${fileNumber}: ${matchingPaletteIndex === -1 ? 'Created new palette' : 'Found matching palette'}`);

  // Create sprite with size and palette number
  const spriteSize = getSpriteSize(infoHeader.imageWidth, infoHeader.imageHeight);
  const sprite = new Sprite(paletteNumber, spriteSize);

  // Now the actual pixels must be broken down into individual tiles
  // First just replace all the pixel color values with their indexes into the palette
  const colorIndexes = pixelStrings.map(pixelString => {
    // If the bitmap has a transparency pixel, that will always be position 0 in the palette, since black in position 0
    // in our asset system is treated as transparent
    if (pixelString === '#ff00ff') {
      return 0;
    } else {
      // If we are drawing a non transparent value, but the color in question is black, we need to find the first
      // black value that isn't in position 0, otherwise we can just get the position of the color
      const palette = palettes.value[paletteNumber];
      if (palette[0] === '#000000' && pixelString === '#000000') {
        return palette.findIndex((color, index) => index > 0 && color === pixelString);
      } else {
        return palette.findIndex(paletteColor => paletteColor === pixelString);
      }
    }
  });

  // At this point color indexes is just one giant tile. It possibly needs to be split into smaller tiles, unless
  // it's a 16x16 sprite, in which case it's a single tile and we're done.
  if (sprite.size === 0) {
    tiles.value.push(colorIndexes);
    const spriteTile = new SpriteTile(false, false, tiles.value.length - 1);
    sprite.spriteTiles = [spriteTile];
    convertLog.value.push(`File ${fileNumber}: Created 1 Tile`);
  }

  if (sprite.size === 1) {
    const newTiles = chunkArrayInGroups(colorIndexes, 256);
    tiles.value.push(...newTiles);
    const tile1 = new SpriteTile(false, false, tiles.value.length - 2);
    const tile2 = new SpriteTile(false, false, tiles.value.length - 1);
    sprite.spriteTiles = [tile1, tile2];
    convertLog.value.push(`File ${fileNumber}: Created 2 Tiles`);
  }

  if (sprite.size === 2) {
    const tileWidthRows = chunkArrayInGroups(colorIndexes, 16);
    let tile1Values = [];
    let tile2Values = [];

    tileWidthRows.forEach((tileRow, index) => {
      if (index % 2 === 0) {
        tile1Values.push(...tileRow);
      } else {
        tile2Values.push(...tileRow);
      }
    });

    tiles.value.push(tile1Values, tile2Values);
    const tile1 = new SpriteTile(false, false, tiles.value.length - 2);
    const tile2 = new SpriteTile(false, false, tiles.value.length - 1);
    sprite.spriteTiles = [tile1, tile2];
    convertLog.value.push(`File ${fileNumber}: Created 2 Tiles`);
  }

  if (sprite.size === 3) {
    const [topHalf, bottomHalf] = chunkArrayInGroups(colorIndexes, 512);
    const topHalfRows = chunkArrayInGroups(topHalf, 32);
    const bottomHalfRows = chunkArrayInGroups(bottomHalf, 32);

    const topLeftTiles = [];
    const topRightTiles = [];

    topHalfRows.forEach(topHalfRow => {
      const [left, right] = chunkArrayInGroups(topHalfRow, 16);
      topLeftTiles.push(left);
      topRightTiles.push(right);
    });

    const bottomLeftTiles = [];
    const bottomRightTiles = [];

    bottomHalfRows.forEach(bottomHalfRow => {
      const [left, right] = chunkArrayInGroups(bottomHalfRow, 16);
      bottomLeftTiles.push(left);
      bottomRightTiles.push(right);
    });

    const tile1Values = topLeftTiles.flat(2);
    const tile2Values = topRightTiles.flat(2);
    const tile3Values = bottomLeftTiles.flat(2);
    const tile4Values = bottomRightTiles.flat(2);

    tiles.value.push(tile1Values, tile2Values, tile3Values, tile4Values);
    const tile1 = new SpriteTile(false, false, tiles.value.length - 4);
    const tile2 = new SpriteTile(false, false, tiles.value.length - 3);
    const tile3 = new SpriteTile(false, false, tiles.value.length - 2);
    const tile4 = new SpriteTile(false, false, tiles.value.length - 1);
    sprite.spriteTiles = [tile1, tile2, tile3, tile4];

    convertLog.value.push(`File ${fileNumber}: Created 2 Tiles`);
  }

  sprites.value.push(sprite);
  convertLog.value.push(`File ${fileNumber}: Sprite Imported!!`);
  convertLog.value.push('----------------------------');
}

async function loadBitmaps(event: any) {
  const fileElement = event.target as HTMLInputElement;

  if (fileElement.files) {
    const bitmapArrayBufferPromises = Array.from(fileElement.files).map(file => fileToArrayBuffer(file));
    return await Promise.all(bitmapArrayBufferPromises);
  }
}

function getSpriteSize(widthInPixels: number, heightInPixels: number) {
  if (widthInPixels === 16 && heightInPixels === 16) {
    return 0;
  } else if (widthInPixels === 16 && heightInPixels === 32) {
    return 1;
  } else if (widthInPixels === 32 && heightInPixels === 16) {
    return 2;
  } else {
    return 3;
  }
}

function flipBitmap(pixels: PixelStructData[], bitmapWidth: number): { red: number, green: number, blue: number }[] {
  const chunked = chunkArrayInGroups(pixels, bitmapWidth);
  chunked.reverse();
  return chunked.flat();
}
</script>

<style scoped>

</style>