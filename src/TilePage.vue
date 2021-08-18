<template>
  <div>
    <palette-maker v-model="palettes"></palette-maker>
    <tile-draw :palettes="palettes"></tile-draw>
  </div>
</template>

<script>
import PaletteMaker from '@/palette-maker/palette-maker';
import { usePalettes } from '@/palette-maker/palette.composable';
import TileDraw from '@/tile-draw/tile-draw';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TilePage',
  components: { PaletteMaker, TileDraw },
  setup() {
    const { palettes } = usePalettes();

    return {
      palettes,
    };
  },
});
</script>

<style scoped>

</style>
