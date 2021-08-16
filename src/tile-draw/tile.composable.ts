import { ref } from "vue";

const tiles = ref<number[]>([]);
const tileSize = 16;

export function useTiles() {
  return {
    tiles,
    tileSize,
  }
}

function tilesToBytes() {

}

function tileToImageData(tile: number[], palette: string[]): ImageData {
  const imageData = new ImageData(tileSize, tileSize);
  tile.forEach(pixelValue => {

  })
}