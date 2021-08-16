<template>
  <canvas ref="canvasElement" width="32" height="32"></canvas>
</template>

<script>
import {usePalettes} from "@/palette-maker/palette.composable";
import {useTiles} from "@/tile-draw/tile.composable";
import {defineComponent, onMounted, ref} from "vue";

export default defineComponent({
  name: "image-data-icon",
  props: {
    tile: {
      required: true,
      type: Array,
    }
  },
  setup(props) {
    const { tileToImageData } = useTiles();
    const { palettes } = usePalettes();
    const canvasElement = ref<HTMLCanvasElement | null>(null);
    onMounted(() => {
      if (canvasElement.value && props.imageData) {
        const context = canvasElement.value.getContext('2d');
        const imageData = tileToImageData(props.tile, palettes.value[0]);
        context.putImageData(imageData, 0, 0, 32, 32);
      }
    })
  }
})
</script>

<style scoped>
canvas {
  border: 1px solid black;
}
</style>