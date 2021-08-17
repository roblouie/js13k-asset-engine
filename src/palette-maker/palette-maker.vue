<template>
  <div>
    <button @click="addPalette">Add Palette</button>
    <section
        v-for="(palette, paletteIndex) in palettes"
        :key="paletteIndex"
        class="palette"
        @click="selectPalette(paletteIndex)"
        :class="{ 'selected': selectedPaletteIndex === paletteIndex }"
    >
      <input
          type="color"
          v-for="(color, colorIndex) in palette"
          :key="colorIndex" :value="color"
          @change="saveColorChange($event, paletteIndex, colorIndex)"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { usePalettes } from '@/palette-maker/palette.composable'

export default defineComponent({
  name: 'palette-maker',
  props: {
    modelValue: Array
  },
  setup (props: any, { emit }) {
    const { selectedPaletteIndex } = usePalettes()

    const palettes = computed({
      get: () => props.modelValue,
      set: value => emit('update:modelValue', value)
    })

    function addPalette () {
      const newPalette = ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000']
      palettes.value = [...props.modelValue, newPalette]
    }

    function saveColorChange (event: InputEvent, paletteIndex: number, colorIndex: number) {
      palettes.value[paletteIndex][colorIndex] = (event.target as HTMLInputElement).value
    }

    function selectPalette (paletteIndex: number) {
      selectedPaletteIndex.value = paletteIndex
    }

    return {
      palettes,
      addPalette,
      saveColorChange,
      selectPalette,
      selectedPaletteIndex
    }
  }
})
</script>

<style scoped>
.palette {
  border: 1px solid black;
  padding: 10px;
}
</style>
