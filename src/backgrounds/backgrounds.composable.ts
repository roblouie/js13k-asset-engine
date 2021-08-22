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
      byteSize += backgroundLayer.sprites.length; // Then each used sprite is one byte, three bits for sprite index and five for the position in the sprite grid
    });
  });

  const arrayBuffer = new ArrayBuffer(byteSize);
  const dataView = new DataView(arrayBuffer);
  dataView.setUint8(0, numberOfBackgrounds);

  let byteOffset = 1;

  backgrounds.forEach(backgroundLayers => {
    backgroundLayers.forEach(backgroundLayer => {
      // Store how many sprites
      dataView.setUint8(byteOffset, backgroundLayer.sprites.length);
      byteOffset++;

      // Store the sprite to start at. Background layers only allow 8 sprites and the should be sequential in the
      // sprite list. That way the sprite number can always be 0-7. Storing this number specifies what number sprite
      // 0 should be. Sprite 1 will be this number + 1, sprite 2 this number + 2 and so on for all 8 sprites.
      dataView.setUint8(byteOffset, backgroundLayer.spriteStartOffset);
      byteOffset++;

      backgroundLayer.sprites.forEach(sprite => {
        const byte = ((sprite.position & 0b11111) << 3) + (sprite.spriteIndex & 0b111);
        dataView.setUint8(byteOffset, byte);
        byteOffset++;
      });
    });
  });

  return arrayBuffer;
}
