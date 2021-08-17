<template>
  <div>
    <div class="grid-container" ref="grid">
      <div
        v-for="(note, noteIndex) in allNotes"
        :key="noteIndex"
        class="keyboard-row"
      >
        <div class="keyboard-key" :class="{ 'sharp': note.isSharp }"></div>
        <div
          v-for="gridPosition in 3200"
          :key="gridPosition"
          class="grid-square"
          @click="toggleGridSquare(note, gridPosition, $event.target.getBoundingClientRect())"
          :class="{'start-square': ((gridPosition + 1) % 16 === 0)}" />
      </div>
      <div
        v-for="(selectedNote, selectedIndex) in selectedNotePositions"
        :key="selectedIndex"
        class="selected-note"
        :style="selectedNote.style">
        <div
          class="right-border"
          @mousedown="startNoteResize"
          @mouseup="finalizeNoteResize"
          @mousemove="resizeNote"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

interface Note {
  frequency: number;
  isSharp: boolean;
  name: string;
}

interface NotePosition {
  frequency: number;
  startPosition: number;
  duration: number;
  style: {
    width: string;
    top: string;
    left: string;
  }
}

export default defineComponent({
  setup() {
    const singleOctave: Note[] = [
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

    const allNotes: Note[] = [];
    for (let i = 0; i < 9; i++) {
      const newOctave = singleOctave.map(note => {
        return {
          frequency: Math.round(note.frequency * Math.pow(2, i)),
          isSharp: note.isSharp,
          name: note.name,
        };
      });
      allNotes.push(...newOctave);
    }
    allNotes.reverse();

    const selectedNotePositions = ref<NotePosition[]>([]);
    let isResizing = false;
    const grid = ref<HTMLElement | undefined>();

    function toggleGridSquare(note: Note, gridPosition: number, boundingRect: any) {
      if (isResizing)  {
        return;
      }
      if (isSquareSelected(note, gridPosition)) {
        const alreadySelectedIndex = selectedNotePositions.value.findIndex(position => {
          return position.frequency === note.frequency && position.startPosition === gridPosition;
        });
        selectedNotePositions.value.splice(alreadySelectedIndex, 1);
        return;
      }

      const gridRect = grid.value?.getBoundingClientRect();
      const xOffset = gridRect?.x  || 0;
      const yOffset = gridRect?.y || 0;


      selectedNotePositions.value.push(
        {
          frequency: note.frequency,
          startPosition: gridPosition,
          duration: 1,
          style: {
            top: `${Math.round(boundingRect.top - yOffset - 2).toString()}px`,
            width: '25px',
            left: `${Math.round(boundingRect.left - xOffset - 2).toString()}.px`,
          },
        },
      );
      console.log(selectedNotePositions.value);
    }

    function isSquareSelected(note: Note, gridPosition: number): boolean {
      return !!selectedNotePositions.value.find(position => {
        return position.frequency === note.frequency && position.startPosition === gridPosition;
      });
    }

    function startNoteResize(event: MouseEvent) {
      isResizing = true;
    }

    function resizeNote(event: any) {
      if (!isResizing) {
        return;
      }
      // debugger;
      // console.log(event);
      // event.target.style.width = event.x - event.target.style.left;
    }

    function finalizeNoteResize(event: MouseEvent) {
      isResizing = false;
    }


    return {
      allNotes,
      grid,
      toggleGridSquare,
      selectedNotePositions,
      startNoteResize,
      resizeNote,
      finalizeNoteResize,
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
  left: 25px;
  top: 0;
  cursor: ew-resize;
}

.selected-note {
  height: 25px;
  width: 100px;
  background-color: red;
  position: absolute;
}
</style>
