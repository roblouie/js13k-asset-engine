import { ref } from "vue";

const tileSize = 16;
const tiles = ref<number[][]>([new Array(tileSize * tileSize)]);

export function useTiles() {
  return {
    tiles,
    tileSize,
    tileToImageData,
    drawToTile,
  }
}

function tilesToBytes(tiles: number[]) {

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