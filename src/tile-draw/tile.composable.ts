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
  const numberOfBytes = (numberOfTiles * tileSize * tileSize) / 2;
  const tileBuffer = new ArrayBuffer(numberOfBytes + 2);

  const dataView = new DataView(tileBuffer);
  dataView.setUint8(0, numberOfTiles);
  dataView.setUint8(1, tileSplitIndex);

  const flatTiles = tiles.flat();
  let byteOffset = 2;

  for (let i = 0; i < tileSplitIndex * 256; i+= 2) {
    const firstPixel = flatTiles[i];
    const secondPixel = flatTiles[i + 1];

    const byte = firstPixel + (secondPixel << 4);
    dataView.setUint8(byteOffset++, byte);
  }

  for (let i = 0; i < (numberOfTiles - tileSplitIndex) * 256; i++) {
    const firstPixel = flatTiles[i];
    const secondPixel = flatTiles[i + 1];
    const thirdPixel = flatTiles[i + 2];
    const fourthPixel = flatTiles[i + 3];
    const fifthPixel = flatTiles[i + 4];
    const sixthPixel = flatTiles[i + 5];
    const seventhPixel = flatTiles[i + 6];
    const eighthPixel = flatTiles[i + 7];

    const data = firstPixel + (secondPixel << 3) + (thirdPixel << 6) + (fourthPixel << 9) + (fifthPixel << 12)
      + (sixthPixel << 15) + (seventhPixel << 18) + (eighthPixel << 21);
    dataView.setUint32(byteOffset, data, true);
    byteOffset += 3;
  }

  return tileBuffer;
}

function tileToImageData(tile: number[], palette: string[]): ImageData {
  const imageData = new ImageData(tileSize, tileSize);
  tile.forEach((pixelValue, index) => {
    const imageDataIndex = index * 4;
    const colorString = palette[pixelValue];
    const red = parseInt(colorString.substr(1, 2), 16);
    const green = parseInt(colorString.substr(3, 2), 16);
    const blue = parseInt(colorString.substr(5, 2), 16);
    imageData.data[imageDataIndex] = red;
    imageData.data[imageDataIndex + 1] = green;
    imageData.data[imageDataIndex + 2] = blue;
    imageData.data[imageDataIndex + 3] = (colorString === '#000000' && pixelValue === 0) ? 0 : 255;
  });

  return imageData;
}

function drawToTile(pixelPosition: number, tile: number[], palette: string[], colorIndex: number): ImageData {
  tile[pixelPosition] = colorIndex;
  return tileToImageData(tile, palette);
}