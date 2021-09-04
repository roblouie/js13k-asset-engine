<template>
<div style="display: flex">
  <section class="sprite-chooser">
    <div @click="selectedSpriteIndex = -1" :class="{selected: selectedSpriteIndex === -1}">Eraser</div>
    <div
        class="sprite"
        :class="{selected: selectedSpriteIndex === spriteIndex}"
        style="width: 32px; height: 32px;"
        v-for="(sprite, spriteIndex) in allowedSprites"
        :key="sprite"
        @click="selectedSpriteIndex = spriteIndex"
    >
      <image-data-icon :sprite="sprite"></image-data-icon>
    </div>
  </section>

  <section>
    <button @click="addBackground">Add Background</button>
    <div class="background-selector">
      <div
          v-for="(background, backgroundIndex) in backgrounds"
         :key="backgroundIndex"
          @click="selectBackground(backgroundIndex)"
          :class="{ 'selected': selectedBackgroundIndex === backgroundIndex }"
      >
        Background: {{ backgroundIndex }}
      </div>
    </div>

    <div class="layer-selector">
      <div
          v-for="(backgroundLayer, backgroundLayerIndex) in backgrounds[selectedBackgroundIndex]"
          @click="selectBackgroundLayer(backgroundLayerIndex)"
          :key="backgroundLayerIndex"
          :class="{ 'selected': selectedBackgroundLayerIndex === backgroundLayerIndex }"
      >
        Layer: {{ backgroundLayerIndex}}
      </div>
    </div>

    <label>
      Is layer transparent
    <input type="checkbox" v-if="backgrounds && backgrounds.length > 0" v-model="backgrounds[selectedBackgroundIndex][selectedBackgroundLayerIndex].isSemiTransparent" />
    </label>
    <input type="number" v-if="backgrounds && backgrounds.length > 0" v-model="backgrounds[selectedBackgroundIndex][selectedBackgroundLayerIndex].spriteStartOffset"/>
  </section>
  <canvas
      class="background-canvas"
      ref="builderCanvasElement"
      width="128"
      height="256"
      style="width: 256px; height: 512px;"
      @click="placeSprite"
  ></canvas>

  <canvas
      class="background-canvas"
    ref="previewCanvasElement"
    width="240"
    height="320"
    style="width: 240px; height: 320px;"
  ></canvas>
</div>
</template>

<script lang="ts">
import { BackgroundLayer } from '@/backgrounds/background-layer';
import { useBackgrounds } from '@/backgrounds/backgrounds.composable';
import { useSprites } from '@/sprite-maker/sprite.composable';
import ImageDataIcon from '@/tile-draw/image-data-icon.vue';
import { computed, defineComponent, onMounted, ref, onBeforeUnmount } from 'vue';
import { Sprite } from '@/sprite-maker/sprite.model';
import { useTiles } from '@/tile-draw/tile.composable';
import { usePalettes } from '@/palette-maker/palette.composable';
import { chunkArrayInGroups } from '@/game-asset-unpacker';

