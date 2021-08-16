<template>
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

  <button @click="addTile">Add Tile</button>

  <section v-for="(tile, tileIndex) in tiles" :key="tileIndex">
    {{ tileIndex }}
    <image-data-icon :image-data="tile"></image-data-icon>
  </section>

  <canvas
      ref="canvasElement"
      width="16"
      height="16"
      style="width: 320px; height: 320px;"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
  ></canvas>
  <div>
  {{ currentPixel }}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useTiles } from "@/tile-draw/tile.composable";
import ImageDataIcon from "@/tile-draw/image-data-icon.vue";

export default defineComponent({
  name: "tile-draw",
  components: {ImageDataIcon},
  props: {
    palettes: {
      required: true,
      type: Array,
    }
  },
  setup(props: any) {
    const selectedPaletteIndex = ref(0);
    const selectedColorIndex = ref(0);
    const canvasElement = ref<HTMLCanvasElement | null>(null);
    let canvasContext: CanvasRenderingContext2D;
    const drawPosition = { x: 0, y: 0 };
    let isDrawing = false;
    const currentPixel = ref(0);
    const { tiles, tileSize } = useTiles();

    onMounted(() => {
      if (canvasElement.value) {
        canvasContext = canvasElement.value.getContext('2d');
        canvasContext.imageSmoothingEnabled = false;
      }
    });

    function selectPalette(paletteIndex: number) {
      selectedPaletteIndex.value = paletteIndex;
    }

    function selectColorIndex(colorIndex: number) {
      selectedColorIndex.value = colorIndex;
    }

    function addTile() {
      tiles.value.push(new ImageData(tileSize, tileSize));
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

      currentPixel.value = pixelX + (pixelY * tileSize);

      if (!canvasContext || !isDrawing) {
        return;
      }

      const color = props.palettes[selectedPaletteIndex.value][selectedColorIndex.value];

      canvasContext.beginPath();
      canvasContext.lineWidth = 1;
      canvasContext.strokeStyle = color;
      canvasContext.moveTo(drawPosition.x, drawPosition.y);
      drawPosition.x = event.offsetX / 20;
      drawPosition.y = event.offsetY / 20;
      canvasContext.lineTo(drawPosition.x, drawPosition.y);
      canvasContext.stroke();
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
    }
  }
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

canvas {
  border: 1px solid black;
  image-rendering: pixelated;
}
</style>