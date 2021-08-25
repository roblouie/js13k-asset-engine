import { Song } from '@/sound/song.model';
import { Track } from '@/sound/track.model';
import { ref } from 'vue';

let currentTempo = 0;
let ctx: AudioContext;
let masterGain: GainNode;

export const isSongPlaying = ref(false);
let isCtxStarted = false;

const oscillators: OscillatorNode[] = [];
const gainNodes: GainNode[] = [];
let repeatTimer: any;

export function startSong(song: Song): void {
  if (!isCtxStarted) {
    createContext();
    isCtxStarted = true;
  }
  isSongPlaying.value = true;
  currentTempo = song.tempo;
  createOscillators(song);
  masterGain.gain.value = .2;
  song.tracks.forEach(scheduleTrackNotes);
  let totalNotePositionsUsed = 0;
  song.tracks.forEach(track => {
    const lastNote = track.notes[track.notes.length - 1] || null;
    if (!lastNote) {
      return;
    }
    const currentTrackLastUsedPos = lastNote.startPosition + lastNote.duration;
    if (currentTrackLastUsedPos > totalNotePositionsUsed) {
      totalNotePositionsUsed = currentTrackLastUsedPos;
    }
  });
  const songLengthInMeasures = Math.ceil(totalNotePositionsUsed % 16);
  const songEndInSeconds = getDurationInSeconds(songLengthInMeasures * 16 + 1);

  repeatTimer = setTimeout(() => restartSong(song), songEndInSeconds* 1000);
}

function restartSong(song: Song) {
  stopSong();
  startSong(song);
}

export function stopSong() {
  isSongPlaying.value = false;
  masterGain.gain.value = 0;
  clearTimeout(repeatTimer);
  oscillators.forEach(osc => osc.stop());
  oscillators.splice(0, oscillators.length);
  gainNodes.splice(0, gainNodes.length);
}

function createContext() {
  ctx = new AudioContext();
  masterGain = ctx.createGain();
  masterGain.gain.value = .2;
  masterGain.connect(ctx.destination);
}


export function createOscillators(song: Song) {
  song.tracks.forEach((track, index) => {
    oscillators[index] = new OscillatorNode(ctx, { type: track.wave || 'triangle' });
    gainNodes.push(ctx.createGain());
    oscillators[index].connect(gainNodes[index]);
    oscillators[index].start();
  });

  gainNodes.forEach((gain: GainNode) => {
    gain.gain.value = 0;
    gain.connect(masterGain);
  });
}

function scheduleTrackNotes(track: Track, index: number) {
  track.notes.forEach((note) => {
    const startTimeInSeconds = getDurationInSeconds(note.startPosition);
    const endTimeInSeconds = getDurationInSeconds(note.startPosition + note.duration);
    oscillators[track.trackId].frequency.setValueAtTime(note.frequency, ctx.currentTime + startTimeInSeconds);
    gainNodes[track.trackId].gain.setValueAtTime(1, ctx.currentTime + startTimeInSeconds);
    gainNodes[track.trackId].gain.setValueAtTime(0, ctx.currentTime + endTimeInSeconds);
  });
}

function getDurationInSeconds(numberOfSixteenths: number): number {
  const timePerSixteenth = 60 / currentTempo / 4;
  return numberOfSixteenths * timePerSixteenth;
}
