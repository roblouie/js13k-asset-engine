import { ref } from 'vue';
import { Sprite } from '@/sprite-maker/sprite.model';

const sprites = ref<Sprite[]>([]);

export function useSprites(): any {
  return {
    sprites,
    spritesToBytes,
  };
}

function spritesToBytes(sprites: Sprite[]): ArrayBuffer {
  const numberOfSprites = sprites.length;
  let spriteByteSize = 1;

  sprites.forEach(sprite => {
    spriteByteSize++; // The sprite itself takes up one byte to store the palette number and size in tiles

    // Then each tile takes two bytes, one for the tile number and one for flipped x and flipped y
    if (sprite.width === 1 && sprite.height === 1) {
      spriteByteSize += 2;
    } else if (sprite.width === 2 && sprite.height === 2) {
      spriteByteSize += 8;
    } else {
      spriteByteSize += 4;
    }
  });

  const arrayBuffer = new ArrayBuffer(spriteByteSize);
  const dataView = new DataView(arrayBuffer);
  dataView.setUint8(0, numberOfSprites);

  let byteOffset = 1;

  sprites.forEach(sprite => {
    let sizeBits = 0;
    if (sprite.width === 1 && sprite.height === 1) {
      sizeBits = 0;
    } else if (sprite.width === 1 && sprite.height === 2) {
      sizeBits = 1;
    } else if (sprite.width === 2 && sprite.height === 1) {
      sizeBits = 2;
    } else if (sprite.width === 2 && sprite.height === 2) {
      sizeBits = 3;
    }

    const spriteByteData = sprite.paletteNumber + (sizeBits << 6);
    dataView.setUint8(byteOffset, spriteByteData);
    byteOffset++;

    sprite.spriteTiles.forEach((spriteTile, index) => {
      if (index < 4) {
        const isFlippedXBit = spriteTile.isFlippedX ? 0b1 : 0b0;
        const isFlippedYBit = spriteTile.isFlippedY ? 0b1 : 0b0;
        const flippedBits = (isFlippedXBit << 1) + isFlippedYBit;
        dataView.setUint8(byteOffset, spriteTile.tileNumber);
        byteOffset++;

        dataView.setUint8(byteOffset, flippedBits);
        byteOffset++;
      }
    });
  });

  return arrayBuffer;
}
