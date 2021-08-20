import { ref } from 'vue';
import { Song } from '@/sound/song.model';
import { NotePosition } from '@/sound/note-position.model';
import { Track } from '@/sound/track.model';

const songs = ref<Song[]>([]);

export function useSound() {
  return {
    songs,
    songsToBytes,
    getUsedNoteFrequencies,
  };
}


function songsToBytes(songs: Song[]): ArrayBuffer {
  const arrayBuffers = songs.map(convertSongToArrayBuffer);
  const byteLength = arrayBuffers.reduce((accumulator, songArray) => {
    return accumulator + songArray.byteLength;
  }, 0);

  const combinedBytes = new Uint8Array(byteLength + 1);
  const numberOfSongsBytes = new Uint8Array([songs.length]);
  combinedBytes.set(numberOfSongsBytes);
  arrayBuffers.forEach((songBuffer: ArrayBuffer) => {
    const songBytes = new Uint8Array(songBuffer);
    combinedBytes.set(songBytes, 1);
  });
  return combinedBytes;
}

function convertSongToArrayBuffer(song: Song): ArrayBuffer {
  const arrayToBufferize = [];

  arrayToBufferize.push(song.tempo); //tempo
  arrayToBufferize.push(song.tracks.length); //number of tracks

  song.tracks.forEach((track: Track) => {
    const usedFrequencies = getUsedNoteFrequencies(track.notes);
    const splitFrequencies = convertFrequenciesTo8BitInt(usedFrequencies);
    arrayToBufferize.push(usedFrequencies.length); // number of pitches
    arrayToBufferize.push(...splitFrequencies); // and both bytes representing each one
    const noteInstructions = getNoteInstructions(track.notes); // get note instructions
    const noteBytes = convertNoteInstructionsTo8BitInt(noteInstructions); // convert them to bytes
    arrayToBufferize.push(noteBytes.length); // add length of the instruction set
    arrayToBufferize.push(...noteBytes); // ...and corresponding instructions in bytes
  });

  const arrayBuffer = new ArrayBuffer(arrayToBufferize.length);
  const dataView = new DataView(arrayBuffer);
  arrayToBufferize.forEach((value, index) => {
    dataView.setUint8(index, value);
  });
  return arrayBuffer;
}


function getUsedNoteFrequencies(notePositions: NotePosition[]): number[] {
  const allFrequencies = notePositions.map(position => position.frequency);
  const uniqueFrequencies = [...new Set(allFrequencies)];
  // rest is always first in array
  uniqueFrequencies.unshift(0);
  if (uniqueFrequencies.length > 15) {
    alert('you done effed up son');
  }
  return uniqueFrequencies;
}


function getNoteInstructions(notePositions: NotePosition[]) {
  if (!notePositions.length) {
    return [];
  }

  const sortedNotes = notePositions.sort((a, b) => a.startPosition > b.startPosition ? 1 : -1);
  const noteInstructions = [];
  /// is the first note at the first position?
  if (sortedNotes[0].startPosition !== 0) {
    // if not create a rest note
    const firstNotePosition = sortedNotes[0].startPosition;
    const additionalMeasuresOfRest = Math.floor(firstNotePosition / 16);
    for (let i = 0; i < additionalMeasuresOfRest; i++) {
      noteInstructions.push(0);
      noteInstructions.push(15);
    }
    const remainingRestLength = firstNotePosition - (additionalMeasuresOfRest * 16);
    noteInstructions.push(0);
    noteInstructions.push(remainingRestLength);
  }
  const usedFrequencies = getUsedNoteFrequencies(notePositions);

  sortedNotes.forEach((note, noteIndex) => {
    // add the next note
    const frequencyIndex = usedFrequencies.findIndex(frequency => frequency === note.frequency);
    noteInstructions.push(frequencyIndex);
    noteInstructions.push(note.duration);
    // this is the last one, no rest to follow
    if (noteIndex + 1 === sortedNotes.length) {
      return;
    }
    const nextNotePosition = sortedNotes[noteIndex + 1].startPosition;
    const gapToNextNote = nextNotePosition - note.startPosition - note.duration;
    // if the next note is the next position, no rest needed
    if (gapToNextNote === 0) {
      return;
    }
    const measuresOfRest = Math.floor(gapToNextNote / 16);
    for (let i = 0; i < measuresOfRest; i++) {
      noteInstructions.push(0);
      noteInstructions.push(15);
    }
    const remainingRest = gapToNextNote - (measuresOfRest * 16);
    noteInstructions.push(0);
    noteInstructions.push(remainingRest);
  });
  return noteInstructions;
}


function convertNoteInstructionsTo8BitInt(noteInstructions: number[]): number[] {
  const bytesToReturn: number[] = [];
  for (let i = 0; i < noteInstructions.length; i += 2) {
    const firstFourBits = noteInstructions[i] << 4;
    const secondFourBits = noteInstructions[i + 1];
    bytesToReturn.push(firstFourBits + secondFourBits);
  }
  return bytesToReturn;
}

function convertFrequenciesTo8BitInt(frequencies: number[]) {
  const bytesToReturn: number[] = [];
  frequencies.forEach(frequency => {
    const firstByte = frequency >> 8;
    const secondByte = frequency & 0b11111111;
    bytesToReturn.push(firstByte);
    bytesToReturn.push(secondByte);
  });

  return bytesToReturn;
}
