<template>
  <div class="grid-container" ref="grid">
    <div
      v-for="(key, keyIndex) in allKeys"
      :key="keyIndex"
      class="keyboard-row"
    >
      <div class="keyboard-key" :class="{ 'sharp': key.isSharp }"></div>
      <div
        v-for="gridPosition in 3200"
        :key="gridPosition - 1"
        class="grid-square"
        @click="toggleGridSquare(key, gridPosition - 1, $event.target.getBoundingClientRect())"
        :class="{'start-square': ((gridPosition) % 16 === 0)}" />
    </div>
    <div
      v-for="(notePosition, noteIndex) in selectedNotePositions"
      :key="noteIndex"
      class="selected-note"
      @click="toggleGridSquare(notePosition.key, notePosition.startPosition)"
      :style="notePosition.style">
      <div
        class="right-border"
        @click.stop="expandNote(notePosition)"
      />
      <div
        class="left-border"
        @click.stop="contractNote(notePosition)"
      />
    </div>
  </div>
</template>

<script  lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';
import { Key } from './key.model';
import { NotePosition } from './note-position.model';

export default defineComponent({
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Array as PropType<NotePosition[]>,
    },
  },
  setup(props, { emit }) {
    const selectedNotePositions = computed({
      get: () => props.modelValue || [],
      set: (value) => emit('update:modelValue', value),
    });
    const singleOctave: Key[] = [
      {
        frequency: 32.7,
        isSharp: false,
        name: 'C',
      }, {
        frequency: 34.65,
        isSharp: true,
        name: 'C#',
      }, {
        frequency: 36.71,
        isSharp: false,
        name: 'D',
      }, {
        frequency: 38.89,
        isSharp: true,
        name: 'D#',
      }, {
        frequency: 41.2,
        isSharp: false,
        name: 'E',
      }, {
        frequency: 43.65,
        isSharp: false,
        name: 'F',
      }, {
        frequency: 46.25,
        isSharp: true,
        name: 'F#',
      }, {
        frequency: 49.00,
        isSharp: false,
        name: 'G',
      }, {
        frequency: 51.91,
        isSharp: true,
        name: 'G#',
      }, {
        frequency: 55,
        isSharp: false,
        name: 'A',
      }, {
        frequency: 58.27,
        isSharp: true,
        name: 'A#',

      }, {
        frequency: 61.74,
        isSharp: false,
        name: 'B',
      },
    ];

    const allKeys: Key[] = [];
    for (let i = 0; i < 9; i++) {
      const newOctave = singleOctave.map(key => {
        return {
          frequency: Math.round(key.frequency * Math.pow(2, i)),
          isSharp: key.isSharp,
          name: key.name,
        };
      });
      allKeys.push(...newOctave);
    }
    allKeys.reverse();

    const grid = ref<HTMLElement | undefined>();

    function toggleGridSquare(key: Key, gridPosition: number, boundingRect?: any) {
      if (isSquareSelected(key, gridPosition)) {
        const alreadySelectedIndex = selectedNotePositions.value.findIndex(position => {
          return position.key.frequency === key.frequency && position.startPosition === gridPosition;
        });
        selectedNotePositions.value.splice(alreadySelectedIndex, 1);
        return;
      }

      const gridRect = grid.value?.getBoundingClientRect();
      const xOffset = gridRect?.x  || 0;
      const yOffset = gridRect?.y || 0;


      selectedNotePositions.value.push(
        {
          key: key,
          startPosition: gridPosition,
          duration: 1,
          style: {
            top: `${Math.round(boundingRect.top - yOffset - 2).toString()}px`,
            width: '25px',
            left: `${Math.round(boundingRect.left - xOffset - 2).toString()}.px`,
          },
        },
      );
    }

    function isSquareSelected(key: Key, gridPosition: number): boolean {
      if (!selectedNotePositions.value) {
        return false;
      }
      return selectedNotePositions.value.some(position => {
        return position.key.frequency === key.frequency && position.startPosition === gridPosition;
      });
    }

    function expandNote(notePosition: NotePosition) {
      if (!notePosition.duration || !notePosition.style?.width) {
        return;
      }
      const { width } = notePosition.style;
      const widthValue = parseInt(width.split('p')[0], 10);
      notePosition.duration += 1;
      notePosition.style.width = `${widthValue + 25}px`;
    }

    function contractNote(notePosition: NotePosition) {
      if (notePosition.duration === 1) {
        toggleGridSquare(notePosition.key, notePosition.startPosition);
        return;
      }
      if (!notePosition.duration || !notePosition.style?.width) {
        return;
      }
      const { width } = notePosition.style;
      const widthValue = parseInt(width.split('p')[0], 10);
      notePosition.duration -= 1;
      notePosition.style.width  = `${widthValue - 25}px`;
    }

    return {
      allKeys,
      grid,
      toggleGridSquare,
      expandNote,
      contractNote,
      selectedNotePositions,
    };
  },
});
</script>

<style scoped>
.grid-container {
  position: relative;
  height: 500px;
  overflow: auto;
  border: 2px solid grey;
  box-sizing: border-box;
}

.keyboard-row {
  width: calc(3200 * 25px + 80px);
  height: 25px;
}

.keyboard-key {
  display: inline-block;
  height: 100%;
  width: 80px;
  border: 1px solid black;
  box-sizing: border-box;
  background-color: white;
  position: sticky;
  left: 0;
  z-index: 999;
}

.keyboard-key.sharp {
  background-color: black;
}

.grid-square {
  display: inline-block;
  height: 100%;
  width: 25px;
  border: 1px solid grey;
  box-sizing: border-box;
  background-color: #dddddd;
}
.grid-square.start-square {
  border-left: 3px solid black;
}

.grid-square.selected {
  background-color: red;
}

.right-border {
  height: 100%;
  width: 3px;
  position: absolute;
  right: 0;
  top: 0;
  cursor: ew-resize;
}

.left-border {
  height: 100%;
  width: 3px;
  position: absolute;
  left: 0;
  top: 0;
  cursor: e-resize;
}

.selected-note {
  height: 25px;
  width: 100px;
  background-color: red;
  position: absolute;
  box-shadow: inset 0 0 6px #2c3e50;
}
</style>
