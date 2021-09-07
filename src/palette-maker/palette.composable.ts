import { ref } from 'vue';

const selectedPaletteIndex = ref(0);
const palettes = ref<string[][]>([]);
const paletteSplitIndex = ref(0);

export function usePalettes() {
  return {
    selectedPaletteIndex,
    palettes,
    paletteSplitIndex,
  };
}

export function palettesToBytes(palettes: string[][], paletteSplitIndex: number): ArrayBuffer {
  const numberOfPalettes = palettes.length;

  const sixteenColorPaletteSize = 16 * 3 * paletteSplitIndex;
  const eightColorPaletteSize = 8 * 3 * (palettes.length - paletteSplitIndex);

  const paletteBuffer = new ArrayBuffer(sixteenColorPaletteSize + eightColorPaletteSize + 2);
  const dataView = new DataView(paletteBuffer);
  dataView.setUint8(0, numberOfPalettes);
  dataView.setUint8(1, paletteSplitIndex);

  const flattenedColorValues = palettes.flat();

  flattenedColorValues.forEach((color: string, index: number) => {
    const noHash = color.replace('#', '');
    const [byte0, byte1, byte2] = noHash.match(/.{1,2}/g) as string[];
    dataView.setUint8((index * 3) + 2, parseInt(byte0, 16));
    dataView.setUint8((index * 3) + 3, parseInt(byte1, 16));
    dataView.setUint8((index * 3) + 4, parseInt(byte2, 16));
  });

  return paletteBuffer;
}
