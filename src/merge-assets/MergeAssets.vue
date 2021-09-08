<template>
  <input type="file" multiple accept="application/json" @change="mergeAssets"/>
  <div style="display: flex">
    <div style="max-height: 400px; overflow: auto;">
      <div
          class="tile"
          v-for="(sprite, spriteIndex) in sprites"
          :key="sprite"
          @click="selectSprite(spriteIndex)"
          :class="{ 'selected': selectedSprite === spriteIndex }"
      >
        {{ spriteIndex }}
        <ImageDataIcon :sprite="sprite"></ImageDataIcon>
      </div>
    </div>

  <div style="width: 320px;">


  <canvas
      ref="canvasElement"
      :width="spriteDimensions.width"
      :height="spriteDimensions.height"
      :style="{
            width: spriteDimensions.width * spriteScaleMultiplier + 'px',
            height: spriteDimensions.height * spriteScaleMultiplier + 'px'
          }"
  >
  </canvas>
  </div>

  <div>
    <section
        v-for="(palette, paletteIndex) in palettes"
        :key="paletteIndex"
        class="palette"
        @click="selectPalette(paletteIndex)"
        :class="{ 'selected': selectedPaletteIndex === paletteIndex }"
    >
      <div
          class="color"
          v-for="(color, colorIndex) in palette"
          :key="colorIndex" :value="color"
          :style="{ backgroundColor: color }"
      >
      </div>
    </section>
  </div>


  <div>
    <div
        style="display: flex;"
        v-for="(oldColor, oldColorIndex) in palettes[sprites[selectedSprite].paletteNumber]"
        :key="oldColorIndex"
    >
      <div class="color" :style="{ backgroundColor: oldColor }"></div>

      <div style="display:flex; margin-left: 10px;">
        <div
            class="color"
            v-for="(color, colorIndex) in palettes[selectedPaletteIndex]"
            :key="color" :value="color"
            @click="selectColorIndex(colorIndex, oldColorIndex)"
            :style="{ backgroundColor: color }"
            :class="{ 'selected': replacements[oldColorIndex] === colorIndex }"
        />
      </div>
    </div>
  </div>

    <button @click="convertPalette">Convert</button>
  </div>
</template>

<script setup lang="ts">
import { fileToString } from '@/shared/file-helpers';
import { usePalettes } from "@/palette-maker/palette.composable";
import { useTiles } from "@/tile-draw/tile.composable";
import { useSprites } from "@/sprite-maker/sprite.composable";
import { useBackgrounds } from "@/backgrounds/backgrounds.composable";
import { Sprite } from "@/sprite-maker/sprite.model";
import { SpriteTile } from "@/sprite-maker/sprite-tile.model";
import { computed, onMounted, ref } from "vue";
import ImageDataIcon from '@/tile-draw/image-data-icon.vue';

const { palettes } = usePalettes();
const { tiles, tileSize, tileToImageData, tileSplitIndex } = useTiles();
const { sprites } = useSprites();
const selectedSprite = ref(0);
const spriteScaleMultiplier = 10;
const selectedPaletteIndex = ref(0);

const canvasElement = ref<HTMLCanvasElement | null>(null);
let canvasContext: CanvasRenderingContext2D;

const replacements = ref(new Array(8));

onMounted(() => {
  if (canvasElement.value) {
    canvasContext = canvasElement.value.getContext('2d') as CanvasRenderingContext2D;
    canvasContext.imageSmoothingEnabled = false;
  }
});

function selectPalette(paletteIndex: number) {
  selectedPaletteIndex.value = paletteIndex;
}

const spriteDimensions = computed(() => {
  if (sprites.value.length === 0) {
    return {
      width: 0,
      height: 0,
    };
  }

  return {
    width: sprites.value[selectedSprite.value].width * tileSize,
    height: sprites.value[selectedSprite.value].height * tileSize,
  };
});

function convertPalette() {
  const tileIndexes = [];
  sprites.value[selectedSprite.value].paletteNumber = selectedPaletteIndex.value;
  sprites.value[selectedSprite.value].spriteTiles.forEach(spriteTile => {
    console.log('old');
    console.log(tiles.value[spriteTile.tileNumber].toString());
    tiles.value[spriteTile.tileNumber] = tiles.value[spriteTile.tileNumber].map(tileVal => {
      return replacements.value[tileVal];
    });

    console.log('new');
    console.log(tiles.value[spriteTile.tileNumber].toString());

    if (!tileIndexes.includes(spriteTile.tileNumber)) {
      tileIndexes.push(spriteTile.tileNumber);
      tileSplitIndex.value--;
    }
  });

  // Move tiles to the bottom since they are 8 color now, and adjust the tile split index
  tileIndexes.sort().forEach((tileIndex, index) => {
    tiles.value.push(tiles.value.splice(tileIndex - index, 1)[0]);
  });

  // Now reassing the sprite tile locations to the last four positions in the array
  let toGoBack = 0;
  const lastIndex = tiles.value.length - 1;
  tileIndexes.forEach((something, index) => {
    sprites.value[selectedSprite.value].spriteTiles[index].tileNumber = lastIndex - toGoBack;
    toGoBack++;
  });
}

function selectSprite(spriteIndex: number) {
  selectedSprite.value = spriteIndex;
  replacements.value = [];

  // This is lame but waits until the canvas resizes to the new sprite before drawing
  setTimeout(() => {
    drawSpriteToCanvas(sprites.value[spriteIndex]);
  }, 50);
}

