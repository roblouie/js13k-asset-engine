import { ref } from 'vue';

const tileSize = 16;
const tiles = ref<number[][]>([]);
const tileSplitIndex = ref(0);

export function useTiles(): any {
  return {
    tiles,
    tileSize,
    tileToImageData,
    drawToTile,
    tilesToBytes,
    tileSplitIndex,
  };
}

function tilesToBytes(tiles: number[][], tileSplitIndex: number): ArrayBuffer {
  const numberOfTiles = tiles.length;
  const sixteenColorTileSize = 128 * tileSplitIndex; // 256 pixels with half a byte per color === 128
  const eightColorTileSize = 96 * (numberOfTiles - tileSplitIndex); // 256 pixels, 8 pixels can be stored in 3 bytes, so 256 / 8 = 32 groups of 8 pixels, times 3, since 3 bytes per 8 pixels, 96
  const numberOfBytes = sixteenColorTileSize + eightColorTileSize;
  const tileBuffer = new ArrayBuffer(numberOfBytes + 2);

  const dataView = new DataView(tileBuffer);
  dataView.setUint8(0, numberOfTiles);
  dataView.setUint8(1, tileSplitIndex);

  const flatTiles = tiles.flat();
  let byteOffset = 2;

  let pixelIndex = 0;

  while (pixelIndex < tileSplitIndex * 256) {
    const firstPixel = flatTiles[pixelIndex];
    const secondPixel = flatTiles[pixelIndex + 1];
    pixelIndex += 2;

    const byte = firstPixel + (secondPixel << 4);
    dataView.setUint8(byteOffset++, byte);
  }

  let bytes = 0;
  let numberOfPixels = 0;
  while (pixelIndex < flatTiles.length) {
    const firstPixel = flatTiles[pixelIndex];
    const secondPixel = flatTiles[pixelIndex + 1];
    const thirdPixel = flatTiles[pixelIndex + 2];
    const fourthPixel = flatTiles[pixelIndex + 3];
    const fifthPixel = flatTiles[pixelIndex + 4];
    const sixthPixel = flatTiles[pixelIndex + 5];
    const seventhPixel = flatTiles[pixelIndex + 6];
    const eighthPixel = flatTiles[pixelIndex + 7];
    numberOfPixels += 8;

    pixelIndex += 8;

    const data = firstPixel + (secondPixel << 3) + (thirdPixel << 6) + (fourthPixel << 9) + (fifthPixel << 12)
      + (sixthPixel << 15) + (seventhPixel << 18) + (eighthPixel << 21);

    if (bytes < eightColorTileSize) {
      dataView.setUint8(byteOffset++, data & 0xff);
      bytes++;
    }

    if (bytes < eightColorTileSize) {
      dataView.setUint8(byteOffset++, (data >> 8) & 0xff);
      bytes++;
    }

    if (bytes < eightColorTileSize) {
      dataView.setUint8(byteOffset++, (data >> 16) & 0xff);
      bytes++;
    }
  }

  return tileBuffer;
}

function tileToImageData(tile: number[], palette: string[]): ImageData {
  const imageData = new ImageData(tileSize, tileSize);
  tile.forEach((pixelValue, index) => {
    try {
      const imageDataIndex = index * 4;
      const colorString = palette[pixelValue];
      const red = parseInt(colorString.substr(1, 2), 16);
      const green = parseInt(colorString.substr(3, 2), 16);
      const blue = parseInt(colorString.substr(5, 2), 16);
      imageData.data[imageDataIndex] = red;
      imageData.data[imageDataIndex + 1] = green;
      imageData.data[imageDataIndex + 2] = blue;
      imageData.data[imageDataIndex + 3] = (colorString === '#000000' && pixelValue === 0) ? 0 : 255;
    } catch(e) {
      console.log('Not enough colors in this palette for this tile');
      const imageDataIndex = index * 4;
      imageData.data[imageDataIndex] = 0;
      imageData.data[imageDataIndex + 1] = 0;
      imageData.data[imageDataIndex + 2] = 0;
      imageData.data[imageDataIndex + 3] = 0;
    }
  });

  return imageData;
}

function drawToTile(pixelPosition: number, tile: number[], palette: string[], colorIndex: number): ImageData {
  tile[pixelPosition] = colorIndex;
  return tileToImageData(tile, palette);
}