<template>
  <div>
  <section
      v-for="(palette, paletteIndex) in palettes"
      :key="palette"
      class="palette"
      @click="selectPalette(paletteIndex)"
      :class="{ 'selected': selectedPaletteIndex === paletteIndex }"
  >
    <div
        class="color"
        v-for="(color, colorIndex) in palette"
        :key="color" :value="color"
        @click="selectColorIndex(colorIndex)"
        :style="{ backgroundColor: color }"
        :class="{ 'selected': selectedColorIndex === colorIndex }"
    />
  </section>

  <div class="draw-wrapper">

    <div>
      <button @click="addTile(8)">Add 8 Color Tile</button>
      <button @click="addTile(16)">Add 16 Color Tile</button>

      <section
          v-for="(tile, tileIndex) in tiles"
          :key="tile"
          :class="{ 'selected': selectedTileIndex === tileIndex, 'color-split': tileIndex === (tileSplitIndex - 1) }"
          @click="selectTile(tileIndex)"
      >
        <button @click="moveUp(tileIndex)">Up</button>
        <button @click="moveDown(tileIndex)">Dn</button>
        {{ tileIndex }}
        <image-data-icon :tile="tile"></image-data-icon>
      </section>

      <button @click="deleteTile">Remove Tile</button>
    </div>

    <div>
      <canvas
          ref="canvasElement"
          width="16"
          height="16"
          style="width: 320px; height: 320px;"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseout="stopDrawing"
      ></canvas>
      <div>
        {{ coordinates }}
      </div>
    </div>
  </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useTiles } from '@/tile-draw/tile.composable';
import ImageDataIcon from '@/tile-draw/image-data-icon.vue';
import { useSprites } from "@/sprite-maker/sprite.composable";
import { SpriteTile } from "@/sprite-maker/sprite-tile.model";
import { Sprite } from "@/sprite-maker/sprite.model";

export default defineComponent({
  name: 'tile-draw',
  components: { ImageDataIcon },
  props: {
    palettes: {
      required: true,
      type: Array,
    },
  },
  setup(props: any) {
    const selectedPaletteIndex = ref(0);
    const selectedColorIndex = ref(0);
    const selectedTileIndex = ref(0);

    const canvasElement = ref<HTMLCanvasElement | null>(null);
    let canvasContext: CanvasRenderingContext2D;
    const drawPosition = { x: 0, y: 0 };
    let isDrawing = false;
    const currentPixel = ref(0);
    const coordinates = ref({ x: 0, y: 0 });
    const { tiles, tileSize, drawToTile, tileToImageData, tilesToBytes, tileSplitIndex } = useTiles();

    console.log(tileSplitIndex);

    onMounted(() => {
      if (canvasElement.value) {
        canvasContext = canvasElement.value.getContext('2d') as CanvasRenderingContext2D;
        canvasContext.imageSmoothingEnabled = false;
      }
    });

    function selectPalette(paletteIndex: number) {
      selectedPaletteIndex.value = paletteIndex;
      const imageData = tileToImageData(tiles.value[selectedTileIndex.value], props.palettes[paletteIndex]);
      canvasContext.putImageData(imageData, 0, 0);
    }

    function selectColorIndex(colorIndex: number) {
      selectedColorIndex.value = colorIndex;
    }

    function addTile(numberOfColors: 8 | 16) {
      if (numberOfColors === 8) {
        tileSplitIndex.value;
      }
      // Limit to 256 tiles so that when used in sprites one bit can be used for flip X and one for flip Y
      if (tiles.value.length < 256) {
        tiles.value.push(new Array(tileSize * tileSize).fill(0));
      } else {
        alert('Limited to 256 tiles');
      }
    }

    function selectTile(index: number) {
      selectedTileIndex.value = index;
      const imageData = tileToImageData(tiles.value[selectedTileIndex.value], props.palettes[selectedPaletteIndex.value]);
      canvasContext.putImageData(imageData, 0, 0);
    }

    function startDrawing(event: MouseEvent) {
      isDrawing = true;
      canvasContext.imageSmoothingEnabled = false;
      drawPosition.x = event.offsetX / 20;
      drawPosition.y = event.offsetY / 20;
      draw(event);
    }

    function draw(event: MouseEvent) {
      const pixelX = Math.floor(event.offsetX / 20);
      const pixelY = Math.floor(event.offsetY / 20);
      coordinates.value.x = pixelX;
      coordinates.value.y = pixelY;

      currentPixel.value = pixelX + (pixelY * tileSize);


      if (!canvasContext || !isDrawing || currentPixel.value < 0 || currentPixel.value > 255) {
        isDrawing = false;
        return;
      }

      const imageData = drawToTile(currentPixel.value, tiles.value[selectedTileIndex.value], props.palettes[selectedPaletteIndex.value], selectedColorIndex.value);

      canvasContext.putImageData(imageData, 0, 0);
    }

    function stopDrawing() {
      isDrawing = false;
    }

    function deleteTile() {
      const { sprites } = useSprites();
      const allSpriteTiles = sprites.value.flatMap((sprite: Sprite) => sprite.spriteTiles);
      const existingIndex = sprites.value.findIndex((sprite: Sprite) => {
        const spriteTileNumbers = sprite.spriteTiles.map((spriteTile: SpriteTile) => spriteTile.tileNumber);
        return spriteTileNumbers.includes(selectedTileIndex.value);
      });

      allSpriteTiles.map((tile: SpriteTile) => tile.tileNumber).findIndex((tileNumber: number) => tileNumber === selectedTileIndex.value);

      if (existingIndex !== -1) {
        alert(`That tile is used in sprite ${existingIndex}, use a different tile in that sprite, or delete the sprite, and try again.`);
        return;
      }

      tiles.value.splice(selectedTileIndex.value, 1);

      allSpriteTiles.forEach((spriteTile: SpriteTile) => {
        if (spriteTile.tileNumber > selectedTileIndex.value) {
          spriteTile.tileNumber--;
        }
      });
    }

    function moveUp(tileIndex: number) {
      move(tileIndex, tileIndex - 1);
    }

    function moveDown(tileIndex: number) {
      move(tileIndex, tileIndex + 1);
    }

    function move(fromIndex: number, toIndex: number) {
      if (toIndex > tiles.value.length - 1 || toIndex < 0) {
        return;
      }

      const element = tiles.value[fromIndex];
      tiles.value.splice(fromIndex, 1);
      tiles.value.splice(toIndex, 0, element);
    }

    return {
      selectPalette,
      selectedPaletteIndex,
      selectedColorIndex,
      selectColorIndex,
      canvasElement,
      startDrawing,
      draw,
      stopDrawing,
      currentPixel,
      addTile,
      tiles,
      selectTile,
      selectedTileIndex,
      coordinates,
      deleteTile,
      moveUp,
      moveDown,
      tileSplitIndex,
    };
  },
});
</script>

<style scoped>
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

.palette.selected {
  background-color: green;
}

.color.selected {
  border: 3px solid white;
}

section.selected {
  background-color: green;
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

.draw-wrapper {
  display: flex;
  justify-content: space-evenly;
}

button {
  font-size: 8px;
  padding: 1px;
}

.color-split {
  background-color: red;
}
</style>