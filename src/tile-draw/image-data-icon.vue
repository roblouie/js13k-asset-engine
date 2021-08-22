<template>
  <canvas ref="canvasElement" :width="sprite ? 32 : 16" :height="sprite ? 32 : 16" style="width: 32px; height: 32px;"></canvas>
</template>

<script lang="ts">
import { usePalettes } from '@/palette-maker/palette.composable';
import { useTiles } from '@/tile-draw/tile.composable';
import { defineComponent, onMounted, ref } from 'vue';
import { Sprite } from '@/sprite-maker/sprite.model';
import { chunkArrayInGroups } from '@/game-asset-unpacker';

export default defineComponent({
  name: 'image-data-icon',
  props: {
    tile: {
      type: Array,
    },
    sprite: {
      type: Object,
    },
  },
  setup(props) {
    const { tileToImageData, tiles, tileSize } = useTiles();
    const { palettes } = usePalettes();

    const canvasElement = ref<HTMLCanvasElement | null>(null);
    let canvasContext: CanvasRenderingContext2D | null;

    onMounted(() => {
      if (canvasElement.value) {
        canvasContext = canvasElement.value.getContext('2d');
        if (!canvasContext) {
          return;
        }
        canvasContext.imageSmoothingEnabled = false;
        if (props.tile) {
          const imageData = tileToImageData(props.tile as number[], palettes.value[0]);
          canvasContext?.putImageData(imageData, 0, 0, 0, 0, 32, 32);
        } else if (props.sprite) {
          drawSpriteToCanvas(props.sprite as Sprite);
        }
      }
    });

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
          canvasContext?.putImageData(imageData, 0, 0);
        } else if (index === 1 && sprite.width === 1) {
          canvasContext?.putImageData(imageData, 0, tileSize);
        } else if (index === 1 && sprite.width === 2) {
          canvasContext?.putImageData(imageData, tileSize, 0);
        } else if (index === 2) {
          canvasContext?.putImageData(imageData, 0, tileSize);
        } else if (index === 3) {
          canvasContext?.putImageData(imageData, tileSize, tileSize);
        }

      });
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

    return {
      canvasElement,
    };
  },
});
</script>

<style scoped>
canvas {
  border: 1px solid black;
}
</style>