<template>
  <div class="grid-container" ref="gridElement">
    <div
      class="keyboard-container"
      ref="keyElements"
    >
      <div
        v-for="(key, keyIndex) in allKeys"
        :key="keyIndex"
        class="keyboard-row"
      >
        <div
          class="keyboard-key"
          :class="{ 'sharp': key.isSharp }"
          :id="key.frequency"
        ></div>
        <div
          v-for="gridPosition in 3200"
          :key="gridPosition - 1"
          class="grid-square"
          @click="addNotePosition(key, gridPosition - 1)"
          :class="[{'start-square': ((gridPosition) % 16 === 0)}, `grid${gridPosition - 1}`]"/>
      </div>
    </div>

    <div
      v-for="(notePosition, noteIndex) in selectedNotePositions"
      :key="noteIndex"
      class="selected-note"
      @click="removeNotePosition(notePosition)"
      :style="getSelectedNotePositionStyle(notePosition)">
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

<script lang="ts">
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

    function addNotePosition(key: Key, gridPosition: number) {
      selectedNotePositions.value.push(
        {
          frequency: key.frequency,
          startPosition: gridPosition,
          duration: 1,
        },
      );
    }

    function removeNotePosition(positionToDelete: NotePosition) {
      const index = selectedNotePositions.value.findIndex(position => {
        return positionToDelete === position;
      });
      if (index !== -1) {
        selectedNotePositions.value.splice(index, 1);
      }
    }

    const keyElements = ref<HTMLElement | undefined>();
    const gridElement = ref<HTMLElement | undefined>();

    function getSelectedNotePositionStyle(notePosition: NotePosition) {
      if (!keyElements.value?.children || !gridElement.value) {
        return;
      }
      const keyboardRows: Element[] = Array.from(keyElements.value.children);
      const keyboardRow: Element | undefined = keyboardRows.find((keyRow: Element) => {
        // somehow ChildNode id is not registered? ¯\_(ツ)_/¯
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return keyRow?.firstChild?.id === notePosition.frequency.toString();
      });
      if (!keyboardRow) {
        return;
      }
      const keyAndGridSquares: Element[] = Array.from(keyboardRow.children);
      const startingGridSquare: Element | undefined = keyAndGridSquares.find((gridSquare: Element) => {
        return gridSquare.classList.contains('grid' + notePosition.startPosition.toString());
      });
      if (!startingGridSquare) {
        return;
      }
      const gridRect = gridElement.value.getBoundingClientRect();
      const xOffset = gridRect?.x || 0;
      const yOffset = gridRect?.y || 0;

      const gridSquareRect = startingGridSquare.getBoundingClientRect();
      const top = `${(gridSquareRect.top - 2 - yOffset).toString()}px`;
      const left = `${(gridSquareRect.left - 2 - xOffset).toString()}px`;
      const width = `${(notePosition.duration * 25).toString()}px`;
      return { top, left, width, height: '25px' };
    }

    function expandNote(notePosition: NotePosition) {
      if (!notePosition.duration) {
        return;
      }
      notePosition.duration += 1;
    }

    function contractNote(notePosition: NotePosition) {
      if (notePosition.duration === 1 || !notePosition.duration) {
        return;
      }
      notePosition.duration -= 1;
    }

    return {
      allKeys,
      keyElements,
      gridElement,
      addNotePosition,
      removeNotePosition,
      expandNote,
      contractNote,
      selectedNotePositions,
      getSelectedNotePositionStyle,
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
