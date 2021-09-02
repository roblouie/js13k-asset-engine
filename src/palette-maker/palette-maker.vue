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
      <button @click="deletePalette(paletteIndex)">Delete</button>
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
import { defineComponent, computed } from 'vue';
import { usePalettes } from '@/palette-maker/palette.composable';
import { useSprites } from "@/sprite-maker/sprite.composable";
import { Sprite } from "@/sprite-maker/sprite.model";

export default defineComponent({
  name: 'palette-maker',
  props: {
    modelValue: Array,
  },
  setup(props: any, { emit }) {
    const { selectedPaletteIndex } = usePalettes();

    const palettes = computed({
      get: () => props.modelValue,
      set: value => emit('update:modelValue', value),
    });

    function addPalette() {
      const newPalette = ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'];
      palettes.value = [...props.modelValue, newPalette];
    }

    function saveColorChange(event: InputEvent, paletteIndex: number, colorIndex: number) {
      palettes.value[paletteIndex][colorIndex] = (event.target as HTMLInputElement).value;
    }

    function selectPalette(paletteIndex: number) {
      selectedPaletteIndex.value = paletteIndex;
    }

    function deletePalette(paletteIndex: number) {
      const { sprites } = useSprites();
      const allPalettesNumbers = sprites.value.map((sprite: Sprite) => sprite.paletteNumber);
      const spriteIndexUsingPalette = allPalettesNumbers.findIndex((paletteNum: number) => paletteNum === selectedPaletteIndex.value);
      if (spriteIndexUsingPalette !== -1) {
        alert(`This palette is used in sprite ${spriteIndexUsingPalette}. Change that sprites palette or delete it then try again`);
        return;
      } else {
        palettes.value.splice(selectedPaletteIndex.value, 1);
        sprites.value.forEach((sprite: Sprite) => {
          if (sprite.paletteNumber > selectedPaletteIndex.value) {
            sprite.paletteNumber--;
          }
        });
      }
    }

    return {
      palettes,
      addPalette,
      saveColorChange,
      selectPalette,
      selectedPaletteIndex,
      deletePalette,
    };
  },
});
</script>

<style scoped>
.palette {
  border: 1px solid black;
  padding: 10px;
}
</style>
