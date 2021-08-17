import { ref } from "vue";

const tileSize = 16;
const tiles = ref<number[][]>([]);

export function useTiles(): any {
  return {
    tiles,
    tileSize,
    tileToImageData,
    drawToTile,
    tilesToBytes,
  };
}

function tilesToBytes(tiles: number[][]): ArrayBuffer {
  const numberOfTiles = tiles.length;
  const numberOfBytes = (numberOfTiles * tileSize * tileSize) / 2;
  const tileBuffer = new ArrayBuffer(numberOfBytes + 1);

  const dataView = new DataView(tileBuffer);
  dataView.setUint8(0, numberOfTiles);

  const flatTiles = tiles.flat();

  for (let i = 0; i < flatTiles.length; i+= 2) {
    const firstPixel = flatTiles[i];
    const secondPixel = flatTiles[i + 1];

    const byte = firstPixel + (secondPixel << 4);
    const byteIndex = (i / 2) + 1;
    dataView.setUint8(byteIndex, byte);
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
    imageData.data[imageDataIndex + 3] = 255;
  });

  return imageData;
}

function drawToTile(pixelPosition: number, tile: number[], palette: string[], colorIndex: number): ImageData {
  tile[pixelPosition] = colorIndex;
  return tileToImageData(tile, palette);
}