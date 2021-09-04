import { BackgroundLayer } from '@/backgrounds/background-layer';
import { ref } from 'vue';

const backgrounds = ref<BackgroundLayer[][]>([]);

export function useBackgrounds() {
  return {
    backgrounds,
    backgroundsToBytes,
  };
}

function backgroundsToBytes(backgrounds: BackgroundLayer[][]): ArrayBuffer {
  const numberOfBackgrounds = backgrounds.length;

  let byteSize = 1;

  backgrounds.forEach(backgroundLayers => {
    backgroundLayers.forEach(backgroundLayer => {
      byteSize += 2; // Add one byte for each layer to store how many sprites there are, and one byte for metadata like sprite start index
      byteSize += backgroundLayer.sprites.length; // Then each used sprite is one byte, one for sprite index and one the position in the sprite grid
    });
  });

  const arrayBuffer = new ArrayBuffer(byteSize);
  const dataView = new DataView(arrayBuffer);
  dataView.setUint8(0, numberOfBackgrounds);

  let byteOffset = 1;

  backgrounds.forEach(backgroundLayers => {
    backgroundLayers.forEach(backgroundLayer => {
      dataView.setUint8(byteOffset, backgroundLayer.sprites.length);
      byteOffset++;

      const transparentBit = backgroundLayer.isSemiTransparent ? 1 : 0;
      const metadata = (transparentBit << 7) + (backgroundLayer.spriteStartOffset & 127);
      dataView.setUint8(byteOffset++, metadata);

      backgroundLayer.sprites.forEach(sprite => {
        const byte = ((sprite.position & 0b11111) << 3) + (sprite.spriteIndex & 0b111);
        dataView.setUint8(byteOffset, byte);
        byteOffset++;
      });
    });
  });

  return arrayBuffer;
}
