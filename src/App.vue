<template>
  Compressed Size: ~{{ compressedSize }} / 13312 bytes

  <div>
    <input type="file" @change="loadAssets"/>
    <button @click="saveAssets">Save Assets</button>
  </div>

  <menu>
    <router-link to="/">Home</router-link>
    <router-link to="/tile-draw">Tile Draw</router-link>
    <router-link to="/sprite-maker">Sprite Maker</router-link>
    <router-link to="/music">Music</router-link>
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

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    const compressedSize = ref(0);
    const { palettes } = usePalettes();
    const { tiles } = useTiles();
    const { sprites } = useSprites();
    const { songs } = useSound();

    watch(palettes, updateCompressedAssetSize, { deep: true });
    watch(tiles, updateCompressedAssetSize, { deep: true });
    watch(sprites, updateCompressedAssetSize, { deep: true });
    watch(songs, updateCompressedAssetSize, { deep: true });

    async function updateCompressedAssetSize() {
      const bytes = packGameAssets(palettes.value, tiles.value, sprites.value, songs.value);
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
        const { paletteAsset, tileAsset, spriteAsset, songsAsset } = unpackGameAssets(assetArrayBuffer);
        palettes.value = paletteAsset.data;
        tiles.value = tileAsset.data;
        sprites.value = spriteAsset.data;
        songs.value = songsAsset.data;
      }
    }

    function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
      const fileReader = new FileReader();

      return new Promise((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);

        fileReader.onerror = () => {
          fileReader.abort();
          reject(new DOMException('Error parsing file'));
        };

        fileReader.readAsArrayBuffer(file);
      });
    }

    function saveAssets() {
      const assetBuffer = packGameAssets(palettes.value, tiles.value, sprites.value, songs.value);
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
