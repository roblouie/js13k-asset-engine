<template>
  <canvas ref="canvasElement" width="16" height="16" style="width: 32px; height: 32px;"></canvas>
</template>

<script lang="ts">
import {usePalettes} from "@/palette-maker/palette.composable";
import {useTiles} from "@/tile-draw/tile.composable";
import {defineComponent, onMounted, ref} from "vue";

export default defineComponent({
  name: "image-data-icon",
  props: {
    tile: {
      required: true,
      type: Array,
    },
  },
  setup(props) {
    const { tileToImageData } = useTiles();
    const { palettes } = usePalettes();

    const canvasElement = ref<HTMLCanvasElement | null>(null);

    onMounted(() => {
      if (canvasElement.value && props.tile) {
        const context = canvasElement.value.getContext('2d');
        if (!context) {
          return;
        }
        context.imageSmoothingEnabled = false;
        const imageData = tileToImageData(props.tile as number[], palettes.value[0]);
        context?.putImageData(imageData, 0, 0, 0, 0, 32, 32);
      }
    });

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