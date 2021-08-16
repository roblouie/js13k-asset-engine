import { ref } from "vue";

const selectedPaletteIndex = ref(0);
const palettes = ref<string[][]>([]);

export function usePalettes() {
  return {
    selectedPaletteIndex,
    palettes,
  }
}

export function palettesToBytes(palettes: string[][]): ArrayBuffer {
 const numberOfPalettes = palettes.length;

 const paletteSize = 8* 3; // eight colors, three bytes per color

 const paletteBuffer = new ArrayBuffer((numberOfPalettes * paletteSize) + 1);
 const dataView = new DataView(paletteBuffer);
 dataView.setUint8(0, numberOfPalettes);

 const flattenedColorValues = palettes.flat();

 flattenedColorValues.forEach((color: string, index: number) => {
   const noHash = color.replace('#', '');
   const [byte0, byte1, byte2] = noHash.match(/.{1,2}/g) as string[];
   dataView.setUint8((index * 3) + 1, parseInt(byte0, 16));
   dataView.setUint8((index * 3) + 2, parseInt(byte1, 16));
   dataView.setUint8((index * 3) + 3, parseInt(byte2, 16));
 });

 return paletteBuffer;
}
