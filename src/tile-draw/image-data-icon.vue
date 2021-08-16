<template>
  <canvas ref="canvasElement" width="32" height="32"></canvas>
</template>

<script>
import {defineComponent, onMounted, ref} from "vue";

export default defineComponent({
  name: "image-data-icon",
  props: {
    imageData: {
      required: true,
      type: Object,
    }
  },
  setup(props) {
    const canvasElement = ref<HTMLCanvasElement | null>(null);
    onMounted(() => {
      if (canvasElement.value && props.imageData) {
        const context = canvasElement.value.getContext('2d');
        context.putImageData(props.imageData, 0, 0, 32, 32);
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