<template>
  <div>HI</div>
  <input type="file" multiple accept="application/json" @change="mergeAssets"/>
</template>

<script setup lang="ts">
import { fileToString } from '@/shared/file-helpers';
import { usePalettes } from "@/palette-maker/palette.composable";
import { useTiles } from "@/tile-draw/tile.composable";
import { useSprites } from "@/sprite-maker/sprite.composable";
import { useBackgrounds } from "@/backgrounds/backgrounds.composable";
import { Sprite } from "@/sprite-maker/sprite.model";
import { SpriteTile } from "@/sprite-maker/sprite-tile.model";

async function mergeAssets(event: any) {
  const { palettes } = usePalettes();
  const { tiles } = useTiles();
  const { sprites } = useSprites();
  const { backgrounds } = useBackgrounds();

  const jsonStrings = await loadAssetFiles(event);

  const jsonObjects = jsonStrings.map(jsonString => JSON.parse(jsonString));
  jsonObjects.sort((a, b) => b.palettes.length - a.palettes.length);

  let paletteOffset = palettes.value.length;
  let tileOffset = tiles.value.length;

  jsonObjects.forEach(jsonObject => {
    if (jsonObject.palettes) {
      palettes.value.push(...jsonObject.palettes);
    }

    if (jsonObject.tiles) {

      tiles.value.push(...jsonObject.tiles);
    }

    if (jsonObject.sprites) {
      const convertedSprites = jsonObject.sprites.map(sprite => {
        console.log(tileOffset);
        const newSpriteTiles = sprite.spriteTiles.map(spriteTile => new SpriteTile(spriteTile.isFlippedX, spriteTile.isFlippedY, spriteTile.tileNumber + tileOffset));

        return Sprite.FromJson({
          paletteNumber: sprite.paletteNumber + paletteOffset,
          size: sprite.size,
          spriteTiles: newSpriteTiles,
        });
      });
      sprites.value.push(...convertedSprites);
    }

    paletteOffset += jsonObject.palettes.length;
    tileOffset += jsonObject.tiles.length;
  });

  // jsonObjects.sort((a, b) => b.backgrounds.length - a.backgrounds.length);
  // backgrounds.push(...jsonObjects[0].backgrounds);
}

async function loadAssetFiles(event: any) {
  const fileElement = event.target as HTMLInputElement;

  if (fileElement.files) {
    const bitmapArrayBufferPromises = Array.from(fileElement.files).map(file => fileToString(file));
    return await Promise.all(bitmapArrayBufferPromises);
  }
}
</script>

<style scoped>

</style>