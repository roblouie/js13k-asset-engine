<template>
  <div>


  <div class="draw-wrapper">

    <div>
      <section
          v-for="(tile, tileIndex) in tiles"
          :key="tileIndex"
          :class="{ 'selected': selectedTileIndex === tileIndex }"
          @click="selectTile(tileIndex)"
      >
        {{ tileIndex }}
        <image-data-icon :tile="tile"></image-data-icon>
      </section>
    </div>

    <div>
      <label>
        Place
        <input v-model="tool" type="radio" name="tool" value="place"/>
      </label>
      <label>
        Select
        <input v-model="tool" type="radio" name="tool" value="select"/>
      </label>

      <div>
        <label>
          Flip X
          <input v-model="isFlippedX" type="checkbox"/>
        </label>
        <label>
          Flip Y
          <input v-model="isFlippedY" type="checkbox"/>
        </label>
      </div>

      <div
          class="tile"
          v-for="(sprite, spriteIndex) in sprites"
          :key="spriteIndex"
          @click="selectSprite(spriteIndex)"
          :class="{ 'selected': selectedSprite === spriteIndex }"
      >
        <button>Up</button>
        <button>Dn</button>
        {{ spriteIndex }}
        <image-data-icon :sprite="sprite"></image-data-icon>
      </div>

      <button @click="deleteSprite">Delete Sprite</button>
    </div>

    <div>
      <select v-model="spriteRatio">
        <option :value="{ width: 1, height: 1, index: 0 }">1x1</option>
        <option :value="{ width: 1, height: 2, index: 1 }">1x2</option>
        <option :value="{ width: 2, height: 1, index: 2 }">2x1</option>
        <option :value="{ width: 2, height: 2, index: 3 }">2x2</option>
      </select>

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
        />
      </section>

      <button @click="addSprite">Add Sprite</button>

      <canvas
          ref="canvasElement"
          @mousedown="applyTool"
          :width="spriteDimensions.width"
          :height="spriteDimensions.height"
          :style="{
            width: spriteDimensions.width * spriteScaleMultiplier + 'px',
            height: spriteDimensions.height * spriteScaleMultiplier + 'px'
          }"
      >
      </canvas>
      {{ tilePositionInSprite }}
    </div>
  </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useTiles } from '@/tile-draw/tile.composable';
import { usePalettes } from '@/palette-maker/palette.composable';
import ImageDataIcon from '@/tile-draw/image-data-icon.vue';
import { Sprite } from '@/sprite-maker/sprite.model';
import { useSprites } from '@/sprite-maker/sprite.composable';
import { SpriteTile } from '@/sprite-maker/sprite-tile.model';

export default defineComponent({
  name: 'SpriteMaker',
  components: { ImageDataIcon },
  setup() {
    const { palettes } = usePalettes();
    const { tiles, tileSize, tileToImageData } = useTiles();
    const { sprites } = useSprites();
    const selectedPaletteIndex = ref(0);
    const selectedTileIndex = ref(0);
    const spriteRatio = ref({ width: 1, height: 1, index: 0 });
    const tilePositionInSprite = ref(0);
    const spriteScaleMultiplier = 10;
    const tool = ref<'place' | 'select'>('place');
    const selectedSprite = ref(0);
    const selectedSpriteTile = ref(0);
    const canvasElement = ref<HTMLCanvasElement | null>(null);
    let canvasContext: CanvasRenderingContext2D;
    const isFlippedX = ref(false);
    const isFlippedY = ref(false);

    onMounted(() => {
      if (canvasElement.value) {
        canvasContext = canvasElement.value.getContext('2d') as CanvasRenderingContext2D;
        canvasContext.imageSmoothingEnabled = false;
      }
    });

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

    function selectTile(index: number) {
      selectedTileIndex.value = index;
    }

    function selectPalette(paletteIndex: number) {
      selectedPaletteIndex.value = paletteIndex;
    }

    function deleteSprite() {
      sprites.value.splice(selectedSprite.value, 1);
    }

    function applyTool(event: MouseEvent) {
      const tilePosition = getTilePositionInSprite(event);
      const sprite = sprites.value[selectedSprite.value];

      if (tool.value === 'place') {
        sprite.spriteTiles[tilePosition] = new SpriteTile(isFlippedX.value, isFlippedY.value, selectedTileIndex.value);
        selectedSpriteTile.value = tilePosition;
        drawSpriteToCanvas(sprite);
      } else {
        selectedSpriteTile.value = tilePosition;
      }
    }

    function selectSprite(spriteIndex: number) {
      selectedSprite.value = spriteIndex;

      // This is lame but waits until the canvas resizes to the new sprite before drawing
      setTimeout(() => {
        drawSpriteToCanvas(sprites.value[spriteIndex]);
      }, 50);
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

    function addSprite() {
      const sprite = new Sprite(selectedPaletteIndex.value, spriteRatio.value.index);
      sprites.value.push(sprite);
    }

    function getTilePositionInSprite(event: MouseEvent) {
      const pixelX = Math.floor(event.offsetX / spriteScaleMultiplier);
      const pixelY = Math.floor(event.offsetY / spriteScaleMultiplier);

      const tileX = Math.floor(pixelX / tileSize);
      const tileY = Math.floor(pixelY / tileSize);

      return tileY * sprites.value[selectedSprite.value].width + tileX;
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

    return {
      selectedTileIndex,
      selectedPaletteIndex,
      selectTile,
      selectPalette,
      palettes,
      tiles,
      spriteDimensions,
      spriteRatio,
      applyTool,
      tilePositionInSprite,
      spriteScaleMultiplier,
      addSprite,
      tool,
      sprites,
      selectedSprite,
      selectSprite,
      canvasElement,
      isFlippedX,
      isFlippedY,
      tileSize,
      deleteSprite,
    };
  },
});
</script>

<style scoped>
.palette.selected {
  background-color: green;
}

.tile.selected {
  background-color: green;
}

section.selected {
  background-color: green;
}

.draw-wrapper {
  display: flex;
  justify-content: space-evenly;
}

.palette {
  border: 1px solid black;
  padding: 10px;
  display: flex;
  width: 350px;
  justify-content: space-evenly;
}

.color {
  border: 1px solid gray;
  height: 30px;
  width: 30px;
  padding: 5px;
}

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

button {
  font-size: 8px;
  padding: 1px;
}
</style>