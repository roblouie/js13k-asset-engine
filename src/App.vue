<template>
  Compressed Size: ~{{ compressedSize }} / 13312 bytes
  <input type="file" @change="loadAssets"/>
  <button @click="saveAssets">Save Assets</button>

  <router-link to="/">Go to Home</router-link>
  <router-link to="/about">Go to About</router-link>

  <palette-maker v-model="palettes"></palette-maker>
  <tile-draw :palettes="palettes"></tile-draw>

  <router-view></router-view>

</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import PaletteMaker from "@/palette-maker/palette-maker.vue";
import { palettesToBytes, usePalettes } from "@/palette-maker/palette.composable";
import JSZip from 'jszip';
import { unpackGameAssets } from "@/game-asset-unpacker";
import { packGameAssets } from "@/game-asset-packer";
import { saveFileToDevice } from "@binary-files/web-file-mover";
import TileDraw from "@/tile-draw/tile-draw.vue";

export default defineComponent({
  name: 'App',
  components: {
    TileDraw,
    PaletteMaker,
  },
  setup() {
    const compressedSize = ref(0);
    const { palettes } = usePalettes();

    //TODO: Update to use game-asset-packer and pack all assets when any change
    watch(palettes, values => {
      const zip = new JSZip();
      const bytes = palettesToBytes(values);
      zip.file('test.zip', bytes, {
        binary: true,
        compression: 'DEFLATE',
      })
      .generateAsync({type: 'uint8array'}).then((file: any) => {
        compressedSize.value = file.length;
      });
    }, { deep: true });

    async function loadAssets(event: any) {
      const fileElement = event.target as HTMLInputElement;

      if (fileElement.files && fileElement.files[0]) {
        const assetArrayBuffer = await fileToArrayBuffer(fileElement.files[0]);
        const { paletteAsset } = unpackGameAssets(assetArrayBuffer);
        palettes.value = paletteAsset.data;
      }
    }

    function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
      const fileReader = new FileReader();

      return new Promise((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);

        fileReader.onerror = () => {
          fileReader.abort();
          reject(new DOMException('Error parsing file'))
        }

        fileReader.readAsArrayBuffer(file);
      });
    }

    function saveAssets() {
      const assetBuffer = packGameAssets(palettes.value);
      saveFileToDevice(assetBuffer, 'assets');
    }

    return {
      palettes,
      compressedSize,
      loadAssets,
      saveAssets,
    }
  }
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
</style>
