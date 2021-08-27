<template>
  <div class="wrapper">
   Art &lt;-&gt; JSON
    <input type="file" @change="loadJson"/>
    <button @click="saveJson">Save JSON</button>
    </div>
</template>

<script setup lang="ts">
import { usePalettes } from '@/palette-maker/palette.composable';
import { useTiles } from '@/tile-draw/tile.composable';
import { useSprites } from '@/sprite-maker/sprite.composable';
import { useBackgrounds } from '@/backgrounds/backgrounds.composable';
import { Sprite } from '@/sprite-maker/sprite.model';

const { palettes } = usePalettes();
const { tiles } = useTiles();
const { sprites } = useSprites();
const { backgrounds } = useBackgrounds();

function loadJson(event: any) {
  const fileElement = event.target as HTMLInputElement;

  if (fileElement.files && fileElement.files[0]) {
    const file = fileElement.files[0];
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const text = event.target.result;
      const json = JSON.parse(text);

      palettes.value = json.palettes;
      tiles.value = json.tiles;
      sprites.value = json.sprites.map(sprite => Sprite.FromJson(sprite));
      backgrounds.value = json.backgrounds;
    };
    fileReader.readAsText(file);
  }
}



function saveJson() {
  const json = JSON.stringify({
    palettes: palettes.value,
    tiles: tiles.value,
    sprites: sprites.value,
    backgrounds: backgrounds.value,
  }, null, 2);

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], {
    type: 'text/plain',
  }));
  a.setAttribute('download', 'art.json');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}



</script>

<style scoped>
.wrapper {
  border: 1px solid gray;
  padding: 10px;
}
</style>