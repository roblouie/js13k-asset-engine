import { Level } from '@/level-editor/level';
import { ref } from 'vue';

const levels = ref<Level[]>([]);

export function useLevel() {
  return {
    levels,
    levelsToBytes,
  };
}

function levelsToBytes(levels: Level[]) {
  const waves = levels.map(level => level.enemyWaves);
  const enemies = waves.flat(2).map(wave => wave.enemies).flat(2);

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
        const pattern = enemy.typeNum;
        const color = enemy.colorNum;
        const combinedData = (pattern << 4) + color;
        dataView.setUint8(byteOffset, combinedData);
        byteOffset++;

        dataView.setUint8(byteOffset, enemy.gridPosition);
        byteOffset++;
      });
    });
  });

  return levelsBuffer;
}