export default defineComponent({
  name: 'BackgroundMaker',
  components: { ImageDataIcon },
  setup() {
    const { palettes } = usePalettes();
    const { tiles, tileToImageData, tileSize } = useTiles();
    const { sprites } = useSprites();
    const { backgrounds } = useBackgrounds();
    const backgroundScaleMultiplier = 2;
    const selectedSpriteIndex = ref(0);
    const selectedBackgroundIndex = ref(0);
    const selectedBackgroundLayerIndex = ref(0);
    const builderCanvasElement = ref<HTMLCanvasElement | null>(null);
    let canvasContext: CanvasRenderingContext2D | null;

    const previewCanvasElement = ref<HTMLCanvasElement | null>(null);
    let previewContext: CanvasRenderingContext2D | null;

    let interval = 0;

    const allowedSprites = computed(() => {
      if (!backgrounds.value || backgrounds.value.length === 0) {
        return [];
      }

      const { spriteStartOffset } = backgrounds.value[selectedBackgroundIndex.value][selectedBackgroundLayerIndex.value];
      return sprites.value.slice(spriteStartOffset, spriteStartOffset + 8);
    });

    onMounted(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      canvasContext = builderCanvasElement.value!.getContext('2d')!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      previewContext =  previewCanvasElement.value!.getContext('2d')!;

      let yPos1 = -256;
      let yPos2 = 0;
      let yPos3 = 256;

      let yPos4 = -128;
      let yPos5 = 128;
      let yPos6 = 384;

      interval = window.setInterval(() => {
        previewContext?.clearRect(0, 0, 240, 320);
        updatePrevewCanvas(yPos1);
        updatePrevewCanvas(yPos2);
        updatePrevewCanvas(yPos3);

        updatePrevewCanvas(yPos4, true);
        updatePrevewCanvas(yPos5, true);
        updatePrevewCanvas(yPos6, true);

        yPos1++;
        yPos2++;
        yPos3++;
        yPos4++;
        yPos5++;
        yPos6++;

        if (yPos1 >= 512) {
          yPos1 = -256;
        }

        if (yPos2 >= 512) {
          yPos2 = -256;
        }

        if (yPos3 >= 512) {
          yPos3 = -256;
        }

        if (yPos4 >= 512) {
          yPos4 = -256;
        }

        if (yPos5 >= 512) {
          yPos5 = -256;
        }

        if (yPos6 >= 512) {
          yPos6 = -256;
        }
      }, 50);
    });

    onBeforeUnmount(() => {
      clearInterval(interval);
    });

    function addBackground() {
      backgrounds.value.push([new BackgroundLayer(), new BackgroundLayer(), new BackgroundLayer()]);
    }

    function selectBackground(backgroundIndex: number) {
      canvasContext?.clearRect(0, 0, 128, 256);
      previewContext?.clearRect(0, 0, 240, 320);

      selectedBackgroundIndex.value = backgroundIndex;
      drawBackgroundLayerToCanvas(backgrounds.value[selectedBackgroundIndex.value][selectedBackgroundLayerIndex.value]);
    }

    function selectBackgroundLayer(backgroundLayerIndex: number) {
      selectedBackgroundLayerIndex.value = backgroundLayerIndex;

      canvasContext?.clearRect(0, 0, 128, 256);
      previewContext?.clearRect(0, 0, 240, 320);

      drawBackgroundLayerToCanvas(backgrounds.value[selectedBackgroundIndex.value][selectedBackgroundLayerIndex.value]);
    }

    function placeSprite(event: MouseEvent) {
      const position = getSpritePositionInBackgroundLayer(event);
      const backgroundLayer = backgrounds.value[selectedBackgroundIndex.value][selectedBackgroundLayerIndex.value];
      const matchingPositionIndex = backgroundLayer.sprites.findIndex(sprite => sprite.position === position);
      if (matchingPositionIndex === -1) {
        backgroundLayer.sprites.push({ position, spriteIndex: selectedSpriteIndex.value });
      } else {
        if (selectedSpriteIndex.value === -1) {
          backgroundLayer.sprites.splice(matchingPositionIndex, 1);
        } else {
          backgroundLayer.sprites[matchingPositionIndex].spriteIndex = selectedSpriteIndex.value;
        }
      }

      drawBackgroundLayerToCanvas(backgroundLayer);
    }

    function getSpritePositionInBackgroundLayer(event: MouseEvent) {
      const pixelX = Math.floor(event.offsetX / backgroundScaleMultiplier);
      const pixelY = Math.floor(event.offsetY / backgroundScaleMultiplier);

      const tileX = Math.floor(pixelX / 32);
      const tileY = Math.floor(pixelY / 32);

      return tileY * 4 + tileX;
    }

    function drawBackgroundLayerToCanvas(backgroundLayer: BackgroundLayer) {
      canvasContext?.clearRect(0, 0, 256, 320);
      const { spriteStartOffset } = backgrounds.value[selectedBackgroundIndex.value][selectedBackgroundLayerIndex.value];

      backgroundLayer.sprites.forEach(sprite => {
        const gridX = sprite.position % 4;
        const gridY = Math.floor(sprite.position / 4);
        drawSpriteToCanvas(sprites.value[spriteStartOffset + sprite.spriteIndex], gridX * 32, gridY * 32);
      });
    }

    function updatePrevewCanvas(yPos: number, isRightSide = false) {
      previewContext?.save();
      if (isRightSide) {
        previewContext?.scale(-1, 1);
        previewContext?.drawImage(builderCanvasElement.value as HTMLCanvasElement, -248, yPos);
      } else {
        previewContext?.drawImage(builderCanvasElement.value as HTMLCanvasElement, -8, yPos);
      }
      previewContext?.restore();
    }

    function drawSpriteToCanvas(sprite: Sprite, positionX: number, positionY: number) {
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
          canvasContext?.putImageData(imageData, positionX, positionY);
        } else if (index === 1 && sprite.width === 1) {
          canvasContext?.putImageData(imageData, positionX, positionY + tileSize);
        } else if (index === 1 && sprite.width === 2) {
          canvasContext?.putImageData(imageData, positionX + tileSize, positionY);
        } else if (index === 2) {
          canvasContext?.putImageData(imageData, positionX, positionY + tileSize);
        } else if (index === 3) {
          canvasContext?.putImageData(imageData, positionX + tileSize, positionY + tileSize);
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
      sprites,
      backgrounds,
      addBackground,
      placeSprite,
      selectedBackgroundIndex,
      selectedBackgroundLayerIndex,
      selectedSpriteIndex,
      builderCanvasElement,
      previewCanvasElement,
      selectBackground,
      selectBackgroundLayer,
      allowedSprites,
    };
  },
});
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

.background-canvas {
  background-color: black;
  background-image: none;
}

.selected {
  background-color: green;
}

.sprite-chooser {
  width: 75px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.sprite {
  border: 2px solid white;
}

.sprite.selected {
  border: 2px solid green;
}

.background-selector {
  border: 1px solid gray;
  margin: 10px 0;
}

.layer-selector {
  border: 1px solid gray;
  margin: 10px 0;
}
</style>