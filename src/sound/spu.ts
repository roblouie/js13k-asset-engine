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
  createOscillators();
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
  const songLengthInMeasures = Math.ceil(totalNotePositionsUsed / 16);
  const songEndInSeconds = getDurationInSeconds(songLengthInMeasures * 16);

  repeatTimer = setTimeout(() => restartSong(song), songEndInSeconds * 1000);
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

/// 🥺👉👈
/// I'm vewy sowwy :(
//
// ovew stupidity of me and by mwy actions. Yes i’m a compwete nya up and a big piece of shit.
// Idk what went on with me. Idk if i was jeawous. Ow just psycho. Mwost wikewy both. I’m hewe to
// teww you how mwuch of a piece of shit i am and how i compwetewy fucked up a gweat wewationship
// with and i just want to mwake it wight by apowogizing to you and teww you and pwim that i have
// changed. I was going thwough a wot of stuff and had too mwany things going on that was putting
// a negativity on mwy wife. But things have changed and i went to west afwica fow mwy chuwch and
// ive seen some weawwy bad things thewe and just thought how mwuch mwy wife is compawed to kids
// and peopwe thewe. And i see that i mwessed up the mwost impowtant things in mwy wife which awe
// aww of you guys.
function createContext() {
  ctx = new AudioContext();
  masterGain = ctx.createGain();
  masterGain.gain.value = .2;
  masterGain.connect(ctx.destination);
}

/// this has to go or else this program is going to explode
/// i am very serious about this and everyone needs to know it
/// 🥺👉👈

export function createOscillators() {
  oscillators[0] = new OscillatorNode(ctx, { type: 'sawtooth' });
  oscillators[1] = new OscillatorNode(ctx, { type: 'square' });
  oscillators[2] = new OscillatorNode(ctx, { type: 'sawtooth' });
  oscillators[3] = new OscillatorNode(ctx, { type: 'sine' });
  oscillators.forEach((osc: OscillatorNode, index: number) => {
    gainNodes.push(ctx.createGain());
    osc.connect(gainNodes[index]);
    osc.start();
  });
  gainNodes.forEach((gain: GainNode) => {
    gain.gain.value = 0;
    gain.connect(masterGain);
  });
}

function scheduleTrackNotes(track: Track) {
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