function selectColorIndex(colorIndex: number, oldColorIndex: number) {
  replacements.value[oldColorIndex] = colorIndex;
  console.log(replacements.value);
}

function drawSpriteToCanvas(sprite: Sprite) {
  if (!canvasContext || !sprite) {
    return;
  }

  sprite.spriteTiles.forEach((spriteTile, index) => {
    const tile = tiles.value[spriteTile.tileNumber];
    const palette = palettes.value[sprite.paletteNumber];

    let imageData = tileToImageData(tile, palette);
    if (spriteTile.isFlippedX) {
      imageData = flipImageDataHorizontally(imageData);
    }
    if (spriteTile.isFlippedY) {
      imageData = flipImageDataVertically(imageData);
    }

    if (index === 0) {
      canvasContext.putImageData(imageData, 0, 0);
    } else if (index === 1 && sprite.width === 1) {
      canvasContext.putImageData(imageData, 0, tileSize);
    } else if (index === 1 && sprite.width === 2) {
      canvasContext.putImageData(imageData, tileSize, 0);
    } else if (index === 2) {
      canvasContext.putImageData(imageData, 0, tileSize);
    } else if (index === 3) {
      canvasContext.putImageData(imageData, tileSize, tileSize);
    }

  });
}

async function mergeAssets(event: any) {
  const { palettes } = usePalettes();
  const { tiles } = useTiles();
  const { sprites } = useSprites();
  const { backgrounds } = useBackgrounds();

  const jsonStrings = await loadAssetFiles(event);

  const jsonObjects = jsonStrings.map(jsonString => JSON.parse(jsonString));
  jsonObjects.sort((a, b) => b.palettes.length - a.palettes.length);

  let paletteOffset = palettes.value.length;
  let tileOffset = tiles.value.length;

  jsonObjects.forEach(jsonObject => {
    if (jsonObject.palettes) {
      palettes.value.push(...jsonObject.palettes);
    }

    if (jsonObject.tiles) {

      tiles.value.push(...jsonObject.tiles);
    }

    if (jsonObject.sprites) {
      const convertedSprites = jsonObject.sprites.map(sprite => {
        console.log(tileOffset);
        const newSpriteTiles = sprite.spriteTiles.map(spriteTile => new SpriteTile(spriteTile.isFlippedX, spriteTile.isFlippedY, spriteTile.tileNumber + tileOffset));

        return Sprite.FromJson({
          paletteNumber: sprite.paletteNumber + paletteOffset,
          size: sprite.size,
          spriteTiles: newSpriteTiles,
        });
      });
      sprites.value.push(...convertedSprites);
    }

    paletteOffset += jsonObject.palettes.length;
    tileOffset += jsonObject.tiles.length;
  });

  // jsonObjects.sort((a, b) => b.backgrounds.length - a.backgrounds.length);
  // backgrounds.push(...jsonObjects[0].backgrounds);
}

async function loadAssetFiles(event: any) {
  const fileElement = event.target as HTMLInputElement;

  if (fileElement.files) {
    const bitmapArrayBufferPromises = Array.from(fileElement.files).map(file => fileToString(file));
    return await Promise.all(bitmapArrayBufferPromises);
  }
}

function flipImageDataHorizontally(imageData: ImageData): ImageData {
  const flippedImageData = new ImageData(imageData.width, imageData.height);
  const chunked = chunkArrayInGroups(imageData.data, 16 * 4);
  let imageDataIndex = 0;
  chunked.forEach(imageRow => {
    for (let i = imageRow.length - 4; i >= 0; i -= 4) {
      flippedImageData.data[imageDataIndex] = imageRow[i];
      flippedImageData.data[imageDataIndex + 1] = imageRow[i + 1];
      flippedImageData.data[imageDataIndex + 2] = imageRow[i + 2];
      flippedImageData.data[imageDataIndex + 3] = imageRow[i + 3];
      imageDataIndex += 4;
    }
  });

  return flippedImageData;
}

function flipImageDataVertically(imageData: ImageData): ImageData {
  const flippedImageData = new ImageData(imageData.width, imageData.height);
  const chunked = chunkArrayInGroups(imageData.data, 16 * 4);
  chunked.reverse();
  let imageDataIndex = 0;
  chunked.forEach(imageRow => {
    for (let i = 0; i < imageRow.length; i+= 4) {
      flippedImageData.data[imageDataIndex] = imageRow[i];
      flippedImageData.data[imageDataIndex + 1] = imageRow[i + 1];
      flippedImageData.data[imageDataIndex + 2] = imageRow[i + 2];
      flippedImageData.data[imageDataIndex + 3] = imageRow[i + 3];
      imageDataIndex += 4;
    }
  });

  return flippedImageData;
}

function chunkArrayInGroups(array: Uint8ClampedArray, chunkSize: number): Uint8ClampedArray[] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
}
</script>

<style scoped>
canvas {
  border: 1px solid black;
  image-rendering: pixelated;
  background-image:
      linear-gradient(45deg, rgb(200, 200, 200) 25%, transparent 25%),
      linear-gradient(-45deg, rgb(200, 200, 200) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgb(200, 200, 200) 75%),
      linear-gradient(-45deg, transparent 75%, rgb(200, 200, 200) 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
  background-color: rgb(231, 231, 231);
}

.color {
  border: 1px solid gray;
  height: 20px;
  width: 10px;
  padding: 1px;
}

.palette {
  border: 1px solid black;
  padding: 10px;
  display: flex;
  width: 120px;
}

.palette.selected {
  background-color: green;
}


.color.selected {
  border: 3px inset white;
}
</style>