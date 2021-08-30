import { Level } from '@/level-editor/level';
import { ref } from 'vue';

const levels = ref<Level[]>([]);

export function useLevel() {
  return {
    levels,
  };
}

function levelsToBytes(levels: Level[]) {
  const waves = levels.map(level => level.enemyWaves);
  const enemies = waves.flat().map(wave => wave.enemies);

  const bytesForNumberOfLevels = 1;
  const bytesForNumberOfWavesPerLevel = levels.length;
  const bytesForNumberOfEnemiesPerWave = waves.length;
  const bytesForEnemies = 2 * enemies.length;

  const levelsBuffer = new ArrayBuffer(bytesForNumberOfLevels + bytesForNumberOfWavesPerLevel + bytesForNumberOfEnemiesPerWave + bytesForEnemies);
  const dataView = new DataView(levelsBuffer);

  let byteOffset = 0;
  dataView.setUint8(byteOffset, levels.length);
  byteOffset++;

  levels.forEach(level => {
    dataView.setUint8(byteOffset, level.enemyWaves.length);
    byteOffset++;

    level.enemyWaves.forEach(wave => {
      dataView.setUint8(byteOffset, wave.enemies.length);
      byteOffset++;

      wave.enemies.forEach(enemy => {
        // 3 bits for enemy pattern (8 patterns)
        // 2 bits for color (4 colors) Should this be 5 colors? We'd need another bit

        // position needs 7 bits
      });
    });
  });
}
