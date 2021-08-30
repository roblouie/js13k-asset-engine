<template>
  <div>
    <button @click="saveJson">Save JSON</button>
    <input type="file" @change="loadJson"/>
  </div>

  <label>
    Level
    <select v-model="currentLevel">
      <option v-for="(level, index) in levels" :key="level" :value="level">{{ index }}</option>
    </select>
  </label>
  <button @click="addLevel">Add Level</button>

  <div v-if="currentLevel">
    <label>
      Wave
      <select v-model="currentWave">
        <option v-for="(wave, index) in currentLevel.enemyWaves" :key="wave" :value="wave">{{ index }}</option>
      </select>
    </label>
    <button @click="addWave">Add Wave</button>
  </div>

  <label>
    Ship Type
   <select v-model="shipType">
     <option>Straight</option>
     <option>Pause</option>
     <option>Wave (left)</option>
     <option>Wave (right)</option>
     <option>ScreenBounce (left)</option>
     <option>ScreenBounce (right)</option>
     <option>Swoop (left)</option>
     <option>Swoop (right)</option>
   </select>
  </label>

  <label>
    Color
    <select v-model="color">
      <option value="0">red</option>
      <option value="1">green</option>
      <option value="2">blue</option>
      <option value="3">purple</option>
    </select>
  </label>

  <div style="display: flex; width: 480px; height: 640px; flex-wrap: wrap;">
    <div
        class="enemy-position"
        v-for="index in 126"
        :key="index"
        @click="addEnemy(index - 1)"
        :style="{ backgroundColor: getColor(index - 1) }"
    >
      {{ getText(index - 1) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLevel } from '@/level-editor/level.composable';
import { Level } from '@/level-editor/level';
import { ref } from 'vue';
import { EnemyWave } from '@/level-editor/enemy-wave';
import { StraightEnemy } from '@/level-editor/straight-enemy';
import { PauseEnemy } from '@/level-editor/pause-enemy';
import { Sprite } from "@/sprite-maker/sprite.model";
import { Enemy } from "@/level-editor/enemy";

const { levels } = useLevel();
const currentLevel = ref<Level>(null);
const currentWave = ref<EnemyWave>(null);
const shipType = ref('Straight');
const color = ref(0);

// 3 bits for enemy pattern (8 patterns)
// 2 bits for color (4 colors) Should this be 5 colors? We'd need another bit

// position needs 7 bits, so we need 2 bytes per enemy
function addLevel() {
  levels.value.push(new Level([]));
}

function addWave() {
  currentLevel.value.enemyWaves.push(new EnemyWave([]));
}

function getText(position: number) {
  if (!currentLevel.value || !currentWave.value) {
    return '';
  }

  const enemy = currentWave.value.enemies.find(enemy => enemy.gridPosition === position);
  if (enemy) {
    return enemy.type;
  } else {
    return '';
  }
}

function addEnemy(position: number) {
  let enemy;

  switch (shipType.value) {
  case 'Straight':
    enemy = new StraightEnemy(position, color.value);
    break;
  case 'Pause':
    enemy = new PauseEnemy(position, color.value);
    break;
  }

  const existingIndex = currentWave.value.enemies.findIndex(enemy => enemy.gridPosition === position);

  if (existingIndex === -1) {
    currentWave.value.enemies.push(enemy);
  } else {
    currentWave.value.enemies[existingIndex] = enemy;
  }
}

function getColor(position: number) {
  if (!currentLevel.value || !currentWave.value) {
    return 'white';
  }

  const enemy = currentWave.value.enemies.find(enemy => enemy.gridPosition === position);
  return enemy ? Enemy.Colors[enemy.colorNum] : 'white';
}

function loadJson(event: any) {
  const fileElement = event.target as HTMLInputElement;

  if (fileElement.files && fileElement.files[0]) {
    const file = fileElement.files[0];
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const text = event.target.result;
      levels.value = JSON.parse(text);
    };
    fileReader.readAsText(file);
  }
}



function saveJson() {
  const json = JSON.stringify(levels.value, null, 2);

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], {
    type: 'text/plain',
  }));
  a.setAttribute('download', 'levels.json');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
</script>

<style scoped>
.enemy-position {
  box-shadow: gray 1px 1px inset;
  width: 64px;
  height: 64px;
  color: white;
  font-size: 12px;
  word-break: break-word;
}
</style>