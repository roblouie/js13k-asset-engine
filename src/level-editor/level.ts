import { EnemyWave } from '@/level-editor/enemy-wave';

export class Level {
  enemyWaves: EnemyWave[];

  constructor(enemyWaves: EnemyWave[]) {
    this.enemyWaves = enemyWaves;
  }
}
