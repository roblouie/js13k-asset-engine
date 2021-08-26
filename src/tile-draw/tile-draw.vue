<template>
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
        @click="selectColorIndex(colorIndex)"
        :style="{ backgroundColor: color }"
        :class="{ 'selected': selectedColorIndex === colorIndex }"
    />
  </section>

  <div class="draw-wrapper">

    <div>
      <button @click="addTile">Add Tile</button>

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
    const { tiles, tileSize, drawToTile, tileToImageData, tilesToBytes } = useTiles();

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

    function addTile() {
      // Limit to 64 tiles so that when used in sprites one bit can be used for flip X and one for flip Y
      if (tiles.value.length < 64) {
        tiles.value.push(new Array(tileSize * tileSize).fill(0));
      } else {
        alert('Limited to 64 tiles');
      }
    }

    function selectTile(index: number) {
      selectedTileIndex.value = index;
      const imageData = tileToImageData(tiles.value[selectedTileIndex.value], props.palettes[selectedPaletteIndex.value]);
      canvasContext.putImageData(imageData, 0, 0);
      tilesToBytes(tiles.value);
    }

    function startDrawing(event: MouseEvent) {
      isDrawing = true;
      canvasContext.imageSmoothingEnabled = false;
      drawPosition.x = event.offsetX / 20;
      drawPosition.y = event.offsetY / 20;
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
</style>