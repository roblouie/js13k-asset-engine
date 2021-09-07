<template>
    Compressed Size: ~{{ compressedSize }} / 13312 bytes
  <div style="display: flex; justify-content: space-evenly">
    <div>
      <input type="file" @change="loadAssets"/>
      <button @click="saveAssets">Save Assets</button>
    </div>

    <JsonArtSaveLoad></JsonArtSaveLoad>
  </div>

  <menu>
    <router-link to="/">Home</router-link>
    <router-link to="/tile-draw">Tile Draw</router-link>
    <router-link to="/sprite-maker">Sprite Maker</router-link>
    <router-link to="/backgrounds">Backgrounds</router-link>
    <router-link to="/music">Music</router-link>
    <router-link to="/sound-effects">Sound Effects</router-link>
    <router-link to="level-editor">Level Editor</router-link>
    <router-link to="/import">Import</router-link>
  </menu>

  <router-view></router-view>

</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { usePalettes } from '@/palette-maker/palette.composable';
import JSZip from 'jszip';
import { unpackGameAssets } from '@/game-asset-unpacker';
import { packGameAssets } from '@/game-asset-packer';
import { saveFileToDevice } from '@binary-files/web-file-mover';
import { useTiles } from '@/tile-draw/tile.composable';
import { useSprites } from '@/sprite-maker/sprite.composable';
import { useSound } from '@/sound/sound.composable';
import { useBackgrounds } from '@/backgrounds/backgrounds.composable';
import JsonArtSaveLoad from '@/JsonArtSaveLoad.vue';
import { useSoundEffects } from '@/sound-effects/sound-effects.composable';
import { useLevel } from "@/level-editor/level.composable";
import { fileToArrayBuffer } from "@/shared/file-helpers";

export default defineComponent({
  name: 'App',
  components: { JsonArtSaveLoad },
  setup() {
    const compressedSize = ref(0);
    const { palettes, paletteSplitIndex } = usePalettes();
    const { tiles, tileSplitIndex } = useTiles();
    const { sprites } = useSprites();
    const { backgrounds } = useBackgrounds();
    const { songs } = useSound();
    const { soundEffects } = useSoundEffects();
    const { levels } = useLevel();

    watch(palettes, updateCompressedAssetSize, { deep: true });
    watch(tiles, updateCompressedAssetSize, { deep: true });
    watch(sprites, updateCompressedAssetSize, { deep: true });
    watch(backgrounds, updateCompressedAssetSize, { deep: true });
    watch(songs, updateCompressedAssetSize, { deep: true });
    watch(soundEffects, updateCompressedAssetSize, { deep: true });
    watch(levels, updateCompressedAssetSize, { deep: true });


    async function updateCompressedAssetSize() {
      const bytes = packGameAssets(palettes.value, paletteSplitIndex.value, tiles.value, tileSplitIndex.value, sprites.value, backgrounds.value, songs.value, soundEffects.value, levels.value);
      compressedSize.value = await getCompressedSize(bytes);
    }

    async function getCompressedSize(assetBytes: ArrayBuffer) {
      const zip = new JSZip();

      const file = await zip.file('test.zip', assetBytes, {
        binary: true,
        compression: 'DEFLATE',
      })
        .generateAsync({ type: 'uint8array' });

      return file.length;
    }

    async function loadAssets(event: any) {
      const fileElement = event.target as HTMLInputElement;

      if (fileElement.files && fileElement.files[0]) {
        const assetArrayBuffer = await fileToArrayBuffer(fileElement.files[0]);
        compressedSize.value = await getCompressedSize(assetArrayBuffer);
        const { paletteAsset, tileAsset, spriteAsset, backgroundAsset, songsAsset, soundEffectsAsset, levelAsset } = unpackGameAssets(assetArrayBuffer);
        palettes.value = paletteAsset.data.paletteData;
        paletteSplitIndex.value = paletteAsset.data.paletteSplitIndex;
        tiles.value = tileAsset.data.tileData;
        tileSplitIndex.value = tileAsset.data.tileSplitIndex;
        sprites.value = spriteAsset.data;
        backgrounds.value = backgroundAsset.data;
        songs.value = songsAsset.data;
        soundEffects.value = soundEffectsAsset.data;
        levels.value = levelAsset.data;
      }
    }



    function saveAssets() {
      const assetBuffer = packGameAssets(palettes.value, paletteSplitIndex.value, tiles.value, tileSplitIndex.value, sprites.value, backgrounds.value, songs.value, soundEffects.value, levels.value);
      saveFileToDevice(assetBuffer, 'assets');
    }

    return {
      palettes,
      compressedSize,
      loadAssets,
      saveAssets,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

menu {
  display: flex;
  justify-content: space-evenly;
}
</style>
