import { palettesToBytes } from "@/palette-maker/palette.composable";

export function packGameAssets(palettes: string[][]): ArrayBuffer {
  const arrayBuffer = palettesToBytes(palettes);
  return arrayBuffer;
}
